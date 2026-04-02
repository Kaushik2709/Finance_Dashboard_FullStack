const express = require('express');
const { body, param, query } = require('express-validator');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { AppError } = require('../utils/errors');
const { sendSuccess } = require('../utils/response');
const { listRecords, getRecordById, createRecord, updateRecord, deleteRecord } = require('../services/record.service');

const router = express.Router();

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.get(
  '/',
  authenticate,
  authorize('viewer', 'analyst', 'admin'),
  ...validate([
    query('type').optional().isIn(['income', 'expense']).withMessage('type must be income|expense'),
    query('category_id').optional().isUUID().withMessage('category_id must be a UUID'),
    query('from').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('from must be YYYY-MM-DD'),
    query('to').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('to must be YYYY-MM-DD'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1').toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1..100').toInt(),
    query('sort')
      .optional()
      .matches(/^[a-z_]+:(asc|desc)$/i)
      .withMessage('sort must look like field:asc|desc'),
  ]),
  asyncHandler(async (req, res) => {
    const result = await listRecords({
      type: req.query.type,
      category_id: req.query.category_id,
      from: req.query.from,
      to: req.query.to,
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 20),
      sort: req.query.sort || 'record_date:desc',
    });
    return sendSuccess(res, { records: result.records }, result.meta);
  })
);

router.get(
  '/:id',
  authenticate,
  authorize('viewer', 'analyst', 'admin'),
  ...validate([
    param('id').isUUID().withMessage('id must be a UUID'),
  ]),
  asyncHandler(async (req, res) => {
    const record = await getRecordById(req.params.id);

    if (!record) {
      throw new AppError('Record not found', 404, 'RECORD_NOT_FOUND');
    }

    return sendSuccess(res, { record });
  })
);

router.post(
  '/',
  authenticate,
  authorize('analyst', 'admin'),
  ...validate([
    body('user_id').optional().isUUID().withMessage('user_id must be a UUID'),
    body('category_id').isUUID().withMessage('category_id must be a UUID'),
    body('amount').isDecimal({ decimal_digits: '1,2' }).withMessage('amount must be a decimal'),
    body('type').isIn(['income', 'expense']).withMessage('type must be income|expense'),
    body('notes').optional({ nullable: true }).isString().isLength({ max: 5000 }),
    body('record_date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('record_date must be YYYY-MM-DD'),
  ]),
  asyncHandler(async (req, res) => {
    const actor = {
      sub: req.user.sub,
      role: req.user.currentUser.role,
    };
    const record = await createRecord(req.body, actor);
    return sendSuccess(res, { record }, undefined, 201);
  })
);

router.patch(
  '/:id',
  authenticate,
  authorize('analyst', 'admin'),
  ...validate([
    param('id').isUUID().withMessage('id must be a UUID'),
    body('category_id').optional().isUUID().withMessage('category_id must be a UUID'),
    body('amount').optional().isDecimal({ decimal_digits: '1,2' }).withMessage('amount must be a decimal'),
    body('type').optional().isIn(['income', 'expense']).withMessage('type must be income|expense'),
    body('notes').optional({ nullable: true }).isString().isLength({ max: 5000 }),
    body('record_date').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('record_date must be YYYY-MM-DD'),
    body().custom((_, { req }) => {
      const keys = ['category_id', 'amount', 'type', 'notes', 'record_date'];
      const hasAny = keys.some((key) => req.body[key] !== undefined);
      if (!hasAny) {
        throw new Error('At least one field is required');
      }
      return true;
    }),
  ]),
  asyncHandler(async (req, res) => {
    const actor = {
      sub: req.user.sub,
      role: req.user.currentUser.role,
    };
    const record = await updateRecord(req.params.id, req.body, actor);
    return sendSuccess(res, { record });
  })
);

router.delete(
  '/:id',
  authenticate,
  authorize('analyst', 'admin'),
  ...validate([
    param('id').isUUID().withMessage('id must be a UUID'),
  ]),
  asyncHandler(async (req, res) => {
    const actor = {
      sub: req.user.sub,
      role: req.user.currentUser.role,
    };
    const record = await deleteRecord(req.params.id, actor);
    return sendSuccess(res, { record });
  })
);

module.exports = router;