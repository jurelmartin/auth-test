

const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');

module.exports = (config, userModel) => {

  const params = {
    secretOrKey: config.authSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt')
  }

  const test = userModel.findByPk('6ba3b41e-13a7-4e25-b6aa-ce855d1a2983')
  console.log(test)

  const strategy = new Strategy(params, (payload, done) => {
    userModel.findByPk(payload.id)
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
