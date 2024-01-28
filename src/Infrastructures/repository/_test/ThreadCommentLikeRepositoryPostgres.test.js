/* eslint-disable no-plusplus */
/* eslint-disable jest/no-conditional-expect */
const pool = require('../../database/postgres/pool');

const ThreadCommentLikesTableHelper = require('../../../../tests/ThreadCommentLikesTableHelper');
const ThreadCommentRepliesTableTestHelper = require('../../../../tests/ThreadCommentRepliesTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadCommentLikeRepositoryPostgres = require('../ThreadCommentLikeRepositoryPostgres');

describe('ThreadCommentLikeRepositoryPostgres', () => {
  beforeAll(async () => {
    await ThreadCommentLikesTableHelper.cleanTable();
    await ThreadCommentRepliesTableTestHelper.cleanTable();
    await ThreadCommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await ThreadCommentLikesTableHelper.cleanTable();
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

  describe('actionCommentLikes function', () => {
    it('should comment likes action correctly', async () => {
      // Arrange
      const owner = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const likeId = 'like-123';

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

      const payloadComment = {
        owner,
        thread: threadId,
        id: commentId,
        content: 'sebuah comment',
        is_delete: false,
      };

      await UsersTableTestHelper.addUser(payloadUser);
      await ThreadsTableTestHelper.addThread(payloadThread);
      await ThreadCommentsTableTestHelper.addThreadComment(payloadComment);

      const fakeIdGenerator = () => '123'; // stub!
      const threadCommentLikeRepositoryPostgres = new ThreadCommentLikeRepositoryPostgres(pool, fakeIdGenerator);

      // action & Assert
      const getLikeId1 = await threadCommentLikeRepositoryPostgres.actionCommentLikes(owner, commentId);
      expect(getLikeId1).toEqual(likeId);

      const getCommentLikes = await ThreadCommentLikesTableHelper.findThreadCommentLikesById(likeId);
      expect(getCommentLikes[0].is_liked).toBe(true);

      const getLikeId2 = await threadCommentLikeRepositoryPostgres.actionCommentLikes(owner, commentId);
      expect(getLikeId2).toEqual(likeId);

      const getCommentLikes2 = await ThreadCommentLikesTableHelper.findThreadCommentLikesById(likeId);
      expect(getCommentLikes2[0].is_liked).toBe(false);
    });
  });
});
