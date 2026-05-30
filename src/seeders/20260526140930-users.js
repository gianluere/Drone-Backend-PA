'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const hash = await bcrypt.hash('password123', 10);

    await queryInterface.bulkInsert('users', [
      {
        email: 'user1@example.com',
        password_hash: hash,
        role: 'user',
        token_balance: 100,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'user2@example.com',
        password_hash: hash,
        role: 'user',
        token_balance: 50,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'user3@example.com',
        password_hash: hash,
        role: 'user',
        token_balance: 5, // ha solo i token per una richiesta
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'operator@example.com',
        password_hash: hash,
        role: 'operator',
        token_balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        email: 'admin@example.com',
        password_hash: hash,
        role: 'admin',
        token_balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};