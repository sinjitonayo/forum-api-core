const ThreadCommentRepository = require('../../../Domains/threads/comments/ThreadCommentRepository');
const DeleteThreadCommentUseCase = require('../DeleteThreadCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteThreadCommentUseCase', () => {
  it('should orchestrating the delete thread comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockThreadCommentRepository = new ThreadCommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve(useCasePayload.threadId));
    mockThreadCommentRepository.verifyThreadCommentOwner = jest.fn(() => Promise.resolve(useCasePayload.commentId));
    mockThreadCommentRepository.deleteThreadComment = jest.fn(() => Promise.resolve(useCasePayload.commentId));

    /** creating use case instance */
    const deleteThreadCommentUseCase = new DeleteThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository,
    });

    // Action
    const deletedThreadComment = await deleteThreadCommentUseCase.execute(useCasePayload);

    // Assert
    expect(deletedThreadComment).toStrictEqual(useCasePayload.commentId);

    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(useCasePayload.threadId);
    expect(mockThreadCommentRepository.verifyThreadCommentOwner).toHaveBeenCalledWith(
      useCasePayload.owner,
      useCasePayload.commentId,
    );
    expect(mockThreadCommentRepository.deleteThreadComment).toHaveBeenCalledWith(
      useCasePayload.commentId,
    );
  });
});
