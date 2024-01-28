/* eslint-disable no-plusplus */
/* eslint-disable jest/no-conditional-expect */
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const DetailsThreadComment = require('../../../Domains/threads/comments/entities/DetailsThreadComment');
const DetailsThreadCommentReply = require('../../../Domains/threads/comment-replies/entities/DetailsThreadCommentReply');

const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadCommentRepository = require('../../../Domains/threads/comments/ThreadCommentRepository');
const ThreadCommentReplyRepository = require('../../../Domains/threads/comment-replies/ThreadCommentReplyRepository');
const DetailThreadUseCase = require('../DetailThreadUseCase');

describe('DetailThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const commentId = 'comment-123';
    const commentId2 = 'comment-223';
    const replyId = 'reply-123';
    const replyId2 = 'reply-223';
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const mockDetailThread = new DetailThread({
      id: useCasePayload.threadId,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: new Date(Date.parse('2021-08-08T07:19:09.775Z')),
      username: 'dicoding',
    });
    const mockDetailsThreadComment = new DetailsThreadComment([
      {
        id: commentId,
        username: 'johndoe',
        date: new Date(Date.parse('2021-08-08T07:22:33.555Z')),
        content: 'sebuah comment',
        is_delete: false,
        like_count: '0',
      },
      {
        id: commentId2,
        username: 'johndoe2',
        date: new Date(Date.parse('2021-08-08T07:22:33.555Z')),
        content: 'sebuah comment',
        is_delete: true,
        like_count: '1',
      },
    ]);
    const mockDetailsThreadCommentReply = new DetailsThreadCommentReply([
      {
        id: replyId,
        content: 'sebuah content',
        date: new Date(Date.parse('2021-08-08T07:22:33.555Z')),
        username: 'johndoe',
        is_delete: false,
      },
      {
        id: replyId2,
        content: 'sebuah content',
        date: new Date(Date.parse('2021-08-08T07:22:33.555Z')),
        username: 'johndoe2',
        is_delete: true,
      },
    ]);

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockThreadCommentRepository = new ThreadCommentRepository();
    const mockThreadCommentReplyRepository = new ThreadCommentReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockDetailThread));
    mockThreadCommentRepository.getThreadCommentsByThreadId = jest.fn(() => Promise.resolve(mockDetailsThreadComment));
    mockThreadCommentReplyRepository.getThreadCommentReplyByCommentId = jest.fn(() => Promise.resolve(mockDetailsThreadCommentReply));

    /** creating use case instance */
    const getDetailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository,
      threadCommentReplyRepository: mockThreadCommentReplyRepository,
    });

    // Action
    const getDetailThread = await getDetailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(getDetailThread.id).toEqual(mockDetailThread.id);
    expect(getDetailThread.title).toEqual(mockDetailThread.title);
    expect(getDetailThread.body).toEqual(mockDetailThread.body);
    expect(new Date(Date.parse(getDetailThread.date))).toEqual(mockDetailThread.date);
    expect(getDetailThread.username).toEqual(mockDetailThread.username);

    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(useCasePayload.threadId);

    for (let i = 0; i < getDetailThread.comments.length; i++) {
      expect(mockThreadCommentRepository.getThreadCommentsByThreadId).toHaveBeenCalledWith(useCasePayload.threadId);

      const actualComment = getDetailThread.comments[i];
      const expectedComment = mockDetailsThreadComment.comments[i];

      expect(actualComment.id).toEqual(expectedComment.id);
      expect(actualComment.username).toEqual(expectedComment.username);
      expect(actualComment.likeCount).toEqual(parseInt(expectedComment.likeCount, 10));
      expect(new Date(Date.parse(actualComment.date))).toEqual(expectedComment.date);
      if (actualComment.is_delete) {
        expect(actualComment.content).toEqual('**komentar telah dihapus**');
      } else {
        expect(actualComment.content).toEqual(expectedComment.content);
      }

      for (let j = 0; j < actualComment.replies.length; j++) {
        expect(mockThreadCommentReplyRepository.getThreadCommentReplyByCommentId).toHaveBeenCalledWith(actualComment.id);

        const actualReply = actualComment.replies[i];
        const expectedReply = mockDetailsThreadCommentReply.replies[i];

        expect(actualReply.id).toEqual(expectedReply.id);
        expect(new Date(Date.parse(actualReply.date))).toEqual(expectedReply.date);
        expect(actualReply.username).toEqual(expectedReply.username);
        if (actualReply.is_delete) {
          expect(actualReply.content).toEqual('**balasan telah dihapus**');
        } else {
          expect(actualReply.content).toEqual(expectedReply.content);
        }
      }
    }
  });
});
