const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const DetailThreadUseCase = require('../../../../Applications/use_case/DetailThreadUseCase');

class ThreadHandler {
  constructor(container) {
    this._container = container;
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const { title, body } = request.payload;

    const { id: owner } = request.auth.credentials;

    const addedThread = await addThreadUseCase.execute({ title, body, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },

    });
    response.code(201);
    return response;
  }

  async getThreadHandler(request, h) {
    const detailThreadUseCase = this._container.getInstance(DetailThreadUseCase.name);

    const { threadId } = request.params;

    const thread = await detailThreadUseCase.execute({ threadId });

    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadHandler;
