

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = (config, UserRepository) => {
  let opts = {};
   opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
   opts.secretOrKey = config.secret;

  console.log('log from auth-test');
  const strategy = new JwtStrategy(opts, (payload, done) => {
    
    console.log(payload)
    UserRepository.getById(payload.id)
      .then((user) => {
        done(null, user)
      })
      .catch((error) => done(error, null))
  })

  passport.use(strategy)
 
  passport.serializeUser(function (user, done) {
    done(null, user)
  })

  passport.deserializeUser(function (user, done) {
    done(null, user)
  })


}
module.exports = () => {
  return {
    authenticate: () => {
      return passport.authenticate('jwt')
    }
  }
}

module.exports = () => {
  return {
    initialize: () => {
      return passport.initialize()
    }
  }

}