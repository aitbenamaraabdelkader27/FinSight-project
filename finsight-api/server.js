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
const ANGULAR_DIST = path.join(__dirname, 'dist', 'finsight-web', 'browser');

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
    
    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await db.createUser(username, passwordHash);
    
    // Create default conversation for new user
    await db.createConversation(userId, 'General Chat');
    
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
    
    const user = await db.getUserByUsername(username);
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

// ==================== Conversations Endpoints ====================

app.get('/api/chat/conversations', authMiddleware, async (req, res) => {
  try {
    const conversations = await db.getConversations(req.user.userId);
    res.json({ conversations });
  } catch (error) {
    console.error('Conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

app.post('/api/chat/conversations', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    const defaultTitle = title || 'New Chat';
    const conversation = await db.createConversation(req.user.userId, defaultTitle);
    res.status(201).json({ conversation });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

app.get('/api/chat/conversations/:id', authMiddleware, async (req, res) => {
  try {
    const conversation = await db.getConversation(req.user.userId, req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    const messages = await db.getConversationMessages(req.user.userId, req.params.id);
    res.json({ conversation, messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

app.delete('/api/chat/conversations/:id', authMiddleware, async (req, res) => {
  try {
    await db.deleteConversation(req.params.id, req.user.userId);
    res.json({ message: 'Conversation deleted' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

app.put('/api/chat/conversations/:id/title', authMiddleware, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const conversation = await db.updateConversationTitle(req.params.id, req.user.userId, title);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json({ conversation });
  } catch (error) {
    console.error('Update title error:', error);
    res.status(500).json({ error: 'Failed to update title' });
  }
});

// ==================== Chat Endpoints ====================

app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let convId = conversationId;

    // Get or create conversation
    if (!convId) {
      const conv = await db.getOrCreateDefaultConversation(req.user.userId);
      convId = conv.id;
    }

    // Auto-update title if first message in conversation
    const existingMessages = await db.getConversationMessages(req.user.userId, convId);
    if (existingMessages.length === 0) {
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      await db.updateConversationTitle(convId, req.user.userId, title);
    }

    const data = await callPythonBot(message);
    
    // Save user message
    await db.saveChatMessage(req.user.userId, message, data.response, convId, 'user');
    // Save assistant response
    await db.saveChatMessage(req.user.userId, 'FinSight', data.response, convId, 'assistant');
    
    res.json({ ...data, conversationId: convId });
  } catch (error) {
    console.error('Bot error:', error.message);
    res.status(500).json({ error: 'Failed to get response from bot' });
  }
});

// Backward compatibility - Get chat history
app.get('/api/chat/history', authMiddleware, async (req, res) => {
  try {
    const history = await db.getChatHistory(req.user.userId);
    res.json({ history });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// Backward compatibility - Clear chat history
app.delete('/api/chat/history', authMiddleware, async (req, res) => {
  try {
    await db.clearChatHistory(req.user.userId);
    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

app.get('/api/me', authMiddleware, async (req, res) => {
  const user = await db.getUserById(req.user.userId);
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
📀 Database: PostgreSQL (conversations + messages)

Auth Endpoints:
  POST /api/register - Create new account
  POST /api/login   - Login and get token

Conversations (ChatGPT-style):
  GET    /api/chat/conversations        - List all conversations
  POST   /api/chat/conversations        - Create new conversation
  GET    /api/chat/conversations/:id    - Get conversation + messages
  DELETE /api/chat/conversations/:id    - Delete conversation
  PUT    /api/chat/conversations/:id/title - Update title

Chat Endpoints (requires JWT):
  POST   /api/chat           - Send message
  GET    /api/chat/history  - Get chat history (backward compat)
  DELETE /api/chat/history - Clear history (backward compat)
  GET    /api/me            - Get current user
`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
