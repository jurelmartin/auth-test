require("dotenv").config();

const Nexmo = require('nexmo')

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET
})

module.exports = (from, to, text) => {

    return new Promise((resolve, reject) => {
        nexmo.message.sendSms(from, to, text, (err, responseData) => {
            if (err) {
                reject(err);
            } else {
                if(responseData.messages[0]['status'] === "0") {
                    resolve("Message sent successfully.");
                } else {
                    reject(`Message failed with error: ${responseData.messages[0]['error-text']}`);
                }
            }
    })
})
}