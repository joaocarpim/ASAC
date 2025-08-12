/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getModule = /* GraphQL */ `query GetModule($id: ID!) {
  getModule(id: $id) {
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
` as GeneratedQuery<APITypes.GetModuleQueryVariables, APITypes.GetModuleQuery>;
export const listModules = /* GraphQL */ `query ListModules(
  $filter: ModelModuleFilterInput
  $limit: Int
  $nextToken: String
) {
  listModules(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      title
      description
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListModulesQueryVariables,
  APITypes.ListModulesQuery
>;
export const getExercise = /* GraphQL */ `query GetExercise($id: ID!) {
  getExercise(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetExerciseQueryVariables,
  APITypes.GetExerciseQuery
>;
export const listExercises = /* GraphQL */ `query ListExercises(
  $filter: ModelExerciseFilterInput
  $limit: Int
  $nextToken: String
) {
  listExercises(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      moduleID
      question
      correctAnswer
      mediaUrl
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListExercisesQueryVariables,
  APITypes.ListExercisesQuery
>;
export const getProgress = /* GraphQL */ `query GetProgress($id: ID!) {
  getProgress(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetProgressQueryVariables,
  APITypes.GetProgressQuery
>;
export const listProgresses = /* GraphQL */ `query ListProgresses(
  $filter: ModelProgressFilterInput
  $limit: Int
  $nextToken: String
) {
  listProgresses(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListProgressesQueryVariables,
  APITypes.ListProgressesQuery
>;
export const exercisesByModuleID = /* GraphQL */ `query ExercisesByModuleID(
  $moduleID: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelExerciseFilterInput
  $limit: Int
  $nextToken: String
) {
  exercisesByModuleID(
    moduleID: $moduleID
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
      id
      moduleID
      question
      correctAnswer
      mediaUrl
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ExercisesByModuleIDQueryVariables,
  APITypes.ExercisesByModuleIDQuery
>;
export const progressesByUserID = /* GraphQL */ `query ProgressesByUserID(
  $userID: ID!
  $sortDirection: ModelSortDirection
  $filter: ModelProgressFilterInput
  $limit: Int
  $nextToken: String
) {
  progressesByUserID(
    userID: $userID
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ProgressesByUserIDQueryVariables,
  APITypes.ProgressesByUserIDQuery
>;
export const getUser = /* GraphQL */ `query GetUser($id: ID!) {
  getUser(id: $id) {
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
` as GeneratedQuery<APITypes.GetUserQueryVariables, APITypes.GetUserQuery>;
export const listUsers = /* GraphQL */ `query ListUsers(
  $filter: ModelUserFilterInput
  $limit: Int
  $nextToken: String
) {
  listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      email
      name
      role
      coins
      points
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListUsersQueryVariables, APITypes.ListUsersQuery>;
