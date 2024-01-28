const Jwt = require('@hapi/jwt');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const JwtTokenManager = require('../../security/JwtTokenManager');
const container = require('../../container');
const createServer = require('../createServer');

describe('threads endpoint', () => {
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

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };
      const requestPayload = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      await UsersTableTestHelper.addUser({
        id: requestToken.id,
        username: requestToken.username,
      });

      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };
      const requestPayload = {
        title: 'sebuah thread',
      };

      await UsersTableTestHelper.addUser({ id: requestToken.id, username: requestToken.username });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };
      const requestPayload = {
        title: 123,
        body: 'sebuah body thread',
      };

      await UsersTableTestHelper.addUser({ id: requestToken.id, username: requestToken.username });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return thread', async () => {
      // Arrange
      const userId = 'user-123';
      const threadId = 'thread-123';

      await UsersTableTestHelper.addUser({ id: userId });
      await ThreadsTableTestHelper.addThread({ owner: userId, id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner: userId, thread_id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner: userId, thread_id: threadId, id: 'comment-111' });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner: userId, thread_id: threadId, id: 'comment-222' });
      await ThreadCommentsTableTestHelper.deleteThreadComment(threadId);

      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(Array.isArray(responseJson.data.thread.comments)).toBeTruthy();
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-404',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
