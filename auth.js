

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

module.exports = (config, userModel) => {
  let opts = {};
   opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
   opts.secretOrKey = config.secret;


  const strategy = new JwtStrategy(opts, (payload, done) => {
    userModel._getById(payload.id)
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
    initialize: () => {
      return passport.initialize()
    },
    authenticate: () => {
      return passport.authenticate('jwt')
    }
  }
}
