const { Prisma } = require('@prisma/client');

const prisma = require('../config/db');

const buildWhere = ({ from, to }) => {
  const where = {
    isDeleted: false,
  };

  if (from || to) {
    where.recordDate = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  return where;
};

const getSummary = async ({ from, to }) => {
  const where = buildWhere({ from, to });

  const grouped = await prisma.financialRecord.groupBy({
    by: ['type'],
    where,
    _sum: { amount: true },
    _count: { _all: true },
  });

  let totalIncome = 0;
  let totalExpenses = 0;
  let recordCount = 0;

  for (const row of grouped) {
    recordCount += row._count._all;
    const amount = row._sum.amount ? Number(row._sum.amount) : 0;

    if (row.type === 'income') {
      totalIncome += amount;
    } else if (row.type === 'expense') {
      totalExpenses += amount;
    }
  }

  return {
    total_income: totalIncome,
    total_expenses: totalExpenses,
    net_balance: totalIncome - totalExpenses,
    record_count: recordCount,
  };
};

const getByCategory = async ({ from, to }) => {
  const conditions = [Prisma.sql`r.is_deleted = FALSE`];

  if (from) {
    conditions.push(Prisma.sql`r.record_date >= ${new Date(from)}::date`);
  }

  if (to) {
    conditions.push(Prisma.sql`r.record_date <= ${new Date(to)}::date`);
  }

  const where = conditions.reduce(
    (acc, clause, index) => (index === 0 ? clause : Prisma.sql`${acc} AND ${clause}`),
    Prisma.sql``
  );

  const rows = await prisma.$queryRaw(
    Prisma.sql`
      SELECT
        c.id AS category_id,
        c.name AS category_name,
        c.type AS category_type,
        COALESCE(SUM(r.amount), 0) AS total_amount,
        COUNT(r.id)::int AS record_count
      FROM financial_records r
      JOIN categories c ON c.id = r.category_id
      WHERE ${where}
      GROUP BY c.id, c.name, c.type
      ORDER BY total_amount DESC, c.name ASC
    `
  );

  return rows.map((row) => ({
    category_id: row.category_id,
    category_name: row.category_name,
    category_type: row.category_type,
    total_amount: Number(row.total_amount),
    record_count: Number(row.record_count),
  }));
};

const getTrends = async ({ period = 'monthly' }) => {
  const bucket = period === 'weekly' ? 'week' : 'month';
  const bucketLiteral = Prisma.raw(`'${bucket}'`);

  const rows = await prisma.$queryRaw(
    Prisma.sql`
      SELECT
        DATE_TRUNC(${bucketLiteral}, r.record_date)::date AS period_start,
        COALESCE(SUM(CASE WHEN r.type = 'income' THEN r.amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN r.type = 'expense' THEN r.amount ELSE 0 END), 0) AS total_expenses
      FROM financial_records r
      WHERE r.is_deleted = FALSE
      GROUP BY DATE_TRUNC(${bucketLiteral}, r.record_date)::date
      ORDER BY period_start ASC
    `
  );

  return rows.map((row) => ({
    period_start: row.period_start,
    total_income: Number(row.total_income),
    total_expenses: Number(row.total_expenses),
  }));
};

const getRecent = async ({ limit = 10 }) => {
  const records = await prisma.financialRecord.findMany({
    where: {
      isDeleted: false,
    },
    take: limit,
    orderBy: [{ recordDate: 'desc' }, { createdAt: 'desc' }],
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      category: {
        select: { id: true, name: true, type: true },
      },
    },
  });

  return records.map((record) => ({
    id: record.id,
    user_id: record.userId,
    category_id: record.categoryId,
    amount: record.amount ? Number(record.amount) : 0,
    type: record.type,
    notes: record.notes,
    record_date: record.recordDate,
    is_deleted: record.isDeleted,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    user: {
      id: record.user.id,
      name: record.user.name,
      email: record.user.email,
      role: record.user.role,
    },
    category: {
      id: record.category.id,
      name: record.category.name,
      type: record.category.type,
    },
  }));
};

module.exports = {
  getSummary,
  getByCategory,
  getTrends,
  getRecent,
};