const { Sequelize, Model, DataTypes } = require("sequelize");


const sequelize = new Sequelize('postgres', 'postgres', 'root',{
  host: 'localhost',
  dialect: 'postgres'

})

module.exports = sequelize;