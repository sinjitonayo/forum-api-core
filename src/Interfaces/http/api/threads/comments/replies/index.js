const ThreadCommentReplyHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'threadCommentReplies',
  register: async (server, { container }) => {
    const handler = new ThreadCommentReplyHandler(container);
    server.route(routes(handler));
  },
};
