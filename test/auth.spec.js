// const sinon  = require('sinon');

const db = require('../AuthHelper/database/Db');
const {expect} = require('chai');
const auth = require('../auth');
const model = require('../AuthHelper/database/model');



describe("auth-test :: auth", () => {
    const config = { authSecret: 'supersecretkey' };
    const userModel = model;
    const { initialize, authenticate } = auth(config, userModel);

    context("config and userModel", () => {
        it("should recieve a config and UserModel", () => {
            expect(config).to.have.key('authSecret')
            expect(userModel).to.not.be.empty
        })
    }),
    context('intialize function', () => {
        it("should expect the initialize function", () => {
            expect(initialize).to.be.not.undefined()
        })
    }),
    context('authenticate function', () => {
        it("should expect the authenticate function", () => {
            expect(authenticate).to.be.not.be.undefined()
        })
    })

});


  // const user = {
  //   firstName: 'jerico',
  //   lastName: 'estanislao',
  //   middleName: 'esquibel',
  //   email: 'jestanislao@stratpoint.com',
  //   password: '12345',
  //   roleId: 2

  // 


