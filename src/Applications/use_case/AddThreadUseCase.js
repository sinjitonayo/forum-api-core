const AddThread = require('../../Domains/threads/entities/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { owner, title, body } = useCasePayload;
    const addThread = new AddThread({ title, body });
    return this._threadRepository.addThread(owner, addThread);
  }
}

module.exports = AddThreadUseCase;
