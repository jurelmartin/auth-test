// FOR NON-SERVERLESS
const InitializeDatabase = require('./lib/InitializeDatabase');
const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const Crypto = require('crypto');

class BreweryAuth {
    constructor(config) {
      this.repository = new InitializeDatabase(config).setRepository()
      this.authSecret = config.authSecret
    }

    register (body) {
        const { email, username } = body;
        const password = Crypto.createHash('SHA256').update(new Date().getTime() + username).digest('hex');
          
        return new Promise((resolve, reject) => {
            this.repository.create({
                  email: email,
                  password: password,
                  username: username
              }).then(user => {
                const response = {
                  clientId: user.dataValues.id,
                  password: user.dataValues.password
                }
                //must send an email for password reset link
                resolve(response)
              })
              .catch(err => reject(err));        
          })
    }

    signup (body) {
        const { email, username, password } = body;
          return new Promise((resolve, reject) => {
            this.repository.create({
                  email: email,
                  password: password,
                  username: username
              }).then(user => {
                code = Math.random();
                const response = {
                  clientId: user.dataValues.id,
                  password: user.dataValues.password,
                  confirmationCode: code
                }
              // must send a confirmation code either email, or mobile
                resolve(response)
              })
              .catch(err => reject(err));        
          })
    }

    login (body) {
        const { clientId, clientSecret } = body;

          return new Promise((resolve, reject) => {
            this.repository.findByPk(clientId).then(user => {
              if(user.dataValues.password == clientSecret){
                const token = jwt.sign({clientId: user.dataValues.id}, 'supersecretkey', {
                  expiresIn: '1h'
                })
                const refreshToken = jwt.sign({accessToken: token}, 'supersecretkey', {
                  expiresIn: '24h'
                })
                const response = {
                  clientId: user.dataValues.id,
                  token: token,
                  refreshToken: refreshToken
                }
                resolve(response);
              }
            }).catch(err => reject(err));
          })
    }

    signupConfirm (body) {
        const { clientId, confirmationCode } = body;

          return new Promise((resolve, reject) => {
            this.repository.findByPk(clientId).then(user => {
              if (confirmationCode === code) {
                resolve(user.dataValues);
              }else {
                const error = new Error();
                error.message = 'Wrong code';
                throw error;
              }
              
            }).catch(err => reject(err.message));
          });
    }

    sigupResend (body) {
      const { clientId } = body;

        return new Promise((resolve, reject) => {
          this.repository.findByPk(clientId).then(user => {
            code = Math.random();
            // sends new confirmation code, through sms or email,
            const response = {
              clientId: clientId,
              confirmationCode: code
            }
            resolve(response);
          }).catch(err => reject(err.message));
        });
    }
   /*
    * FOR PASSPORT AUTHENTICATION
    */
    initialize () {
      return passport.initialize();
    }
    
    authenticate () {
      {
        return [
          (req, res, next) => {
      
            const jwtOptions = {};
            jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
            jwtOptions.secretOrKey = this.authSecret;  
            
            passport.use(new Strategy(jwtOptions, (jwt_payload, done) => {
              this.repository.findByPk(jwt_payload.clientId, {raw: true})
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
      };
  
    }
}
module.exports = BreweryAuth;