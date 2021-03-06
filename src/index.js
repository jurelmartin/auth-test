// FOR NON-SERVERLESS
require("dotenv").config();
const DatabaseInstance = require('./helpers/dataSource/DatabaseInstance');
const {createTokens, refreshTokens} = require('./helpers/TokenHelper');
const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const Crypto = require('crypto');
const jwt = require('jsonwebtoken');
const {generateCode, verifyCode} = require('./helpers/RandomCodeHelper')
const salt = require('../config').salt
const Validator = require('../src/helpers/Validator');
const Email = require('./services/Email');
// const Sms = require('./services/Sms');

class BreweryAuth {
    constructor(config) {
      this.repository = new DatabaseInstance(config.dbConfig).setRepository();
      // this.sms = new Sms(config.nexmoKey, config.nexmoSecret);
      this.email = new Email(config.sendgridKey);
      this.ATSecret = config.tokenSecret;
      this.RTSecret = config.refreshSecret;
      // this.senderEmail = config.senderEmail;
      // this.senderSMS = config.senderSms;
    }
    getRepository () {
      return this.repository;
    };
    
    async _validateTokens(req) {
      const token = req.get('x-token');
      let response;

      if(!token) {
          response = {
            status: 401,
            message: 'Not Authenticated'
          };
          return response;
      }
      try{
        const { userId } = jwt.verify(token, this.ATSecret)

        req.clientId = userId
      } catch(err) {
        const refreshToken = req.get('x-refresh-token');

        let result = await refreshTokens(token, refreshToken, this.repository, this.ATSecret, this.RTSecret);
        const { clientId, newToken, newRefreshToken} = result;
        if (token && refreshToken) {
          response = {
            status: 401,
            message: 'Token Expired, Please renew',
            clientId: clientId,
            Tokens: {
              AccesToken: newToken,
              RefreshToken: newRefreshToken
            }
          };
        }
        return response;
      }
    }

    register (body) {
      // const salt = process.env.SALT;
      const { username } = body
      body.password = Crypto.createHash('SHA256').update(new Date().getTime() + username).digest('hex');
      body.MFA = 0;
      body.registered = 1;
      
      return new Promise((resolve, reject) => {
          const checkFirst = new Validator(body).isValid()
          if(checkFirst) {
            return resolve(checkFirst) 
          }

          this.repository.create(body).then(user => {
              const response = {
                message: 'Registered',
                clientId: user.dataValues.id
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
          let code, response;
          
          return new Promise((resolve, reject) => {
            const checkFirst = new Validator(body).isValid()
            if(checkFirst) {
              return resolve(checkFirst) 
            }

            this.repository.create(body , {raw: true}).then(user => {
              code = generateCode(user.id, 'signup');
              response = {
                message: 'success. use signupConfirm function',
                clientId: user.id,
                password: user.password,
                confirmationCode: code
              }
                resolve(response);
              // this.sms.send(this.senderSMS, user.phone, `Your code is ${code}. Expires in 5 minutes.`).then(result => {
              //   resolve(response);
              // }).catch(err => reject(err));
            })
            .catch(err => reject(err));        
          });
    }

    login (body) {
      const { clientId, clientSecret } = body;
      const validate = Crypto.pbkdf2Sync(clientSecret, salt, 1000, 64, `sha512`).toString(`hex`);
      let code, response;

        return new Promise((resolve, reject) => {

          this.repository.findByPk(clientId, { raw:true }).then(user => {
            if(!user) { throw (new Error('Invalid login!')) }
            if(validate !== user.password) { throw (new Error('Invalid login!')) }
            if(user.confirmed === 0) { reject('account not yet confirmed')}

              if(user.registered === 1){
                
                const response = {
                  clientId: user.id,
                  message: 'Use loginNewPasswordRequired function'
                
                };
                resolve(response);
              }
              if (user.MFA === true){
                code = generateCode(clientId, 'mfa');
                
                // this.sms.send(this.senderSMS, user.phone, `Your code is ${code}. Expires in 5 minutes.`).then(result => {
                //   const response = {
                //     message: 'sucess. use loginMfa function' ,
                //     clientId: user.id,
                //     confirmationCode: code
                //   }
                //   resolve(response);
                // })
                // .catch(err => reject(err));
                const response = {
                  message: 'sucess. use loginMfa function' ,
                  clientId: user.id,
                  confirmationCode: code
                }
                resolve(response);
              }else{
                createTokens(user.id, this.ATSecret, this.RTSecret+user.password).then(tokens => {
                  const [token, refreshToken] = tokens
                  const response = {
                    clientId: user.id,
                    token: token,
                    refreshToken: refreshToken
                  }
                  resolve(response);
                }).catch(err => reject(err));
              }
          }).catch(err => reject(err));
        })
    }

    loginNewPasswordRequired (body) {
      const { clientId, newPassword } = body;
      // const salt = process.env.SALT;
      const hashedPassword = Crypto.pbkdf2Sync(newPassword, salt, 1000, 64, `sha512`).toString(`hex`);
      return new Promise((resolve, reject) => {
        this.repository.findByPk(clientId).then(user => {
          user.update({registered: 0, password: hashedPassword});
        }).then( result => {
          createTokens(clientId, this.ATSecret, this.RTSecret + hashedPassword).then(tokens => {
            const [token, refreshToken] = tokens;
            const response = {
              clientId: clientId,
              token: token,
              refreshToken: refreshToken
            }
            resolve(response);
          })
        }).catch(err => resolve(err));
      })
    }

    loginMfa (body) {
      const { clientId, confirmationCode } = body
      return new Promise((resolve, reject) => {
        const isValid = verifyCode(clientId, confirmationCode, 'mfa');
          if(!isValid){
            reject('invalid code');
          }
          createTokens(clientId, this.ATSecret, this.RTSecret + clientId).then(tokens => {
            const [token, refreshToken] = tokens
            const response = {
              clientId: clientId,
              token: token,
              refreshToken: refreshToken
            }
            resolve(response);
          })
      })
  }
  
    signupConfirm (body, emailContent) {
        const { subject, text } = emailContent; 
        const { clientId, confirmationCode } = body;
        let response, userEmail; 

        return new Promise((resolve, reject) => {
          const isValid = verifyCode(clientId, confirmationCode, 'signup');
          if(!isValid){
            reject('invalid code');
          }
          this.repository.findByPk(clientId, { attributes: {exclude: ['password', 'createdAt', 'updatedAt']} }).then(user => {
            userEmail = user.dataValues.email;
            response = {
              message: 'signup confirmed',
              details: user.dataValues
            }
          user.update({confirmed: 1})
          }).then(result => {
            this.email.send({
              to: userEmail,
              from: this.senderEmail,
              subject: subject,
              text: text
            });
          }).then(result => {
            resolve(response);
          })
          .catch(err => reject(err));
        });
    }

    signupResend (body) {
      const { clientId } = body;
      let code, response;

      return new Promise((resolve, reject) => {
        this.repository.findByPk(clientId, {raw: true}).then(user => {
          code = generateCode(user.id, 'signup');
          response = {
            clientId: user.id,
            confirmationCode: code
          }
            resolve(response);

          // this.sms.send(this.senderSMS, user.phone, `Your code is ${code}. Expires in 5 minutes.`).then(result => {
          //   resolve(response);
          // }).catch(err => reject(err));
        }).catch(err => reject(err));
      });
    }

    passwordForgot (body) {
      const { clientId } = body;
      let code;
      
      return new Promise((resolve, reject) => {
        this.repository.findByPk(clientId, {raw: true}).then(user => {
          code = generateCode(clientId, 'password');
          const response = {
            message: 'success. use passwordReset function',
            confirmationCode: code
          }
          resolve(response);
          // this.sms.send(this.senderSMS, user.phone, `Your code is ${code}. Expires in 5 minutes`);
        })
        // .then(result => {
        //   const response = {
        //     message: 'success. use passwordReset function',
        //     confirmationCode: code
        //   }
        //   resolve(response);
        // })
        .catch(err => reject(err));
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
        const checkFirst = new Validator(body).isValidUpdate()
            if(checkFirst) {
              return resolve(checkFirst) 
            }
        this.repository.findByPk(clientId).then(user => {
          if(!user) {
            reject('User not found!');
          }
          user.update(body, {returning: true,
            plain: true
        }).then(user => {
              resolve('user info updated');
          }).catch(err => reject(err));
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
            user.update({password: newPasswordHash});
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
      const secret = Crypto.pbkdf2Sync(clientSecret, salt, 1000, 64, `sha512`).toString(`hex`);

      
      return new Promise((resolve, reject) => {
          this.repository.findByPk(clientId).then(user => {
            if(!user){ reject ('user not found')}
            if(user.password === secret){
              user.destroy();
            }else{
              reject('invalid credentials');
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
          let mfa;
          if(user.MFA === 1) { mfa = true };
          if(user.MFA === 0) { mfa = false }
          const response = {
            MFA: mfa
          }
          resolve(response);
        }).catch(err => reject(err));
      })
    }

    setMfa (clientId, body) {
      return new Promise((resolve, reject) => {
        const { mfa } = body;
        if(typeof mfa !== 'boolean') {reject ('mfa must boolean')};
        this.repository.update({MFA: mfa}, {returning: true,
          plain: true,
          where: {
          id: clientId
        }
      }).then(user => {
          if(!user){reject ('user does not exist')}
            resolve({
              MFA: mfa
            });
        }).catch(err => reject(err));
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
      const configSecret = this.ATSecret

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
              return next();
            })(req, res, next);
          }
        ];
    }
}
module.exports = BreweryAuth;