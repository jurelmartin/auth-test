

const passport = require('passport');
const { ExtractJwt, Strategy } = require('passport-jwt');

module.exports = (config, UserRepository) => {
  opts = {
    secretOrKey = config.secret,
    jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
  };

  console.log(ExtractJwt.fromAuthHeaderAsBearerToken())
  const strategy = new Strategy(opts, (payload, done) => {
    
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

  return {
    initialize: () => {
      return passport.initialize()
    },
    authenticate: () => {
      return passport.authenticate('jwt')
    }
  }

}
// module.exports = () => {
//   return {
//     authenticate: () => {
//       return passport.authenticate('jwt')
//     }
//   }
// }

// module.exports = () => {
//   return {
//     initialize: () => {
//       return passport.initialize()
//     }
//   }

// }