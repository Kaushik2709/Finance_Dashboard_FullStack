require('dotenv').config();
const cors = require('cors');
const path = require('path');
const express = require('express');
const { Prisma } = require('@prisma/client');

const { AppError } = require('./utils/errors');
const { sendError } = require('./utils/response');
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const recordsRoutes = require('./routes/records.routes');
const categoriesRoutes = require('./routes/categories.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

// Serve the demo frontend (single-page)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Root route (also satisfies Render/uptime HEAD checks)
app.get('/', (req, res) => {
  res.json({ success: true, data: { name: 'Finance API', status: 'ok' } });
});

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/records', recordsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
});

// Error handler
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.code, err.details, err.statusCode);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return sendError(res, 'Duplicate resource', 'DUPLICATE_KEY', undefined, 400);
    }
    if (err.code === 'P2003') {
      return sendError(res, 'Referenced resource not found', 'FOREIGN_KEY_VIOLATION', undefined, 400);
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Resource not found', 'NOT_FOUND', undefined, 404);
    }
  }

  console.error(err);
  return sendError(res, 'An unexpected error occurred', 'INTERNAL_SERVER_ERROR', undefined, 500);
});

const port = Number(process.env.PORT || 3000);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Finance API listening on port ${port}`);
    console.log(`UI available at http://localhost:${port}/`);
  });
}

module.exports = app;