require('dotenv').config;
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.sendEmail = (msg) => {
    
    return new Promise((resolve, reject) => {
        sgMail.send(msg).then(result => {
            resolve(result);
        }).catch(err => reject(err));
    })
};