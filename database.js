const JSONdb = require('simple-json-db');

const db = new JSONdb('storage.json');
const userdb = new JSONdb('/is-a-dev/storageuser.json');
const dbemail = new JSONdb('/is-a-dev/storageemail.json');
const pairdb = new JSONdb('/is-a-dev/storagepair.json');


module.exports = { db, userdb, dbemail, pairdb };
