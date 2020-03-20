const jwt = require('jsonwebtoken');
    
exports.createTokens = async (id, ATSecret, RTSecret ) => {

    const createToken = jwt.sign({ userId: id }, ATSecret, { expiresIn: '1m' });

    const createRefreshToken = jwt.sign({ userId: id }, RTSecret, { expiresIn: '7d' });

    return Promise.all([createToken, createRefreshToken])
};

exports.refreshTokens = async(token, refreshToken, repository, ATSecret, RTSecret) => {
    let currId ;
    try{

        const { userId } = jwt.decode(refreshToken);
        console.log(userId)
        currId = userId
    } catch(err) { return {} }
    
    if(!currId) { return {} }

    const user = await repository.findOne({ where: { id: currId }, raw:true })


    if(!user) { return {} }

    const refreshSecret = RTSecret + user.password

    try {
        jwt.verify(refreshToken, refreshSecret);
    } catch(err) {
        return {}
     }

     return this.createTokens(user.id, ATSecret, refreshSecret).then(tokens => {
         const [newToken, newRefreshToken] = tokens

         const response = {
            clientId: user.id,
            token: newToken,
            refreshToken: newRefreshToken
         }

         return response
     })
    
}