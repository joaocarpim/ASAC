/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser(
    $filter: ModelSubscriptionUserFilterInput
    $id: String
  ) {
    onCreateUser(filter: $filter, id: $id) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser(
    $filter: ModelSubscriptionUserFilterInput
    $id: String
  ) {
    onUpdateUser(filter: $filter, id: $id) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser(
    $filter: ModelSubscriptionUserFilterInput
    $id: String
  ) {
    onDeleteUser(filter: $filter, id: $id) {
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
export const onCreateAchievement = /* GraphQL */ `
  subscription OnCreateAchievement(
    $filter: ModelSubscriptionAchievementFilterInput
    $userId: String
  ) {
    onCreateAchievement(filter: $filter, userId: $userId) {
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
export const onUpdateAchievement = /* GraphQL */ `
  subscription OnUpdateAchievement(
    $filter: ModelSubscriptionAchievementFilterInput
    $userId: String
  ) {
    onUpdateAchievement(filter: $filter, userId: $userId) {
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
export const onDeleteAchievement = /* GraphQL */ `
  subscription OnDeleteAchievement(
    $filter: ModelSubscriptionAchievementFilterInput
    $userId: String
  ) {
    onDeleteAchievement(filter: $filter, userId: $userId) {
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
export const onCreateProgress = /* GraphQL */ `
  subscription OnCreateProgress(
    $filter: ModelSubscriptionProgressFilterInput
    $userId: String
  ) {
    onCreateProgress(filter: $filter, userId: $userId) {
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
export const onUpdateProgress = /* GraphQL */ `
  subscription OnUpdateProgress(
    $filter: ModelSubscriptionProgressFilterInput
    $userId: String
  ) {
    onUpdateProgress(filter: $filter, userId: $userId) {
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
export const onDeleteProgress = /* GraphQL */ `
  subscription OnDeleteProgress(
    $filter: ModelSubscriptionProgressFilterInput
    $userId: String
  ) {
    onDeleteProgress(filter: $filter, userId: $userId) {
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
export const onCreateModule = /* GraphQL */ `
  subscription OnCreateModule($filter: ModelSubscriptionModuleFilterInput) {
    onCreateModule(filter: $filter) {
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
export const onUpdateModule = /* GraphQL */ `
  subscription OnUpdateModule($filter: ModelSubscriptionModuleFilterInput) {
    onUpdateModule(filter: $filter) {
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
export const onDeleteModule = /* GraphQL */ `
  subscription OnDeleteModule($filter: ModelSubscriptionModuleFilterInput) {
    onDeleteModule(filter: $filter) {
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
export const onCreateLesson = /* GraphQL */ `
  subscription OnCreateLesson($filter: ModelSubscriptionLessonFilterInput) {
    onCreateLesson(filter: $filter) {
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
export const onUpdateLesson = /* GraphQL */ `
  subscription OnUpdateLesson($filter: ModelSubscriptionLessonFilterInput) {
    onUpdateLesson(filter: $filter) {
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
export const onDeleteLesson = /* GraphQL */ `
  subscription OnDeleteLesson($filter: ModelSubscriptionLessonFilterInput) {
    onDeleteLesson(filter: $filter) {
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
export const onCreateQuestion = /* GraphQL */ `
  subscription OnCreateQuestion($filter: ModelSubscriptionQuestionFilterInput) {
    onCreateQuestion(filter: $filter) {
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
export const onUpdateQuestion = /* GraphQL */ `
  subscription OnUpdateQuestion($filter: ModelSubscriptionQuestionFilterInput) {
    onUpdateQuestion(filter: $filter) {
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
export const onDeleteQuestion = /* GraphQL */ `
  subscription OnDeleteQuestion($filter: ModelSubscriptionQuestionFilterInput) {
    onDeleteQuestion(filter: $filter) {
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
export const onCreateBrailleSymbol = /* GraphQL */ `
  subscription OnCreateBrailleSymbol(
    $filter: ModelSubscriptionBrailleSymbolFilterInput
  ) {
    onCreateBrailleSymbol(filter: $filter) {
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
export const onUpdateBrailleSymbol = /* GraphQL */ `
  subscription OnUpdateBrailleSymbol(
    $filter: ModelSubscriptionBrailleSymbolFilterInput
  ) {
    onUpdateBrailleSymbol(filter: $filter) {
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
export const onDeleteBrailleSymbol = /* GraphQL */ `
  subscription OnDeleteBrailleSymbol(
    $filter: ModelSubscriptionBrailleSymbolFilterInput
  ) {
    onDeleteBrailleSymbol(filter: $filter) {
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
