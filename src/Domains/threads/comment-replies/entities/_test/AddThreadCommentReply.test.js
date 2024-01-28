const AddThreadCommentReply = require('../AddThreadCommentReply');

describe('a AddThreadCommentReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new AddThreadCommentReply(payload)).toThrow('ADD_THREAD_COMMENT_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
    };

    // Action and Assert
    expect(() => new AddThreadCommentReply(payload)).toThrow('ADD_THREAD_COMMENT_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addThreadComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'sebuah balasan',
    };

    // Action
    const { content } = new AddThreadCommentReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
  });
});
