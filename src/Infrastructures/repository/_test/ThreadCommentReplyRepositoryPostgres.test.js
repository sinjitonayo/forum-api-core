/* eslint-disable no-plusplus */
/* eslint-disable jest/no-conditional-expect */
const ThreadCommentRepliesTableTestHelper = require('../../../../tests/ThreadCommentRepliesTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddThreadCommentReplies = require('../../../Domains/threads/comment-replies/entities/AddThreadCommentReply');
const AddedThreadCommentReply = require('../../../Domains/threads/comment-replies/entities/AddedThreadCommentReply');
const pool = require('../../database/postgres/pool');
const ThreadCommentReplyRepositoryPostgres = require('../ThreadCommentReplyRepositoryPostgres');
const DetailsThreadCommentReply = require('../../../Domains/threads/comment-replies/entities/DetailsThreadCommentReply');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('ThreadCommentReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    await ThreadCommentRepliesTableTestHelper.cleanTable();
    await ThreadCommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await ThreadCommentRepliesTableTestHelper.cleanTable();
    await ThreadCommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  // Mock the database pool and dependencies
  jest.mock('pg');

  describe('addThreadCommentReply function', () => {
    it('should persist reply and return reply correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ owner, thread_id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner, thread_id: threadId, id: commentId });

      const addThreadCommentReply = new AddThreadCommentReplies({
        content: 'sebuah balasan',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentReplyRepositoryPostgres = new ThreadCommentReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadCommentReplyRepositoryPostgres.addThreadCommentReply(owner, commentId, addThreadCommentReply);

      // Assert
      const comment = await ThreadCommentRepliesTableTestHelper.findThreadCommentRepliesById('reply-123');
      expect(comment).toHaveLength(1);
    });

    it('should return reply correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ owner, thread_id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner, thread_id: threadId, id: commentId });

      const payloadReply = {
        content: 'sebuah balasan',
      };

      const addThreadCommentReply = new AddThreadCommentReplies(payloadReply);
      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentReplyRepositoryPostgres = new ThreadCommentReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await threadCommentReplyRepositoryPostgres.addThreadCommentReply(owner, commentId, addThreadCommentReply);

      // Assert
      expect(addedComment).toStrictEqual(new AddedThreadCommentReply({
        id: replyId,
        content: payloadReply.content,
        owner,
      }));
    });
  });

  describe('getThreadCommentReplyByCommentId function', () => {
    it('should return comment replies correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const commentId2 = 'comment-223';
      const replyId = 'reply-123';
      const replyId2 = 'reply-223';

      const payloadUser = {
        id: owner,
        username: 'testing',
      };

      const payloadThread = {
        owner,
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      const payloadComments = [
        {
          owner,
          thread: threadId,
          id: commentId,
          content: 'sebuah comment',
          is_delete: false,
        },
        {
          owner,
          thread: threadId,
          id: commentId2,
          content: 'sebuah comment',
          is_delete: true,
        },
      ];

      const payloadReplies = [
        {
          owner,
          comment_id: commentId,
          id: replyId,
          content: 'sebuah balasan',
          is_delete: false,
        },
        {
          owner,
          comment_id: commentId,
          id: replyId2,
          content: 'sebuah balasan',
          is_delete: true,
        },
      ];

      await UsersTableTestHelper.addUser(payloadUser);
      await ThreadsTableTestHelper.addThread(payloadThread);
      await ThreadCommentsTableTestHelper.addThreadComment(payloadComments[0]);
      await ThreadCommentsTableTestHelper.addThreadComment(payloadComments[1]);
      await ThreadCommentRepliesTableTestHelper.addThreadCommentReply(payloadReplies[0]);
      await ThreadCommentRepliesTableTestHelper.addThreadCommentReply(payloadReplies[1]);

      const threadCommentReplyRepositoryPostgres = new ThreadCommentReplyRepositoryPostgres(pool, {});

      // action reply
      const threadCommentReplies = await threadCommentReplyRepositoryPostgres.getThreadCommentReplyByCommentId(commentId);
      expect(threadCommentReplies instanceof DetailsThreadCommentReply).toBeTruthy();

      const { replies } = threadCommentReplies;
      for (let i = 0; i < replies.length; i++) {
        const actualReply = replies[i];
        const expectedReply = payloadReplies[i];

        expect(actualReply.id).toEqual(expectedReply.id);
        expect(actualReply.date instanceof Date).toBeTruthy();
        expect(actualReply.username).toEqual(payloadUser.username);
        if (expectedReply.is_delete) {
          expect(actualReply.content).toEqual('**balasan telah dihapus**');
        } else {
          expect(actualReply.content).toEqual(expectedReply.content);
        }
      }
    });
  });

  describe('verifyThreadCommentReplyOwner function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const threadCommentReplyRepositoryPostgres = new ThreadCommentReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentReplyRepositoryPostgres.verifyThreadCommentReplyOwner('user-123', 'reply-123'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when owner not equals', async () => {
      // Arrange
      const owner = 'user-123';
      const ownerWrong = 'user-222';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ owner, thread_id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner, threadId, commentId });
      await ThreadCommentRepliesTableTestHelper.addThreadCommentReply({ owner, comment_id: commentId, id: replyId });

      const threadCommentReplyRepositoryPostgres = new ThreadCommentReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentReplyRepositoryPostgres.verifyThreadCommentReplyOwner(ownerWrong, replyId))
        .rejects
        .toThrow(AuthorizationError);
    });

    it('should verify correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ owner, thread_id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner, threadId, commentId });
      await ThreadCommentRepliesTableTestHelper.addThreadCommentReply({ owner, comment_id: commentId, id: replyId });

      const threadCommentReplyRepositoryPostgres = new ThreadCommentReplyRepositoryPostgres(pool, {});

      // Action
      const threadCommentReplyId = await threadCommentReplyRepositoryPostgres.verifyThreadCommentReplyOwner(owner, replyId);

      // Assert
      expect(threadCommentReplyId).toEqual(replyId);
    });
  });

  describe('deleteThreadCommentReply function', () => {
    it('should throw InvariantError when reply failed to delete', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const replyIdWrong = 'reply-223';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ owner, thread_id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner, threadId, commentId });
      await ThreadCommentRepliesTableTestHelper.addThreadCommentReply({ owner, comment_id: commentId, id: replyId });

      const threadCommentReplyRepositoryPostgres = new ThreadCommentReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadCommentReplyRepositoryPostgres.deleteThreadCommentReply(replyIdWrong))
        .rejects
        .toThrow(InvariantError);
    });

    it('should deleted correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ owner, thread_id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner, threadId, commentId });
      await ThreadCommentRepliesTableTestHelper.addThreadCommentReply({ owner, comment_id: commentId, id: replyId });

      const threadCommentReplyRepositoryPostgres = new ThreadCommentReplyRepositoryPostgres(pool, {});

      // Action
      const deletedThreadCommentReply = await threadCommentReplyRepositoryPostgres.deleteThreadCommentReply(replyId);
      const threadCommentReplies = await ThreadCommentRepliesTableTestHelper.findThreadCommentRepliesById(replyId);

      // Assert
      expect(deletedThreadCommentReply).toEqual(replyId);
      expect(threadCommentReplies).toHaveLength(1);
      expect(threadCommentReplies[0].is_delete).toEqual(true);
    });
  });
});
