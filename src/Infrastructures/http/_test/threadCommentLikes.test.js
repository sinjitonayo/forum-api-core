const Jwt = require('@hapi/jwt');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadCommentRepliesTableTestHelper = require('../../../../tests/ThreadCommentRepliesTableTestHelper');
const ThreadCommentLikesTableHelper = require('../../../../tests/ThreadCommentLikesTableHelper');
const JwtTokenManager = require('../../security/JwtTokenManager');
const container = require('../../container');
const createServer = require('../createServer');

describe('threadCommentLikes endpoint', () => {
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

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };

      await UsersTableTestHelper.addUser({ id: requestToken.id, username: requestToken.username });
      await ThreadsTableTestHelper.addThread({ owner: requestToken.id, threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner: requestToken.id, thread_id: threadId, id: commentId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when comment not found by threadId', async () => {
      // Arrange
      const threadId = 'thread-123';
      const threadIdWrong = 'thread-223';
      const commentId = 'comment-123';
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };

      await UsersTableTestHelper.addUser({ id: requestToken.id, username: requestToken.username });
      await ThreadsTableTestHelper.addThread({ owner: requestToken.id, threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner: requestToken.id, thread_id: threadId, id: commentId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadIdWrong}/comments/${commentId}/likes`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 404 when comment not found by commentId', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const commentIdWrong = 'comment-223';
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };

      await UsersTableTestHelper.addUser({ id: requestToken.id, username: requestToken.username });
      await ThreadsTableTestHelper.addThread({ owner: requestToken.id, threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner: requestToken.id, thread_id: threadId, id: commentId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentIdWrong}/likes`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });
  });
});
