/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('thread_comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    is_liked: {
      type: 'BOOLEAN',
      notNull: true,
    },
  });

  /*
      Menambahkan constraint UNIQUE, kombinasi dari kolom owner dan comment_id
      Guna menghindari duplikasi data antara nilai keduanya.
    */
  pgm.addConstraint(
    'thread_comment_likes',
    'unique_owner_and_comment_id',
    'UNIQUE(owner, comment_id)',
  );

  // foreign key dengan tabel users
  pgm.addConstraint(
    'thread_comment_likes',
    'fk_thread_comment_likes.owner_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE',
  );

  // foreign key dengan tabel threads
  pgm.addConstraint(
    'thread_comment_likes',
    'fk_thread_comment_likes.comment_id_thread_comments.id',
    'FOREIGN KEY(comment_id) REFERENCES thread_comments(id) ON DELETE CASCADE',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('thread_comment_likes');
};
