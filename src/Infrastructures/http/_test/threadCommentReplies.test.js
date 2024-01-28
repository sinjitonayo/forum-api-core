const Jwt = require('@hapi/jwt');
const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ThreadCommentsTableTestHelper = require('../../../../tests/ThreadCommentsTableTestHelper');
const ThreadCommentRepliesTableTestHelper = require('../../../../tests/ThreadCommentRepliesTableTestHelper');
const JwtTokenManager = require('../../security/JwtTokenManager');
const container = require('../../container');
const createServer = require('../createServer');
const ThreadCommentLikesTableHelper = require('../../../../tests/ThreadCommentLikesTableHelper');

describe('threadCommentReplies endpoint', () => {
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

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };
      const requestPayload = {
        content: 'sebuah balasan',
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
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };
      const requestPayload = {};

      await UsersTableTestHelper.addUser({ id: requestToken.id, username: requestToken.username });
      await ThreadsTableTestHelper.addThread({ owner: requestToken.id, threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner: requestToken.id, thread_id: threadId, id: commentId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };
      const requestPayload = {
        content: 123,
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
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and deleted comment', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };
      const requestPayload = {
        content: 'sebuah comment',
      };

      await UsersTableTestHelper.addUser({ id: requestToken.id, username: requestToken.username });
      await ThreadsTableTestHelper.addThread({ owner: requestToken.id, id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner: requestToken.id, thread_id: threadId, id: commentId });
      await ThreadCommentRepliesTableTestHelper.addThreadCommentReply({ owner: requestToken.id, comment_id: commentId, id: replyId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
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
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const owner = 'user-123';
      const requestTokenFailed = {
        id: 'user-231',
        username: 'tester2',
      };
      const requestPayload = {
        content: 'sebuah comment',
      };

      await UsersTableTestHelper.addUser({ id: owner });
      await UsersTableTestHelper.addUser({ id: requestTokenFailed.id, username: requestTokenFailed.username });
      await ThreadsTableTestHelper.addThread({ owner, id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner, thread_id: threadId, id: commentId });
      await ThreadCommentRepliesTableTestHelper.addThreadCommentReply({ owner, comment_id: commentId, id: replyId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestTokenFailed);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak memiliki izin untuk mengakses balasan');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };
      const requestPayload = {
        content: 'sebuah comment',
      };

      await UsersTableTestHelper.addUser({ id: requestToken.id, username: requestToken.username });
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-999/comments/comment-999/replies/reply-999',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
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
      await ThreadsTableTestHelper.addThread({ owner: requestToken.id, id: threadId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/comment-999/replies/reply-999`,
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

    it('should response 404 when reply not found', async () => {
      // Arrange
      const threadId = 'thread-123';
      const commentId = 'comment-123';
      const requestToken = {
        id: 'user-123',
        username: 'tester',
      };
      const requestPayload = {
        content: 'sebuah comment',
      };

      await UsersTableTestHelper.addUser({ id: requestToken.id, username: requestToken.username });
      await ThreadsTableTestHelper.addThread({ owner: requestToken.id, id: threadId });
      await ThreadCommentsTableTestHelper.addThreadComment({ owner: requestToken.id, thread_id: threadId, id: commentId });
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const jwtTokenManager = new JwtTokenManager(Jwt.token);

      // Action
      const token = await jwtTokenManager.createAccessToken(requestToken);
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/reply-999`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('balasan tidak ditemukan');
    });
  });
});
