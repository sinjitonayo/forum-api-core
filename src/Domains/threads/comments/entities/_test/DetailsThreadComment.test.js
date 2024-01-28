const DetailsThreadComment = require('../DetailsThreadComment');

describe('a DetailsThreadComment entities', () => {
  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-_pby2_tmXV6bcvcdev8xk',
      username: 'johndoe',
      date: '2021-08-08T07:22:33.555Z',
      content: 'sebuah comment',
    };

    // Action and Assert
    expect(() => new DetailsThreadComment(payload)).toThrow('DETAILS_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
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
    expect(() => new DetailsThreadComment(payload)).toThrow('DETAIL_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when item in payload array did not meet data type specification', () => {
    // Arrange
    const payload = [
      {
        id: true,
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        like_count: '0',
      },
      {
        id: 'comment-yksuCoxM2s4MMrZJO-qVD',
        username: 123,
        date: '2021-08-08T07:26:21.338Z',
        content: '**komentar telah dihapus**',
        like_count: '1',
      },
    ];

    // Action and Assert
    expect(() => new DetailsThreadComment(payload)).toThrow('DETAIL_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should return comments array empty correctly', () => {
    // Arrange
    const payload = [];

    // Action
    const comments = new DetailsThreadComment(payload);

    // Assert
    expect(comments).toEqual(new DetailsThreadComment(payload));
  });

  it('should return comments array not empty correctly', () => {
    // Arrange
    const payload = [
      {
        id: 'comment-_pby2_tmXV6bcvcdev8xk',
        username: 'johndoe',
        date: new Date(Date.parse('2021-08-08T07:22:33.555Z')),
        content: 'sebuah comment',
        is_delete: true,
        like_count: '0',
      },
      {
        id: 'comment-yksuCoxM2s4MMrZJO-qVD',
        username: 'dicoding',
        date: new Date(Date.parse('2021-08-08T07:26:21.338Z')),
        content: 'sebuah comment',
        is_delete: false,
        like_count: '1',
      },
    ];

    // Action
    const comments = new DetailsThreadComment(payload);

    // Assert
    expect(comments).toEqual(new DetailsThreadComment(payload));
  });
});
