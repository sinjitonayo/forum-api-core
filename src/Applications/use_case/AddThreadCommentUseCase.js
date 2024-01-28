const AddThreadComment = require('../../Domains/threads/comments/entities/AddThreadComment');

class AddThreadCommentUseCase {
  constructor({ threadRepository, threadCommentRepository }) {
    this._threadRepository = threadRepository;
    this._threadCommentRepository = threadCommentRepository;
  }

  async execute(useCasePayload) {
    const { owner, threadId, content } = useCasePayload;
    const addThreadComment = new AddThreadComment({ content });
    await this._threadRepository.verifyThreadAvailability(threadId);
    return this._threadCommentRepository.addThreadComment(owner, threadId, addThreadComment);
  }
}

module.exports = AddThreadCommentUseCase;
