const { DataTypes, Sequelize } = require('sequelize');

class InitializeDatabase {
    constructor(dbConfig) {
        this.configuration = dbConfig
    }

    _loadDbCredentials() {
        const { 
            databaseName,
            username,
            password,
            dialect,
            host
        } = this.configuration;
        return new Sequelize(databaseName, username, password, {
            host: host,
            dialect: dialect
        });

    }

    setRepository() {
        return this._loadDbCredentials().define('testTable', {
        // Model attributes are defined here
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }, {
        // Other model options go here
        });

    }
}
module.exports = InitializeDatabase