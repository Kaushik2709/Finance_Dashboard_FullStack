const prisma = require('../config/db');
const { AppError } = require('../utils/errors');

const recordToResponse = (record) => ({
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
  user: record.user
    ? {
        id: record.user.id,
        name: record.user.name,
        email: record.user.email,
        role: record.user.role,
      }
    : undefined,
  category: record.category
    ? {
        id: record.category.id,
        name: record.category.name,
        type: record.category.type,
      }
    : undefined,
});

const ensureCategoryTypeMatches = (category, recordType) => {
  if (!category) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  if (category.type !== 'both' && category.type !== recordType) {
    throw new AppError('Category type does not match record type', 400, 'CATEGORY_TYPE_MISMATCH');
  }
};

const resolveOrderBy = (sortValue) => {
  const sortMap = {
    record_date: 'recordDate',
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    amount: 'amount',
  };

  const [field = 'record_date', direction = 'desc'] = (sortValue || 'record_date:desc').split(':');
  const orderField = sortMap[field] || sortMap.record_date;
  const orderDirection = direction.toLowerCase() === 'asc' ? 'asc' : 'desc';

  return { [orderField]: orderDirection };
};

const buildWhere = ({ type, category_id, from, to }) => {
  const where = {
    isDeleted: false,
  };

  if (type) {
    where.type = type;
  }

  if (category_id) {
    where.categoryId = category_id;
  }

  if (from || to) {
    where.recordDate = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  return where;
};

const getRecordById = async (recordId) => {
  const record = await prisma.financialRecord.findFirst({
    where: {
      id: recordId,
      isDeleted: false,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      category: {
        select: { id: true, name: true, type: true },
      },
    },
  });

  return record ? recordToResponse(record) : null;
};

const listRecords = async ({ type, category_id, from, to, page = 1, limit = 20, sort }) => {
  const skip = (page - 1) * limit;
  const where = buildWhere({ type, category_id, from, to });

  const [total, records] = await Promise.all([
    prisma.financialRecord.count({ where }),
    prisma.financialRecord.findMany({
      where,
      skip,
      take: limit,
      orderBy: resolveOrderBy(sort),
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        category: {
          select: { id: true, name: true, type: true },
        },
      },
    }),
  ]);

  return {
    records: records.map(recordToResponse),
    meta: {
      page,
      limit,
      total,
    },
  };
};

const createRecord = async (payload, actor) => {
  const targetUserId = payload.user_id || actor.sub;

  if (actor.role === 'analyst' && targetUserId !== actor.sub) {
    throw new AppError('Analysts can only create their own records', 403, 'FORBIDDEN');
  }

  const [targetUser, category] = await Promise.all([
    prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true } }),
    prisma.category.findUnique({ where: { id: payload.category_id }, select: { id: true, type: true } }),
  ]);

  if (!targetUser) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  ensureCategoryTypeMatches(category, payload.type);

  const record = await prisma.financialRecord.create({
    data: {
      userId: targetUserId,
      categoryId: payload.category_id,
      amount: String(payload.amount),
      type: payload.type,
      notes: payload.notes ?? null,
      recordDate: new Date(payload.record_date),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      category: {
        select: { id: true, name: true, type: true },
      },
    },
  });
  return recordToResponse(record);
};

const updateRecord = async (recordId, payload, actor) => {
  const existing = await prisma.financialRecord.findUnique({
    where: { id: recordId },
    select: {
      id: true,
      userId: true,
      categoryId: true,
      type: true,
      isDeleted: true,
    },
  });

  if (!existing || existing.isDeleted) {
    throw new AppError('Record not found', 404, 'RECORD_NOT_FOUND');
  }

  if (actor.role === 'analyst' && existing.userId !== actor.sub) {
    throw new AppError('Analysts can only update their own records', 403, 'FORBIDDEN');
  }

  const nextCategoryId = payload.category_id || existing.categoryId;
  const nextType = payload.type || existing.type;

  const category = await prisma.category.findUnique({
    where: { id: nextCategoryId },
    select: { id: true, type: true },
  });

  ensureCategoryTypeMatches(category, nextType);

  const record = await prisma.financialRecord.update({
    where: { id: recordId },
    data: {
      ...(payload.category_id !== undefined ? { categoryId: payload.category_id } : {}),
      ...(payload.amount !== undefined ? { amount: String(payload.amount) } : {}),
      ...(payload.type !== undefined ? { type: payload.type } : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes ?? null } : {}),
      ...(payload.record_date !== undefined ? { recordDate: new Date(payload.record_date) } : {}),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      category: {
        select: { id: true, name: true, type: true },
      },
    },
  });
  return recordToResponse(record);
};

const deleteRecord = async (recordId, actor) => {
  const existing = await prisma.financialRecord.findUnique({
    where: { id: recordId },
    select: {
      id: true,
      userId: true,
      isDeleted: true,
    },
  });

  if (!existing || existing.isDeleted) {
    throw new AppError('Record not found', 404, 'RECORD_NOT_FOUND');
  }

  if (actor.role === 'analyst' && existing.userId !== actor.sub) {
    throw new AppError('Analysts can only delete their own records', 403, 'FORBIDDEN');
  }

  await prisma.financialRecord.update({
    where: { id: recordId },
    data: { isDeleted: true },
  });

  return {
    id: recordId,
    is_deleted: true,
  };
};

module.exports = {
  listRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
};