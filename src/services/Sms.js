require("dotenv").config();

const Nexmo = require('nexmo')

class Sms {
    constructor(key, secret){
        this.nexmo = new Nexmo({
            apiKey: key,
            apiSecret: secret
          });
    }

    send (from, to, text) {

        return new Promise((resolve, reject) => {
            this.nexmo.message.sendSms(from, to, text, (err, responseData) => {
                if (err) {
                    reject(err);
                } else {
                    if(responseData.messages[0]['status'] === "0") {
                        resolve("Message sent successfully.");
                    } else {
                        reject(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                    }
                }
            });
        });
    }
}

module.exports = Sms;