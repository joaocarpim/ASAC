/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getProgress = /* GraphQL */ `
  query GetProgress($id: ID!) {
    getProgress(id: $id) {
      id
      userId
      user {
        id
        name
        email
        role
        coins
        points
        modulesCompleted
        currentModule
        precision
        correctAnswers
        wrongAnswers
        timeSpent
        createdAt
        updatedAt
        __typename
      }
      moduleId
      module {
        id
        title
        description
        moduleNumber
        createdAt
        updatedAt
        __typename
      }
      moduleNumber
      accuracy
      correctAnswers
      wrongAnswers
      timeSpent
      completed
      completedAt
      errorDetails
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listProgresses = /* GraphQL */ `
  query ListProgresses(
    $filter: ModelProgressFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProgresses(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        moduleId
        moduleNumber
        accuracy
        correctAnswers
        wrongAnswers
        timeSpent
        completed
        completedAt
        errorDetails
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const progressesByUserId = /* GraphQL */ `
  query ProgressesByUserId(
    $userId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelProgressFilterInput
    $limit: Int
    $nextToken: String
  ) {
    progressesByUserId(
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        moduleId
        moduleNumber
        accuracy
        correctAnswers
        wrongAnswers
        timeSpent
        completed
        completedAt
        errorDetails
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const progressesByModuleId = /* GraphQL */ `
  query ProgressesByModuleId(
    $moduleId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelProgressFilterInput
    $limit: Int
    $nextToken: String
  ) {
    progressesByModuleId(
      moduleId: $moduleId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userId
        moduleId
        moduleNumber
        accuracy
        correctAnswers
        wrongAnswers
        timeSpent
        completed
        completedAt
        errorDetails
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      name
      email
      role
      coins
      points
      modulesCompleted
      currentModule
      precision
      correctAnswers
      wrongAnswers
      timeSpent
      achievements {
        nextToken
        __typename
      }
      progress {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $id: ID
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listUsers(
      id: $id
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        id
        name
        email
        role
        coins
        points
        modulesCompleted
        currentModule
        precision
        correctAnswers
        wrongAnswers
        timeSpent
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const usersByEmail = /* GraphQL */ `
  query UsersByEmail(
    $email: String!
    $sortDirection: ModelSortDirection
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    usersByEmail(
      email: $email
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        name
        email
        role
        coins
        points
        modulesCompleted
        currentModule
        precision
        correctAnswers
        wrongAnswers
        timeSpent
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAchievement = /* GraphQL */ `
  query GetAchievement($id: ID!) {
    getAchievement(id: $id) {
      id
      title
      description
      moduleNumber
      userId
      user {
        id
        name
        email
        role
        coins
        points
        modulesCompleted
        currentModule
        precision
        correctAnswers
        wrongAnswers
        timeSpent
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listAchievements = /* GraphQL */ `
  query ListAchievements(
    $filter: ModelAchievementFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAchievements(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        moduleNumber
        userId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const achievementsByUserId = /* GraphQL */ `
  query AchievementsByUserId(
    $userId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelAchievementFilterInput
    $limit: Int
    $nextToken: String
  ) {
    achievementsByUserId(
      userId: $userId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        description
        moduleNumber
        userId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getModule = /* GraphQL */ `
  query GetModule($id: ID!) {
    getModule(id: $id) {
      id
      title
      description
      moduleNumber
      lessons {
        nextToken
        __typename
      }
      questions {
        nextToken
        __typename
      }
      progress {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listModules = /* GraphQL */ `
  query ListModules(
    $filter: ModelModuleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listModules(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        moduleNumber
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getLesson = /* GraphQL */ `
  query GetLesson($id: ID!) {
    getLesson(id: $id) {
      id
      title
      content
      image
      lessonNumber
      moduleId
      module {
        id
        title
        description
        moduleNumber
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listLessons = /* GraphQL */ `
  query ListLessons(
    $filter: ModelLessonFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLessons(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        content
        image
        lessonNumber
        moduleId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const lessonsByModuleIdAndLessonNumber = /* GraphQL */ `
  query LessonsByModuleIdAndLessonNumber(
    $moduleId: ID!
    $lessonNumber: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelLessonFilterInput
    $limit: Int
    $nextToken: String
  ) {
    lessonsByModuleIdAndLessonNumber(
      moduleId: $moduleId
      lessonNumber: $lessonNumber
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        content
        image
        lessonNumber
        moduleId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getQuestion = /* GraphQL */ `
  query GetQuestion($id: ID!) {
    getQuestion(id: $id) {
      id
      questionText
      options
      correctAnswerIndex
      moduleId
      module {
        id
        title
        description
        moduleNumber
        createdAt
        updatedAt
        __typename
      }
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listQuestions = /* GraphQL */ `
  query ListQuestions(
    $filter: ModelQuestionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listQuestions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        questionText
        options
        correctAnswerIndex
        moduleId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const questionsByModuleId = /* GraphQL */ `
  query QuestionsByModuleId(
    $moduleId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelQuestionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    questionsByModuleId(
      moduleId: $moduleId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        questionText
        options
        correctAnswerIndex
        moduleId
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getBrailleSymbol = /* GraphQL */ `
  query GetBrailleSymbol($id: ID!) {
    getBrailleSymbol(id: $id) {
      id
      letter
      description
      imageKey
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listBrailleSymbols = /* GraphQL */ `
  query ListBrailleSymbols(
    $filter: ModelBrailleSymbolFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listBrailleSymbols(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        letter
        description
        imageKey
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
