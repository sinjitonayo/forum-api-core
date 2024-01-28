const ThreadCommentHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'threadComments',
  register: async (server, { container }) => {
    const handler = new ThreadCommentHandler(container);
    server.route(routes(handler));
  },
};
