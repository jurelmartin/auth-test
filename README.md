# brewery-auth-test

Authentication package using PassportJs


## Table of Contents

* [Requirements](#requirements)
* [Install](#install)
* [Usage](#usage)
* [API](#api)
* [Contributors](#contributors)
* [License](#license)

## Requirements

* [Nexmo account](https://dashboard.nexmo.com)
* [Sendgrid account](https://sendgrid.com)

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

First you need to pass the needed parameters for this library like so:

```javascript
BreweryAuth({
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
})
```

For logging in a Client you need to pass a Client Id and Password and it will return a Access Token and Refresh Token.

```javascript
.login({ clientId: '', clientSecret: '' })
```

If a Client does not exist yet, you can signup first by using this api and passing the fields needed.

```js
.signup({ email: '', password: '', username: '', phone: '', MFA: '' })
```

If you have an existing user and just need to register a client just use this api and pass the following fields.

```js
.register({ email: '', password: '', username: '', phone: '' })
```

After you use  the signup api, you can execute this api after so can recieve a confirmation code and an email.

```js
.signupConfirm({ clientId: '' , confirmationCode: '' }, { subject: '' , text: '' })
```

If you somehow did not recieved a confirmation code, you can use this api to resend the request by just passing the Client Id used.

```js
.signupResend({ clientId: '' })
```

If you enabled the MFA upon signup, you have to use this api and pass the confirmation code in it

```js
.loginMfa({ clientId: '', confirmationCode: '' })
```

If you change your password that was given by default upon registration you have to use this api to change it

```js
.loginNewPasswordRequired({ clientId: '', newPassword: '' })
```

If you want to log the Client out, just use this api and just pass in the request and the response

```js
.logout(req,res)
```

`.passwordForgot({ clientId: '' })`

`.passwordReset({ clientId: '', confirmationCode: '', newPassword: '' })`

`.passwordChange({ oldPassword: '', newPassword: '' })`

`.profile({ clientId: '' })`

`.profileEdit({ clientId: '', body })`

`.setMfa({ clientId: '', mfa: '' })`

`.getMfa({ clientId: '' })`

`.deleteUser({ clientId: '', clientSecret: '' })`

For your resources that needed protection or authentication you can attach this api and use it on your routes first.

```js
.initialize()
```

Then, Including this above your resources that needed authentication first

```js
.JWTauthenticate()
```

## Contributors

* Jerico Estanislao
* Jorelle Agustin

## License

[ISC](LICENSE) © Stratpoint Technologies Inc.
