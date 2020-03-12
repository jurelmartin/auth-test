

const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');

module.exports = (config, userModel) => {

  const params = {
    secretOrKey: config.authSecret,
    jwtFromRequest: ExtractJwt.fromHeader('authorization')
  }

  const strategy = new Strategy(params, (payload, done) => {
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
