const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    const threadId = 'thread-123';
    const useCasePayload = {
      owner: 'user-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
    };

    const mockAddedThread = new AddedThread({
      id: threadId,
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn(() => Promise.resolve(mockAddedThread));

    /** creating use case instance */
    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(mockAddedThread);

    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(
      useCasePayload.owner,
      new AddThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
      }),
    );
  });
});
