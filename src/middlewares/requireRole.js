// Centralizing role checks here (rather than inline `req.user.role === 'admin'`
// checks in controllers) so adding/refining roles later is a one-file change.
module.exports = function requireRole(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ status: 'unauthorized', message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: 'forbidden', message: 'Insufficient role' });
    }

    next();
  };
};
