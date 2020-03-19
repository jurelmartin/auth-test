
const {assert} = require('chai');
const auth = require('../auth');

const UserRepository = require('../AuthHelper/database/repository')
const BreweryAuth = require('../breweryLike');

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

    context('breweryAuth', () => {
        const dbConfigurations = {
            databaseName: 'postgres',
            username: 'postgres',
            password: 'root',
            dialect: 'postgres',
            host: 'localhost',
            authSecret: 'supersecret',
            autSecret2: 'supersecret2',
            newAttrib: ['email']
        }
        const user = {
            username: 'teddy',
            email: 'teddy@stratpoint.com',
            password: '696969'
        }
        const loginCred = {
            clientId: 'b7225930-2260-4343-84f7-cd8e239d7c47',
            clientSecret: '696969'
        }
        it('output', () => {
            const brewery = new BreweryAuth(dbConfigurations).login(loginCred)
            // const brewery = new BreweryAuth(dbConfigurations).register(user)


            brewery.then((result) => {

                console.log(result)
            })
            // console.log(brewery)
    
        })

    })


});
