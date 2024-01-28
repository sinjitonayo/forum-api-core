/* eslint-disable jest/no-conditional-expect */
/* eslint-disable no-plusplus */
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AddThreadComment = require('../../../Domains/threads/comments/entities/AddThreadComment');
const AddedThreadComment = require('../../../Domains/threads/comments/entities/AddedThreadComment');
const pool = require('../../database/postgres/pool');
const ThreadCommentRepositoryPostgres = require('../ThreadCommentRepositoryPostgres');
const DetailsThreadComment = require('../../../Domains/threads/comments/entities/DetailsThreadComment');
const DetailThreadComment = require('../../../Domains/threads/comments/entities/DetailThreadComment');

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    await ThreadCommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await ThreadCommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThreadComment function', () => {
    it('should persist add comment and return comment correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ owner, thread_id: threadId });

      const payloadAddComment = {
        content: 'sebuah comment',
      };

      const addThreadComment = new AddThreadComment(payloadAddComment);
      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadCommentRepositoryPostgres.addThreadComment(owner, threadId, addThreadComment);

      // Assert
      const comment = await ThreadCommentsTableTestHelper.findThreadCommentsById(commentId);
      expect(comment).toHaveLength(1);
    });

    it('should return added thread comment correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ owner, thread_id: threadId });

      const payloadAddComment = {
        content: 'sebuah comment',
      };

      const addThreadComment = new AddThreadComment(payloadAddComment);
      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await threadCommentRepositoryPostgres.addThreadComment(owner, threadId, addThreadComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedThreadComment({
        id: commentId,
        content: payloadAddComment.content,
        owner,
      }));
    });
  });

  describe('getThreadCommentsByThreadId function', () => {
    it('should return thread comments correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const commentId2 = 'comment-223';

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

      await UsersTableTestHelper.addUser(payloadUser);
      await ThreadsTableTestHelper.addThread(payloadThread);
      await ThreadCommentsTableTestHelper.addThreadComment(payloadComments[0]);
      await ThreadCommentsTableTestHelper.addThreadComment(payloadComments[1]);

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action
      const getThreadComments = await threadCommentRepositoryPostgres.getThreadCommentsByThreadId(threadId);

      // Assert
      expect(getThreadComments instanceof DetailsThreadComment).toBeTruthy();
      const { comments } = getThreadComments;

      for (let i = 0; i < comments.length; i++) {
        const actualComment = comments[i];
        const expectedComment = payloadComments[i];

        expect(actualComment instanceof DetailThreadComment).toBeTruthy();

        expect(actualComment.id).toEqual(expectedComment.id);
        expect(actualComment.username).toEqual(payloadUser.username);
        expect(actualComment.date instanceof Date).toBeTruthy();
        if (actualComment.thread_id === threadId) {
          expect(actualComment.likeCount).toEqual(payloadComments.length);
        } else {
          expect(actualComment.likeCount).toEqual(0);
        }

        if (expectedComment.is_delete) {
          expect(actualComment.content).toEqual('**komentar telah dihapus**');
        } else {
          expect(actualComment.content).toEqual(expectedComment.content);
        }
      }
    });
  });

  describe('verifyThreadCommentOwner function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {}, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.verifyThreadCommentOwner('user-123', 'comment-123'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when owner not equals', async () => {
      // Arrange
      const owner = 'user-123';
      const ownerWrong = 'user-223';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ owner, thread_id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner, threadId, commentId });

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {}, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.verifyThreadCommentOwner(ownerWrong, commentId))
        .rejects
        .toThrow(AuthorizationError);
    });

    it('should verify correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ owner, thread_id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner, threadId, commentId });

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {}, {});

      // Action
      const getCommentId = await threadCommentRepositoryPostgres.verifyThreadCommentOwner(owner, commentId);

      // Assert
      expect(getCommentId).toEqual(commentId);
    });
  });

  describe('deleteThreadComment function', () => {
    it('should throw InvariantError when comment failed to delete', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const commentIdWrong = 'comment-223';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ owner, thread_id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner, threadId, commentId });

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {}, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.deleteThreadComment(commentIdWrong))
        .rejects
        .toThrow(InvariantError);
    });

    it('should deleted correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ owner, thread_id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner, threadId, commentId });

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {}, {});

      // Action
      const deletedThreadComment = await threadCommentRepositoryPostgres.deleteThreadComment(commentId);
      const threadComments = await ThreadCommentsTableTestHelper.findThreadCommentsById(commentId);

      // Assert
      expect(deletedThreadComment).toEqual(commentId);
      expect(threadComments).toHaveLength(1);
      expect(threadComments[0].is_delete).toEqual(true);
    });
  });

  describe('verifyThreadCommentAvailability function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {}, {});

      // Action & Assert
      await expect(threadCommentRepositoryPostgres.verifyThreadCommentAvailability('user-123', 'comment-123'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should verify correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ owner, thread_id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner, threadId, commentId });

      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {}, {});

      // Action
      const getCommentId = await threadCommentRepositoryPostgres.verifyThreadCommentAvailability(commentId, threadId);

      // Assert
      expect(getCommentId).toEqual(commentId);
    });
  });
});
