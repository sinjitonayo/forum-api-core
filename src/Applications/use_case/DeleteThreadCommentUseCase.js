class DeleteThreadCommentUseCase {
  constructor({ threadRepository, threadCommentRepository }) {
    this._threadRepository = threadRepository;
    this._threadCommentRepository = threadCommentRepository;
  }

  async execute(useCasePayload) {
    const { owner, threadId, commentId } = useCasePayload;
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._threadCommentRepository.verifyThreadCommentOwner(owner, commentId);
    return this._threadCommentRepository.deleteThreadComment(commentId);
  }
}

module.exports = DeleteThreadCommentUseCase;
