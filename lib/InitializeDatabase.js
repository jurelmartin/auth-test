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

        const { newAttrib } = this.configuration

        const attributes = () => {
            const columns = {
              // Model attributes are defined here
              id:{
                primaryKey: true,
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
              },
              username: {
                type: DataTypes.STRING,
                allowNull: false
              },
              password: {
                type: DataTypes.STRING,
                allowNull: false
              },
              phone: {
                type: DataTypes.STRING,
                allowNull: false
              },
              MFA: {
                type: DataTypes.BOOLEAN
              },
              registered: {
                type: DataTypes.BOOLEAN
              }
            };

            if(newAttrib){
              if(newAttrib.includes('Email'.toLowerCase())) {
                columns.email = {
                    type: DataTypes.STRING,
                    allowNull: false
                }
              }
              return columns  
          }
          
        const repository =  this._loadDbCredentials().define('clients', attributes()
        , {
        // Other model options go here
        })

        repository.sync();
        return repository;
        
    }
}
}
module.exports = InitializeDatabase