# FinSight Run Guide

This project runs with Docker Compose.

- `finsight-api`: Express API on `http://localhost:3000`, also serves the Angular web build
- `finsight-web`: Angular source built inside the `finsight-api` Docker image
- `finsight-postgres`: PostgreSQL 15
- `finsight-bot`: Python chatbot API on internal URL `http://finsight-bot:5000`
- `finsight-ollama`: Ollama on `http://localhost:11434`
- `finsight-discord`: optional Discord bot, started with the `discord` Compose profile

The default Ollama context is set to `1024` tokens in Docker Compose so `mistral-nemo` can run on modest WSL machines. Increase `OLLAMA_NUM_CTX` in Compose if you have more RAM or GPU memory.

## Prerequisites

From WSL Ubuntu:

1. Docker Desktop is installed on Windows.
2. Docker Desktop WSL integration is enabled for your Ubuntu distribution.
3. `docker compose version` works from WSL.

Check Docker:

```bash
docker compose version
```

## Environment Setup

Run these commands from the repository root:

```bash
cp .env.example .env
```

Generate a local development JWT secret:

```bash
openssl rand -hex 32
```

Copy the generated value into `.env`:

```env
JWT_SECRET=paste_the_generated_value_here
```

For local development, the other default values in `.env.example` can stay unchanged.

## First Web Launch

Build and start the core web stack:

```bash
docker compose build
docker compose up -d
```

Pull the Ollama model:

```bash
docker exec -it finsight-ollama ollama pull mistral-nemo
```

Check that the containers are running:

```bash
docker compose ps
```

Expected core services:

```text
finsight-api        Up
finsight-bot        Up
finsight-ollama     Up
finsight-postgres   Up
```

Open the web app:

```text
http://localhost:3000
```

Then:

1. Go to `http://localhost:3000/auth`.
2. Create an account.
3. Log in if needed.
4. Open `http://localhost:3000/chat`.
5. Send a message to FinSight.

## Web Checks

Use these commands if the web app does not respond:

```bash
curl http://localhost:3000/api/health
curl http://localhost:11434/api/tags
docker compose logs -f finsight-api finsight-bot
```

If `mistral-nemo` is missing, pull it again:

```bash
docker exec -it finsight-ollama ollama pull mistral-nemo
```

## Discord Bot Setup

The Discord bot is optional. It is not started by default.

### 1. Create or Open the Discord Application

Go to:

```text
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

Keep this token private. Do not commit `.env`.

### 3. Enable Required Bot Settings

In **Bot > Privileged Gateway Intents**, enable:

```text
Message Content Intent
```

This is required because the bot supports prefix commands like `!chat`, `!calc`, and `!ping`.

Without this setting, the container will restart with:

```text
Error: Used disallowed intents
```

### 4. Invite the Bot to Your Server

In the Developer Portal:

1. Go to **OAuth2 > URL Generator**.
2. Select scopes:

```text
bot
applications.commands
```

3. Select bot permissions. For local testing, **Administrator** is the simplest option.
4. Open the generated URL.
5. Choose your Discord server and authorize the bot.

If you do not use Administrator, the bot needs permissions to read messages, send messages, use slash commands, and embed links.

## Launch Discord Bot

Start the core stack first if it is not already running:

```bash
docker compose up -d
```

Start the Discord bot:

```bash
docker compose --profile discord up -d finsight-discord
```

Restart the Discord bot after changing `.env` or Discord Developer Portal settings:

```bash
docker compose --profile discord restart finsight-discord
```

Check status:

```bash
docker compose ps
```

Expected Discord service status:

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

## Test Discord

In your Discord server, test slash commands:

```text
/ping
/help
/chat What is EBITDA?
/calculate npv 1000 10% 5
/compliance ifrs16
/tax vat
```

Also test prefix commands:

```text
!ping
!help
!chat What is EBITDA?
!calc npv 1000 10% 5
!ifrs 16
!tax vat
```

The Discord bot calls the same Python chatbot API as the web app, so the core stack must be running for AI responses.

## Common Commands

Start the core web stack:

```bash
docker compose up -d
```

Start the Discord bot too:

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

Stop everything:

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
