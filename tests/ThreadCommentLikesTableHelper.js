/* eslint-disable camelcase */
/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadCommentLikesTableTestHelper = {
  async addThreadCommentLikes({
    owner = 'user-123',
    comment_id = 'comment-123',
    is_liked = false,
    id = 'like-123',
  }) {
    const query = {
      text: 'INSERT INTO thread_comment_likes (id, owner, comment_id, is_liked) VALUES($1, $2, $3, $4)',
      values: [id, owner, comment_id, is_liked],
    };

    await pool.query(query);
  },

  async deleteThreadComment(id) {
    const query = {
      text: 'DELETE FROM thread_comment_likes WHERE id = $1',
      values: [id],
    };

    await pool.query(query);
  },

  async findThreadCommentLikesById(id) {
    const query = {
      text: 'SELECT * FROM thread_comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM thread_comment_likes WHERE 1=1');
  },
};

module.exports = ThreadCommentLikesTableTestHelper;
