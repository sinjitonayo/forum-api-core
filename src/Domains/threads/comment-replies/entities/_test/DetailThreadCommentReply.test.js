const DetailThreadCommentReply = require('../DetailThreadCommentReply');

describe('a DetailThreadCommentReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-BErOXUSefjwWGW1Z10Ihk',
      content: 'sebuah balasan',
      username: 'johndoe',
    };

    // Action and Assert
    expect(() => new DetailThreadCommentReply(payload)).toThrow('DETAIL_THREAD_COMMENT_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: true,
      content: 'sebuah balasan',
      date: '2021-08-08T07:59:48.766Z',
      username: 'johndoe',
    };

    // Action and Assert
    expect(() => new DetailThreadCommentReply(payload)).toThrow('DETAIL_THREAD_COMMENT_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detail reply object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-BErOXUSefjwWGW1Z10Ihk',
      content: 'sebuah balasan',
      date: new Date(Date.parse('2021-08-08T07:59:48.766Z')),
      username: 'johndoe',
    };

    // Action
    const {
      id, content, date, username,
    } = new DetailThreadCommentReply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(username).toEqual(payload.username);
    expect(date).toEqual(payload.date);
  });
});
