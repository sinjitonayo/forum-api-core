const DetailThreadComment = require('../DetailThreadComment');

describe('a DetailThreadComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-q_0uToswNf6i24RDYZJI3',
      username: 'dicoding',
      content: 'sebuah comment',
    };

    // Action and Assert
    expect(() => new DetailThreadComment(payload)).toThrow('DETAIL_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: true,
      username: 'dicoding',
      date: '2021-08-08T07:59:18.982Z',
      content: 'sebuah comment',
      like_count: '1',
    };

    // Action and Assert
    expect(() => new DetailThreadComment(payload)).toThrow('DETAIL_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create add thread comment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-q_0uToswNf6i24RDYZJI3',
      username: 'dicoding',
      date: new Date(Date.parse('2021-08-08T07:59:18.982Z')),
      content: 'sebuah comment',
      like_count: '1',
    };

    // Action
    const {
      id, username, date, content, likeCount,
    } = new DetailThreadComment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
    expect(content).toEqual(payload.content);
    expect(likeCount).toEqual(parseInt(payload.like_count, 10));
  });
});
