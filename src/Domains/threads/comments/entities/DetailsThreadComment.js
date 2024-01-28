/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
const DetailThreadComment = require('./DetailThreadComment');

class DetailsThreadComment {
  constructor(payload) {
    this._verifyPayload(payload);

    this.comments = [];
    for (let i = 0; i < payload.length; i++) {
      if (payload[i].is_delete) {
        payload[i].content = '**komentar telah dihapus**';
      }
      delete payload[i].is_delete;

      this.comments[i] = new DetailThreadComment({ ...payload[i] });
    }
  }

  _verifyPayload(threadComments) {
    if (!Array.isArray(threadComments)) {
      throw new Error('DETAILS_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailsThreadComment;
