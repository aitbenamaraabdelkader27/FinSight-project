const { Client, GatewayIntentBits, Events, SlashCommandBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

// Configuration
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5000';
const EXPRESS_API_URL = process.env.EXPRESS_API_URL || 'http://localhost:3000';

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// Command definitions
const commands = [
  new SlashCommandBuilder()
  .setName('chat')
  .setDescription('Ask FinSight a question')
  .addStringOption(option =>
    option.setName('message')
      .setDescription('Your question')
      .setRequired(true)
  ),
  new SlashCommandBuilder()
  .setName('calculate')
  .setDescription('Financial calculation')
  .addStringOption(option =>
    option.setName('formula')
      .setDescription('e.g., npv 1000 10% 5 or depreciation 10000 5')
      .setRequired(true)
  ),
  new SlashCommandBuilder()
  .setName('compliance')
  .setDescription('Get IFRS/GAAP compliance info')
  .addStringOption(option =>
    option.setName('standard')
      .setDescription('e.g., ifrs16, gaap, ias16')
      .setRequired(true)
  ),
  new SlashCommandBuilder()
  .setName('tax')
  .setDescription('Tax information')
  .addStringOption(option =>
    option.setName('topic')
      .setDescription('e.g., vat, corporate')
      .setRequired(true)
  ),
  new SlashCommandBuilder()
  .setName('help')
  .setDescription('Get help with FinSight commands'),
  new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check if bot is alive')
];

// REST client for registering commands
const rest = new REST().setToken(BOT_TOKEN);

async function callPythonAPI(message) {
  try {
    const response = await axios.post(`${PYTHON_API_URL}/api/chat`, {
      message: message
    }, {
      timeout: 30000
    });
    return response.data.response;
  } catch (error) {
    console.error('Python API error:', error.message);
    if (error.response) {
      return error.response.data.error || 'Error from API';
    }
    return 'Sorry, I encountered an error connecting to the AI service.';
  }
}

async function callExpressAPI(endpoint, data) {
  try {
    const response = await axios.post(`${EXPRESS_API_URL}${endpoint}`, data, {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error('Express API error:', error.message);
    return { error: error.response?.data?.error || 'Connection failed' };
  }
}

async function handleSlashCommand(interaction) {
  const commandName = interaction.commandName;
  const options = interaction.options;

  try {
    await interaction.deferReply();

    let response = '';
    let message = '';

    switch (commandName) {
      case 'chat':
        message = options.getString('message');
        response = await callPythonAPI(message);
        break;

      case 'calculate':
        message = `/calculate ${options.getString('formula')}`;
        response = await callPythonAPI(message);
        break;

      case 'compliance':
        message = `/compliance ${options.getString('standard')}`;
        response = await callPythonAPI(message);
        break;

      case 'tax':
        message = `/tax ${options.getString('topic')}`;
        response = await callPythonAPI(message);
        break;

      case 'help':
        response = `**FinSight Commands**

- \`/chat <message>\` - Ask any financial question
- \`/calculate <formula>\` - Do calculations (e.g., npv, depreciation)
- \`/compliance <standard>\` - Get compliance info
- \`/tax <topic>\` - Tax information
- \`/ping\` - Check bot status

**Examples:**
/chat What is EBITDA?
/calculate npv 1000 10% 5
/compliance ifrs16
/tax vat`;
        break;

      case 'ping':
        response = 'Pong! FinSight is online';
        break;

      default:
        response = 'Unknown command';
    }

    // Split response if too long (Discord limit 2000 chars)
    if (response.length > 1900) {
      await interaction.editReply(response.substring(0, 1900));
      if (response.length > 1900) {
        await interaction.followUp('```' + response.substring(1900) + '```');
      }
    } else {
      await interaction.editReply(response);
    }
  } catch (error) {
    console.error('Command error:', error);
    await interaction.editReply('Sorry, I encountered an error processing your command.');
  }
}

async function handleMessage(message) {
  // Ignore bot messages
  if (message.author.bot) return;

  const content = message.content.trim();

  // Check for prefix commands (for non-slash)
  if (content.startsWith('!')) {
    const args = content.substring(1).split(' ');
    const command = args[0].toLowerCase();
    const query = args.slice(1).join(' ');

    let response = '';

    switch (command) {
      case 'help':
        response = `**FinSight Commands**

!help - Show this message
!chat <question> - Ask a financial question
!calc <formula> - Do calculations
!ifrs <standard> - Compliance info
!tax <topic> - Tax info
!ping - Check status`;
        break;

      case 'chat':
      case 'c':
        if (!query) {
          response = 'Please provide a question. Usage: !chat What is EBITDA?';
        } else {
          response = await callPythonAPI(query);
        }
        break;

      case 'calc':
      case 'calculate':
        if (!query) {
          response = 'Usage: !calculate npv 1000 10% 5';
        } else {
          response = await callPythonAPI(`/calculate ${query}`);
        }
        break;

      case 'ifrs':
      case 'compliance':
        if (!query) {
          response = 'Usage: !ifrs 16';
        } else {
          response = await callPythonAPI(`/compliance ${query}`);
        }
        break;

      case 'tax':
        if (!query) {
          response = 'Usage: !tax vat';
        } else {
          response = await callPythonAPI(`/tax ${query}`);
        }
        break;

      case 'ping':
        response = '🏓 Pong! FinSight is online!';
        break;

      default:
        return; // Not a command, treat as chat
    }

    try {
      await message.reply(response);
    } catch (e) {
      console.error('Reply error:', e);
    }
    return;
  }

  // Regular messages - treat as chat in channels (optional)
  // Uncomment to enable auto-response:
  // response = await callPythonAPI(content);
  // await message.reply(response);
}

client.once(Events.ClientReady, async () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   FinSight Discord Bot                               ║
╚═══════════════════════════════════════════════════════════╝

✅ Bot logged in as: ${client.user.tag}
✅ Bot ID: ${client.user.id}
🔗 Python API: ${PYTHON_API_URL}
🔗 Express API: ${EXPRESS_API_URL}

Commands registered:
- /chat - Ask a question
- /calculate - Financial calculation
- /compliance - IFRS/GAAP info
- /tax - Tax information
- /help - Help
- /ping - Status check

Prefix commands (for text chat):
- !chat, !calc, !ifrs, !tax, !help, !ping
  `);

  // Register slash commands
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('Failed to register commands:', error);
  }
});

client.on(Events.InteractionCreate, handleSlashCommand);
client.on(Events.MessageCreate, handleMessage);

client.on(Events.Error, error => {
  console.error('Discord error:', error);
});

// Login
if (!BOT_TOKEN || BOT_TOKEN === 'your_discord_bot_token_here') {
  console.error('❌ Please set DISCORD_BOT_TOKEN in .env file');
  console.error('Get your token from: https://discord.com/developers/applications');
  process.exit(1);
}

client.login(BOT_TOKEN);