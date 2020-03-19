const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = (msg) => {
    
    return new Promise((resolve, reject) => {
        sgMail.send(msg).then(result => {
            fresolve(result);
        }).catch(err => reject);
    })
};