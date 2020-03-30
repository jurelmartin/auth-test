class Validator {
    constructor(data){
        this.data = data
    }

    _validate (email) {
        const  tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
        
        if (!email) return false;
      
        if (email.length > 256) return false;
      
        if (!tester.test(email)) return false;
      
        // Further checking of some things regex can't handle
        var [account, address] = email.split('@');
        if (account.length > 64) return false;
      
        var domainParts = address.split('.');
        if (domainParts.some(function (part) {
          return part.length > 63;
        })) return false;
      
        return true;
      };

    isValid () {
        const errors = [];
        const { email, password, username, phone } = this.data
        const checkEmail = this._validate(email)

        if(!checkEmail) {
            errors.push('Please input a vaid email!');
        }

        if(password.length < 6) {
            errors.push('Minimum password length is 6!')
        }

        const checkNumber = /((^(\+)(\d){12}$)|(^\d{11}$))/
        if(!checkNumber.test(phone)){
            errors.push('Invalid phone number!')
        }
        
        if(errors.length > 0){
            let error = {}
            error.message = errors;
            return error;  
        }
    }

    isValidUpdate () {
        const errors = [];
        const { email, password, username, phone } = this.data

        for (const key in this.data) {
            if(key.toLowerCase() === 'password') {
                throw new Error('use PasswordChange function to update password');
            }
            if(key.toLowerCase() === 'mfa') {
                throw new Error('use setMfa function to update password');
            }

            if (key !== 'email'){
                if ( key !== 'username'){
                    if ( key !== 'phone') {
                        throw new Error (`invalid property ${key}`);
                        break;
                    }
                }
            }
        }
        if(email){
            const checkEmail = this._validate(email)

        if(!checkEmail) {
            errors.push('Please input a vaid email!');
        }
        }

        if(phone) {
            const checkNumber = /((^(\+)(\d){12}$)|(^\d{11}$))/
            if(!checkNumber.test(phone)){
            errors.push('Invalid phone number!')
        }
        }
        
        if(errors.length > 0){
            let error = {}
            error.message = errors;
            return error;  
        }
    }

}
module.exports = Validator