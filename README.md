# brewery-auth-test

JWT Authentication package using PassportJs


## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [API](#api)
* [Contributors](#contributors)
* [License](#license)

## Requirements

```
[SMS] Nexmo account - https://dashboard.nexmo.com/sign-in?redirect=sms
[EMAIL] Sendgrid account - https://sendgrid.com
```

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


    const config = {
    dbConfig: {
        databaseName: process.env.DB_NAME,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        dialect: process.env.DB_DIALECT,
        host: process.env.DB_HOST,
        authSecret: process.env.SECRET1,
        authSecret2: process.env.SECRET2,
    },
    salt: process.env.SALT,
    nexmoSecret: process.env.NEXMO_API_SECRET,
    nexmoKey: process.env.NEXMO_API_KEY,
    sendgridKey: process.env.SENDGRID_API_KEY,
    senderEmail: process.env.SENDER_EMAIL,
    senderSms: process.env.SENDER_SMS 
  };

    try {
      const tokens = new BreweryAuth(config).login({ clientId, clientSecret });
      
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

`BreweryAuth({
    dbConfig: {
        databaseName: ,
        username: ,
        password: ,
        dialect: ,
        host: ,
        authSecret: ,
        authSecret2: ,
    },
    salt: ,
    nexmoSecret: ,
    nexmoKey: ,
    sendgridKey: ,
    senderEmail: ,
    senderSms: 
})`
`.login({ clientId: '', clientSecret: '' })`

`.signup({ email: '', password: '', username: '', phone: '', MFA: '' })`

`.register({ email: '', password: '', username: '', phone: '' })`

`.signupConfirm({ clientId: '' , confirmationCode: '' }, { subject: '' , text: '' })`

`.signupResend({ clientId: '' })`

`.loginMfa({ clientId: '', confirmationCode: '' })`

`.loginNewPasswordRequired({ clientId: '', newPassword: '' })`

`.logout(req,res)`

`.passwordForgot({ clientId: '' })`

`.passwordReset({ clientId: '', confirmationCode: '', newPassword: '' })`

`.passwordChange({ oldPassword: '', newPassword: '' })`

`.profile({ clientId: '' })`

`.profileEdit({ clientId: '', body })`

`.setMfa({ clientId: '', mfa: '' })`

`.getMfa({ clientId: '' })`

`.deleteUser({ clientId: '', clientSecret: '' })`

`.initialize() //placed in your router to initialize authentication`

`.JWTauthenticate() //placed in front of your protected resources`


## Contributors

* Jerico Estanislao
* Jorelle Agustin

## License

[ISC](LICENSE) © Stratpoint Technologies Inc.
