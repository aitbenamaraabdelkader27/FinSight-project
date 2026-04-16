# FinSight - AI Assistant for KPMG Financial Officers

<div align="center">

![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-FF6B35?style=flat&logoColor=white)

**AI-powered financial assistant with local LLM, Discord integration, and full-stack web interface**

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Directory Structure](#directory-structure)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Running Without Docker](#running-without-docker)
- [API Endpoints](#api-endpoints)
- [Discord Bot Setup](#discord-bot-setup)
- [Discord Commands](#discord-commands)
- [Knowledge Base](#knowledge-base)
- [Video Presentation](#video-presentation)
- [Chat Conversations](#chat-conversations)
- [Troubleshooting](#troubleshooting)
- [Common Commands](#common-commands)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## Overview

FinSight is a comprehensive AI-powered chatbot designed for KPMG Financial Officers. It provides:

- **AI-powered conversations** using a local LLM (Ollama + Mistral Nemo)
- **Financial calculations** (depreciation, NPV, IRR, ROI, amortization, etc.)
- **IFRS/GAAP compliance** information and guidance
- **Tax regulation** support for EU jurisdictions
- **Web interface** built with Angular 17
- **Discord integration** with slash commands
- **User authentication** with JWT tokens
- **Chat history persistence** using PostgreSQL

All AI processing runs locally using Ollama - no external API calls or data leaves your infrastructure.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FinSight Architecture                          │
└─────────────────────────────────────────────────────────────────────────────┘

                           ┌─────────────────────────┐
                           │    Web Browser          │
                           │    (Angular 17)         │
                           └───────────┬─────────────┘
                                       │ HTTP
                           ┌───────────▼─────────────┐
                           │   finsight-api          │
                           │   (Express/Node.js)     │
                           │   Port: 3000            │
                           │   - JWT Auth            │
                           │   - Serves Angular      │
                           │   - Proxy to Python     │
                           └───────────┬─────────────┘
                                       │ HTTP
                           ┌───────────▼─────────────┐
                           │   finsight-bot           │
                           │   (Python 3.12)         │
                           │   Port: 5000            │
                           │   - Ollama Client       │
                           │   - Command Handler     │
                           │   - Calculator          │
                           └───────────┬─────────────┘
                                       │ HTTP
                           ┌───────────▼─────────────┐
                           │   finsight-ollama        │
                           │   (Mistral Nemo 12B)   │
                           │   Port: 11434           │
                           │   GPU: NVIDIA           │
                           └─────────────────────────┘

  ┌─────────────────┐                             ┌─────────────────────────┐
  │ Discord Client  │                             │   finsight-postgres      │
  └────────┬────────┘                             │   (PostgreSQL 15)       │
           │ HTTP                                  │   Port: 5432            │
           │                                       │   - Users               │
           └───────────┬───────────────────────────┴─────────────┬───────────┘
                       │                                             │
                       │                                    ┌──────▼──────┐
                       │                                    │ finsight-   │
                       └────────────────────────────────────│ discord     │
                                                            │ (Node.js)   │
                                                            └─────────────┘
```

### Services

| Service | URL | Description |
|---------|-----|-------------|
| `finsight-api` | `http://localhost:3000` | Express API, also serves the Angular web build |
| `finsight-web` | *(built into finsight-api image)* | Angular source built inside the `finsight-api` Docker image |
| `finsight-postgres` | `localhost:5432` | PostgreSQL 15 |
| `finsight-bot` | `http://finsight-bot:5000` *(internal)* | Python chatbot API |
| `finsight-ollama` | `http://localhost:11434` | Ollama LLM |
| `finsight-discord` | *(optional)* | Discord bot, started with the `discord` Compose profile |

### Data Flow

1. **Web**: Angular → Express API → Python Bot → Ollama → LLM Response
2. **Discord**: User → Discord API → finsight-discord → Python Bot → Ollama → Response
3. **Storage**: Express API → PostgreSQL (users, chat history)

---

## Features

### AI-Powered Chat
- Local LLM using Ollama (Mistral Nemo 12B)
- GPU-accelerated inference (NVIDIA, AMD, or CPU)
- Conversation history with context
- Fallback responses when LLM unavailable

### ChatGPT-Style Conversations
- Sidebar with conversation list
- Create new conversations with "+ New Chat" button
- Switch between conversations
- Delete conversations with confirmation
- Auto-generated titles from first message

### Financial Calculations
- **Depreciation** (straight-line, declining balance, sum-of-years)
- **Amortization** (straight-line, declining balance)
- **NPV** (Net Present Value)
- **IRR** (Internal Rate of Return)
- **ROI** (Return on Investment)
- Financial ratios and metrics

### Compliance Information
- IFRS 9 (Financial Instruments)
- IFRS 15 (Revenue Recognition)
- IFRS 16 (Leases)
- IAS 16 (Property, Plant & Equipment)
- US GAAP overview
- Compliance checklists

### Tax Support
- EU Corporate Tax rates
- VAT regulations
- Transfer pricing guidelines
- Filing deadlines

### Web Interface
- Modern Angular 17 SPA
- Dark theme design
- Real-time chat interface
- Connection status indicator
- **Video presentation** embedded on landing page

### Discord Integration
- Slash commands (`/chat`, `/calculate`, `/compliance`, `/tax`)
- Prefix commands (`!chat`, `!calc`, `!ifrs`, `!tax`)
- Warm-up on startup to handle cold starts
- Optional service started via `discord` Compose profile

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Protected API endpoints
- Chat history per user
- Conversations per user

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Frontend | Angular | 17.3.0 |
| Backend API | Node.js/Express | 20.x / 4.18.2 |
| Chatbot | Python | 3.12 |
| LLM Engine | Ollama | latest |
| Language Model | Mistral Nemo | 12B |
| Database | PostgreSQL | 15 |
| Discord | Discord.js | 14.x |
| Container | Docker | Latest |
| GPU | NVIDIA | Any CUDA-capable |

---

## Prerequisites

### Required (from WSL Ubuntu)

- **Docker Desktop** installed on Windows with **WSL integration** enabled for your Ubuntu distribution.
- Verify Docker is accessible from WSL:

```bash
docker compose version
```

### Optional (for local development)
- Node.js 20+
- Python 3.12+
- PostgreSQL 15+

---

## Directory Structure

```
B-AIA-210-PAR-2-1-eliza-24/
├── docker-compose.yml           # Container orchestration (core stack)
├── docker-compose.gpu.yml       # NVIDIA GPU override
├── docker-compose.amd.yml       # AMD GPU/APU override
├── .env                         # Environment variables (create from example)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
│
├── config/
│   └── database.sql             # PostgreSQL schema
│
├── finsight-web/                # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── landing/         # Landing page component
│   │   │   └── chat/            # Chat interface component
│   │   ├── styles.css          # Global styles (dark theme)
│   │   └── index.html          # Entry point
│   ├── angular.json             # Angular config
│   ├── package.json             # Dependencies
│   └── dist/                    # Built output
│
├── finsight-api/                # Express.js backend
│   ├── server.js                # Main server (routes, auth, proxy)
│   ├── db.js                    # PostgreSQL client
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── Dockerfile
│   └── package.json
│
├── finsight-bot/                # Python chatbot
│   ├── api.py                   # HTTP API server
│   ├── src/
│   │   ├── main.py              # CLI entry point
│   │   ├── chatbot/
│   │   │   ├── bot.py           # FinSightBot class
│   │   │   ├── ollama_client.py # Ollama integration
│   │   │   ├── commands.py      # Command handler
│   │   │   └── calculator.py   # Financial calculations
│   │   └── knowledge/           # Knowledge base
│   │       ├── ifrs/            # IFRS standards docs
│   │       ├── gaap/            # GAAP docs
│   │       ├── tax/             # Tax guides
│   │       ├── templates/       # Report templates
│   │       └── checklists/      # Audit checklists
│   ├── Dockerfile
│   └── requirements.txt
│
└── finsight-discord/            # Discord bot (optional)
    ├── bot.js                   # Main bot logic
    ├── package.json
    └── Dockerfile
```

---

## Quick Start

### 1. Clone and Configure

```bash
git clone <repository-url>
cd B-AIA-210-PAR-2-1-eliza-24
cp .env.example .env
```

### 2. Configure Environment Variables

Generate a JWT secret:

```bash
openssl rand -hex 32
```

Paste the generated value into `.env`:

```env
JWT_SECRET=paste_the_generated_value_here
```

For local development, all other default values in `.env.example` can stay unchanged.

> **Note:** The Discord bot token is only required if you plan to run the Discord bot. See [Discord Bot Setup](#discord-bot-setup).

### 3. Build and compose

_____________________________________________________________


### 4. Pull the Ollama Model

After the containers are running, pull the model (approx. 7.1 GB):

```bash
docker exec -it finsight-ollama ollama pull mistral-nemo
```

### 5. Verify Running Services

```bash
docker compose ps
```

Expected output:

```text
finsight-api        Up
finsight-bot        Up
finsight-ollama     Up
finsight-postgres   Up
```

### 6. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| Web UI | http://localhost:3000 | Angular frontend with video |
| Auth | http://localhost:3000/auth | Register or log in |
| Chat | http://localhost:3000/chat | Chat with conversations |
| API | http://localhost:3000/api | Express API |
| Ollama | http://localhost:11434 | LLM API |

### 7. First Login

1. Go to **http://localhost:3000/auth** and create an account.
2. Log in if redirected.
3. Go to **http://localhost:3000/chat** to start chatting.
4. Use the **"+ New Chat"** button to create new conversations.

> **Note:** The first message after starting Ollama may take 30–90 seconds as the model loads into memory.

> **Note:** When building the Angular frontend manually (outside Docker), use `npm run build` in the `finsight-web` directory, not `npx @angular/cli@17 build`, to prevent UI state reset issues.

---

## Configuration

### Ollama Context Window

The default Ollama context is set to `1024` tokens in Docker Compose so `mistral-nemo` can run on modest WSL machines. If you have more RAM or GPU memory, increase `OLLAMA_NUM_CTX` in your Compose file:

```yaml
environment:
  - OLLAMA_NUM_CTX=4096
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DISCORD_BOT_TOKEN` | *(required for Discord)* | Discord bot token |
| `JWT_SECRET` | `finsight-jwt-secret-change-in-production` | JWT signing secret |
| `DATABASE_URL` | `postgresql://postgres:postgres@postgres:5432/finsight` | PostgreSQL connection |
| `OLLAMA_BASE_URL` | `http://ollama:11434` | Ollama API URL |
| `OLLAMA_MODEL` | `mistral-nemo` | LLM model name |
| `OLLAMA_NUM_CTX` | `1024` | Ollama context window size |
| `PYTHON_API_URL` | `http://finsight-bot:5000` | Python bot URL |
| `PORT` | `3000` | Express server port |

### Docker Resources

The Ollama service is configured with GPU support. If running without a GPU, remove the `deploy` section from `docker-compose.yml`:

```yaml
# Remove this section from ollama service:
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

---

```

---

## Running Without Docker

### 1. PostgreSQL Setup

```bash
docker run -d -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=finsight \
  -p 5432:5432 postgres:15

psql -h localhost -U postgres -d finsight -f config/database.sql
```

### 2. Ollama Setup

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull mistral-nemo
ollama serve
```

### 3. Python Bot

```bash
cd finsight-bot
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
OLLAMA_BASE_URL=http://localhost:11434 python api.py
```

### 4. Express API

```bash
cd finsight-api
npm install
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finsight \
PYTHON_API_URL=http://localhost:5000 \
node server.js
```

### 5. Angular Frontend

```bash
cd finsight-web
npm install
npm start
# Visit http://localhost:4200
```

### 6. Discord Bot

```bash
cd finsight-discord
npm install
DISCORD_BOT_TOKEN=your_token PYTHON_API_URL=http://localhost:5000 node bot.js
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | No | Create new user account |
| POST | `/api/login` | No | Login, returns JWT token |

### Chat

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/chat` | Yes | Send message to AI |
| GET | `/api/chat/history` | Yes | Get user's chat history |
| DELETE | `/api/chat/history` | Yes | Clear chat history |

### Conversations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/chat/conversations` | Yes | Get user's conversations |
| POST | `/api/chat/conversations` | Yes | Create new conversation |
| DELETE | `/api/chat/conversations/:id` | Yes | Delete conversation |
| GET | `/api/chat/messages/:conversationId` | Yes | Get messages for conversation |

### User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/me` | Yes | Get current user info |

### System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/*` | No | Serve Angular frontend |

### Python Bot API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `http://localhost:5000/api/chat` | Send message |
| GET | `http://localhost:5000/api/health` | Health check |

---

## Discord Bot Setup

The Discord bot is **optional**. It is not started by default and requires a separate Compose profile.

### 1. Create or Open the Discord Application

Go to:

```
https://discord.com/developers/applications
```

Create a new application or open your existing FinSight application.

### 2. Create the Bot Token

In the Discord Developer Portal:

1. Open your application.
2. Go to **Bot**.
3. Click **Reset Token** or **View Token**.
4. Copy the token.

Add it to `.env`:

```env
DISCORD_BOT_TOKEN=paste_your_discord_bot_token_here
```

> Keep this token private. Do not commit `.env`.

### 3. Enable Required Bot Settings

In **Bot > Privileged Gateway Intents**, enable:

```
Message Content Intent
```

This is required because the bot supports prefix commands like `!chat`, `!calc`, and `!ping`.

Without this setting the container will restart with:

```
Error: Used disallowed intents
```

### 4. Invite the Bot to Your Server

In the Developer Portal:

1. Go to **OAuth2 > URL Generator**.
2. Select scopes:

```
bot
applications.commands
```

3. Select bot permissions. For local testing, **Administrator** is the simplest option.
   - If not using Administrator, the bot needs permissions to: read messages, send messages, use slash commands, and embed links.
4. Open the generated URL, choose your Discord server, and authorize.

Alternatively, you can invite the original hosted bot directly:

```
https://discord.com/oauth2/authorize?client_id=1488875465920745592&permissions=8&integration_type=0&scope=bot
```

### 5. Start the Discord Bot

Make sure the core stack is running first:

```bash
docker compose up -d
```

Then start the Discord bot with its profile:

```bash
docker compose --profile discord up -d finsight-discord
```

Check status:

```bash
docker compose ps
```

Expected:

```text
finsight-discord    Up
```

If it shows `Restarting`, check the logs:

```bash
docker compose logs --tail=80 finsight-discord
```

Follow live logs:

```bash
docker compose logs -f finsight-discord
```

Restart after changing `.env` or Discord Developer Portal settings:

```bash
docker compose --profile discord restart finsight-discord
```

> **Note:** The Discord bot calls the same Python chatbot API as the web app. The core stack must be running for AI responses.

---

## Discord Commands

### Slash Commands

| Command | Example | Description |
|---------|---------|-------------|
| `/chat <message>` | `/chat What is EBITDA?` | Ask a financial question |
| `/calculate <formula>` | `/calculate npv 1000 10% 5` | Financial calculation |
| `/compliance <standard>` | `/compliance ifrs16` | IFRS/GAAP info |
| `/tax <topic>` | `/tax vat` | Tax information |
| `/help` | — | Show all commands |
| `/ping` | — | Check bot status |

### Prefix Commands

| Command | Example | Description |
|---------|---------|-------------|
| `!chat <message>` | `!chat What is ROI?` | Chat (alternative) |
| `!calc <formula>` | `!calc depreciation 10000 5` | Calculator |
| `!ifrs <standard>` | `!ifrs 16` | Compliance |
| `!tax <topic>` | `!tax corporate` | Tax info |
| `!help` | — | Help |
| `!ping` | — | Status |

### Calculation Examples

```
/calculate depreciation 10000 5 1000
/calculate amortization 50000 5% 10
/calculate npv 1000 10% 5
/calculate irr -1000 300 400 500
/calculate roi 10000 15000 2
```

---

## Knowledge Base

### IFRS Standards
- **IFRS 9** - Financial Instruments
- **IFRS 15** - Revenue from Contracts with Customers
- **IFRS 16** - Leases
- **IAS 16** - Property, Plant and Equipment

### Tax Topics
- EU Corporate Tax rates and deductions
- VAT handling and compliance
- Transfer pricing guidelines
- Filing deadlines

### Checklists
- IFRS Compliance checklist
- Year-end audit preparation

### Templates
- Financial statement templates (Balance Sheet, P&L, Cash Flow)

---

## Video Presentation

The landing page includes an embedded video presentation that demonstrates FinSight's capabilities for KPMG Financial Officers. The video showcases:

- AI-powered financial analysis
- Real-time chat interface with contextual understanding
- Financial calculation tools (NPV, IRR, ROI, depreciation)
- Compliance information access (IFRS/GAAP)
- Tax regulation support for EU jurisdictions
- Conversation management features

The video is automatically served from the Angular assets folder and plays on the landing page at http://localhost:3000

---

## Chat Conversations

FinSight features a ChatGPT-style conversation system that allows users to:

- **Create new conversations** using the "+ New Chat" button in the sidebar
- **Switch between conversations** by clicking on any conversation in the list
- **View conversation history** with persistent storage in PostgreSQL
- **Delete conversations** with confirmation dialog
- **Auto-generated titles** based on the first message in each conversation
- **Maintain context** within each conversation for more coherent AI interactions

### How It Works
1. When you start a new chat, a conversation entry is created in the database
2. All messages exchanged are stored with their conversation ID
3. Switching conversations loads the appropriate message history
4. The sidebar shows all your conversations with timestamps
5. Active conversations are highlighted in the sidebar

---

## Troubleshooting

### Web App Not Responding

```bash
curl http://localhost:3000/api/health
curl http://localhost:11434/api/tags
docker compose logs -f finsight-api finsight-bot
```

If `mistral-nemo` is missing, pull it again:

```bash
docker exec -it finsight-ollama ollama pull mistral-nemo
```

### Ollama Cold Start

The first request after container restart takes 30–90 seconds while the model loads into GPU memory. The Discord bot includes a warm-up on startup. If you encounter timeouts:

- Increase timeout in `finsight-discord/bot.js` (current: 90s)
- Wait 60s after container start before issuing commands

### Discord Bot Restarting

If `finsight-discord` shows `Restarting`, the most common cause is a missing or incorrect **Message Content Intent** in the Discord Developer Portal.

Check logs for:

```
Error: Used disallowed intents
```

Fix: Enable **Message Content Intent** under **Bot > Privileged Gateway Intents** in the Discord Developer Portal, then restart:

```bash
docker compose --profile discord restart finsight-discord
```

### Container Network Issues

All containers communicate via the `finsight-network` Docker network. If services can't reach each other:

```bash
# Verify network
docker network inspect B-AIA-210-PAR-2-1-eliza-24_finsight-network

# Check logs for connection errors
docker compose logs finsight-bot
docker compose logs finsight-discord
```

### Database Connection

```bash
# Test PostgreSQL connection
docker exec finsight-postgres pg_isready -U postgres

# Connect to database
docker exec -it finsight-postgres psql -U postgres -d finsight
```

### Pull Ollama Model

```bash
# Pull model inside the container
docker exec -it finsight-ollama ollama pull mistral-nemo

# List available models
docker exec -it finsight-ollama ollama list
```

---

## Common Commands

Start the core web stack:

```bash
docker compose up -d
```

Start the Discord bot as well:

```bash
docker compose --profile discord up -d finsight-discord
```

Restart only the Discord bot:

```bash
docker compose --profile discord restart finsight-discord
```

Show container status:

```bash
docker compose ps
```

Show core logs:

```bash
docker compose logs -f finsight-api finsight-bot
```

Show Discord logs:

```bash
docker compose logs -f finsight-discord
```

Stop everything (including Discord bot):

```bash
docker compose --profile discord down
```

Stop only the Discord bot:

```bash
docker compose --profile discord stop finsight-discord
```

Rebuild after code changes:

```bash
docker compose build
docker compose up -d
docker compose --profile discord up -d finsight-discord
```

---

## Environment Variables Reference

### finsight-api (.env)
```bash
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/finsight
JWT_SECRET=your-secret-key
PYTHON_API_URL=http://finsight-bot:5000
PORT=3000
```

### finsight-bot (.env)
```bash
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=mistral-nemo
OLLAMA_NUM_CTX=1024
```

### finsight-discord (.env)
```bash
DISCORD_BOT_TOKEN=your_bot_token
PYTHON_API_URL=http://finsight-bot:5000
EXPRESS_API_URL=http://finsight-api:3000
```

---

## Credits

- **Ollama** - https://ollama.ai
- **Mistral Nemo** - https://mistral.ai
- **Angular** - https://angular.io
- **Discord.js** - https://discord.js.org
- **PostgreSQL** - https://www.postgresql.org
```
