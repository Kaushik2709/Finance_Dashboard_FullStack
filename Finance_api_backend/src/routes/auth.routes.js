const express = require('express');
const { body } = require('express-validator');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { login, register, blacklistToken, getCurrentUser } = require('../services/auth.service');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.post(
  '/register',
  ...validate([
    body('name').isString().trim().notEmpty().isLength({ max: 255 }).withMessage('name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password')
      .isString()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ]),
  asyncHandler(async (req, res) => {
    const result = await register(req.body);
    return sendSuccess(res, result, undefined, 201);
  })
);

router.post(
  '/login',
  ...validate([
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ]),
  asyncHandler(async (req, res) => {
    const result = await login(req.body);
    return sendSuccess(res, result);
  })
);

router.get(
  '/me',
  authenticate,
  authorize('viewer', 'analyst', 'admin'),
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req.user.sub);
    return sendSuccess(res, { user: req.user.currentUser || user });
  })
);

router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    blacklistToken(req.user);
    return sendSuccess(res, { message: 'Logged out successfully' });
  })
);

module.exports = router;