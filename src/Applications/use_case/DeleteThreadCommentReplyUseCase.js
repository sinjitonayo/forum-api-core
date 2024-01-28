class DeleteThreadCommentReplyUseCase {
  constructor({ threadRepository, threadCommentRepository, threadCommentReplyRepository }) {
    this._threadRepository = threadRepository;
    this._threadCommentRepository = threadCommentRepository;
    this._threadCommentReplyRepository = threadCommentReplyRepository;
  }

  async execute(useCasePayload) {
    const {
      owner, threadId, commentId, replyId,
    } = useCasePayload;
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._threadCommentRepository.verifyThreadCommentAvailability(commentId, threadId);
    await this._threadCommentReplyRepository.verifyThreadCommentReplyOwner(owner, replyId);
    return this._threadCommentReplyRepository.deleteThreadCommentReply(replyId);
  }
}

module.exports = DeleteThreadCommentReplyUseCase;
