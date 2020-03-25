require('dotenv').config();

module.exports = {
    // FOR DEVELOPMENT
    dbConfig: {
        databaseName: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dialect: process.env.DB_DIALECT,
        host: process.env.DB_HOST,
        authSecret: process.env.SECRET1,
        authSecret2: process.env.SECRET2,
    },
    salt: process.env.SALT

}