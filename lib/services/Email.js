require('dotenv').config;
const sgMail = require('@sendgrid/mail');

class Email{
    constructor(key){
        this.key = key;
    }

    send(msg){
        return new Promise((resolve, reject) => {
            sgMail.setApiKey(this.key);   
            sgMail.send(msg).then(result => {
            resolve('promise resolved: email sent');
            }).catch(err => reject (err));
        })
    }
}

module.exports = Email;