/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onCreateUser(filter: $filter, owner: $owner) {
      id
      owner
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
    $owner: String
  ) {
    onUpdateUser(filter: $filter, owner: $owner) {
      id
      owner
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
    $owner: String
  ) {
    onDeleteUser(filter: $filter, owner: $owner) {
      id
      owner
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
    $owner: String
  ) {
    onCreateAchievement(filter: $filter, owner: $owner) {
      id
      title
      description
      user {
        id
        owner
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
      userId
      moduleNumber
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateAchievement = /* GraphQL */ `
  subscription OnUpdateAchievement(
    $filter: ModelSubscriptionAchievementFilterInput
    $owner: String
  ) {
    onUpdateAchievement(filter: $filter, owner: $owner) {
      id
      title
      description
      user {
        id
        owner
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
      userId
      moduleNumber
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteAchievement = /* GraphQL */ `
  subscription OnDeleteAchievement(
    $filter: ModelSubscriptionAchievementFilterInput
    $owner: String
  ) {
    onDeleteAchievement(filter: $filter, owner: $owner) {
      id
      title
      description
      user {
        id
        owner
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
      userId
      moduleNumber
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onCreateProgress = /* GraphQL */ `
  subscription OnCreateProgress(
    $filter: ModelSubscriptionProgressFilterInput
    $owner: String
  ) {
    onCreateProgress(filter: $filter, owner: $owner) {
      id
      user {
        id
        owner
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
      userId
      module {
        id
        title
        description
        moduleNumber
        createdAt
        updatedAt
        __typename
      }
      moduleId
      accuracy
      correctAnswers
      wrongAnswers
      timeSpent
      completed
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateProgress = /* GraphQL */ `
  subscription OnUpdateProgress(
    $filter: ModelSubscriptionProgressFilterInput
    $owner: String
  ) {
    onUpdateProgress(filter: $filter, owner: $owner) {
      id
      user {
        id
        owner
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
      userId
      module {
        id
        title
        description
        moduleNumber
        createdAt
        updatedAt
        __typename
      }
      moduleId
      accuracy
      correctAnswers
      wrongAnswers
      timeSpent
      completed
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteProgress = /* GraphQL */ `
  subscription OnDeleteProgress(
    $filter: ModelSubscriptionProgressFilterInput
    $owner: String
  ) {
    onDeleteProgress(filter: $filter, owner: $owner) {
      id
      user {
        id
        owner
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
      userId
      module {
        id
        title
        description
        moduleNumber
        createdAt
        updatedAt
        __typename
      }
      moduleId
      accuracy
      correctAnswers
      wrongAnswers
      timeSpent
      completed
      createdAt
      updatedAt
      owner
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
      module {
        id
        title
        description
        moduleNumber
        createdAt
        updatedAt
        __typename
      }
      moduleId
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
      module {
        id
        title
        description
        moduleNumber
        createdAt
        updatedAt
        __typename
      }
      moduleId
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
      module {
        id
        title
        description
        moduleNumber
        createdAt
        updatedAt
        __typename
      }
      moduleId
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
      module {
        id
        title
        description
        moduleNumber
        createdAt
        updatedAt
        __typename
      }
      moduleId
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
      module {
        id
        title
        description
        moduleNumber
        createdAt
        updatedAt
        __typename
      }
      moduleId
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
      module {
        id
        title
        description
        moduleNumber
        createdAt
        updatedAt
        __typename
      }
      moduleId
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
