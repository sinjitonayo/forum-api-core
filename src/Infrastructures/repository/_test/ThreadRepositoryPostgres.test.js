/* eslint-disable no-await-in-loop */
/* eslint-disable jest/no-conditional-expect */
/* eslint-disable no-plusplus */
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadCommentRepliesTableTestHelper = require('../../../../tests/ThreadCommentRepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadCommentRepositoryPostgres = require('../ThreadCommentRepositoryPostgres');
const ThreadCommentReplyRepositoryPostgres = require('../ThreadCommentReplyRepositoryPostgres');
const DetailThreadComment = require('../../../Domains/threads/comments/entities/DetailThreadComment');
const DetailsThreadComment = require('../../../Domains/threads/comments/entities/DetailsThreadComment');
const DetailsThreadCommentReply = require('../../../Domains/threads/comment-replies/entities/DetailsThreadCommentReply');

describe('ThreadRepositoryPostgres', () => {
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

  describe('addThread function', () => {
    it('should persist add thread and return thread correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner });

      const addThread = new AddThread({
        title: 'sebuah thread',
        body: 'sebuah body thread',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(owner, addThread);

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadsById(threadId);
      expect(thread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const owner = 'user-123';

      await UsersTableTestHelper.addUser({ id: owner });

      const payloadAddThread = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      const addThread = new AddThread(payloadAddThread);
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(owner, addThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: threadId,
        title: payloadAddThread.title,
        owner,
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should return detail thread correctly with empty comment', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';

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

      await UsersTableTestHelper.addUser(payloadUser);
      await ThreadsTableTestHelper.addThread(payloadThread);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const getThread = await threadRepositoryPostgres.getThreadById(threadId);
      const {
        id, title, body, date, username,
      } = getThread;

      // Assert
      expect(id).toEqual(payloadThread.id);
      expect(title).toEqual(payloadThread.title);
      expect(body).toEqual(payloadThread.body);
      expect(date instanceof Date).toBeTruthy();
      expect(username).toEqual(payloadUser.username);
    });

    it('should return detail thread with not empty comment correctly', async () => {
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

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});

      // Action
      const getThread = await threadRepositoryPostgres.getThreadById(threadId);
      getThread.comments = await threadCommentRepositoryPostgres.getThreadCommentsByThreadId(threadId);
      const { comments } = getThread.comments;

      // Assert
      expect(getThread.id).toEqual(payloadThread.id);
      expect(getThread.title).toEqual(payloadThread.title);
      expect(getThread.body).toEqual(payloadThread.body);
      expect(getThread.date instanceof Date).toBeTruthy();
      expect(getThread.username).toEqual(payloadUser.username);
      expect(getThread.comments instanceof DetailsThreadComment).toBeTruthy();

      for (let i = 0; i < comments.length; i++) {
        const actualComment = comments[i];
        const expectedComment = payloadComments[i];

        expect(actualComment instanceof DetailThreadComment).toBeTruthy();

        expect(actualComment.id).toEqual(expectedComment.id);
        expect(actualComment.username).toEqual(payloadUser.username);
        expect(actualComment.date instanceof Date).toBeTruthy();
        if (expectedComment.is_delete) {
          expect(actualComment.content).toEqual('**komentar telah dihapus**');
        } else {
          expect(actualComment.content).toEqual(expectedComment.content);
        }
      }
    });

    it('should return detail thread with not empty comment and reply correctly', async () => {
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

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const threadCommentRepositoryPostgres = new ThreadCommentRepositoryPostgres(pool, {});
      const threadCommentReplyRepositoryPostgres = new ThreadCommentReplyRepositoryPostgres(pool, {});

      // Action
      const getThread = await threadRepositoryPostgres.getThreadById(threadId);
      getThread.comments = await threadCommentRepositoryPostgres.getThreadCommentsByThreadId(threadId);
      const { comments } = getThread.comments;

      // Assert
      expect(getThread.id).toEqual(payloadThread.id);
      expect(getThread.title).toEqual(payloadThread.title);
      expect(getThread.body).toEqual(payloadThread.body);
      expect(getThread.date instanceof Date).toBeTruthy();
      expect(getThread.username).toEqual(payloadUser.username);
      expect(getThread.comments instanceof DetailsThreadComment).toBeTruthy();

      for (let i = 0; i < comments.length; i++) {
        const actualComment = comments[i];
        const expectedComment = payloadComments[i];

        expect(actualComment instanceof DetailThreadComment).toBeTruthy();

        expect(actualComment.id).toEqual(expectedComment.id);
        expect(actualComment.username).toEqual(payloadUser.username);
        expect(actualComment.date instanceof Date).toBeTruthy();
        if (expectedComment.is_delete) {
          expect(actualComment.content).toEqual('**komentar telah dihapus**');
        } else {
          expect(actualComment.content).toEqual(expectedComment.content);
        }

        // action reply
        const threadCommentReplies = await threadCommentReplyRepositoryPostgres.getThreadCommentReplyByCommentId(actualComment.id);
        expect(threadCommentReplies instanceof DetailsThreadCommentReply).toBeTruthy();

        const { replies } = threadCommentReplies;
        for (let j = 0; j < replies.length; j++) {
          const actualReply = replies[j];
          const expectedReply = payloadReplies[j];

          expect(actualReply.id).toEqual(expectedReply.id);
          expect(actualReply.date instanceof Date).toBeTruthy();
          expect(actualReply.username).toEqual(payloadUser.username);
          if (expectedReply.is_delete) {
            expect(actualReply.content).toEqual('**balasan telah dihapus**');
          } else {
            expect(actualReply.content).toEqual(expectedReply.content);
          }
        }
      }
    });
  });

  describe('verifyThreadAvailability function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.getThreadById('thread-123'))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should verify thread correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({
        owner,
        id: threadId,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action
      const getThreadId = await threadRepositoryPostgres.verifyThreadAvailability(threadId);

      // Assert
      expect(getThreadId).toEqual(threadId);
    });
  });
});
