/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('thread_comment_replies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    is_delete: {
      type: 'Boolean',
      notNull: true,
      default: false,
    },
    date: {
      type: 'TIMESTAMP',
      default: pgm.func('current_timestamp'),
      notNull: true,
    },
  });

  // foreign key dengan tabel users
  pgm.addConstraint(
    'thread_comment_replies',
    'fk_thread_comment_replies.owner_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE',
  );

  // foreign key dengan tabel threads
  pgm.addConstraint(
    'thread_comment_replies',
    'fk_thread_comment_replies.comment_id_thread_comments.id',
    'FOREIGN KEY(comment_id) REFERENCES thread_comments(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('thread_comment_replies');
};
