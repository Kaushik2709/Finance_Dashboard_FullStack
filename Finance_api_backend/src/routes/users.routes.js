const express = require('express');
const { body, param, query } = require('express-validator');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');
const {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  changeUserRole,
  toggleUserStatus,
} = require('../services/user.service');
const { sendSuccess } = require('../utils/response');
const { AppError } = require('../utils/errors');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get(
  '/',
  ...validate([
    query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1..100').toInt(),
  ]),
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const result = await listUsers({ page, limit });
    return sendSuccess(res, { users: result.users }, result.meta);
  })
);

router.post(
  '/',
  ...validate([
    body('name').isString().trim().notEmpty().isLength({ max: 255 }).withMessage('name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isString().isLength({ min: 8 }).withMessage('password must be at least 8 chars'),
    body('role').isIn(['viewer', 'analyst', 'admin']).withMessage('role must be viewer|analyst|admin'),
  ]),
  asyncHandler(async (req, res) => {
    const user = await createUser(req.body, req.user.sub);
    return sendSuccess(res, { user }, undefined, 201);
  })
);

router.get(
  '/:id',
  ...validate([
    param('id').isUUID().withMessage('id must be a UUID'),
  ]),
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id, { includePasswordHash: false });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return sendSuccess(res, { user });
  })
);

router.patch(
  '/:id',
  ...validate([
    param('id').isUUID().withMessage('id must be a UUID'),
    body('name').optional().isString().trim().notEmpty().isLength({ max: 255 }),
    body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body().custom((_, { req }) => {
      if (req.body.name === undefined && req.body.email === undefined) {
        throw new Error('At least one field is required');
      }
      return true;
    }),
  ]),
  asyncHandler(async (req, res) => {
    const user = await updateUser(req.params.id, req.body, req.user.sub);
    return sendSuccess(res, { user });
  })
);

router.patch(
  '/:id/role',
  ...validate([
    param('id').isUUID().withMessage('id must be a UUID'),
    body('role').isIn(['viewer', 'analyst', 'admin']).withMessage('role must be viewer|analyst|admin'),
  ]),
  asyncHandler(async (req, res) => {
    const user = await changeUserRole(req.params.id, req.body.role, req.user.sub);
    return sendSuccess(res, { user });
  })
);

router.patch(
  '/:id/status',
  ...validate([
    param('id').isUUID().withMessage('id must be a UUID'),
  ]),
  asyncHandler(async (req, res) => {
    const user = await toggleUserStatus(req.params.id, req.user.sub);
    return sendSuccess(res, { user });
  })
);

module.exports = router;