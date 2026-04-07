const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5000';
const ANGULAR_DIST = path.join(__dirname, '..', 'finsight-web', 'dist', 'finsight-web', 'browser');

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

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const data = await callPythonBot(message);
        res.json(data);
    } catch (error) {
        console.error('Bot error:', error.message);
        res.status(500).json({ error: 'Failed to get response from bot' });
    }
});

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

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   FinSight API Server                                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

Server running on: http://localhost:${PORT}
📁 Frontend served from: ${ANGULAR_DIST}
🔗 Python API: ${PYTHON_API_URL}

Endpoints:
  POST /api/chat   - Send a message to the bot
  GET  /api/health - Check API status

Note: Make sure the Python API is running:
  cd finsight-bot && python3 api.py
`);
});
