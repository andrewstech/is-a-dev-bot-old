const {
  Client,

  GatewayIntentBits,

  ActionRowBuilder,

  ButtonBuilder,

  EmbedBuilder,

  TextInputBuilder,

  DropdownBuilder,

  ModalBuilder,

  TextInputStyle,

  ButtonStyle,
} = require("discord.js");

const Discord = require('discord.js');

var AES = require("crypto-js/aes");

const { createOAuthDeviceAuth } = require("@octokit/auth-oauth-device");

const { Octokit } = require("@octokit/core");

const JSONdb = require("simple-json-db");

const fetch = require("node-fetch");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const keepAlive = require("./server");

require("dotenv").config();

const { db, userdb, dbemail, maintainerdb, betadb } = require("./database");

const { isValidURL, delay, ValidateIPaddress } = require("./tools");

const Sentry = require("@sentry/node");
// or use es6 import statements
// import * as Sentry from '@sentry/node';

const Tracing = require("@sentry/tracing");
// or use es6 import statements
// import * as Tracing from '@sentry/tracing';

Sentry.init({
  dsn: "https://26418f26472e449494e582986f00dda6@o1276241.ingest.sentry.io/4504674686468096",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
  op: "test",
  name: "My First Test Transaction",
});

setTimeout(() => {
  try {
    foo();
  } catch (e) {
    Sentry.captureException(e);
  } finally {
    transaction.finish();
  }
}, 99);

// Error Handling

client.on("error", () => console.error);

client.on("warn", () => console.warn);

process.on("unhandledRejection", console.error);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
 // set bot statu
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }

  if (interaction.commandName === "botinfo") {
    if (!betadb.has(interaction.user.id)) {
      await interaction.reply("You are not in the beta program!");
      return;
    }
    const infoBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()

        .setStyle(ButtonStyle.Link)

        .setLabel("GitHub")

        .setURL(`https://github.com/andrewstech/is-a-dev-bot`)
    );

    await interaction.reply({ components: [infoBtn], ephemeral: true });
  }

  if (interaction.commandName === "github") {
    const gitBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()

        .setStyle(ButtonStyle.Link)

        .setLabel("GitHub")

        .setURL(`https://github.com/is-a-dev/register`)
    );

    await interaction.reply({ components: [gitBtn], ephemeral: true });
  }

  if (interaction.commandName === "check") {
    if (!betadb.has(interaction.user.id)) {
      await interaction.reply("You are not in the beta program!");
      return;
    }
    var subdomain = interaction.options.getString("subdomain");

    fetch(
      `https://api.github.com/repos/is-a-dev/register/contents/domains/${subdomain}.json`,
      {
        method: "GET",

        headers: {
          "User-Agent": "mtgsquad",
        },
      }
    ).then(async (res) => {
      if (res.status && res.status == 404) {
        await interaction.reply(
          "The domain: " + subdomain + ".is-a.dev" + " is not registered!"
        );
      } else {
        await interaction.reply(
          "The domain: " + subdomain + ".is-a.dev" + " is registered!"
        );
      }
    });
  }

  if (interaction.commandName === "logout") {
    if (!betadb.has(interaction.user.id)) {
      await interaction.reply("You are not in the beta program!");
      return;
    }
    if (!db.has(interaction.user.id)) {
      await interaction.reply("You are not logged in!");

      return;
    }

    db.delete(interaction.user.id);

    userdb.delete(interaction.user.id);

    await interaction.reply("You have been logged out!");
  }

  if (interaction.commandName === "beta-add") {
    if (!maintainerdb.has(interaction.user.id)) {
      await interaction.reply("You are not a maintainer!");
      return;
    }
    var user = interaction.options.getUser("user");
    betadb.set(user.id, true);
    await interaction.reply("Added " + user.username + " to the beta program!");
    // send a message to the user
    const dm = await user.createDM();
    dm.send(
      "You have been added to the beta program for is-a.dev! Please use /login to login to the bot!"
    );
    return;
  }

  if (interaction.commandName === "beta-remove") {
    if (!maintainerdb.has(interaction.user.id)) {
      await interaction.reply("You are not a maintainer!");
      return;
    }
    var user = interaction.options.getUser("user");
    betadb.delete(user.id);
    await interaction.reply("removed " + user.username + " from the beta program.");
    const dm = await user.createDM();
    dm.send(
      "You have been removed from the is-a-dev Beta Program!"
    );
    return;
  }

  if (interaction.commandName === "login") {
    if (!betadb.has(interaction.user.id)) {
      await interaction.reply("You are not in the beta program!");
      return;
    }
    if (db.has(interaction.user.id)) {
      await interaction.reply("You are already logged in!");

      return;
    }

    await interaction.reply({
      content: `Please Wait`,
      ephemeral: true,
      fetchReply: true,
    });

    const loginBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()

        .setStyle(ButtonStyle.Link)

        .setLabel("Login with GitHub")

        .setURL(`https://register-bot.is-a.dev/login?user=${interaction.user.id}`)
    );

    await interaction.editReply({ components: [loginBtn], ephemeral: true });
  }
  if (interaction.commandName === "maintainers") {
    // make a discord modal with a dropdown of all the domains the user owns
    // then delete the domain
    //if user has role of maintainer then continue if not then return
    if (!maintainerdb.has(interaction.user.id)) {
      await interaction.reply("You are not a maintainer!");
      return;
    }
    if (!db.has(interaction.user.id)) {
      await interaction.reply("You are not logged in!");
      return;
    }
    var username = db.get(interaction.user.id);
    fetch('https://raw.is-a.dev')
      .then(response => response.json())
      .then(async data => {
        var found = false;
        var results = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].owner.username.toLowerCase() === username.toLowerCase()) {
              results.push(data[i].domain);
              found = true;
            }
        }
        if (found) {
          var count = results.length;
          var domains = results;
          const modal = new ModalBuilder()
            .setCustomId('delteDomainModal')
            .setTitle('Domain Deletion');

          // Add components to modal

          //add a select menu
        

          const domain = new TextInputBuilder()
            .setCustomId('deletedomain')
              // The label is the prompt the user sees for this input
            .setLabel("What domain would you like to delete?")
              // Short means only a single line of text
            .setStyle(TextInputStyle.Short);


          // An action row only holds one text input,
          // so you need one action row per text input.
          const firstActionRow = new ActionRowBuilder().addComponents(domain);

          // Add inputs to the modal
          modal.addComponents(firstActionRow);

          // Show the modal to the user
          await interaction.showModal(modal);
        } else {
          await interaction.reply("You do not own any domains!");
        }
      });

  }
          
  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId === 'delteDomainModal') {
      await interaction.reply({ content: 'Your submission was received successfully! However Im not going to delete that domain as I am not fully programmed.' });
    }
  });

  if (interaction.commandName === "domains") {
    var username = interaction.options.getString("username");
    if (username == null){
      // your code here.
      if (!db.has(interaction.user.id)) {
        await interaction.reply("You are not logged in!");
      
        return;
      }
      fetch('https://raw.is-a.dev')
        .then(response => response.json())
        .then(async data => {
  
          var username = db.get(interaction.user.id);
          var found = false;
          var results = [];
  
          for (var i = 0; i < data.length; i++) {
              if (data[i].owner.username.toLowerCase() === username.toLowerCase()) {
                results.push(data[i].domain);
                found = true;
              }
          }
          if (found) {
            var count = results.length;
            var embed = new EmbedBuilder()
              .setAuthor({
                name: "Is a dev BOT",
                url: "https://is-a.dev",
                iconURL: "https://raw.githubusercontent.com/is-a-dev/register/main/media/logo.png",
              })
              .setDescription("You own ``" + count + "`` domains")
              .addFields(
                {
                  name: "Your Domains",
                  value: ` ${results.join('\n')} `,
                },
              )
              .setColor("#00b0f4")
              .setFooter({
                text: "©IS-A-DEV",
                iconURL: "https://raw.githubusercontent.com/is-a-dev/register/main/media/logo.png",
              });
            await interaction.reply({ embeds: [embed] });
          }
  
          if (!found) {
            await interaction.reply(`Unable to find domains linked to user "${username}"!`);
          }
          });

          return;
    }
    fetch('https://raw.is-a.dev')
        .then(response => response.json())
        .then(async data => {
  
          var found = false;
          var results = [];
  
          for (var i = 0; i < data.length; i++) {
              if (data[i].owner.username.toLowerCase() === username.toLowerCase()) {
                results.push(data[i].domain);
                found = true;
              }
          }
          if (found) {
            var count = results.length;
            var embed = new EmbedBuilder()
              .setAuthor({
                name: "Is a dev BOT",
                url: "https://is-a.dev",
                iconURL: "https://raw.githubusercontent.com/is-a-dev/register/main/media/logo.png",
              })
              .setDescription(username + " owns ``" + count + "`` domains")
              .addFields(
                {
                  name: "Domains",
                  value: ` ${results.join('\n')} `,
                },
              )
              .setColor("#00b0f4")
              .setFooter({
                text: "©IS-A-DEV",
                iconURL: "https://raw.githubusercontent.com/is-a-dev/register/main/media/logo.png",
              });
            await interaction.reply({ embeds: [embed] });
          }
  
          if (!found) {
            await interaction.reply(`Username "${username}" has not registed any domains.`);
          }
          });


    
  }



  if (interaction.commandName === "user") {
    if (!betadb.has(interaction.user.id)) {
      await interaction.reply("You are not in the beta program!");
      return;
    }
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
    if (!betadb.has(interaction.user.id)) {
      await interaction.reply("You are not in the beta program!");
      return;
    }
    if (!db.has(interaction.user.id)) {
      await interaction.reply("You are not logged in!");

      return;
    }

    await interaction.reply({ content: `Please Wait`, ephemeral: true });
    var token = userdb.get(interaction.user.id);

    console.log(token);

    const response = await fetch("https://dns.beadman-network.com/api/fork", {
      method: "get",
      headers: {
        "Content-Type": "application/json",

        "x-gh-auth": token,
      },
    });
    // check if the response is ok
    if (!response.ok) {
      // if not, throw an error
      await interaction.editReply({ content: `Error has occured while forking the repo. HTTP error, status  ${response.status}`, ephemeral: true });
      return;
    }
    await interaction.editReply({ content: `Forked`, ephemeral: true });

    subdomain = interaction.options.getString("subdomain");

    var type = interaction.options.getString("type");

    var content = interaction.options.getString("content");

    username = db.get(interaction.user.id);

    var email = dbemail.get(interaction.user.id);

    var prosubdomain = subdomain.toLowerCase();

    var LowcaseContent = content.toLowerCase();

    console.log("Request sent!");

    const commit = await fetch("https://dns.beadman-network.com/api/commit", {
      method: "post",

      headers: {
        "Content-Type": "application/json",

        "x-gh-auth": token,

        domain: prosubdomain,

        email: email,

        username: username,

        type: type,

        content: LowcaseContent,
      },
    });
    // check if the response is ok
    if (!commit.ok) {
      // if not, throw an error
      await interaction.editReply({ content: `Error has occured while commiting the repo. HTTP error, status  ${commit.status}`, ephemeral: true });
      return;
    }

    console.log("Request sent!");

    await interaction.editReply({
      content: `Subdomain: ${subdomain}\nType: ${type}\nContent: ${content}`,
      ephemeral: true,
    });
  }
});




keepAlive();

client.login(process.env.BOT_TOKEN);
