const passport = require('passport');
const {ExtractJwt, Strategy} = require('passport-jwt');
let config, repository;

exports.initialize = (inputConfig, inputRepository) => {

  config = inputConfig;
  repository = inputRepository;

  return passport.initialize();
};

exports.authenticate = () => {
  return [
    (req, res, next) => {

      const jwtOptions = {};
      jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
      jwtOptions.secretOrKey = config.authSecret;  
      

      passport.use(new Strategy(jwtOptions, (jwt_payload, done) => {
        // console.log('payload is', jwt_payload.id);
        repository.getById(jwt_payload.id)
          .then((user) => {
            // console.log(user);
            done(null, user.dataValues);
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
          res.status(401).json({
            status: 401,
            message: 'Not Authenticated'
          });
        }
        next();
      })(req, res, next);
    }
  ];
};