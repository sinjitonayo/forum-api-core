/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
class DetailThreadUseCase {
  constructor({ threadRepository, threadCommentRepository, threadCommentReplyRepository }) {
    this._threadRepository = threadRepository;
    this._threadCommentRepository = threadCommentRepository;
    this._threadCommentReplyRepository = threadCommentReplyRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    const threadDetail = await this._threadRepository.getThreadById(threadId);
    const thread = JSON.parse(JSON.stringify(threadDetail));

    const threadComments = await this._threadCommentRepository.getThreadCommentsByThreadId(threadId);
    thread.comments = JSON.parse(JSON.stringify(threadComments)).comments;

    for (let i = 0; i < thread.comments.length; i++) {
      const threadCommentReplies = await this._threadCommentReplyRepository.getThreadCommentReplyByCommentId(thread.comments[i].id);
      thread.comments[i].replies = JSON.parse(JSON.stringify(threadCommentReplies)).replies;
    }

    return thread;
  }
}

module.exports = DetailThreadUseCase;
