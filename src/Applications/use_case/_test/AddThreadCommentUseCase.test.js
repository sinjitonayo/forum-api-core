const AddThreadComment = require('../../../Domains/threads/comments/entities/AddThreadComment');
const AddedThreadComment = require('../../../Domains/threads/comments/entities/AddedThreadComment');
const ThreadCommentRepository = require('../../../Domains/threads/comments/ThreadCommentRepository');
const AddThreadCommentUseCase = require('../AddThreadCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddThreadCommentUseCase', () => {
  it('should orchestrating the add thread comment action correctly', async () => {
    // Arrange
    const commentId = 'comment-123';
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      content: 'sebuah comment',
    };

    const mockAddedThreadComment = new AddedThreadComment({
      id: commentId,
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockThreadCommentRepository = new ThreadCommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve(useCasePayload.threadId));
    mockThreadCommentRepository.addThreadComment = jest.fn(() => Promise.resolve(mockAddedThreadComment));

    /** creating use case instance */
    const getThreadCommentUseCase = new AddThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository,
    });

    // Action
    const addedThreadComment = await getThreadCommentUseCase.execute(
      useCasePayload,
    );

    // Assert
    expect(addedThreadComment).toStrictEqual(mockAddedThreadComment);

    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockThreadCommentRepository.addThreadComment).toHaveBeenCalledWith(
      useCasePayload.owner,
      useCasePayload.threadId,
      new AddThreadComment({
        content: useCasePayload.content,
      }),
    );
  });
});
