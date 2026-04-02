require('dotenv').config();

const bcrypt = require('bcrypt');

const prisma = require('../src/config/db');

const seed = async () => {
  try {
    await prisma.auditLog.deleteMany();
    await prisma.financialRecord.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('Password123!', Number(process.env.BCRYPT_SALT_ROUNDS || 10));

    const userRows = await Promise.all(
      [
        { name: 'Admin User', email: 'admin@finance.local', role: 'admin' },
        { name: 'Analyst User', email: 'analyst@finance.local', role: 'analyst' },
        { name: 'Viewer User', email: 'viewer@finance.local', role: 'viewer' },
      ].map((user) =>
        prisma.user.create({
          data: {
            name: user.name,
            email: user.email,
            passwordHash,
            role: user.role,
          },
          select: { id: true, name: true, email: true, role: true },
        })
      )
    );

    const categoryRows = await Promise.all(
      [
        { name: 'Salary', type: 'income' },
        { name: 'Freelance', type: 'income' },
        { name: 'Investments', type: 'both' },
        { name: 'Rent', type: 'expense' },
        { name: 'Utilities', type: 'expense' },
        { name: 'Travel', type: 'expense' },
        { name: 'Consulting', type: 'income' },
      ].map((category) =>
        prisma.category.create({
          data: {
            name: category.name,
            type: category.type,
          },
          select: { id: true, name: true, type: true },
        })
      )
    );

    const incomeCategories = categoryRows.filter((category) => category.type !== 'expense');
    const expenseCategories = categoryRows.filter((category) => category.type !== 'income');
    const users = {
      admin: userRows.find((user) => user.role === 'admin'),
      analyst: userRows.find((user) => user.role === 'analyst'),
      viewer: userRows.find((user) => user.role === 'viewer'),
    };

    for (let index = 0; index < 20; index += 1) {
      const isIncome = index % 2 === 0;
      const categoryPool = isIncome ? incomeCategories : expenseCategories;
      const category = categoryPool[index % categoryPool.length];
      const actor = index % 3 === 0 ? users.admin : index % 3 === 1 ? users.analyst : users.viewer;
      const amount = isIncome ? 1200 + index * 75 : 180 + index * 22;
      const date = new Date();
      date.setDate(date.getDate() - index * 3);

      await prisma.financialRecord.create({
        data: {
          userId: actor.id,
          categoryId: category.id,
          amount: amount.toFixed(2),
          type: isIncome ? 'income' : 'expense',
          notes: `${category.name} transaction ${index + 1}`,
          recordDate: new Date(date.toISOString().slice(0, 10)),
        },
      });
    }

    console.log('Database seeded successfully');
    console.log('Seeded users: admin@finance.local, analyst@finance.local, viewer@finance.local');
    console.log('Default password: Password123!');
  } catch (error) {
    throw error;
  }
};

const disconnect = async () => {
  await prisma.$disconnect();
};

seed()
  .then(disconnect)
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await disconnect();
    process.exit(1);
  });