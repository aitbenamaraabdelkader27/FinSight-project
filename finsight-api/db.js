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

  try {
    const client = await pool.connect();
    console.log('[DB] Connected to PostgreSQL');
    client.release();
  } catch (error) {
    console.error('[DB] Failed to connect:', error.message);
    throw error;
  }

  await createSchema();
  console.log('[DB] Database tables verified');
}

async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
      role VARCHAR(20) DEFAULT 'user',
      message TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
  `);
}

// ==================== Users ====================

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

// ==================== Conversations ====================

function createConversation(userId, title = 'New Chat') {
  return pool.query(
    'INSERT INTO conversations (user_id, title) VALUES ($1, $2) RETURNING *',
    [userId, title]
  ).then(result => result.rows[0]);
}

function getConversations(userId) {
  return pool.query(
    `SELECT c.*, 
            (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count
     FROM conversations c 
     WHERE c.user_id = $1 
     ORDER BY c.updated_at DESC`,
    [userId]
  ).then(result => result.rows);
}

function getConversation(userId, conversationId) {
  return pool.query(
    'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
    [conversationId, userId]
  ).then(result => result.rows[0] || null);
}

function updateConversationTitle(conversationId, userId, title) {
  return pool.query(
    'UPDATE conversations SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
    [title, conversationId, userId]
  ).then(result => result.rows[0]);
}

function deleteConversation(conversationId, userId) {
  return pool.query(
    'DELETE FROM conversations WHERE id = $1 AND user_id = $2',
    [conversationId, userId]
  );
}

function getOrCreateDefaultConversation(userId) {
  return pool.query(
    'SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
    [userId]
  ).then(result => {
    if (result.rows[0]) {
      return result.rows[0];
    }
    return createConversation(userId, 'General Chat');
  });
}

// ==================== Messages ====================

function saveChatMessage(userId, message, response, conversationId, role = 'user') {
  if (!conversationId) {
    return Promise.resolve(null);
  }
  
  return pool.query(
    'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [conversationId]
  ).then(() => {
    return pool.query(
      'INSERT INTO messages (user_id, message, response, conversation_id, role) VALUES ($1, $2, $3, $4, $5)',
      [userId, message, response, conversationId, role]
    );
  });
}

function getConversationMessages(userId, conversationId, limit = 100) {
  return pool.query(
    `SELECT message, response, role, created_at 
     FROM messages 
     WHERE user_id = $1 AND conversation_id = $2 
     ORDER BY created_at ASC 
     LIMIT $3`,
    [userId, conversationId, limit]
  ).then(result => result.rows);
}

// Backward compatibility - getChatHistory
function getChatHistory(userId, limit = 50) {
  return pool.query(
    `SELECT message, response, role, created_at 
     FROM messages 
     WHERE user_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2`,
    [userId, limit]
  ).then(result => result.rows);
}

// Backward compatibility - clearChatHistory
function clearChatHistory(userId) {
  return pool.query('DELETE FROM messages WHERE user_id = $1', [userId]);
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
  createConversation,
  getConversations,
  getConversation,
  updateConversationTitle,
  deleteConversation,
  getOrCreateDefaultConversation,
  saveChatMessage,
  getConversationMessages,
  getChatHistory,
  clearChatHistory,
  closeDatabase
};
