/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
const DetailThreadCommentReply = require('./DetailThreadCommentReply');

class DetailsThreadCommentReply {
  constructor(payload) {
    this._verifyPayload(payload);

    this.replies = [];
    for (let i = 0; i < payload.length; i++) {
      if (payload[i].is_delete) {
        payload[i].content = '**balasan telah dihapus**';
      }
      delete payload[i].is_delete;

      this.replies[i] = new DetailThreadCommentReply({ ...payload[i] });
    }
  }

  _verifyPayload(threadReplies) {
    if (!Array.isArray(threadReplies)) {
      throw new Error('DETAILS_THREAD_COMMENT_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailsThreadCommentReply;
