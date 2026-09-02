const { getFirebaseAdmin } = require('../config/firebaseAdmin');
const User = require('../models/userModel');

const getSuperAdminEmails = () =>
  (process.env.SUPER_ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

// Atomic upsert keyed on firebaseUid so two near-simultaneous requests from a
// freshly-signed-up user can't race into duplicate user documents.
const provisionUser = async (decodedToken) => {
  const email = (decodedToken.email || '').toLowerCase();
  const firebaseUid = decodedToken.uid;
  const name = decodedToken.name || email || firebaseUid;
  const isBootstrapSuperAdmin = !!email && getSuperAdminEmails().includes(email);

  const user = await User.findOneAndUpdate(
    { firebaseUid },
    {
      $setOnInsert: {
        firebaseUid,
        email,
        name,
        role: isBootstrapSuperAdmin ? 'superadmin' : 'tenant',
        accountStatus: 'active',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // SUPER_ADMIN_EMAILS is a one-time bootstrap trigger only: it promotes on
  // first matching login, but removing an email from it later never demotes
  // an already-promoted superadmin (we never touch role when not matching).
  if (isBootstrapSuperAdmin && user.role !== 'superadmin') {
    user.role = 'superadmin';
    await user.save();
  }

  return user;
};

const toRequestUser = (user) => ({
  _id: user._id,
  firebaseUid: user.firebaseUid,
  email: user.email,
  name: user.name,
  role: user.role,
  accountStatus: user.accountStatus,
});

module.exports = async function verifyFirebaseToken(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ status: 'unauthorized', message: 'Missing bearer token' });
    }

    const decodedToken = await getFirebaseAdmin().auth().verifyIdToken(token);
    const user = await provisionUser(decodedToken);

    if (user.accountStatus === 'disabled') {
      return res.status(403).json({ status: 'forbidden', message: 'Account is disabled' });
    }

    req.user = toRequestUser(user);
    next();
  } catch (error) {
    if (error.message && error.message.includes('Firebase Admin credentials are not configured')) {
      console.error('Firebase auth error:', error.message);
      return res.status(500).json({ status: 'error', message: 'Authentication is not configured on the server yet' });
    }

    console.error('Firebase token verification failed:', error.message);
    return res.status(401).json({ status: 'unauthorized', message: 'Invalid or expired token' });
  }
};

module.exports.provisionUser = provisionUser;
module.exports.toRequestUser = toRequestUser;
