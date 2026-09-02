const { getFirebaseAdmin } = require('../config/firebaseAdmin');
const User = require('../models/userModel');
const { toRequestUser } = require('./verifyFirebaseToken');

// Like verifyFirebaseToken, but never rejects the request — used on endpoints
// that must stay reachable by the public (e.g. room browsing) while still
// shaping the response differently for authenticated staff.
module.exports = async function optionalAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    req.user = null;
    return next();
  }

  try {
    const decodedToken = await getFirebaseAdmin().auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    req.user = user && user.accountStatus !== 'disabled' ? toRequestUser(user) : null;
  } catch (error) {
    req.user = null;
  }

  next();
};
