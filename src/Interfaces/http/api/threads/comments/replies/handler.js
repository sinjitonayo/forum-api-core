const AddThreadCommentReplyUseCase = require('../../../../../../Applications/use_case/AddThreadCommentReplyUseCase');
const DeleteThreadCommentReplyUseCase = require('../../../../../../Applications/use_case/DeleteThreadCommentReplyUseCase');

class ThreadCommentReplyHandler {
  constructor(container) {
    this._container = container;
  }

  async postThreadCommentReplyHandler(request, h) {
    const addThreadCommentReplyUseCase = this._container.getInstance(AddThreadCommentReplyUseCase.name);
    const { content } = request.payload;

    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const addedReply = await addThreadCommentReplyUseCase.execute({
      owner, threadId, commentId, content,
    });

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteThreadCommentReplyHandler(request, h) {
    const deleteThreadCommentReplyUseCase = this._container.getInstance(DeleteThreadCommentReplyUseCase.name);

    const { id: owner } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;

    await deleteThreadCommentReplyUseCase.execute({
      owner, threadId, commentId, replyId,
    });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadCommentReplyHandler;
