/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('thread_comments', {
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
    thread_id: {
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
    'thread_comments',
    'fk_thread_comments.owner_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE',
  );

  // foreign key dengan tabel threads
  pgm.addConstraint(
    'thread_comments',
    'fk_thread_comments.thread_id_threads.id',
    'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('thread_comments');
};
