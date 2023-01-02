const express = require("express")
//const { db, userdb } = require("./index")
//const JSONdb = require('simple-json-db');
//const db = new JSONdb('/is-a-dev/storage.json');
//const userdb = new JSONdb('/is-a-dev/storageuser.json');
//const dbemail = new JSONdb('/is-a-dev/storageemail.json');
const { db, userdb, dbemail } = require("./database")

const server = express()

server.all("/", (req, res) => {
  res.send("Bot is running!")
  
})

server.use(express.static("public"));

server.get('/login', async (req, res) => {
    var user = req.query.user;
    if (user == undefined) {
      res.send("Please enter a username")
    }
    if (db.has(user)) {
        res.send("Username already exists")
    }
})

server.get('/login/api', async (req, res) => {
  //get params from url
  //console.log(req.query);
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