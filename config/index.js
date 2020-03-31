require('dotenv').config();

module.exports = {
    // FOR DEVELOPMENT
    dbConfig: {
        databaseName: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        dialect: process.env.DB_DIALECT,
        host: process.env.DB_HOST
    },
    salt: process.env.SALT,
    tokenSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    nexmoSecret: process.env.NEXMO_API_SECRET,
    nexmoKey: process.env.NEXMO_API_KEY,
    sendgridKey: process.env.SENDGRID_API_KEY,
    senderEmail: process.env.SENDER_EMAIL,
    senderSms: process.env.SENDER_SMS
}