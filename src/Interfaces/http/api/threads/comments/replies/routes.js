const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: (request, h) => handler.postThreadCommentReplyHandler(request, h),
    options: {
      auth: 'forumapp_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: (request, h) => handler.deleteThreadCommentReplyHandler(request, h),
    options: {
      auth: 'forumapp_jwt',
    },
  },
]);

module.exports = routes;
