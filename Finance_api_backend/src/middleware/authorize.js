const { AppError } = require('../utils/errors');

// Simple RBAC based purely on JWT claims.
// For demo purposes we avoid a DB lookup on every request.
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user?.sub) {
    return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }

  if (req.user.is_active === false) {
    return next(new AppError('Your account is inactive', 403, 'FORBIDDEN'));
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
    return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
  }

  return next();
};

module.exports = authorize;