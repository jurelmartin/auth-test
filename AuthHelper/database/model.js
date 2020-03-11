// const { encryptPassword } = require('../../encryption')
const { Sequelize, Model, DataTypes } = require("sequelize");
const db = require('./Db');


  const User = db.define('users',{
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    middleName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    verificationCode: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    isVerified: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isDeleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    createdBy: {
      type: DataTypes.UUID
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true
    }
  })
module.exports = User;
