
// const {assert} = require('chai');
// const auth = require('../auth');

// const UserRepository = require('../AuthHelper/database/repository')
// const BreweryAuth = require('../breweryLike');

// describe("auth-test :: auth", () => {
//     const config = { authSecret: 'supersecretkey' };

//     const { initialize, authenticate } = auth;


//     context("config and UserRepository parameters", () => {
//         it("should have valid parameters", () => {
//             assert.isObject(config, 'config is an object')
//             assert.exists(UserRepository, 'UserRepository exists')
//         })
//     }),
//     context('intialize function', () => {
//         it("should expect the initialize function", () => {
//             assert.isFunction(initialize, 'initialize() not defined')
//         })
//     }),
//     context('authenticate function', () => {
//         it("should expect the authenticate function", () => {
//             assert.isFunction(authenticate, 'authenticate() not defined')
//         })
//     })

//     context('breweryAuth', () => {
//         const dbConfigurations = {
//             databaseName: 'postgres',
//             username: 'postgres',
//             password: 'root',
//             dialect: 'postgres',
//             host: 'localhost',
//             authSecret: 'supersecret',
//             autSecret2: 'supersecret2',
//             newAttrib: ['email']
//         }const { expect } = require('chai');
//         // const strategies =  require('../strategies/jwt')
//         // const dummyPayload = require('../test/utils/dummyPayload')
        
//         // describe("auth-test :: strategies", () => {
//         //     context("JWTStrategy", () => {
//         //         const config = { authSecret: 'supersecretkey' };
//         //         const { signin, verify, decode } = strategies(config)
//         //         const signIn = signin();
//         //         const veriFy = verify();
//         //         const deCode = decode();
                
//         //         context("signin : verify : decode", () => {
//         //             let tokenTemp;
//         //             context("signin", () => {
//         //                 it("signin should return a token", () => {
//         //                     const token = signIn(dummyPayload)
//         //                     tokenTemp = token
//         //                     expect(token).to.not.be.empty()
//         //                 })
//         //             })
//         //             context("verify", () => {
//         //                 it("should verify a token", () => {
//         //                     const verified = veriFy(tokenTemp)
//         //                     expect(verified).to.not.be.empty()
//         //                 })
//         //             }) 
//         //             context("decode", () => {
//         //                 it("should decode a token", () => {
//         //                     const decoded = deCode(tokenTemp)
//         //                     expect(decoded).to.not.be.empty()
//         //                 })
//         //             })
//         //         })
            
//         //     })
//         // });
            
//         const user = {
//             email: 'jagustin@stratpoint.com',
//             password: '123456',
//             username: 'jurelmartin',
//             phone: '+639954928364'
//         }
//         const loginCred = {
//             clientId: 'a7c6e0b5-bdc8-403e-b9a9-f22b81035b24',
//             clientSecret: '123456'
//         }
//         const forSignup = {
//             email: 'jec@email.com',
//             password: 'jecpassword',
//             username: 'jecusername',
//             phone: '09954928364',
//             MFA: 1
//         }
    


//         it('output', () => {
//             // const brewery = new BreweryAuth(dbConfigurations).login(loginCred)
//             // const brewery = new BreweryAuth(dbConfigurations).signup(forSignup)
//             const brewery = new BreweryAuth(dbConfigurations).register(user)
//             brewery.then((result) => {
                
//                 console.log(result)
//             })
//             // console.log(brewery)
    
//         })

//     })


// });
