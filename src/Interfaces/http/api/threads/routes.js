const routes = (handler) => ([
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: (request, h) => handler.getThreadHandler(request, h),
  },
  {
    method: 'POST',
    path: '/threads',
    handler: (request, h) => handler.postThreadHandler(request, h),
    options: {
      auth: 'forumapp_jwt',
    },
  },
]);

module.exports = routes;
