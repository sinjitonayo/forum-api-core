/* istanbul ignore file */

const { createContainer } = require('instances-container');

// external agency
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');
const pool = require('./database/postgres/pool');

// service (repository, helper, manager, etc)
const UserRepository = require('../Domains/users/UserRepository');
const PasswordHash = require('../Applications/security/PasswordHash');
const UserRepositoryPostgres = require('./repository/UserRepositoryPostgres');
const BcryptPasswordHash = require('./security/BcryptPasswordHash');

const ThreadRepository = require('../Domains/threads/ThreadRepository');
const ThreadRepositoryPostgres = require('./repository/ThreadRepositoryPostgres');

const ThreadCommentRepository = require('../Domains/threads/comments/ThreadCommentRepository');
const ThreadCommentRepositoryPostgres = require('./repository/ThreadCommentRepositoryPostgres');

const ThreadCommentReplyRepository = require('../Domains/threads/comment-replies/ThreadCommentReplyRepository');
const ThreadCommentReplyRepositoryPostgres = require('./repository/ThreadCommentReplyRepositoryPostgres');

const ThreadCommentLikesRepository = require('../Domains/threads/comment-likes/ThreadCommentLikesRepository');
const ThreadCommentLikeRepositoryPostgres = require('./repository/ThreadCommentLikeRepositoryPostgres');

// use case
const AddUserUseCase = require('../Applications/use_case/AddUserUseCase');
const AuthenticationTokenManager = require('../Applications/security/AuthenticationTokenManager');
const JwtTokenManager = require('./security/JwtTokenManager');
const LoginUserUseCase = require('../Applications/use_case/LoginUserUseCase');
const AuthenticationRepository = require('../Domains/authentications/AuthenticationRepository');
const AuthenticationRepositoryPostgres = require('./repository/AuthenticationRepositoryPostgres');
const LogoutUserUseCase = require('../Applications/use_case/LogoutUserUseCase');
const RefreshAuthenticationUseCase = require('../Applications/use_case/RefreshAuthenticationUseCase');

const AddThreadUseCase = require('../Applications/use_case/AddThreadUseCase');
const DetailThreadUseCase = require('../Applications/use_case/DetailThreadUseCase');

const AddThreadCommentUseCase = require('../Applications/use_case/AddThreadCommentUseCase');
const DeleteThreadCommentUseCase = require('../Applications/use_case/DeleteThreadCommentUseCase');

const AddThreadCommentReplyUseCase = require('../Applications/use_case/AddThreadCommentReplyUseCase');
const DeleteThreadCommentReplyUseCase = require('../Applications/use_case/DeleteThreadCommentReplyUseCase');

const ActionThreadCommentLikesUseCase = require('../Applications/use_case/ActionThreadCommentLikesUseCase');

// creating container
const container = createContainer();

// registering services and repository
container.register([
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: AuthenticationRepository.name,
    Class: AuthenticationRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
      ],
    },
  },
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [
        {
          concrete: bcrypt,
        },
      ],
    },
  },
  {
    key: AuthenticationTokenManager.name,
    Class: JwtTokenManager,
    parameter: {
      dependencies: [
        {
          concrete: Jwt.token,
        },
      ],
    },
  },
  {
    key: ThreadRepository.name,
    Class: ThreadRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: ThreadCommentRepository.name,
    Class: ThreadCommentRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: ThreadCommentReplyRepository.name,
    Class: ThreadCommentReplyRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: ThreadCommentLikesRepository.name,
    Class: ThreadCommentLikeRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
]);

// registering use cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: UserRepository.name,
        },
        {
          name: 'passwordHash',
          internal: PasswordHash.name,
        },
      ],
    },
  },
  {
    key: LoginUserUseCase.name,
    Class: LoginUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: UserRepository.name,
        },
        {
          name: 'authenticationRepository',
          internal: AuthenticationRepository.name,
        },
        {
          name: 'authenticationTokenManager',
          internal: AuthenticationTokenManager.name,
        },
        {
          name: 'passwordHash',
          internal: PasswordHash.name,
        },
      ],
    },
  },
  {
    key: LogoutUserUseCase.name,
    Class: LogoutUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'authenticationRepository',
          internal: AuthenticationRepository.name,
        },
      ],
    },
  },
  {
    key: RefreshAuthenticationUseCase.name,
    Class: RefreshAuthenticationUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'authenticationRepository',
          internal: AuthenticationRepository.name,
        },
        {
          name: 'authenticationTokenManager',
          internal: AuthenticationTokenManager.name,
        },
      ],
    },
  },
  {
    key: AddThreadUseCase.name,
    Class: AddThreadUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name,
        },
      ],
    },
  },
  {
    key: DetailThreadUseCase.name,
    Class: DetailThreadUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name,
        },
        {
          name: 'threadCommentRepository',
          internal: ThreadCommentRepository.name,
        },
        {
          name: 'threadCommentReplyRepository',
          internal: ThreadCommentReplyRepository.name,
        },
      ],
    },
  },
  {
    key: AddThreadCommentUseCase.name,
    Class: AddThreadCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name,
        },
        {
          name: 'threadCommentRepository',
          internal: ThreadCommentRepository.name,
        },
      ],
    },
  },
  {
    key: DeleteThreadCommentUseCase.name,
    Class: DeleteThreadCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name,
        },
        {
          name: 'threadCommentRepository',
          internal: ThreadCommentRepository.name,
        },
      ],
    },
  },
  {
    key: AddThreadCommentReplyUseCase.name,
    Class: AddThreadCommentReplyUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name,
        },
        {
          name: 'threadCommentRepository',
          internal: ThreadCommentRepository.name,
        },
        {
          name: 'threadCommentReplyRepository',
          internal: ThreadCommentReplyRepository.name,
        },
      ],
    },
  },
  {
    key: DeleteThreadCommentReplyUseCase.name,
    Class: DeleteThreadCommentReplyUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name,
        },
        {
          name: 'threadCommentRepository',
          internal: ThreadCommentRepository.name,
        },
        {
          name: 'threadCommentReplyRepository',
          internal: ThreadCommentReplyRepository.name,
        },
      ],
    },
  },
  {
    key: ActionThreadCommentLikesUseCase.name,
    Class: ActionThreadCommentLikesUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadCommentRepository',
          internal: ThreadCommentRepository.name,
        },
        {
          name: 'threadCommentLikesRepository',
          internal: ThreadCommentLikesRepository.name,
        },
      ],
    },
  },
]);

module.exports = container;
