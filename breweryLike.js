// FOR NON-SERVERLESS
const InitializeDatabase = require('./lib/InitializeDatabase');
const {createTokens, refreshTokens} = require('./lib/TokenCreations');
const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');
const Crypto = require('crypto');
const jwt = require('jsonwebtoken');


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
        const salt = 'testingngsaltlangto';
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
        const { email, password } = body;
        const salt = 'testingngsaltlangto';
        const validate = Crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);

          return new Promise((resolve, reject) => {

            this.repository.findOne({ where: { email } }).then(user => {
              const userData = user.dataValues
              const userPassword = userData.password

              if(!user) { throw new Error('Invalid login!') }

              if( validate !== userPassword ) { throw new Error('Invalid login!') }

              createTokens(user, this.authSecret, this.authSecret2 + password).then(tokens => {
                const [token, refreshToken] = tokens
                const response = {
                  clientId: user.dataValues.id,
                  token: token,
                  refreshToken: refreshToken
                }
                resolve(response);
              })
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
    
    JWTauthenticate () {
    
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

  
    }
}
module.exports = BreweryAuth;