/* eslint-disable no-unused-vars */
class ThreadCommentReplyRepository {
  async addThreadCommentReply(owner, threadId, addThreadCommentReply) {
    throw new Error('THREAD_COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getThreadCommentReplyByCommentId(commentId) {
    throw new Error('THREAD_COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyThreadCommentReplyOwner(owner, id) {
    throw new Error('THREAD_COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteThreadCommentReply(id) {
    throw new Error('THREAD_COMMENT_REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ThreadCommentReplyRepository;
