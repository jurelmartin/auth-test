// FOR NON-SERVERLESS
const InitializeServer = require('./dbHelper/index');
const Crypto = require('crypto');

class BreweryAuth {
    constructor(dbCredentials) {
      this.repository = InitializeServer.config(dbCredentials)
    }

register (body) {
    this.repository.then((UserRepository) => {
      const { email, username } = body;

      const password = Crypto.createHash('SHA256').update(new Date().getTime() + username).digest('hex');
        return new Promise((resolve, reject) => {
          UserRepository.create({
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
    })
}

signup (body) {
    this.repository.then((UserRepository) => {
    const { email, username, password } = body;

      return new Promise((resolve, reject) => {
        UserRepository.create({
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
    })
}


login (body) {
  this.repository.then((UserRepository) => {
    const { clientId, clientSecret } = body;

      return new Promise((resolve, reject) => {
        UserRepository.findByPk(clientId).then(user => {
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
  })
}

signupConfirm (body) {
  this.repository.then((UserRepository) => {
    const { clientId, confirmationCode } = body;

      return new Promise((resolve, reject) => {
        UserRepository.findByPk(clientId).then(user => {
          if (confirmationCode === code) {
            resolve(user.dataValues);
          }else {
            const error = new Error();
            error.message = 'Wrong code';
            throw error;
          }
          
        }).catch(err => reject(err.message));
      });
  })

}

sigupResend (body) {
  this.repository.then((UserRepository) => {
  const { clientId } = body;

    return new Promise((resolve, reject) => {
      UserRepository.findByPk(clientId).then(user => {
        code = Math.random();
        // sends new confirmation code, through sms or email,
        const response = {
          clientId: clientId,
          confirmationCode: code
        }
        resolve(response);
      }).catch(err => reject(err.message));
    });
  })
}



}
module.exports = BreweryAuth;