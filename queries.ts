/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./src/API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getUser = /* GraphQL */ `query GetUser($id: ID!) {
  getUser(id: $id) {
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
` as GeneratedQuery<APITypes.GetUserQueryVariables, APITypes.GetUserQuery>;
export const listUsers = /* GraphQL */ `query ListUsers(
  $filter: ModelUserFilterInput
  $limit: Int
  $nextToken: String
) {
  listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListUsersQueryVariables, APITypes.ListUsersQuery>;
export const getModule = /* GraphQL */ `query GetModule($id: ID!) {
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
      moduleNumber
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
export const getLesson = /* GraphQL */ `query GetLesson($id: ID!) {
  getLesson(id: $id) {
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
` as GeneratedQuery<APITypes.GetLessonQueryVariables, APITypes.GetLessonQuery>;
export const listLessons = /* GraphQL */ `query ListLessons(
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
` as GeneratedQuery<
  APITypes.ListLessonsQueryVariables,
  APITypes.ListLessonsQuery
>;
export const getQuestion = /* GraphQL */ `query GetQuestion($id: ID!) {
  getQuestion(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetQuestionQueryVariables,
  APITypes.GetQuestionQuery
>;
export const listQuestions = /* GraphQL */ `query ListQuestions(
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
` as GeneratedQuery<
  APITypes.ListQuestionsQueryVariables,
  APITypes.ListQuestionsQuery
>;
export const getBrailleSymbol = /* GraphQL */ `query GetBrailleSymbol($id: ID!) {
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
` as GeneratedQuery<
  APITypes.GetBrailleSymbolQueryVariables,
  APITypes.GetBrailleSymbolQuery
>;
export const listBrailleSymbols = /* GraphQL */ `query ListBrailleSymbols(
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
` as GeneratedQuery<
  APITypes.ListBrailleSymbolsQueryVariables,
  APITypes.ListBrailleSymbolsQuery
>;
export const lessonsByModuleIdAndLessonNumber = /* GraphQL */ `query LessonsByModuleIdAndLessonNumber(
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
` as GeneratedQuery<
  APITypes.LessonsByModuleIdAndLessonNumberQueryVariables,
  APITypes.LessonsByModuleIdAndLessonNumberQuery
>;
export const questionsByModuleId = /* GraphQL */ `query QuestionsByModuleId(
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
` as GeneratedQuery<
  APITypes.QuestionsByModuleIdQueryVariables,
  APITypes.QuestionsByModuleIdQuery
>;
