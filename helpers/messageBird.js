//https://blog.messagebird.com/easy-sms-integration-with-node-js-686b62b739d3
// const messagebird = require('messagebird')('KPqpABNWnQMG54YcYgfCBl82r'); //DEV
// const messagebird = require('messagebird')('Yl9bbKZWWwC64ZVxpKJ11pAkb'); //LIVE +14704279939
const config      = require('../config/configuration');
const messagebird = require('messagebird')(config.messageBirdKey.key); 

exports.sendSmsVerificationCode = (contactNumber, verificationCode, message, res) => {

  let params = {
  'originator': 'Bingwit',
  'recipients': [
    contactNumber
  ],
  'body': `${message}: ${verificationCode}`
  };

  messagebird.messages.create(params, (err, data) => {
    if (err) return ReE(res, err, 500);
    return ReS(res, {message: 'Ok'}, 201);
  });
}