// const sinon  = require('sinon');

const db = require('../AuthHelper/database/Db');
const {expect} = require('chai');
const auth = require('../auth');
const model = require('../AuthHelper/database/model');
const sinon = require('sinon')
const { ExtractJwt, Strategy } = require('passport-jwt');


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

        it("testing lang", ()=> {
            auth(config, userModel)
        })
    }),
    context('authenticate function', () => {
        it("should expect the authenticate function", () => {
            expect(authenticate).to.be.not.be.undefined()
        })
    })
    context('params parameter', () => {
        beforeEach(()=> {
            auth(config, userModel)
            sinon.stub(ExtractJwt, 'fromAuthHeaderWithScheme')
        })
            it("should not accept if jwtFromRequest is empty", () => {
                ExtractJwt.fromAuthHeaderWithScheme.returns(false)
                expect(ExtractJwt.fromAuthHeaderWithScheme()).to.equal(false)
                ExtractJwt.fromAuthHeaderWithScheme.restore()
            })

    })

});
