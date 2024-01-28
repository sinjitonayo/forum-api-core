const AddedThreadCommentReply = require('../AddedThreadCommentReply');

describe('a AddedThreadCommentReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'sebuah comment',
    };

    // Action and Assert
    expect(() => new AddedThreadCommentReply(payload)).toThrow('ADDED_THREAD_COMMENT_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: true,
      content: 123,
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new AddedThreadCommentReply(payload)).toThrow('ADDED_THREAD_COMMENT_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addThreadComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      owner: 'user-123',
    };

    // Action
    const { id, content, owner } = new AddedThreadCommentReply(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
