const { AppError } = require('../utils/errors');
const { getUserById } = require('../services/user.service');

const authorize = (...allowedRoles) => async (req, res, next) => {
  if (!req.user?.sub) {
    return next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
  }

  const currentUser = await getUserById(req.user.sub, { includePasswordHash: false });

  if (!currentUser || !currentUser.is_active) {
    return next(new AppError('Your account is inactive', 403, 'FORBIDDEN'));
  }

  req.user.currentUser = currentUser;

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
  }

  return next();
};

module.exports = authorize;