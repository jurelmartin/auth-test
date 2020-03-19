const jwt = require('jsonwebtoken');
    
exports.createTokens = async (id, ATSecret, RTSecret ) => {

    const createToken = jwt.sign({ user: id }, ATSecret, { expiresIn: '1h' });

    const createRefreshToken = jwt.sign({ user: id }, RTSecret, { expiresIn: '7d' });

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

    const refreshSecret = RTSecret + user.dataValues.password

    try {
        jwt.verify(refreshToken, refreshSecret);
    } catch(err) {
        return {}
     }
     createTokens(user, ATSecret, refreshSecret).then(tokens => {
        const [token, refreshToken] = tokens
        return {
          clientId: user.dataValues.id,
          token: token,
          refreshToken: refreshToken
        }

      })
    
}