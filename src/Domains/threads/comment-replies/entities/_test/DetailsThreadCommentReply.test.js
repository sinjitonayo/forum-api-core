const DetailsThreadCommentReply = require('../DetailsThreadCommentReply');

describe('a DetailsThreadCommentReply entities', () => {
  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-_pby2_tmXV6bcvcdev8xk',
      username: 'johndoe',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
    };

    // Action and Assert
    expect(() => new DetailsThreadCommentReply(payload)).toThrow('DETAILS_THREAD_COMMENT_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when item in payload array did not contain needed property', () => {
    // Arrange
    const payload = [
      {
        id: 'comment-_pby2_tmXV6bcvcdev8xk',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
      },
      {
        id: 'comment-yksuCoxM2s4MMrZJO-qVD',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
      },
    ];

    // Action and Assert
    expect(() => new DetailsThreadCommentReply(payload)).toThrow('DETAIL_THREAD_COMMENT_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when item in payload array did not meet data type specification', () => {
    // Arrange
    const payload = [
      {
        id: true,
        content: 'sebuah comment',
        date: '2021-08-08T07:22:33.555Z',
        username: 'johndoe',
      },
      {
        id: 'comment-yksuCoxM2s4MMrZJO-qVD',
        content: '**komentar telah dihapus**',
        date: '2021-08-08T07:26:21.338Z',
        username: 123,
      },
    ];

    // Action and Assert
    expect(() => new DetailsThreadCommentReply(payload)).toThrow('DETAIL_THREAD_COMMENT_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create replies array empty correctly', () => {
    // Arrange
    const payload = [];

    // Action
    const replies = new DetailsThreadCommentReply(payload);

    // Assert
    expect(replies).toEqual(new DetailsThreadCommentReply(payload));
  });

  it('should create replies array not empty correctly', () => {
    // Arrange
    const payload = [
      {
        id: 'reply-BErOXUSefjwWGW1Z10Ihk',
        content: '**balasan telah dihapus**',
        date: new Date(Date.parse('2021-08-08T07:59:48.766Z')),
        username: 'johndoe',
      },
      {
        id: 'reply-xNBtm9HPR-492AeiimpfN',
        content: 'sebuah balasan',
        date: new Date(Date.parse('2021-08-08T07:59:48.766Z')),
        username: 'dicoding',
      },
    ];

    // Action
    const replies = new DetailsThreadCommentReply(payload);

    // Assert
    expect(replies).toEqual(new DetailsThreadCommentReply(payload));
  });
});
