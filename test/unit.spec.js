const {expect} = require('chai');
const BreweryAuth = require('../index');
const config = require('../config');

describe('Brewery-auth', () => {

    const auth = new BreweryAuth(config.dbConfig);
    before(async() => {
        const repository = await auth.getRepository();
        await repository.destroy({truncate: true});
    });

    context('Brewery-auth :: signup()', () => {
        context('when inputs are valid', () => {
            it('should return user info with confirmation code', async () => {
                const signupNoMFA = await auth.signup({
                    email: 'jec@email.com',
                    password: 'jecpassword',
                    username: 'jecusername',
                    phone: '+639498575069',
                    MFA: 0
                });
                expect(signupNoMFA.message).to.equal('success. use signupConfirm function');
                expect(signupNoMFA).to.have.property('confirmationCode');
            });
        });
        context('when inputs are invalid', () => {
            it('should return error', async () => {
                try{
                    await auth.signup({
                        email: 'jec@email.com',
                        password: 'jecpassword',
                        username: 'jecusername',
                        phone: '9498575069',
                        MFA: 0
                    });
                }catch(err){
                    expect(err);
                }
            });
        });
    })
    context('Brewery-auth :: register()', () => {
        context('when inputs are valid', () => {
            it('should return user info with confirmation code', async () => {
                const register = await auth.register({
                    email: 'jec@email.com',
                    password: 'jecpassword',
                    username: 'jecusername',
                    phone: '+639498575069'
                });
    
                expect(register.message).to.equal('Registered');
            });
        });
        context('when inputs are invalid', () => {
            it('should return user info with confirmation code', async () => {
                try{
                    await auth.register({
                        email: 'jec@email.com',
                        password: 'jecpassword',
                        username: 'jecusername',
                        phone: '98575069'
                    });
                }catch(err){
                    expect(err);
                }
            });
        });
    });
    context('Brewery-auth :: signupConfirm()', () => {
        context('when inputs are valid', () => {
            it('should return user info', async () => {
                const signupNoMFA = await auth.signup({
                    email: 'jestanislao@stratpoint.com',
                    password: 'jecpassword',
                    username: 'jecusername',
                    phone: '+639498575069',
                    MFA: 0
                });
            
                const confirmNoMFA = await auth.signupConfirm({
                    clientId: signupNoMFA.clientId,
                    confirmationCode: signupNoMFA.confirmationCode,
                },{
                    subject: 'The Brewery',
                    text: 'Welcome to the Brewery'
                });
            
                expect (confirmNoMFA.message).to.equal('signup confirmed');            
            })
            
        });
        context('when inputs are invalid', () => {
            it('should return error', async () => {
                try{
                    await auth.signupConfirm({
                        clientId: "dummyId",
                        confirmationCode: 1234,
                    });
                }catch(err){
                    expect(err);
                }           
            })
            
        });
    })
    context('Brewery-auth :: signupResend()', () => {
        context('when inputs are valid', () => {
            it('should return code', async () => {
                const signupNoMFA = await auth.signup({
                    email: 'jec@email.com',
                    password: 'jecpassword',
                    username: 'jecusername',
                    phone: '+639498575069',
                    MFA: 0
                });
                const signupNoMFAResend = await auth.signupResend({
                    clientId: signupNoMFA.clientId
                });
            
                expect (signupNoMFAResend).to.have.property('confirmationCode')         
            })
            
        });
        context('when inputs are invalid', () => {
            it('should return error', async () => {
                try{
                    await auth.signupResend({
                        clientId: 'dummyId'
                    });
                }catch(err){
                    expect(err);
                }           
            })
            
        });
    })
    context('Brewery-auth :: login()', () => {
        context('when inputs are valid', () => {
            context('when MFA is false', () => {
                it('should return tokens', async () => {
                    const signupNoMFA = await auth.signup({
                        email: 'jec@email.com',
                        password: 'jecpassword',
                        username: 'jecusername',
                        phone: '+639498575069',
                        MFA: 0
                    });
    
                    const confirmNoMFA = await auth.signupConfirm({
                        clientId: signupNoMFA.clientId,
                        confirmationCode: signupNoMFA.confirmationCode,
                    },{
                        subject: 'The Brewery',
                        text: 'Welcome to the Brewery'
                    });
    
                    const loginNoMFA = await auth.login({
                        clientId: confirmNoMFA.details.id,
                        clientSecret: 'jecpassword'
                    })
                
                    expect (loginNoMFA).to.have.property('token');  
                    expect (loginNoMFA).to.have.property('refreshToken');           
                });
            });
            context('when MFA is true', () => {
                it('should return confirmation code', async () => {
                    const signupNoMFA = await auth.signup({
                        email: 'jec@email.com',
                        password: 'jecpassword',
                        username: 'jecusername',
                        phone: '+639498575069',
                        MFA: 1
                    });
    
                    const confirmNoMFA = await auth.signupConfirm({
                        clientId: signupNoMFA.clientId,
                        confirmationCode: signupNoMFA.confirmationCode,
                    },  {
                        subject: 'The Brewery',
                        text: 'Welcome to the Brewery'
                    });
    
                    const loginMFA = await auth.login({
                        clientId: confirmNoMFA.details.id,
                        clientSecret: 'jecpassword'
                    })
                    console.log(loginMFA);
                    expect (loginMFA).to.have.property('confirmationCode');          
                });
            });
            context('when registered', () => {
                it('should notify user to use loginNewPasswordRequired()', async () => {
                    const registered = await await auth.register({
                        email: 'jec@email.com',
                        password: 'jecpassword',
                        username: 'jecusername',
                        phone: '+639498575069'
                    });
    
                    const loginregistered = await auth.login({
                        clientId: registered.details.id,
                        clientSecret: 'jecpassword'
                    })
                
                    expect (loginregistered.message).to.equal('Use loginNewPasswordRequired function');          
                });
            });
        });
        context('when inputs are invalid', () => {
            it('should return error', async () => {
                try{
                    await auth.login({
                        clientId: 'dummyId',
                        clientSecret: 'jecpassword'
                    })
                }catch(err){
                    expect(err);
                }           
            })
            
        });
    });
    context('Brewery-auth :: loginNewPasswordRequired()', () => {
        context('when inputs are valid', () => {
            it('should return tokens', async () => {
                const register = await auth.register({
                    email: 'jec@email.com',
                    password: 'jecpassword',
                    username: 'jecusername',
                    phone: '+639498575069'
                });
            
                const login = await auth.login({
                    clientId: register.details.id,
                    clientSecret: 'jecpassword'
                })
            
                const loginNewPassword = await auth.loginNewPasswordRequired({
                    clientId: login.clientId,
                    newPassword: 'jecnewpassword'
                });

                expect(loginNewPassword).to.have.property('token');
                expect(loginNewPassword).to.have.property('refreshToken');
            });
        });
        context('when inputs are invalid', () => {
            it('should return error', async () => {
                it('should return error', async () => {
                    try{
                        await auth.loginNewPasswordRequired({
                            clientId: 'dummyId',
                            newPassword: 'jecnewpassword'
                        })
                    }catch(err){
                        expect(err);
                    }           
                })
            });
        });
    });
    context('Brewery-auth :: passwordForgot()', () => {
        context('when inputs are valid', () => {
            it('should return confirmation code', async () => {
                const signupNoMFA = await auth.signup({
                    email: 'jec@email.com',
                    password: 'jecpassword',
                    username: 'jecusername',
                    phone: '+639498575069',
                    MFA: 0
                });

                const forgotPassword = await auth.passwordForgot({
                    clientId: signupNoMFA.clientId
                });

                expect(forgotPassword).to.have.property('confirmationCode');
            });
        });
        context('when inputs are invalid', () => {
            it('should return error', async () => {
                it('should return error', async () => {
                    try{
                        await auth.passwordForgot({
                            clientId: 'dummyId'
                        });
                    }catch(err){
                        expect(err);
                    }           
                })
            });
        });
    });
    context('Brewery-auth :: passwordReset()', () => {
        context('when inputs are valid', () => {
            it('should return confirmation code', async () => {
                const signupNoMFA = await auth.signup({
                    email: 'jec@email.com',
                    password: 'jecpassword',
                    username: 'jecusername',
                    phone: '+639498575069',
                    MFA: 0
                });

                const forgotPassword = await auth.passwordForgot({
                    clientId: signupNoMFA.clientId
                });

                const confirmPasswordReset = await auth.passwordReset({
                    clientId: signupNoMFA.clientId,
                    confirmationCode: forgotPassword.confirmationCode,
                    newPassword: 'newPassword'
                });
                expect(confirmPasswordReset.message).to.equal('password reset success');
                expect(confirmPasswordReset).to.have.property('newPassword');
            });
        });
        context('when inputs are invalid', () => {
            it('should return error', async () => {
                it('should return error', async () => {
                    try{
                        await auth.passwordReset({
                            clientId: 'dummyId',
                            confirmationCode: 'dummyCode',
                            newPassword: 'newPassword'
                        });
                    }catch(err){
                        expect(err);
                    }           
                })
            });
        });
    });
    context('Brewery-auth :: profile()', () => {
        context('when inputs are valid', () => {
            it('should return user data', async () => {
                const signupNoMFA = await auth.signup({
                    email: 'jec@email.com',
                    password: 'jecpassword',
                    username: 'jecusername',
                    phone: '+639498575069',
                    MFA: 0
                });

                const profile = await auth.profile(signupNoMFA.clientId);

                expect(profile).to.have.property('email');
            });
        });
        context('when inputs are invalid', () => {
            it('should return error', async () => {
                it('should return error', async () => {
                    try{
                        await auth.profile('dummyId');
                    }catch(err){
                        expect(err);
                    }           
                })
            });
        });
    });
    context('Brewery-auth :: profileEdit()', () => {
        context('when inputs are valid', () => {
            it('should return user data that is updated', async () => {
                const signupNoMFA = await auth.signup({
                    email: 'jec@email.com',
                    password: 'jecpassword',
                    username: 'jecusername',
                    phone: '+639498575069',
                    MFA: 0
                });

                const updated = await auth.profileEdit(signupNoMFA.clientId, {
                    username: 'jericooo11'
                });

                expect(updated).to.have.property('username');
            });
        });
        context('when inputs are invalid', () => {
            it('should return error', async () => {
                it('should return error', async () => {
                    try{
                        await auth.profileEdit('dummyId', {
                            username: 'jericooo11'
                        });
                    }catch(err){
                        expect(err);
                    }           
                })
            });
        });
    });
    context('Brewery-auth :: passwordChange()', () => {
        context('when inputs are valid', () => {
            it('should return success', async () => {
                const signupNoMFA = await auth.signup({
                    email: 'jec@email.com',
                    password: 'jecpassword',
                    username: 'jecusername',
                    phone: '+639498575069',
                    MFA: 0
                });

                const newPassword = await auth.passwordChange(signupNoMFA.clientId, {
                    oldPassword: 'jecpassword', 
                    newPassword: Math.random().toString()
                });

                expect(newPassword).to.equal('Success');
            });
        });
        context('when inputs are invalid', () => {
            it('should return error', async () => {
                it('should return error', async () => {
                    try{
                        await auth.passwordChange('dummyId', {
                            oldPassword: 'jecpassword', 
                            newPassword: Math.random().toString()
                        });
                    }catch(err){
                        expect(err);
                    }           
                })
            });
        });
    });
    context('Brewery-auth :: getMFA()', () => {
        context('when inputs are valid', () => {
            it('should return MFA data', async () => {
                const signupNoMFA = await auth.signup({
                    email: 'jec@email.com',
                    password: 'jecpassword',
                    username: 'jecusername',
                    phone: '+639498575069',
                    MFA: 0
                });

                const mfaData = await auth.getMfa(signupNoMFA.clientId);

                expect(mfaData).to.have.property('MFA');
            });
        });
        context('when inputs are invalid', () => {
            it('should return error', async () => {
                it('should return error', async () => {
                    try{
                        await auth.getMfa('dummyId');
                    }catch(err){
                        expect(err);
                    }           
                })
            });
        });
    });
    context('Brewery-auth :: setMFA()', () => {
        context('when inputs are valid', () => {
            it('should return new MFA data', async () => {
                const signupMFA = await auth.signup({
                    email: 'jec@email.com',
                    password: 'jecpassword',
                    username: 'jecusername',
                    phone: '+639498575069',
                    MFA: 1
                });

                const setMfa = await auth.setMfa(signupMFA.clientId, {
                    mfa: false
                });

                expect(setMfa).to.have.property('MFA');
            });
        });
        context('when inputs are invalid', () => {
            it('should return error', async () => {
                it('should return error', async () => {
                    try{
                        await auth.setMfa('dummyId', {
                            mfa: false
                        });
                    }catch(err){
                        expect(err);
                    }           
                })
            });
        });
    });
    context('Brewery-auth :: deleteUser()', () => {
        context('when inputs are valid', () => {
            it('return deleted', async () => {
                const signupMFA = await auth.signup({
                    email: 'jec@email.com',
                    password: 'jecpassword',
                    username: 'jecusername',
                    phone: '+639498575069',
                    MFA: 1
                });

                const deleteUser = await auth.deleteUser({
                    clientId: signupMFA.clientId,
                    password: 'jecpassword'
                });

                expect(deleteUser.message).to.equal('deleted');
            });
        });
        context('when inputs are invalid', () => {
            it('should return error', async () => {
                it('should return error', async () => {
                    try{
                        await auth.deleteUser({
                            clientId: 'dummyId',
                            password: 'jecpassword'
                        });
                    }catch(err){
                        expect(err);
                    }           
                })
            });
        });
    });
})