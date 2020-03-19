// FOR NON-SERVERLESS
const InitializeDatabase = require('./lib/InitializeDatabase');
const {createTokens, refreshTokens} = require('./lib/TokenCreations');
const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const Crypto = require('crypto');
const jwt = require('jsonwebtoken');
require("dotenv").config();

let signupCode, payloadId, forgotPasswordCode, mfaCode, loginId;

class BreweryAuth {
    constructor(config) {
      this.repository = new InitializeDatabase(config).setRepository()
      this.authSecret = config.authSecret
      this.authSecret2 = config.authSecret2
    }


    ValidateTokens(req) {
      const token = req.headers['x-token'];

      if(token){
        try{
          const { user } = jwt.verify(token, this.authSecret)
          req.user = user
        } catch(err) {
          const refreshToken = req.headers['x-refresh-token'];
          const newToken = refreshTokens(token, refreshToken, this.repository, this.authSecret, this.authSecret2);

          if(newToken.token && newToken.refreshToken){
            let res = {}
            res.set('x-token', newToken.token)
            res.set('x-refresh-token', newToken.refreshToken);

            return res
          }
          return req.user = newToken.user
         }
      }
    }

    register (body) {
        const { email, username, password } = body;
        const salt = process.env.SALT;
        const hashedPassword = Crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
        
        return new Promise((resolve, reject) => {
            this.repository.create({
                  email: email,
                  password: hashedPassword,
                  username: username
              }).then(user => {
                const response = {
                  clientId: user.dataValues.id
                }
                //must send an email for password reset link
                resolve(response)
              })
              .catch(err => reject(err));        
          })
    }

    signup (body) {
          return new Promise((resolve, reject) => {
            this.repository.create(body , {raw: true}).then(user => {
              signupCode = {
                clientId: user.id,
                code: Math.random()
              }
                const response = {
                  clientId: user.id,
                  password: user.password,
                  confirmationCode: signupCode
                }
              // must send a confirmation code either email, or mobile
                resolve(response)
              })
              .catch(err => reject(err));        
          })
    }

    login (body) {
        const { clientId, clientSecret } = body;
        const salt = process.env.SALT;
        const validate = Crypto.pbkdf2Sync(clientSecret, salt, 1000, 64, `sha512`).toString(`hex`);

          return new Promise((resolve, reject) => {

            this.repository.findByPk(clientId, { raw:true }).then(user => {
              const userPassword = user

              if(!user) { throw new Error('Invalid login!') }

              if(validate !== userPassword) { throw new Error('Invalid login!') }

              if(user.registered === 1){
                loginId = user.id;
                const response = {
                  clientId: user.id,
                  message: 'Use loginNewPasswordRequired function'
                };
                resolve(response);
              }
              if (user.MFA === 1){
                mfaCode = {
                  clientId: user.id,
                  code: Math.random()
                }
                resolve(mfaCode);
              }

              createTokens(user, this.authSecret, this.authSecret2 + userPassword).then(tokens => {
                const [token, refreshToken] = tokens
                const response = {
                  clientId: user.id,
                  token: token,
                  refreshToken: refreshToken
                }
                resolve(response);
              })
            }).catch(err => reject(err));
          })
    }

    loginNewPasswordRequired (body) {
      const { clientId, newPassword } = body
      return new Promise((resolve, reject) => {
        if(loginId !== clientId){
          reject(null);
        }
        this.repository.findByPk(clientId).then(user => {
          user.update({registered: 0, password: newPassword});
        }).then( result => {
          createTokens(user, this.authSecret, this.authSecret2 + newPassword).then(tokens => {
            const [token, refreshToken] = tokens
            const response = {
              clientId: user.id,
              token: token,
              refreshToken: refreshToken
            }
            resolve(response);
          })
        }).catch(err => resolve(err));
      })
    }

    loginMfa (body) {
      const { clientId, code } = body
      return new Promise((resolve, reject) => {
        if(mfaCode.clientId === clientId && mfaCode.code === code){
          createTokens(user, this.authSecret, this.authSecret2 + newPassword).then(tokens => {
            const [token, refreshToken] = tokens
            const response = {
              clientId: user.id,
              token: token,
              refreshToken: refreshToken
            }
            resolve(response);
          })
        }else{
          reject('invalid code');
        }
      })
  }
  
    signupConfirm (body) {
        const { clientId, confirmationCode } = body;

        return new Promise((resolve, reject) => {
          if (signupCode.clientId !== clientId || signupCode.code !== confirmationCode){
            reject(null);
          }
          this.repository.findByPk(clientId, {raw: true}).then(user => {
            resolve(user);
          }).catch(err => reject(err.message));
        });
    }

    sigupResend (body) {
      const { clientId } = body;

      return new Promise((resolve, reject) => {
        this.repository.findByPk(clientId).then(user => {
          signupCode = {
            clientId: clientId,
            code: Math.random()
          }
          // sends new confirmation code, through sms or email,
          const response = {
            clientId: signupCode.clientId,
            confirmationCode: signupCode.code
          }
          resolve(response);
        }).catch(err => reject(err.message));
      });
    }

    passwordForgot (body) {
      const { clientId } = body;

      return new Promise((resolve, reject) => {
        this.repository.findByPk(clientId).then(result => {
          forgotPasswordCode = {
            clientId: clientId,
            code: Math.random()
          }
    
          // must send an email for password link
          resolve(forgotPasswordCode);
        }).catch(err => reject(err));
      })
    
    };

    passwordReset (body) {
      const { clientId, clientCode, newPassword } = body
      return new Promise ((resolve, reject) => {
        if (clientId === forgotPasswordCode.clientId && clientCode === forgotPasswordCode.code){
          this.repository.update({ password: newPassword }, { where: { id: clientId } }).then(result => {
            resolve(result);
          }).catch(err => reject(err));
        }else{
          reject(null);
        }
      })
    }

    profile (body) {
      return new Promise((resolve, reject) => {
        this.repository.findByPk(payloadId, {raw: true}).then(user => {
          const response = {
            username: user.username,
            email: user.email,
            password: user.password
          }
          resolve(response);
        }).catch(err => reject(err));
      });
    }

    profileEdit (body)  {
      return new Promise((resolve, reject) => {
        this.repository.update(body, {returning: true,
          plain: true,
          where: {
          id: payloadId
        }
      }).then(user => {
            resolve(body);
        }).catch(err => reject(err));
      })
    };

    passwordChange (body)  {
      const { oldPassword, newPassword } = body
      return new Promise((resolve, reject) => {
        this.repository.findByPk(payloadId).then(user => {
          if(user.dataValues.password === oldPassword && user.dataValues.password !== newPassword){
            user.update({password: newPassword});
          }else{
            reject(null);
          }
        }).then(result => {
          resolve({
            newPassword: newPassword
          });
        }).catch(err => reject(err));
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
                status: 'deleted',
                clientId: clientId
              }
              resolve(response);
          }).catch(err => reject(err));
      })
    }

    getMfa (body) {
      return new Promise((resolve, reject) => {
        this.repository.findByPk(payloadId, {raw: true}).then( user => {
          const response = {
            MFA: user.MFA
          }
          resolve(response);
        }).catch(err => reject(err));
      })
    }

    setMfa (body) {
      return new Promise((resolve, reject) => {
        if (body.mfa !== true && body.mfa !== false){
          reject('parameter must be boolean(true/false)');
        }
        this.repository.findByPk(payloadId).then( user => {
          user.update({mfa: body.mfa});
        }).then(result => {
          resolve(body);
        })
        .catch(err => reject(err));
      })
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
              repository.findByPk(jwt_payload.clientId, {raw: true})
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
                return res.status(401).json({
                  status: 401,
                  message: 'Not Authenticated'
                });
              }
              payloadId = user.id;
              return next();
            })(req, res, next);
          }
        ];

  
    }
}
module.exports = BreweryAuth;