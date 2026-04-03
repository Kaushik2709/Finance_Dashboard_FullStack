const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const prisma = require('../config/db');
const { AppError } = require('../utils/errors');
const { sanitizeUser, getUserById } = require('./user.service');

const getUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const signToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new AppError('JWT_SECRET is not configured', 500, 'MISCONFIGURED_SERVER');
  }

  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      is_active: user.isActive,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      jwtid: randomUUID(),
    }
  );
};

const register = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError('User already exists', 400, 'USER_EXISTS');
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'viewer',
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

    const token = signToken(user);

    return {
      token,
      user: sanitizeUser(user),
    };
  } catch (error) {
    if (error?.code === 'P2002') {
      throw new AppError('User already exists', 400, 'USER_EXISTS');
    }

    throw error;
  }
};

const login = async ({ email, password }) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const matches = await bcrypt.compare(password, user.passwordHash);

  if (!matches) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new AppError('Your account is inactive', 403, 'FORBIDDEN');
  }

  const token = signToken(user);

  return {
    token,
    user: sanitizeUser(user),
  };
};

const getCurrentUser = async (userId) => {
  const user = await getUserById(userId, { includePasswordHash: false });
  return user;
};

module.exports = {
  login,
  getCurrentUser,
  register,
};