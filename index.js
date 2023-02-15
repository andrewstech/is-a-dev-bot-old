const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require("discord.js");
const fetch = require("node-fetch");

const keepAlive = require("./server");
const { db, userdb, dbemail } = require("./database");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

require("dotenv").config();

// Error Handling
client.on("error", (err) => console.error(err));
client.on("warn", (warn) => console.warn(warn));
process.on("unhandledRejection", (err) => console.error(err));

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }

  if (interaction.commandName === "botinfo") {
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
    let subdomain = interaction.options.getString("subdomain");

    fetch(
      `https://api.github.com/repos/is-a-dev/register/contents/domains/${subdomain}.json`,
      {
        method: "GET",
        headers: {
          "User-Agent": "mtgsquad",
        },
      }
    )
    .then(async (res) => {
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

  if (interaction.commandName === "domains") {
    let username = interaction.options.getString("username");
    if (username == null) {
      if (!db.has(interaction.user.id)) {
        await interaction.reply("You are not logged in!");
        return;
      }
      fetch('https://raw.is-a.dev')
        .then(response => response.json())
        .then(async data => {
          let username = db.get(interaction.user.id);
          let found = false;
          let results = [];

          for (let i = 0; i < data.length; i++) {
            if (data[i].owner.username.toLowerCase() === username.toLowerCase()) {
              results.push(data[i].domain);
              found = true;
            }
          }

          if (found) {
            let count = results.length;
            let embed = new EmbedBuilder()
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

        for (let i = 0; i < data.length; i++) {
          if (data[i].owner.username.toLowerCase() === username.toLowerCase()) {
            results.push(data[i].domain);
            found = true;
          }
        }
        if (found) {
          let count = results.length;
          let embed = new EmbedBuilder()
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
          await interaction.reply(`Username "${username}" has not registered any domains.`);
        }
      });
  }

  if (interaction.commandName === "user") {
    if (!db.has(interaction.user.id)) {
      await interaction.reply("You are not logged in!");
      return;
    }

    let message =
      ("Username: ") +
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

    await interaction.reply({ content: `Please Wait`, ephemeral: true });
    let token = userdb.get(interaction.user.id);

    console.log(`Discord User, ${interaction.user.tag} (ID: ${interaction.user.id}, Discriminator: #${interaction.user.discriminator}) has requested a new subdomain: (Subdomain: ${interaction.options.data[0].value}.is-a.dev, Type: ${interaction.options.data[1].value}, Value: ${interaction.options.data[2].value}), with the GitHub Token: ${token}, as the GitHub User: ${db.get(interaction.user.id)}`);

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

    let subdomain = interaction.options.getString("subdomain");
    let type = interaction.options.getString("type");
    let content = interaction.options.getString("content");
    let username = db.get(interaction.user.id);
    let email = dbemail.get(interaction.user.id);
    let lowercaseSubdomain = subdomain.toLowerCase();
    let lowcaseContent = content.toLowerCase();

    console.log("Request sent!");

    const commit = await fetch("https://dns.beadman-network.com/api/commit", {
      method: "post",

      headers: {
        "Content-Type": "application/json",
        "x-gh-auth": token,
        domain: lowercaseSubdomain,
        email: email,
        username: username,
        type: type,
        content: lowcaseContent
      }
    });

    // // check if the response is ok
    // if (!commit.ok) {
    //   // if not, throw an error
    //   await interaction.editReply({ content: `Error has occured while commiting the repo. HTTP error, status  ${commit.status}`, ephemeral: true });
    //   return;
    // }
    // await interaction.editReply({ content: `Committed`, ephemeral: true });

    // console.log("Request sent!");

    // await interaction.editReply({
    //   content: `Subdomain: ${subdomain}\nType: ${type}\nContent: ${content}`,
    //   ephemeral: true,
    // });
  }
});

keepAlive();
client.login(process.env.BOT_TOKEN);