const ActionThreadCommentLikesUseCase = require('../../../../../../Applications/use_case/ActionThreadCommentLikesUseCase');

class ThreadCommentLikeHandler {
  constructor(container) {
    this._container = container;
  }

  async putThreadCommentLikeHandler(request, h) {
    const actionThreadCommentLikesUseCase = this._container.getInstance(ActionThreadCommentLikesUseCase.name);

    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await actionThreadCommentLikesUseCase.execute({
      owner, threadId, commentId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadCommentLikeHandler;
