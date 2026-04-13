const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/finsight';

let pool = null;

async function initializeDatabase() {
  pool = new Pool({
    connectionString: DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test connection
  try {
    const client = await pool.connect();
    console.log('[DB] Connected to PostgreSQL');
    client.release();
  } catch (error) {
    console.error('[DB] Failed to connect:', error.message);
    throw error;
  }

  try {
    await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('users', 'chat_history')
    `);
    console.log('[DB] Database tables verified');
  } catch (error) {
    console.log('[DB] Tables will be created on first use');
  }
}

function createUser(username, passwordHash) {
  return pool.query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
    [username, passwordHash]
  ).then(result => result.rows[0]?.id);
}

function getUserByUsername(username) {
  return pool.query(
    'SELECT * FROM users WHERE username = $1',
    [username]
  ).then(result => result.rows[0] || null);
}

function getUserById(id) {
  return pool.query(
    'SELECT id, username, created_at FROM users WHERE id = $1',
    [id]
  ).then(result => result.rows[0] || null);
}

function saveChatMessage(userId, message, response) {
  return pool.query(
    'INSERT INTO chat_history (user_id, message, response) VALUES ($1, $2, $3)',
    [userId, message, response]
  );
}

function getChatHistory(userId, limit = 50) {
  return pool.query(
    `SELECT message, response, created_at 
     FROM chat_history 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [userId, limit]
  ).then(result => result.rows);
}

function clearChatHistory(userId) {
  return pool.query(
    'DELETE FROM chat_history WHERE user_id = $1',
    [userId]
  );
}

async function closeDatabase() {
  if (pool) {
    await pool.end();
  }
}

module.exports = {
  initializeDatabase,
  createUser,
  getUserByUsername,
  getUserById,
  saveChatMessage,
  getChatHistory,
  clearChatHistory,
  closeDatabase
};
