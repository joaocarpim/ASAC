/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateProgress = /* GraphQL */ `subscription OnCreateProgress($filter: ModelSubscriptionProgressFilterInput) {
  onCreateProgress(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateProgressSubscriptionVariables,
  APITypes.OnCreateProgressSubscription
>;
export const onUpdateProgress = /* GraphQL */ `subscription OnUpdateProgress($filter: ModelSubscriptionProgressFilterInput) {
  onUpdateProgress(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateProgressSubscriptionVariables,
  APITypes.OnUpdateProgressSubscription
>;
export const onDeleteProgress = /* GraphQL */ `subscription OnDeleteProgress($filter: ModelSubscriptionProgressFilterInput) {
  onDeleteProgress(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteProgressSubscriptionVariables,
  APITypes.OnDeleteProgressSubscription
>;
export const onCreateUser = /* GraphQL */ `subscription OnCreateUser($filter: ModelSubscriptionUserFilterInput) {
  onCreateUser(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserSubscriptionVariables,
  APITypes.OnCreateUserSubscription
>;
export const onUpdateUser = /* GraphQL */ `subscription OnUpdateUser($filter: ModelSubscriptionUserFilterInput) {
  onUpdateUser(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserSubscriptionVariables,
  APITypes.OnUpdateUserSubscription
>;
export const onDeleteUser = /* GraphQL */ `subscription OnDeleteUser($filter: ModelSubscriptionUserFilterInput) {
  onDeleteUser(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserSubscriptionVariables,
  APITypes.OnDeleteUserSubscription
>;
export const onCreateAchievement = /* GraphQL */ `subscription OnCreateAchievement(
  $filter: ModelSubscriptionAchievementFilterInput
) {
  onCreateAchievement(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateAchievementSubscriptionVariables,
  APITypes.OnCreateAchievementSubscription
>;
export const onUpdateAchievement = /* GraphQL */ `subscription OnUpdateAchievement(
  $filter: ModelSubscriptionAchievementFilterInput
) {
  onUpdateAchievement(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateAchievementSubscriptionVariables,
  APITypes.OnUpdateAchievementSubscription
>;
export const onDeleteAchievement = /* GraphQL */ `subscription OnDeleteAchievement(
  $filter: ModelSubscriptionAchievementFilterInput
) {
  onDeleteAchievement(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteAchievementSubscriptionVariables,
  APITypes.OnDeleteAchievementSubscription
>;
export const onCreateModule = /* GraphQL */ `subscription OnCreateModule($filter: ModelSubscriptionModuleFilterInput) {
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
` as GeneratedSubscription<
  APITypes.OnCreateModuleSubscriptionVariables,
  APITypes.OnCreateModuleSubscription
>;
export const onUpdateModule = /* GraphQL */ `subscription OnUpdateModule($filter: ModelSubscriptionModuleFilterInput) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateModuleSubscriptionVariables,
  APITypes.OnUpdateModuleSubscription
>;
export const onDeleteModule = /* GraphQL */ `subscription OnDeleteModule($filter: ModelSubscriptionModuleFilterInput) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteModuleSubscriptionVariables,
  APITypes.OnDeleteModuleSubscription
>;
export const onCreateLesson = /* GraphQL */ `subscription OnCreateLesson($filter: ModelSubscriptionLessonFilterInput) {
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
` as GeneratedSubscription<
  APITypes.OnCreateLessonSubscriptionVariables,
  APITypes.OnCreateLessonSubscription
>;
export const onUpdateLesson = /* GraphQL */ `subscription OnUpdateLesson($filter: ModelSubscriptionLessonFilterInput) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateLessonSubscriptionVariables,
  APITypes.OnUpdateLessonSubscription
>;
export const onDeleteLesson = /* GraphQL */ `subscription OnDeleteLesson($filter: ModelSubscriptionLessonFilterInput) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteLessonSubscriptionVariables,
  APITypes.OnDeleteLessonSubscription
>;
export const onCreateQuestion = /* GraphQL */ `subscription OnCreateQuestion($filter: ModelSubscriptionQuestionFilterInput) {
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
` as GeneratedSubscription<
  APITypes.OnCreateQuestionSubscriptionVariables,
  APITypes.OnCreateQuestionSubscription
>;
export const onUpdateQuestion = /* GraphQL */ `subscription OnUpdateQuestion($filter: ModelSubscriptionQuestionFilterInput) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateQuestionSubscriptionVariables,
  APITypes.OnUpdateQuestionSubscription
>;
export const onDeleteQuestion = /* GraphQL */ `subscription OnDeleteQuestion($filter: ModelSubscriptionQuestionFilterInput) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteQuestionSubscriptionVariables,
  APITypes.OnDeleteQuestionSubscription
>;
export const onCreateBrailleSymbol = /* GraphQL */ `subscription OnCreateBrailleSymbol(
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
` as GeneratedSubscription<
  APITypes.OnCreateBrailleSymbolSubscriptionVariables,
  APITypes.OnCreateBrailleSymbolSubscription
>;
export const onUpdateBrailleSymbol = /* GraphQL */ `subscription OnUpdateBrailleSymbol(
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
` as GeneratedSubscription<
  APITypes.OnUpdateBrailleSymbolSubscriptionVariables,
  APITypes.OnUpdateBrailleSymbolSubscription
>;
export const onDeleteBrailleSymbol = /* GraphQL */ `subscription OnDeleteBrailleSymbol(
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
` as GeneratedSubscription<
  APITypes.OnDeleteBrailleSymbolSubscriptionVariables,
  APITypes.OnDeleteBrailleSymbolSubscription
>;
