const jwt = require('jsonwebtoken');

const { AppError } = require('../utils/errors');
const { isTokenBlacklisted } = require('../services/auth.service');

const authenticate = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Missing bearer token', 401, 'UNAUTHORIZED'));
  }

  const token = header.slice(7).trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded?.jti && isTokenBlacklisted(decoded.jti)) {
      return next(new AppError('Token has been revoked', 401, 'TOKEN_REVOKED'));
    }

    req.user = decoded;
    req.token = token;
    return next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
  }
};

module.exports = authenticate;