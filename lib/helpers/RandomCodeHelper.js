const jwt = require('jsonwebtoken');
let signupToken, mfaToken, passwordForgotToken ;

exports.generateCode = (clientId, type) => {

    if (!clientId || !type){
        throw new Error('failed to generate code');
    }

    let code           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = 5 ;
    for ( var i = 0; i < charactersLength; i++ ) {
       code += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

        if(type.toLowerCase() == 'signup'){
            signupToken = jwt.sign({clientId: clientId},code, {
                expiresIn: '5m'
            });
    
        }else
        if(type.toLowerCase() == 'mfa'){
            mfaToken = jwt.sign({clientId: clientId},code, {
                expiresIn: '5m'
            });
    
        }else
        if(type.toLowerCase() == 'password'){
            passwordForgotToken = jwt.sign({clientId: clientId},code, {
                expiresIn: '5m'
            });
        }else{
            throw new Error('unknown type')
        }
        return code;

};

exports.verifyCode = (clientId, code, type) => {
    
    if (!clientId || !type || !code){
        throw new Error('incomplete parameters');
    }

    if(type.toLowerCase() == 'signup'){
        const decoded = jwt.verify(signupToken, code)
        if (decoded.clientId === clientId){
            return(true);
        }else{
            throw new Error('code invalid/expired');
        }
    }else
    if(type.toLowerCase() == 'mfa'){
        const decoded = jwt.verify(mfaToken, code)
        if (decoded.clientId === clientId){
            return(true);
        }else{
            throw new Error('code invalid/expired');
        }
    }else
    if(type.toLowerCase() == 'password'){
        const decoded = jwt.verify(passwordForgotToken, code)
        if (decoded.clientId === clientId){
            return(true);
        }else{
            throw new Error('code invalid/expired');
        }
    }else{
        throw new Error('unknow type');
    }
    
} 