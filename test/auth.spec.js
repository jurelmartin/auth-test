
const {assert} = require('chai');
const auth = require('../auth');

const UserRepository = require('../AuthHelper/database/repository')


describe("auth-test :: auth", () => {
    const config = { authSecret: 'supersecretkey' };

    const { initialize, authenticate } = auth;


    context("config and UserRepository parameters", () => {
        it("should have valid parameters", () => {
            assert.isObject(config, 'config is an object')
            assert.exists(UserRepository, 'UserRepository exists')
        })
    }),
    context('intialize function', () => {
        it("should expect the initialize function", () => {
            assert.isFunction(initialize, 'initialize() not defined')
        })
    }),
    context('authenticate function', () => {
        it("should expect the authenticate function", () => {
            assert.isFunction(authenticate, 'authenticate() not defined')
        })
    })


});
