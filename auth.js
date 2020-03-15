const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;


module.exports = (config, UserRepository) => {

  const strategyOptions = {
    secretOrKey : config.secret,
    jwtFromRequest: req => req.headers.cookie,
    passReqToCallback: true
  };

  const verifyCallback = async (req, jwtPayload, cb) => {
    const [err, user] = await UserRepository.getById(jwtPayload.dataValues.id)
    console.log(user);
    if(err) {
      return cb(err)
    }
    req.user = user
    return cb(null, user)
  }

  passport.use(new JwtStrategy(strategyOptions, verifyCallback))



  passport.serializeUser((user, done) => done (null, user.dataValues.id))


  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserRepository.getById(id)
      return done(null, user)
    }catch (err) {
      return done(err, null)
    }
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
