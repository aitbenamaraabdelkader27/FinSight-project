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

  try {
    await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('users', 'conversations', 'messages')
    `);
    console.log('[DB] Database tables verified');
  } catch (error) {
    console.log('[DB] Tables will be created on first use');
  }
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
