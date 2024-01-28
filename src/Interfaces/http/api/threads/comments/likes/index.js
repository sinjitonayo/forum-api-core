const ThreadCommentLikeHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'threadCommentLikes',
  register: async (server, { container }) => {
    const handler = new ThreadCommentLikeHandler(container);
    server.route(routes(handler));
  },
};
