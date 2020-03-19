const express = require('express');
const app = express();
const cors = require('cors');
const sendSMS = require('./lib/sendSMS');
const sendEmail = require('./lib/sendEmail');
const breweryAuth = require('./breweryLike');

const dbCredentials = {
    databaseName: 'yourdatabase',
    username: 'root',
    password: 'root',
    dialect: 'mysql',
    host: 'localhost',
    authSecret: 'supersecret',
    autSecret2: 'supersecret2',
    newAttrib: ['email']
}
const auth = new breweryAuth(dbCredentials);

app
.use(cors())
.use(auth.initialize());

app.use('/api', auth.JWTauthenticate(), async () => {
     
    const profile = await auth.profile();
    console.log(profile);
    const mfaData = await auth.getMfa();
    console.log(mfaData);
    const setMfa = await auth.setMfa({
        mfa: false
    });
    console.log(setMfa);
    const updated = await auth.profileEdit({
        username: 'jericooo11'
    });
    console.log(updated);
    // const newPassword = await auth.passwordChange({
    //     oldPassword: 'jecpassword', 
    //     newPassword: Math.random().toString()
    // });
    // console.log(newPassword);
})

app.listen(3000, async () => {

    //send email
    // console.log(await sendEmail({
    //     to: 'jestanislao@stratpoint.com',
    //     from: 'Brewery-auth',
    //     subject: 'Sending with Twilio SendGrid is Fun',
    //     text: 'and easy to do anywhere, even with Node.js',
    //     html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    //   }));
    //send SMS pls wag gamitin ng madalas may limit lang siya

    // const text = 'Hello welcome to brewery'
    // const from = 'Brewery-auth';
    // const to = '+639498575069';

    // console.log(await sendSMS(from, to, text));
     
// login when user is registered by resource owner
    const register = await auth.register({
        email: 'jec@email.com',
        password: 'jecpassword',
        username: 'jecusername',
        phone: '1234567'
    });

    console.log(register.details);

    const login = await auth.login({
        clientId: register.details.id,
        clientSecret: 'jecpassword'
    })

    console.log(login);

    const loginNewPassword = await auth.loginNewPasswordRequired({
        clientId: login.clientId,
        newPassword: 'jecnewpassword'
    });

    console.log(loginNewPassword);


// login after signing up non MFA
    const signupNoMFA = await auth.signup({
        email: 'jec@email.com',
        password: 'jecpassword',
        username: 'jecusername',
        phone: '1234567',
        MFA: 0
    });

    console.log(signupNoMFA);

    const confirmNoMFA = await auth.signupConfirm({
        clientId: signupNoMFA.clientId,
        confirmationCode: signupNoMFA.confirmationCode.code,
    });

    console.log(confirmNoMFA);

    const signupNoMFAResend = await auth.signupResend({
        clientId: signupNoMFA.clientId
    });

    console.log(signupNoMFAResend);

    const confirmNoMFA2 = await auth.signupConfirm({
        clientId: signupNoMFAResend.clientId,
        confirmationCode: signupNoMFAResend.confirmationCode,
    });

    console.log(confirmNoMFA2);

    const forgotPassword = await auth.passwordForgot({
        clientId: confirmNoMFA2.id
    })

    console.log(forgotPassword);
    
    const confirmPasswordReset = await auth.passwordReset({
        clientId: confirmNoMFA2.id,
        confirmationCode: forgotPassword.details.code,
        newPassword: 'newPassword'
    });

    console.log(confirmPasswordReset);

    const loginNoMFA = await auth.login({
        clientId: confirmNoMFA.id,
        clientSecret: 'newPassword'
    })

    console.log(loginNoMFA);
    
// login after signing up non MFA
    const signupMFA = await auth.signup({
        email: 'jec@email.com',
        password: 'jecpassword',
        username: 'jecusername',
        phone: '1234567',
        MFA: 1
    });

    console.log(signupMFA);

    const confirmMFA = await auth.signupConfirm({
        clientId: signupMFA.clientId,
        confirmationCode: signupMFA.confirmationCode.code,
    });

    console.log(confirmMFA);

    const loginMFA = await auth.login({
        clientId: confirmMFA.id,
        clientSecret: 'jecpassword'
    })


    console.log(loginMFA);

    const finalLoginMFA = await auth.loginMfa({
        clientId: loginMFA.clientId,
        confirmationCode: loginMFA.code
    })

    console.log(finalLoginMFA);

});