const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const ThreadCommentReplyRepository = require('../../Domains/threads/comment-replies/ThreadCommentReplyRepository');
const AddedThreadCommentReply = require('../../Domains/threads/comment-replies/entities/AddedThreadCommentReply');
const DetailsThreadCommentReply = require('../../Domains/threads/comment-replies/entities/DetailsThreadCommentReply');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class ThreadCommentReplyRepositoryPostgres extends ThreadCommentReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThreadCommentReply(owner, commentId, addThreadCommentReply) {
    const { content } = addThreadCommentReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO thread_comment_replies (id, content, owner, comment_id) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, owner, commentId],
    };

    const { rows } = await this._pool.query(query);

    return new AddedThreadCommentReply(rows[0]);
  }

  async getThreadCommentReplyByCommentId(commentId) {
    const query = {
      text: 'SELECT thread_comment_replies.id, thread_comment_replies.content, thread_comment_replies.date, users.username, thread_comment_replies.is_delete FROM thread_comment_replies INNER JOIN users ON thread_comment_replies.owner = users.id WHERE thread_comment_replies.comment_id = $1 ORDER BY thread_comment_replies.date ASC',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return new DetailsThreadCommentReply(result.rows);
  }

  async verifyThreadCommentReplyOwner(owner, id) {
    const query = {
      text: 'SELECT id, owner FROM thread_comment_replies WHERE id = $1 AND is_delete = $2',
      values: [id, false],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('balasan tidak ditemukan');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('tidak memiliki izin untuk mengakses balasan');
    }

    return result.rows[0].id;
  }

  async deleteThreadCommentReply(id) {
    const query = {
      text: 'UPDATE thread_comment_replies SET is_delete = $1 WHERE id = $2 RETURNING id',
      values: [true, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('reply gagal dihapus');
    }

    return result.rows[0].id;
  }
}

module.exports = ThreadCommentReplyRepositoryPostgres;
