const ActionThreadCommentLikesUseCase = require('../ActionThreadCommentLikesUseCase');
const ThreadCommentRepository = require('../../../Domains/threads/comments/ThreadCommentRepository');
const ThreadCommentLikesRepository = require('../../../Domains/threads/comment-likes/ThreadCommentLikesRepository');

describe('ActionThreadCommentLikesUseCase', () => {
  it('should orchestrating the comment likes action correctly', async () => {
    // Arrange
    const likeId = 'like-123';
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockThreadCommentRepository = new ThreadCommentRepository();
    const mockThreadCommentLikesRepository = new ThreadCommentLikesRepository();

    mockThreadCommentRepository.verifyThreadCommentAvailability = jest.fn(() => Promise.resolve(useCasePayload.commentId));
    mockThreadCommentLikesRepository.actionCommentLikes = jest
      .fn(() => Promise.resolve(likeId));

    const getActionThreadCommentLikesUseCase = new ActionThreadCommentLikesUseCase({
      threadCommentRepository: mockThreadCommentRepository,
      threadCommentLikesRepository: mockThreadCommentLikesRepository,
    });

    // Action
    const getLikeId = await getActionThreadCommentLikesUseCase.execute(
      useCasePayload,
    );

    // Assert
    expect(getLikeId).toStrictEqual(likeId);

    expect(
      mockThreadCommentRepository.verifyThreadCommentAvailability,
    ).toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(
      mockThreadCommentLikesRepository.actionCommentLikes,
    ).toHaveBeenCalledWith(
      useCasePayload.owner,
      useCasePayload.commentId,
    );
  });
});
