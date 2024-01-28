const AddThreadCommentReply = require('../../../Domains/threads/comment-replies/entities/AddThreadCommentReply');
const AddedThreadCommentReply = require('../../../Domains/threads/comment-replies/entities/AddedThreadCommentReply');
const AddThreadCommentReplyUseCase = require('../AddThreadCommentReplyUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadCommentRepository = require('../../../Domains/threads/comments/ThreadCommentRepository');
const ThreadCommentReplyRepository = require('../../../Domains/threads/comment-replies/ThreadCommentReplyRepository');

describe('AddThreadCommentReplyUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: 'sebuah balasan',
    };

    const mockAddedThreadCommentReply = new AddedThreadCommentReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockThreadCommentRepository = new ThreadCommentRepository();
    const mockThreadCommentReplyRepository = new ThreadCommentReplyRepository();

    mockThreadRepository.verifyThreadAvailability = jest.fn(() => Promise.resolve(useCasePayload.threadId));

    mockThreadCommentRepository.verifyThreadCommentAvailability = jest.fn(() => Promise.resolve(useCasePayload.commentId));

    mockThreadCommentReplyRepository.addThreadCommentReply = jest
      .fn(() => Promise.resolve(mockAddedThreadCommentReply));

    const getThreadCommentReplyUseCase = new AddThreadCommentReplyUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository,
      threadCommentReplyRepository: mockThreadCommentReplyRepository,
    });

    // Action
    const addThreadCommentReply = await getThreadCommentReplyUseCase.execute(
      useCasePayload,
    );

    // Assert
    expect(addThreadCommentReply).toStrictEqual(mockAddedThreadCommentReply);

    expect(
      mockThreadCommentRepository.verifyThreadCommentAvailability,
    ).toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);
    expect(
      mockThreadCommentReplyRepository.addThreadCommentReply,
    ).toHaveBeenCalledWith(
      useCasePayload.owner,
      useCasePayload.commentId,
      new AddThreadCommentReply({
        content: useCasePayload.content,
      }),
    );
  });
});
