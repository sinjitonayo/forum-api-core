const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedThreadComment = require('../../Domains/threads/comments/entities/AddedThreadComment');
const DetailsThreadComment = require('../../Domains/threads/comments/entities/DetailsThreadComment');
const ThreadCommentRepository = require('../../Domains/threads/comments/ThreadCommentRepository');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class ThreadCommentRepositoryPostgres extends ThreadCommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThreadComment(owner, threadId, addThreadComment) {
    const { content } = addThreadComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO thread_comments (id, content, owner, thread_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, threadId],
    };

    const { rows } = await this._pool.query(query);

    return new AddedThreadComment(rows[0]);
  }

  async getThreadCommentsByThreadId(threadId) {
    const query = {
      text: `
      SELECT
        thread_comments.id,
        users.username,
        thread_comments.date,
        thread_comments.content,
        thread_comments.is_delete,
        (
          SELECT COUNT(*)
          FROM thread_comment_likes
          WHERE thread_comment_likes.comment_id = thread_comments.id AND is_liked = $1
        ) AS like_count
      FROM
        thread_comments
      INNER JOIN
        users ON thread_comments.owner = users.id
      WHERE
        thread_comments.thread_id = $2
      ORDER BY
        thread_comments.date ASC
    `,
      values: [true, threadId],
    };

    const result = await this._pool.query(query);

    return new DetailsThreadComment(result.rows);
  }

  async verifyThreadCommentOwner(owner, id) {
    const query = {
      text: 'SELECT id, owner FROM thread_comments WHERE id = $1 AND is_delete = $2',
      values: [id, false],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('tidak memiliki izin untuk mengakses comment');
    }

    return result.rows[0].id;
  }

  async deleteThreadComment(id) {
    const query = {
      text: 'UPDATE thread_comments SET is_delete = $1 WHERE id = $2 RETURNING id',
      values: [true, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('comment gagal dihapus');
    }

    return result.rows[0].id;
  }

  async verifyThreadCommentAvailability(id, threadId) {
    const query = {
      text: 'SELECT id FROM thread_comments WHERE id = $1 AND thread_id = $2',
      values: [id, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    return result.rows[0].id;
  }
}

module.exports = ThreadCommentRepositoryPostgres;
