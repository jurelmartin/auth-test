const jwt = require('jsonwebtoken');
    
exports.createTokens = async (id, ATSecret, RTSecret ) => {

    const createToken = jwt.sign({ user: id }, ATSecret, { expiresIn: '1h' });

    const createRefreshToken = jwt.sign({ user: id }, RTSecret, { expiresIn: '7d' });

    return Promise.all([createToken, createRefreshToken])
};

exports.refreshTokens = async(token, refreshToken, repository, ATSecret, RTSecret) => {
    let userId ;
    try{
        const { clientId } = jwt.decode(refreshToken);
        userId = clientId
    } catch(err) { return {} }
    
    if(!userId) { return {} }

    const user = await repository.findOne({ where: { id: userId }, raw:true })

    if(!user) { return {} }

    const refreshSecret = RTSecret + user.password

    try {
        jwt.verify(refreshToken, refreshSecret);
    } catch(err) {
        return {}
     }

     return this.createTokens(user, ATSecret, refreshSecret).then(tokens => {
         const [newToken, newRefreshToken] = tokens

         const response = {
            clientId: user.id,
            token: newToken,
            refreshToken: newRefreshToken
         }

         return response
     })
    
}