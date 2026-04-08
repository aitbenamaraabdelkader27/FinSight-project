const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { generateToken, authMiddleware, optionalAuthMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5000';
const ANGULAR_DIST = path.join(__dirname, '..', 'finsight-web', 'dist', 'finsight-web', 'browser');

let db = null;

async function initDb() {
  const dbModule = require('./db');
  await dbModule.initializeDatabase();
  return dbModule;
}

async function callPythonBot(message) {
  const response = await fetch(`${PYTHON_API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  if (!response.ok) {
    throw new Error('Python API error');
  }
  
  return response.json();
}

// ==================== Auth Endpoints ====================

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const existingUser = db.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = db.createUser(username, passwordHash);
    
    const token = generateToken(userId, username);
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, username }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const user = db.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const token = generateToken(user.id, user.username);
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// ==================== Protected Endpoints ====================

app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const data = await callPythonBot(message);
    
    db.saveChatMessage(req.user.userId, message, data.response);
    
    res.json(data);
  } catch (error) {
    console.error('Bot error:', error.message);
    res.status(500).json({ error: 'Failed to get response from bot' });
  }
});

app.get('/api/chat/history', authMiddleware, (req, res) => {
  try {
    const history = db.getChatHistory(req.user.userId);
    res.json({ history });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

app.delete('/api/chat/history', authMiddleware, (req, res) => {
  try {
    db.clearChatHistory(req.user.userId);
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

app.get('/api/me', authMiddleware, (req, res) => {
  const user = db.getUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

// ==================== Health & Static ====================

app.get('/api/health', async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_API_URL}/api/health`);
    if (response.ok) {
      res.json({ status: 'ok', pythonApi: 'connected' });
    } else {
      res.json({ status: 'degraded', pythonApi: 'disconnected' });
    }
  } catch (error) {
    res.json({ status: 'degraded', pythonApi: 'disconnected' });
  }
});

app.use(express.static(ANGULAR_DIST));

app.get('*', (req, res) => {
  res.sendFile(path.join(ANGULAR_DIST, 'index.html'));
});

// Start server
initDb().then(database => {
  db = database;
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║   FinSight API Server                               ║
╚═══════════════════════════════════════════════════════════╝

✅ Server running on: http://localhost:${PORT}
📁 Frontend served from: ${ANGULAR_DIST}
🔗 Python API: ${PYTHON_API_URL}
📀 Database: SQLite (sql.js)

Auth Endpoints:
  POST /api/register - Create new account
  POST /api/login  - Login and get token

Protected Endpoints (requires JWT):
  POST /api/chat - Send message to bot
  GET  /api/chat/history - Get chat history
  DELETE /api/chat/history - Clear history
  GET  /api/me - Get current user

Note: Make sure the Python API is running:
  cd finsight-bot && python3 api.py
`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});