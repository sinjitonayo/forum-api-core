const AddThreadCommentReply = require('../../Domains/threads/comment-replies/entities/AddThreadCommentReply');

class AddThreadCommentReplyUseCase {
  constructor({ threadRepository, threadCommentRepository, threadCommentReplyRepository }) {
    this._threadRepository = threadRepository;
    this._threadCommentRepository = threadCommentRepository;
    this._threadCommentReplyRepository = threadCommentReplyRepository;
  }

  async execute(useCasePayload) {
    const {
      owner, threadId, commentId, content,
    } = useCasePayload;
    const addThreadCommentReply = new AddThreadCommentReply({ content });
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._threadCommentRepository.verifyThreadCommentAvailability(commentId, threadId);
    return this._threadCommentReplyRepository.addThreadCommentReply(owner, commentId, addThreadCommentReply);
  }
}

module.exports = AddThreadCommentReplyUseCase;
