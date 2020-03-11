
const repository = require('./repository');
const model = require('./model')

class UserRepository extends repository {
  constructor({model}) {
    super(model);
  }
}

module.exports = UserRepository;

