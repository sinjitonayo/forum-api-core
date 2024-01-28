/* eslint-disable camelcase */
/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadCommentRepliesTableTestHelper = {
  async addThreadCommentReply({
    owner = 'user-123',
    comment_id = 'comment-123',
    id = 'reply-123',
    content = 'sebuah balasan',
    is_delete = false,
  }) {
    const query = {
      text: 'INSERT INTO thread_comment_replies (id, content, owner, comment_id, is_delete) VALUES($1, $2, $3, $4, $5)',
      values: [id, content, owner, comment_id, is_delete],
    };

    await pool.query(query);
  },

  async deleteThreadComment(id) {
    const query = {
      text: 'UPDATE thread_comment_replies SET is_delete = $1 WHERE id = $2',
      values: [true, id],
    };

    await pool.query(query);
  },

  async findThreadCommentRepliesById(id) {
    const query = {
      text: 'SELECT * FROM thread_comment_replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM thread_comment_replies WHERE 1=1');
  },
};

module.exports = ThreadCommentRepliesTableTestHelper;
