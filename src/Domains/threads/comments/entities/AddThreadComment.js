class AddThreadComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content } = payload;

    this.content = content;
  }

  _verifyPayload({ content }) {
    if (!content) {
      throw new Error('ADD_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string') {
      throw new Error('ADD_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddThreadComment;
