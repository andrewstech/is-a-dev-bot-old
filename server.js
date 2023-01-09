const express = require("express")
//const { db, userdb } = require("./index")
//const JSONdb = require('simple-json-db');
//const db = new JSONdb('/is-a-dev/storage.json');
//const userdb = new JSONdb('/is-a-dev/storageuser.json');
//const dbemail = new JSONdb('/is-a-dev/storageemail.json');
const { db, userdb, dbemail, pairdb } = require("./database")
const fs = require("fs");
var AES = require("crypto-js/aes");
const multer  = require('multer');
const { EmbedBuilder, WebhookClient } = require('discord.js');


const upload = multer();

function readAndServe(path, res) {
  fs.readFile(path, function (err, data) {
      res.end(data);
  })
}

const server = express()

server.use(express.static("public"))

server.all("/", (req, res) => {
  res.send("Bot is running!")
  
})

server.get('/api/user', (req, res) => {
  var user = req.query.id;
  if (user == undefined) {
    res.send("undefined")
  }
  if (db.has(user)) {
    res.send("exists")
  }
  if (!db.has(user)) {
    res.send("available")
  }
})



server.get('/login/api', async (req, res) => {
  //get params from url
  //console.log(req.query);
  var id = req.query.user;
  var username = req.query.username;
  var token = req.query.token;
  var user = req.query.user;
  var email = req.query.email;
  db.set(user, username);
  userdb.set(user, token);
  dbemail.set(user, email);

})

server.post ('/api/email', upload.none(), (req, res) => {
  const body = req.body;

  console.log(`From: ${body.from}`);
  console.log(`To: ${body.to}`);
  console.log(`Subject: ${body.subject}`);
  console.log(`Text: ${body.text}`);
  // send to discord webhook
  const webhookClient = new WebhookClient({ url: 'https://discord.com/api/webhooks/1062110685888254072/bQ8xtZyrZAVjeLPNbXB3MA4xKB2sB2nulWV2rrQt81HTGVmcOmTE0KMgPLmKbRu-t45F' });
  const embed = {
    "type": "rich",
    "title": `Email from: ${body.from}`,
    "description": `Subject: ${body.subject}`,
    "color": 0x00FFFF,
    "fields": [
      {
        "name": `Message`,
        "value": `${body.text}`
      }
    ]
  }

  webhookClient.send({
    content: 'NEW EMAIL',
    username: 'IS-A-DEV-TECH-SUPPORT',
    avatarURL: 'https://raw.githubusercontent.com/is-a-dev/register/main/media/logo.png',
    embeds: [embed],
  });



  return res.status(200).send();
});


function keepAlive() {
  server.listen(3000, () => {
    console.log("Server is ready.")
  })
}

module.exports = keepAlive