const bcrypt = require('bcrypt');

const prisma = require('../config/db');
const { AppError } = require('../utils/errors');

const sanitizeUser = (user) => (user ? {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  is_active: user.isActive,
  created_at: user.createdAt,
} : null);

const getUserById = async (userId, options = {}) => {
  if (options.includePasswordHash === false) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user ? sanitizeUser(user) : null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
  });
};

const listUsers = async ({ page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;

  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    users: users.map(sanitizeUser),
    meta: { page, limit, total },
  };
};

const createUser = async ({ name, email, password, role }, actorId) => {
  const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 10));

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  return sanitizeUser(user);
};

const updateUser = async (userId, updates, actorId) => {
  if (updates.name === undefined && updates.email === undefined) {
    throw new AppError('No updates provided', 400, 'NO_UPDATES');
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.email !== undefined ? { email: updates.email } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return sanitizeUser(user);
  } catch (error) {
    if (error?.code === 'P2025') {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    throw error;
  }
};

const changeUserRole = async (userId, role, actorId) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return sanitizeUser(user);
  } catch (error) {
    if (error?.code === 'P2025') {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    throw error;
  }
};

const toggleUserStatus = async (userId, actorId) => {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      isActive: true,
    },
  });

  if (!current) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !current.isActive },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  return sanitizeUser(user);
};

module.exports = {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  changeUserRole,
  toggleUserStatus,
  sanitizeUser,
};