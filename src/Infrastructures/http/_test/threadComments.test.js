const Jwt = require('@hapi/jwt');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadCommentRepliesTableTestHelper = require('../../../../tests/ThreadCommentRepliesTableTestHelper');
const JwtTokenManager = require('../../security/JwtTokenManager');
const container = require('../../container');
const createServer = require('../createServer');

describe('threadComments endpoint', () => {
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

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const threadId = 'thread-123';
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };
      const requestPayload = {
        content: 'sebuah comment',
      };

      await UsersTableTestHelper.addUser({ id: requestToken.id, username: requestToken.username });
      await ThreadsTableTestHelper.addThread({ owner: requestToken.id, threadId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const threadId = 'thread-123';
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };
      const requestPayload = {};

      await UsersTableTestHelper.addUser({ id: requestToken.id, username: requestToken.username });
      await ThreadsTableTestHelper.addThread({ owner: requestToken.id, threadId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const threadId = 'thread-123';
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };
      const requestPayload = {
        content: 123,
      };

      await UsersTableTestHelper.addUser({ id: requestToken.id, username: requestToken.username });
      await ThreadsTableTestHelper.addThread({ owner: requestToken.id, threadId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and deleted comment', async () => {
      // Arrange
      const commentId = 'comment-123';
      const threadId = 'thread-123';
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };
      const requestPayload = {
        content: 'sebuah comment',
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
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 when owner not equals', async () => {
      // Arrange
      const commentId = 'comment-123';
      const threadId = 'thread-123';
      const requestFailedToken = {
        id: 'user-223',
        username: 'tester failed',
      };
      const requestPayload = {
        content: 'sebuah comment',
      };

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: requestFailedToken.id, username: requestFailedToken.username });
      await ThreadsTableTestHelper.addThread({ owner: 'user-123', threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner: 'user-123', thread_id: threadId, id: commentId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestFailedToken);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak memiliki izin untuk mengakses comment');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const requestFailedToken = {
        id: 'user-223',
        username: 'tester failed',
      };
      const requestPayload = {
        content: 'sebuah comment',
      };

      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await UsersTableTestHelper.addUser({ id: requestFailedToken.id, username: requestFailedToken.username });
      await ThreadsTableTestHelper.addThread({ owner: 'user-123', threadId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestFailedToken);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-231`,
        payload: requestPayload,
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
