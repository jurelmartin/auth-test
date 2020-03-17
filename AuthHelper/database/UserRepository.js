
const repository = require('./repository');
const model = require('./UserModel')

class UserRepository extends repository {
  constructor({ UserModel }) {
    super(UserModel);
  }
}

module.exports = UserRepository;

