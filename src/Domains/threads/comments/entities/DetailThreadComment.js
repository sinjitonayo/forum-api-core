/* eslint-disable camelcase */
class DetailThreadComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, like_count,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = content;
    this.likeCount = parseInt(like_count, 10);
  }

  _verifyPayload({
    id, username, date, content, like_count,
  }) {
    if (!id || !username || !date || !content || !like_count) {
      throw new Error('DETAIL_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    // eslint-disable-next-line no-restricted-globals
    if (typeof id !== 'string' || typeof username !== 'string' || !(date instanceof Date) || typeof content !== 'string' || isNaN(like_count)) {
      throw new Error('DETAIL_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DetailThreadComment;
