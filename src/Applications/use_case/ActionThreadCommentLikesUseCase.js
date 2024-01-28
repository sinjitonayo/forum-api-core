class ActionThreadCommentLikesUseCase {
  constructor({ threadCommentRepository, threadCommentLikesRepository }) {
    this._threadCommentRepository = threadCommentRepository;
    this._threadCommentLikesRepository = threadCommentLikesRepository;
  }

  async execute(useCasePayload) {
    const {
      owner, threadId, commentId,
    } = useCasePayload;

    await this._threadCommentRepository.verifyThreadCommentAvailability(commentId, threadId);
    return this._threadCommentLikesRepository.actionCommentLikes(owner, commentId);
  }
}

module.exports = ActionThreadCommentLikesUseCase;
