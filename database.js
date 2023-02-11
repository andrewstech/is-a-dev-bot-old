const JSONdb = require('simple-json-db');

const db = new JSONdb('storage.json');
const userdb = new JSONdb('storageuser.json');
const dbemail = new JSONdb('storageemail.json');
const pairdb = new JSONdb('storagepair.json');


module.exports = { db, userdb, dbemail, pairdb };