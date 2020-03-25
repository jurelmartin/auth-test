# brewery-auth-test

JWT Authentication package using PassportJs 


## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [API](#api)
* [Contributors](#contributors)
* [License](#license)


## Install

```sh
npm i brewery-auth-test
```

## Usage

Example usage in AmberJs Framework:

```js

const BreweryAuth = require('brewery-auth');


class LoginUser extends Operation {
  constructor({ UserRepository }) {
    super();
    this.UserRepository = UserRepository;
  }

  async execute(data) {
    const { SUCCESS, VALIDATION_ERROR } = this.events;

    const { clientId, clientSecret } = data;


    const dbCredentials = {
      databaseName: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      dialect: process.env.DB_DIALECT,
      host: process.env.DB_HOST,
      authSecret: process.env.SECRET1,
      autSecret2: process.env.SECRET2,
    };

    try {
      const tokens = new BreweryAuth(dbCredentials).login({ clientId, clientSecret });
      
      tokens.then(result=> {
        return this.emit(SUCCESS, result);
      });

    } catch(error) {
      this.emit(VALIDATION_ERROR, {
        type: 'VALIDATION ERROR',
        details: error.message
      });
    }
  }
}

LoginUser.setEvents(['SUCCESS', 'ERROR', 'VALIDATION_ERROR', 'NOT_FOUND']);

module.exports = LoginUser;

```

## API

`BreweryAuth(dbCredentials)`

`.login({ clientId: '', clientSecret: '' })`

`.signup({ email: '', password: '', username: '', phone: '', MFA: '' })`

`.register({ email: '', password: '', username: '', phone: '' })`

`.signupConfirm({ clientId: '', confirmationCode: '' })`

`.signupResend({ clientId: '' })`

`.loginMfa({ clientId: '', mfaCode: '' })`

`.loginNewPasswordRequired({ clientId: '', newPassword: '' })`

`.logout(req,res)`

`.passwordForgot({ clientId: '' })`

`.passwordReset({ clientId: '', confirmationCode: '', newPassword: '' })`

`.passwordChange({ oldPassword: '', newPassword: '' })`

`.profile({ clientId: '' })`

`.profileEdit({ clientId: '', body })`

`.setMfa({ clientId: '', body })`

`.getMfa({ clientId: '' })`

`.deleteUser({ clientId: '', clientSecret: '' })`

`.initialize() //placed in your router to initialize authentication`

`.JWTauthenticate() //placed in front of your protected resources`


## Contributors

* Jerico Estanislao
* Jorelle Agustin

## License

[ISC](LICENSE) © Stratpoint Technologies Inc.
