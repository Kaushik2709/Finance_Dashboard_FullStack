const express = require('express');
const { body } = require('express-validator');

const prisma = require('../config/db');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const logAudit = async (userId, action, resource) => {
  if (!userId) {
    return;
  }

  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resource,
    },
  });
};

router.get(
  '/',
  authenticate,
  authorize('viewer', 'analyst', 'admin'),
  asyncHandler(async (req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
      },
    });

    return sendSuccess(res, {
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        type: category.type,
        created_at: category.createdAt,
      })),
    });
  })
);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  ...validate([
    body('name').isString().trim().notEmpty().isLength({ max: 255 }).withMessage('name is required'),
    body('type').isIn(['income', 'expense', 'both']).withMessage('type must be income|expense|both'),
  ]),
  asyncHandler(async (req, res) => {
    const category = await prisma.category.create({
      data: {
        name: req.body.name,
        type: req.body.type,
      },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
      },
    });

    await logAudit(req.user.sub, 'CREATE_CATEGORY', `categories:${category.id}`);

    return sendSuccess(
      res,
      {
        category: {
          id: category.id,
          name: category.name,
          type: category.type,
          created_at: category.createdAt,
        },
      },
      undefined,
      201
    );
  })
);

module.exports = router;