const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'finsight.db');

let db = null;
let SQL = null;

async function initializeDatabase() {
  SQL = await initSqlJs();
  
  try {
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
      console.log('[DB] Database loaded from file');
    } else {
      db = new SQL.Database();
      console.log('[DB] New database created');
    }
  } catch (error) {
    db = new SQL.Database();
    console.log('[DB] Database created (error loading: ' + error.message + ')');
  }
  
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      response TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  saveDatabase();
  console.log('[DB] Database initialized');
}

function saveDatabase() {
  if (db && DB_PATH) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

function createUser(username, passwordHash) {
  db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash]);
  const result = db.exec('SELECT last_insert_rowid() as id');
  saveDatabase();
  return result[0]?.values[0]?.[0];
}

function getUserByUsername(username) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  stmt.bind([username]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function getUserById(id) {
  const stmt = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?');
  stmt.bind([id]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function saveChatMessage(userId, message, response) {
  db.run('INSERT INTO chat_history (user_id, message, response) VALUES (?, ?, ?)', 
    [userId, message, response]);
  saveDatabase();
}

function getChatHistory(userId, limit = 50) {
  const stmt = db.prepare(`
    SELECT message, response, created_at 
    FROM chat_history 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT ?
  `);
  stmt.bind([userId, limit]);
  
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function clearChatHistory(userId) {
  db.run('DELETE FROM chat_history WHERE user_id = ?', [userId]);
  saveDatabase();
}

module.exports = {
  initializeDatabase,
  createUser,
  getUserByUsername,
  getUserById,
  saveChatMessage,
  getChatHistory,
  clearChatHistory
};