/* eslint-disable camelcase */
/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadCommentsTableTestHelper = {
  async addThreadComment({
    owner = 'user-123', thread_id = 'thread-123', id = 'comment-123', content = 'sebuah comment', is_delete = false,
  }) {
    const query = {
      text: 'INSERT INTO thread_comments (id, content, owner, thread_id, is_delete) VALUES($1, $2, $3, $4, $5)',
      values: [id, content, owner, thread_id, is_delete],
    };

    await pool.query(query);
  },

  async deleteThreadComment(id) {
    const query = {
      text: 'UPDATE thread_comments SET is_delete = $1 WHERE id = $2',
      values: [true, id],
    };

    await pool.query(query);
  },

  async findThreadCommentsById(id) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM thread_comments WHERE 1=1');
  },
};

module.exports = ThreadCommentsTableTestHelper;
