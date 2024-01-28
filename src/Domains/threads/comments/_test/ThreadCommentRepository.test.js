const ThreadCommentRepository = require('../ThreadCommentRepository');

describe('ThreadCommentRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const threadCommentRepository = new ThreadCommentRepository();

    // Action and Assert
    await expect(threadCommentRepository.addThreadComment({})).rejects.toThrow('THREAD_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadCommentRepository.getThreadCommentsByThreadId({})).rejects.toThrow('THREAD_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadCommentRepository.verifyThreadCommentOwner({})).rejects.toThrow('THREAD_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadCommentRepository.deleteThreadComment({})).rejects.toThrow('THREAD_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadCommentRepository.verifyThreadCommentAvailability({})).rejects.toThrow('THREAD_COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
