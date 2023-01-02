const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { createOAuthDeviceAuth } = require("@octokit/auth-oauth-device");
const { Octokit } = require("@octokit/core");
const JSONdb = require('simple-json-db');
const fetch = require("node-fetch");
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const keepAlive = require("./server")
require('dotenv').config();
const { db, userdb, dbemail } = require("./database")
const { isValidURL, delay, ValidateIPaddress } = require("./tools")
// Error Handling
client.on("error", () => console.error);
client.on("warn", () => console.warn);
process.on("unhandledRejection", console.error);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
      await interaction.reply("Pong!");
  }
  if (interaction.commandName === "check") {
      var subdomain = interaction.options.getString("subdomain");
      fetch(`https://api.github.com/repos/is-a-dev/register/contents/domains/${subdomain}.json`, {
            method: 'GET',
            headers: {
                'User-Agent': 'mtgsquad'
            }
        }).then(async(res) => {
            if(res.status && res.status == 404) {
                await interaction.reply("The domain: " + subdomain + ".is-a.dev" + " is not registered!");
            } else {
                await interaction.reply("The domain: " + subdomain + ".is-a.dev" + " is registered!");
            }
        })
    }


  if (interaction.commandName === "logout") {
      if (!db.has(interaction.user.id)) {
          await interaction.reply("You are not logged in!");
          return;
      }
      db.delete(interaction.user.id);
      userdb.delete(interaction.user.id);
      await interaction.reply("You have been logged out!");
  }
  if (interaction.commandName === "login") {
      if (db.has(interaction.user.id)) {
          await interaction.reply("You are already logged in!");
          return;
      }
      const loginBtn = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
              .setStyle(ButtonStyle.Link)
              .setLabel("Login with GitHub")
              .setURL(
                  `https://register-bot.is-a.dev/login?user=${interaction.user.id}`
              )
      );
      await interaction.reply({ components: [loginBtn], ephemeral: true });
  }
  if (interaction.commandName === "user") {
      if (!db.has(interaction.user.id)) {
          await interaction.reply("You are not logged in!");
          return;
      }
      var message =
          (await "Username: ") +
          db.get(interaction.user.id) +
          "\nEmail: " +
          dbemail.get(interaction.user.id);
      await interaction.reply({ content: message, ephemeral: true });
  }
    if (interaction.commandName === "new") {
        if (!db.has(interaction.user.id)) {
            await interaction.reply("You are not logged in!");
            return;
        }
        var subdomain = interaction.options.getString('subdomain');
        var type = interaction.options.getString('type');
        var content = interaction.options.getString('content');
        var token = userdb.get(interaction.user.id);
        var username = db.get(interaction.user.id);
        var email = dbemail.get(interaction.user.id);
        var prosubdomain = subdomain.lowercase();
        var LowcaseContent = content.lowercase();
        console.log("Request sent!");
        fetch("https://register.is-a.dev/api/commit", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            "x-gh-auth": token,
            "domain": prosubdomain,
            "email": email,
            "username": username,
            "type": type,
            "content": LowcaseContent,
        },
        }).then(async (res) => {
            if (res.status && res.status == "202") {
                console.log("PR!");
                await delay(1000);
                var octokit = new Octokit({
                    auth: token,
                });
            
                var res = octokit.request(
                    "GET /repos/{owner}/{repo}/pulls?head=" + { username } + ":main",
                    {
                        owner: "is-a-dev",
                        repo: "register",
                        user: username,
                    }
                );
                // reult data html_url
                var prurl = res.data[0].html_url;
                await interaction.reply(
                    "Your PR has been created! " + prurl
                );
            }
        });
        console.log("Request sent!");
        await interaction.reply({ content: `Subdomain: ${subdomain}\nType: ${type}\nContent: ${content}`, ephemeral: true });
    }
});



keepAlive();
client.login(process.env.TOKEN);
