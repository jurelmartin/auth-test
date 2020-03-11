const { expect } = require('chai');
const strategies =  require('../strategies/jwt')
const dummyPayload = require('../test/utils/dummyPayload')

describe("auth-test :: strategies", () => {
    context("JWTStrategy", () => {
        const config = { authSecret: 'supersecretkey' };
        const { signin, verify, decode } = strategies(config)
        const signIn = signin();
        const veriFy = verify();
        const deCode = decode();
        
        context("signin : verify : decode", () => {
            let tokenTemp;
            context("signin", () => {
                it("signin should return a token", () => {
                    const token = signIn(dummyPayload)
                    tokenTemp = token
                    expect(token).to.not.be.empty()
                })
            })
            context("verify", () => {
                it("should verify a token", () => {
                    const verified = veriFy(tokenTemp)
                    expect(verified).to.not.be.empty()
                })
            }) 
            context("decode", () => {
                it("should decode a token", () => {
                    const decoded = deCode(tokenTemp)
                    expect(decoded).to.not.be.empty()
                })
            })
        })
    
    })
});
    