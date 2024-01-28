const AddThreadCommentUseCase = require('../../../../../Applications/use_case/AddThreadCommentUseCase');
const DeleteThreadCommentUseCase = require('../../../../../Applications/use_case/DeleteThreadCommentUseCase');

class ThreadCommentHandler {
  constructor(container) {
    this._container = container;
  }

  async postThreadCommentHandler(request, h) {
    const addThreadCommentUseCase = this._container.getInstance(AddThreadCommentUseCase.name);
    const { content } = request.payload;

    const { id: owner } = request.auth.credentials;
    const { threadId } = request.params;

    const addedComment = await addThreadCommentUseCase.execute({ owner, threadId, content });

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteThreadCommentHandler(request, h) {
    const deleteThreadCommentUseCase = this._container.getInstance(DeleteThreadCommentUseCase.name);

    const { id: owner } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await deleteThreadCommentUseCase.execute({ owner, threadId, commentId });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadCommentHandler;
