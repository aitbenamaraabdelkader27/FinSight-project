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
- [Discord Commands](#discord-commands)
- [Knowledge Base](#knowledge-base)
- [Troubleshooting](#troubleshooting)
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

### Data Flow

1. **Web**: Angular → Express API → Python Bot → Ollama → LLM Response
2. **Discord**: User → Discord API → finsight-discord → Python Bot → Ollama → Response
3. **Storage**: Express API → PostgreSQL (users, chat history)

---

## Features

### AI-Powered Chat
- Local LLM using Ollama (Mistral Nemo 12B)
- GPU-accelerated inference (NVIDIA)
- Conversation history with context
- Fallback responses when LLM unavailable

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

### Discord Integration
- Slash commands (`/chat`, `/calculate`, `/compliance`, `/tax`)
- Prefix commands (`!chat`, `!calc`, `!ifrs`, `!tax`)
- Warm-up on startup to handle cold starts

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Protected API endpoints
- Chat history per user

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

### Required
- **Docker** and **Docker Compose**
- **GPU** (one of the following):
  - **AMD GPU** with ROCm support (e.g., RX 6000/7000 series)
  - **NVIDIA GPU** with CUDA support
  - **No GPU** (CPU-only mode, slower performance)

### Optional (for local development)
- Node.js 20+
- Python 3.12+
- PostgreSQL 15+

> **Note:** For GPU requirements, see [GPU Compatibility](#gpu-compatibility) section.

---

## Directory Structure

```
B-AIA-210-PAR-2-1-eliza-24/
├── docker-compose.yml           # Container orchestration
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
│   │   │   └── calculator.py    # Financial calculations
│   │   └── knowledge/           # Knowledge base
│   │       ├── ifrs/            # IFRS standards docs
│   │       ├── gaap/           # GAAP docs
│   │       ├── tax/            # Tax guides
│   │       ├── templates/      # Report templates
│   │       └── checklists/     # Audit checklists
│   ├── Dockerfile
│   └── requirements.txt
│
└── finsight-discord/            # Discord bot
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

Edit `.env` and add your Discord bot token:

```bash
# Required
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# Optional (defaults provided)
JWT_SECRET=your-secret-key-change-in-production
```

**To get a Discord bot token:**
1. Go to https://discord.com/developers/applications
2. Create a new application
3. Go to "Bot" and create a bot
4. Copy the token
5. Enable "Message Content" intent in Bot settings

### 3. Start Services

```bash
docker compose up -d
```

This will start all 5 services:
- `finsight-postgres` - PostgreSQL database (port 5432)
- `finsight-ollama` - Ollama LLM (port 11434)
- `finsight-bot` - Python chatbot API (port 5000)
- `finsight-api` - Express API (port 3000)
- `finsight-discord` - Discord bot

### 4. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| Web UI | http://localhost:3000 | Angular frontend |
| API | http://localhost:3000/api | Express API |
| Ollama | http://localhost:11434 | LLM API |
| Bot | http://localhost:5000 | Python API |

### 5. Verify Status

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f finsight-discord
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DISCORD_BOT_TOKEN` | *(required)* | Discord bot token |
| `JWT_SECRET` | `finsight-jwt-secret-change-in-production` | JWT signing secret |
| `DATABASE_URL` | `postgresql://postgres:postgres@postgres:5432/finsight` | PostgreSQL connection |
| `OLLAMA_BASE_URL` | `http://ollama:11434` | Ollama API URL |
| `OLLAMA_MODEL` | `mistral-nemo` | LLM model name |
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

## GPU Compatibility

FinSight supports NVIDIA, AMD, and CPU-only deployments with Mistral Nemo (12B parameters).

| GPU Type | Compose File | Ollama Image | Notes |
|----------|--------------|--------------|-------|
| AMD GPU | `docker-compose.amd.yml` | `ollama/ollama:rocm:latest` | Uses ROCm backend |
| NVIDIA GPU | `docker-compose.gpu.yml` | `ollama/ollama:latest` | Uses CUDA backend |
| CPU Only | `docker-compose.yml` | `ollama/ollama:latest` | Slower performance |

### Usage

**AMD GPU:**
```bash
docker compose -f docker-compose.amd.yml up -d
```

**NVIDIA GPU:**
```bash
docker compose -f docker-compose.gpu.yml up -d
```

**CPU Only:**
```bash
docker compose up -d
```

> **Note:** The first request after starting Ollama may take 30-90 seconds as the model loads into memory.

---

## Running Without Docker

### 1. PostgreSQL Setup

```bash
# Start PostgreSQL
docker run -d -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=finsight \
  -p 5432:5432 postgres:15

# Run schema
psql -h localhost -U postgres -d finsight -f config/database.sql
```

### 2. Ollama Setup

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull model (7.1 GB)
ollama pull mistral-nemo

# Start server
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

## Troubleshooting

### Ollama Cold Start

The first request to Ollama after container restart takes 30-90 seconds while the model loads into GPU memory. The Discord bot includes a warm-up on startup, but if you encounter timeouts:

- Increase timeout in `finsight-discord/bot.js` (current: 90s)
- Wait 60s after container start before issuing commands

### GPU Not Detected

```bash
# Verify nvidia-docker is installed
docker run --rm --gpus all nvidia/cuda:12.0-base-ubuntu nvidia-smi

# Check docker-compose.yml has GPU config
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
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

If models aren't available in Ollama:

```bash
# Access container and pull model
docker exec -it finsight-ollama ollama pull mistral-nemo

# List available models
docker exec -it finsight-ollama ollama list
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