const ThreadCommentLikesRepository = require('../../Domains/threads/comment-likes/ThreadCommentLikesRepository');

class ThreadCommentLikeRepositoryPostgres extends ThreadCommentLikesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async actionCommentLikes(owner, commentId) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO thread_comment_likes (id, owner, comment_id, is_liked) VALUES ($1, $2, $3, $4) ON CONFLICT (owner, comment_id) DO UPDATE SET is_liked = CASE WHEN excluded.is_liked THEN false ELSE true END',
      values: [id, owner, commentId, true],
    };

    await this._pool.query(query);
    return id;
  }
}

module.exports = ThreadCommentLikeRepositoryPostgres;
