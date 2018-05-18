require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  operatorsAliases: false,
  logging: false
});

const Message = sequelize.define('message', {
  userid: Sequelize.STRING,
  content: Sequelize.STRING
});

const Consent = sequelize.define('consent', {
  userid: Sequelize.STRING,
  consent: Sequelize.STRING
});

const ConsentNotification = sequelize.define('consentnotification', {
  userid: Sequelize.STRING
});


const Crypto = require('node-crypt');
const crypto = new Crypto({
  key: process.env.CRYPT_KEY,
  hmacKey: process.env.CRYPT_HMAC
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity('Write "N, erase me" to delete consent and messages');
});

client.on('message', msg => {
  if (msg.author.id === client.user.id) return;

  Consent.findOne({ where: {userid: msg.author.id}}).then((item) => {
    if (item !== null) {
      if (msg.content === process.env.ERASE_STRING) {
        Message.destroy({ where: {userid: msg.author.id }}).then((count) => {
          msg.author.send("All your messages (there were " + count + " of them) have been deleted.");
          
          return Consent.destroy({ where: {userid: msg.author.id }});
        }).then(() => {
          msg.author.send("Your consent has been revoked.");
          return ConsentNotification.destroy({ where: {userid: msg.author.id }});
        });
      } else {
        Message.create({
          userid: msg.author.id,
          content: crypto.encrypt(msg.content)
        });
      }
    } else {
      if (msg.content === process.env.CONSENT_STRING) {
        Consent.create({
          userid: msg.author.id,
          consent: msg.content
        }).then(() => {
          msg.author.send(":white_check_mark: Future messages from you will now be collected. You may remove consent and all messages associated with you by typing: " + process.env.ERASE_STRING);
        });
      } else {
        ConsentNotification.findOne({ where: {userid: msg.author.id}}).then((n) => {
          if (n === null) {
            ConsentNotification.create({
              userid: msg.author.id
            }).then(() => {
              msg.author.send(":exclamation: Consent is not given from you for me to collect your messages. Please write the following: " + process.env.CONSENT_STRING);
            });
          }
        });
      }
    }
  });

  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
});

sequelize.sync().then(() => {
  client.login(process.env.DISCORD_TOKEN).catch(console.log);
});

/*Message.findAll({ where: { userid: '129653525042036736' } }).then(users => {
  users.forEach((user) => {
    console.log(crypto.decrypt(user.content));
  });
});*/