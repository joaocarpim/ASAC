/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateUser = /* GraphQL */ `subscription OnCreateUser(
  $filter: ModelSubscriptionUserFilterInput
  $owner: String
) {
  onCreateUser(filter: $filter, owner: $owner) {
    id
    name
    email
    role
    coins
    points
    modulesCompleted
    precision
    correctAnswers
    timeSpent
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateUserSubscriptionVariables,
  APITypes.OnCreateUserSubscription
>;
export const onUpdateUser = /* GraphQL */ `subscription OnUpdateUser(
  $filter: ModelSubscriptionUserFilterInput
  $owner: String
) {
  onUpdateUser(filter: $filter, owner: $owner) {
    id
    name
    email
    role
    coins
    points
    modulesCompleted
    precision
    correctAnswers
    timeSpent
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateUserSubscriptionVariables,
  APITypes.OnUpdateUserSubscription
>;
export const onDeleteUser = /* GraphQL */ `subscription OnDeleteUser(
  $filter: ModelSubscriptionUserFilterInput
  $owner: String
) {
  onDeleteUser(filter: $filter, owner: $owner) {
    id
    name
    email
    role
    coins
    points
    modulesCompleted
    precision
    correctAnswers
    timeSpent
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteUserSubscriptionVariables,
  APITypes.OnDeleteUserSubscription
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
