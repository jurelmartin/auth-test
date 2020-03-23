// FOR NON-SERVERLESS
const InitializeDatabase = require('./lib/InitializeDatabase');
const {createTokens, refreshTokens} = require('./lib/TokenCreations');
const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const Crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {generateCode, verifyCode} = require('./lib/codeFactory')
require("dotenv").config();
const salt = 'superduperhardsalt'
const Validate = require('./lib/utils/validations')


let loginSession = {};

class BreweryAuth {
    constructor(config) {
      this.repository = new InitializeDatabase(config).setRepository()
      this.authSecret = config.authSecret
      this.authSecret2 = config.authSecret2
    }

    
    async _validateTokens(req) {
      const token = req.get('x-token');
      let response;
      if(token){
        try{
          const { userId } = jwt.verify(token, this.authSecret)

          req.clientId = userId
        } catch(err) {
          const refreshToken = req.get('x-refresh-token');

          let result = await refreshTokens(token, refreshToken, this.repository, this.authSecret, this.authSecret2);
          const { clientId, token: token_2, refreshToken: refreshToken_1 } = result;
          if (token_2 && refreshToken_1) {
            response = {
              status: 401,
              message: 'Token Expired, Please renew',
              Tokens: {
                AccesToken: token_2,
                RefreshToken: refreshToken_1
              }
            };
          }
          return response;
        }
      }
    }

    register (body) {
        // const salt = process.env.SALT;
        body.password = Crypto.pbkdf2Sync(body.password, salt, 1000, 64, `sha512`).toString(`hex`);
        body.MFA = 0;
        body.registered = 1;
        
        return new Promise((resolve, reject) => {
            const checkFirst = new Validate(body).isValid()
            if(checkFirst) {
              return resolve(checkFirst) 
            }

            this.repository.create(body, {raw: true}).then(user => {
                const response = {
                  message: 'Registered',
                  details: user.dataValues
                }
                //must send an email for password reset link
                resolve(response)
              })
              .catch(err => reject(err));        
          })
    }

    signup (body) {
          body.registered = 0;
          body.confirmed = 0;
          // const salt = process.env.SALT;
          body.password = Crypto.pbkdf2Sync(body.password, salt, 1000, 64, `sha512`).toString(`hex`);
          
          return new Promise((resolve, reject) => {
            const checkFirst = new Validate(body).isValid()
            if(checkFirst) {
              return resolve(checkFirst) 
            }

            this.repository.create(body , {raw: true}).then(user => {
                const response = {
                  message: 'success. use signupConfirm function',
                  clientId: user.id,
                  password: user.password,
                  confirmationCode: generateCode(user.id, 'signup')
                }
              // must send a confirmation code either email, or mobile
                resolve(response)
              })
              .catch(err => reject(err));        
          })
    }

    login (body) {
      const { clientId, clientSecret } = body;
      const validate = Crypto.pbkdf2Sync(clientSecret, salt, 1000, 64, `sha512`).toString(`hex`);

        return new Promise((resolve, reject) => {

          this.repository.findByPk(clientId, { raw:true }).then(user => {
            if(!user) { reject('Invalid login!') }
            if(validate !== user.password) { reject('Invalid login!') }
            if(user.confirmed === 0) { reject('account not yet confirmed')}

              if(user.registered === 1){

                loginSession[user.id] = true;
                
                const response = {
                  clientId: user.id,
                  message: 'Use loginNewPasswordRequired function'
                
                };
                resolve(response);
              }
              if (user.MFA === 1){
                loginSession[user.id] = true;
                const response = {
                  message: 'sucess. use loginMfa function' ,
                  clientId: user.id,
                  confirmationCode: generateCode(user.id, 'mfa')
                }
                resolve(response);
              }

              createTokens(user.id, this.authSecret, this.authSecret2+user.password).then(tokens => {
                const [token, refreshToken] = tokens
                const response = {
                  clientId: user.id,
                  token: token,
                  refreshToken: refreshToken
                }
                resolve(response);
            }).catch(err => reject(err));
          })
        })
    }

    loginNewPasswordRequired (body) {
      const { clientId, newPassword } = body;
      // const salt = process.env.SALT;
      const hashedPassword = Crypto.pbkdf2Sync(newPassword, salt, 1000, 64, `sha512`).toString(`hex`);
      return new Promise((resolve, reject) => {
        if(!loginSession[clientId]){
          reject(null);
        }
        this.repository.findByPk(clientId).then(user => {
          user.update({registered: 0, password: newPassword});
        }).then( result => {
          createTokens(clientId, this.authSecret, this.authSecret2 + hashedPassword).then(tokens => {
            const [token, refreshToken] = tokens
            const response = {
              clientId: clientId,
              token: token,
              refreshToken: refreshToken
            }
            loginSession[clientId] = null;
            resolve(response);
          })
        }).catch(err => resolve(err));
      })
    }

    loginMfa (body) {
      const { clientId, confirmationCode } = body
      return new Promise((resolve, reject) => {
        if(!loginSession[clientId]){
          reject(null);
        }
          createTokens(clientId, this.authSecret, this.authSecret2 + clientId).then(tokens => {
            const [token, refreshToken] = tokens
            const response = {
              clientId: clientId,
              token: token,
              refreshToken: refreshToken
            }
            loginSession[clientId] = null;
            resolve(response);
          })
      })
  }
  
    signupConfirm (body) {
        const { clientId, confirmationCode } = body;
        let response; 

        return new Promise((resolve, reject) => {
          const isValid = verifyCode(clientId, confirmationCode, 'signup');
          if(!isValid){
            reject('invalid code');
          }
          this.repository.findByPk(clientId).then(user => {
            response = {
              message: 'signup confirmed',
              details: user.dataValues
            }
          user.update({confirmed: 1})
          }).then(result => {
              resolve(response);
          })
          .catch(err => reject(err.message));
        });
    }

    signupResend (body) {
      const { clientId } = body;

      return new Promise((resolve, reject) => {
        this.repository.findByPk(clientId, {raw: true}).then(user => {
          // sends new confirmation code, through sms or email,
          const response = {
            clientId: user.id,
            confirmationCode: generateCode(user.id, 'signup')
          }
          resolve(response);
        }).catch(err => reject(err.message));
      });
    }

    passwordForgot (body) {
      const { clientId } = body;

      return new Promise((resolve, reject) => {
        this.repository.findByPk(clientId, {raw: true}).then(user => {

          const response = {
            message: 'success. use passwordReset function',
            confirmationCode: generateCode(clientId, 'password')
          }
    
          // must send an email for password link
          resolve(response);
        }).catch(err => reject(err));
      })
    
    };

    passwordReset (body) {
      const { clientId, confirmationCode, newPassword } = body;
      // const salt = process.env.SALT;
      const newPasswordHash = Crypto.pbkdf2Sync(newPassword, salt, 1000, 64, `sha512`).toString(`hex`);

      return new Promise ((resolve, reject) => {
        this.repository.findByPk(clientId).then( user => {
          const isValid = verifyCode(user.dataValues.id, confirmationCode, 'password');
          if(!isValid){
            reject('code expired/invalid');
          }
            user.update({ password: newPasswordHash }).then(result => {
              const response = {
                message: 'password reset success',
                newPassword: newPasswordHash
              }
                resolve(response);
            }).catch(err => reject(err));
        }).catch(err => reject(err));
      })
    }

    profile (clientId) {
      return new Promise((resolve, reject) => {
        this.repository.findByPk(clientId, {raw: true}).then(user => {
          const response = {
            username: user.username,
            email: user.email,
            password: user.password
          }
          resolve(response);
        }).catch(err => reject(err));
      });
    }

    profileEdit (clientId, body)  {
      return new Promise((resolve, reject) => {
        this.repository.update(body, {returning: true,
          plain: true,
          where: {
          id: clientId
        }
      }).then(user => {
            resolve(body);
        }).catch(err => reject(err));
      })
    };

    passwordChange (clientId, body)  {
      const { oldPassword, newPassword } = body;
      // const salt = process.env.SALT;
      const newPasswordHash = Crypto.pbkdf2Sync(newPassword, salt, 1000, 64, `sha512`).toString(`hex`);
      const oldPasswordHash = Crypto.pbkdf2Sync(oldPassword, salt, 1000, 64, `sha512`).toString(`hex`);
      return new Promise((resolve, reject) => {
        this.repository.findByPk(clientId).then(user => {
          if(user.dataValues.password === oldPasswordHash && user.dataValues.password !== newPasswordHash){
            user.update({password: newPassword});
          }else{
            reject('failed to change password');
          }
        }).then(result => {
          resolve('Success');
        }).catch(err => reject('failed to change password'));
      })
    }
    
    deleteUser (body) {
      const { clientId, clientSecret } = body;
      
      return new Promise((resolve, reject) => {
          this.repository.findByPk(clientId).then(user => {
            if(user.password === clientSecret){
              user.destroy();
            }
          }).then(user => {
              const response = {
                message: 'deleted',
                clientId: clientId
              }
              resolve(response);
          }).catch(err => reject(err));
      })
    }

    getMfa (clientId) {
      return new Promise((resolve, reject) => {
        this.repository.findByPk(clientId, {raw: true}).then( user => {
          const response = {
            MFA: user.MFA
          }
          resolve(response);
        }).catch(err => reject(err));
      })
    }

    setMfa (clientId, body) {
      return new Promise((resolve, reject) => {
        if (body.mfa !== true && body.mfa !== false){
          reject('parameter must be boolean(true/false)');
        }
        this.repository.findByPk(clientId).then( user => {
          user.update({mfa: body.mfa});
        }).then(result => {
          resolve({
            MFA: body.mfa
          });
        })
        .catch(err => reject(err));
      })
    }

    logout(req, res) {
      const getAccessToken = req.headers['authorization']
      const accessToken = req.headers['x-token'];
      const refreshToken = req.headers['x-refresh-token'];


        if(getAccessToken && accessToken && refreshToken){
          /* 
           * clear tokens in the back-end ONLY
           * still need to clear on the front-end
           */

          req.headers['authorization'] = ''
          req.headers['x-token'] = ''
          req.headers['x-refresh-token'] = ''

          return res.json({
            status: 401,
            message: 'Successfully logged out!'
          })
        }
    }


   /*
    * FOR PASSPORT AUTHENTICATION
    */
    initialize () {
      return passport.initialize();
    }
    
    JWTauthenticate () {
      const repository = this.repository
      const configSecret = this.authSecret

        return [
          (req, res, next) => {
      
            const jwtOptions = {};
            jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
            jwtOptions.secretOrKey = configSecret;  
            
            passport.use(new Strategy(jwtOptions, (jwt_payload, done) => {

              repository.findByPk(jwt_payload.userId, {raw: true})
                .then((user) => {
                  done(null, user);
                })
                .catch((error) =>  done(error, null));
            }));
        
            passport.serializeUser(function (user, done) {
              done(null, user);
            });
        
            passport.deserializeUser(function (user, done) {
              done(null, user);
            });
        
            return passport.authenticate('jwt', (err, user, info)=> {
              if(!user){
                this._validateTokens(req).then(result => {
                  return res.json(result)
                })
              }
              req.userId = user.id;
              payloadId = user.id;
              return next();
            })(req, res, next);
          }
        ];
    }
}
module.exports = BreweryAuth;