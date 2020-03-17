const { DataTypes, Sequelize } = require('sequelize');

exports.config = async (dbConfig) => {
    try {
        const { 
            databaseName,
            username,
            password,
            dialect,
            host
        } = dbConfig;
        const sequelize = await new Sequelize(databaseName, username, password, {
            host: host,
            dialect: dialect
        });

            const repo = await sequelize.define('testTable', {
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

            return await repo
    }catch(err){
        throw err;
    }
}

