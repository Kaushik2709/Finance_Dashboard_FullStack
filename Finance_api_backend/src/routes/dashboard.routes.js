const express = require('express');
const { query } = require('express-validator');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { sendSuccess } = require('../utils/response');
const { getSummary, getByCategory, getTrends, getRecent } = require('../services/dashboard.service');

const router = express.Router();

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

router.get(
  '/summary',
  authenticate,
  authorize('viewer', 'analyst', 'admin'),
  ...validate([
    query('from').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('from must be YYYY-MM-DD'),
    query('to').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('to must be YYYY-MM-DD'),
  ]),
  asyncHandler(async (req, res) => {
    const summary = await getSummary(req.query);
    return sendSuccess(res, { summary });
  })
);

router.get(
  '/by-category',
  authenticate,
  authorize('analyst', 'admin'),
  ...validate([
    query('from').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('from must be YYYY-MM-DD'),
    query('to').optional().matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('to must be YYYY-MM-DD'),
  ]),
  asyncHandler(async (req, res) => {
    const categories = await getByCategory(req.query);
    return sendSuccess(res, { categories });
  })
);

router.get(
  '/trends',
  authenticate,
  authorize('analyst', 'admin'),
  ...validate([
    query('period')
      .optional()
      .isIn(['monthly', 'weekly'])
      .withMessage('period must be monthly|weekly'),
  ]),
  asyncHandler(async (req, res) => {
    const trends = await getTrends({ period: req.query.period || 'monthly' });
    return sendSuccess(res, { trends });
  })
);

router.get(
  '/recent',
  authenticate,
  authorize('viewer', 'analyst', 'admin'),
  asyncHandler(async (req, res) => {
    const records = await getRecent({ limit: 10 });
    return sendSuccess(res, { records });
  })
);

module.exports = router;