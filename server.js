const express = require("express")
//const { db, userdb } = require("./index")
//const JSONdb = require('simple-json-db');
//const db = new JSONdb('/is-a-dev/storage.json');
//const userdb = new JSONdb('/is-a-dev/storageuser.json');
//const dbemail = new JSONdb('/is-a-dev/storageemail.json');
const { db, userdb, dbemail, pairdb } = require("./database")
const fs = require("fs");
var AES = require("crypto-js/aes");

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

function keepAlive() {
  server.listen(3000, () => {
    console.log("Server is ready.")
  })
}

module.exports = keepAlive