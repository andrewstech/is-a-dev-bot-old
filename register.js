const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'github',
    description: 'Github!',
  },
  {
    name: 'botinfo',
    description: 'Replies with bot info!',
  },
  {
    name: 'login',
    description: 'Login with Github',
  },
  {
    name: 'logout',
    description: 'Lougout of the service',
  },
  {
    name: 'user',
    description: 'Get user info',
  },
  {
    "name": "new",
    "description": "create a new subdomain",
    "options": [
      {
        "type": 3,
        "name": "subdomain",
        "description": "subdomain name",
        "required": true
      },
      {
        "type": 3,
        "name": "type",
        "description": "The domain type",
        "required": true,
        "choices": [
          {
            "name": "CNAME",
            "value": "CNAME"
          },
          {
            "name": "TXT",
            "value": "TXT"
          },
          {
            "name": "A",
            "value": "A"
          }
        ]
      },
      {
        "type": 3,
        "name": "content",
        "description": "domain content",
        "required": true
      }
    ]
  },
  {
    "name": "check",
    "description": "check if domain is available",
    "options": [
      {
        "type": 3,
        "name": "subdomain",
        "description": "Name of the subdomain",
        "required": true
      }
    ]
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands('1057671251646222447'), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();