/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateModule = /* GraphQL */ `subscription OnCreateModule($filter: ModelSubscriptionModuleFilterInput) {
  onCreateModule(filter: $filter) {
    id
    title
    description
    exercises {
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
    exercises {
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
    exercises {
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
export const onCreateExercise = /* GraphQL */ `subscription OnCreateExercise($filter: ModelSubscriptionExerciseFilterInput) {
  onCreateExercise(filter: $filter) {
    id
    moduleID
    question
    correctAnswer
    mediaUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateExerciseSubscriptionVariables,
  APITypes.OnCreateExerciseSubscription
>;
export const onUpdateExercise = /* GraphQL */ `subscription OnUpdateExercise($filter: ModelSubscriptionExerciseFilterInput) {
  onUpdateExercise(filter: $filter) {
    id
    moduleID
    question
    correctAnswer
    mediaUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateExerciseSubscriptionVariables,
  APITypes.OnUpdateExerciseSubscription
>;
export const onDeleteExercise = /* GraphQL */ `subscription OnDeleteExercise($filter: ModelSubscriptionExerciseFilterInput) {
  onDeleteExercise(filter: $filter) {
    id
    moduleID
    question
    correctAnswer
    mediaUrl
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteExerciseSubscriptionVariables,
  APITypes.OnDeleteExerciseSubscription
>;
export const onCreateProgress = /* GraphQL */ `subscription OnCreateProgress($filter: ModelSubscriptionProgressFilterInput) {
  onCreateProgress(filter: $filter) {
    id
    userID
    moduleID
    hits
    misses
    timeSpent
    completed
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
    userID
    moduleID
    hits
    misses
    timeSpent
    completed
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
    userID
    moduleID
    hits
    misses
    timeSpent
    completed
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteProgressSubscriptionVariables,
  APITypes.OnDeleteProgressSubscription
>;
export const onCreateUser = /* GraphQL */ `subscription OnCreateUser(
  $filter: ModelSubscriptionUserFilterInput
  $owner: String
) {
  onCreateUser(filter: $filter, owner: $owner) {
    id
    email
    name
    role
    coins
    points
    progresses {
      nextToken
      __typename
    }
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
    email
    name
    role
    coins
    points
    progresses {
      nextToken
      __typename
    }
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
    email
    name
    role
    coins
    points
    progresses {
      nextToken
      __typename
    }
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
