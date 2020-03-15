

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = (config, UserRepository) => {
  let opts = {};
   opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
   opts.secretOrKey = config.secret;

  console.log(opts.jwtFromRequest);
  const strategy = new JwtStrategy(opts, (payload, done) => {
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