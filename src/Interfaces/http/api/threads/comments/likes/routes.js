const routes = (handler) => ([
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: (request, h) => handler.putThreadCommentLikeHandler(request, h),
    options: {
      auth: 'forumapp_jwt',
    },
  },
]);

module.exports = routes;
