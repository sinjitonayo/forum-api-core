const ThreadCommentLikesRepository = require('../ThreadCommentLikesRepository');

describe('ThreadCommentLikesRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const threadCommentReplyRepository = new ThreadCommentLikesRepository();

    // Action and Assert
    await expect(threadCommentReplyRepository.actionCommentLikes({})).rejects.toThrow('THREAD_COMMENT_LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
