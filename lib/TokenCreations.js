const jwt = require('jsonwebtoken');
    
exports.createTokens = async (user, ATSecret, RTSecret ) => {

    const createToken = jwt.sign({ clientId:user.id }, ATSecret, { expiresIn: '1m' });

    const createRefreshToken = jwt.sign({ clientId:user.id }, RTSecret, { expiresIn: '7d' });

    return Promise.all([createToken, createRefreshToken])
};

exports.refreshTokens = async(token, refreshToken, repository, ATSecret, RTSecret) => {
    let userId;
    try{
        const { user: { id } } = jwt.decode(refreshToken);
        userId = id
    } catch(err) { return {} }
    
    if(!userId) { return {} }

    const user = await repository.findOne({ where: { id: userId } })

    if(!user) { return {} }

    const refreshSecret = RTSecret + user.password

    try {
        jwt.verify(refreshToken, refreshSecret);
    } catch(err) {
        return {}
     }
     createTokens(user, ATSecret, refreshSecret).then(tokens => {
        const [token, refreshToken] = tokens
        return {
          clientId: user.id,
          token: token,
          refreshToken: refreshToken
        }

      })
    
}