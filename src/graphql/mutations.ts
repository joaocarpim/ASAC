/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const adminRegisterUser = /* GraphQL */ `mutation AdminRegisterUser(
  $name: String!
  $email: String!
  $password: String!
) {
  adminRegisterUser(name: $name, email: $email, password: $password)
}
` as GeneratedMutation<
  APITypes.AdminRegisterUserMutationVariables,
  APITypes.AdminRegisterUserMutation
>;
export const adminDeleteCognitoUser = /* GraphQL */ `mutation AdminDeleteCognitoUser($username: String!, $userId: String) {
  adminDeleteCognitoUser(username: $username, userId: $userId)
}
` as GeneratedMutation<
  APITypes.AdminDeleteCognitoUserMutationVariables,
  APITypes.AdminDeleteCognitoUserMutation
>;
export const createUser = /* GraphQL */ `mutation CreateUser(
  $input: CreateUserInput!
  $condition: ModelUserConditionInput
) {
  createUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateUserMutationVariables,
  APITypes.CreateUserMutation
>;
export const updateUser = /* GraphQL */ `mutation UpdateUser(
  $input: UpdateUserInput!
  $condition: ModelUserConditionInput
) {
  updateUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateUserMutationVariables,
  APITypes.UpdateUserMutation
>;
export const deleteUser = /* GraphQL */ `mutation DeleteUser(
  $input: DeleteUserInput!
  $condition: ModelUserConditionInput
) {
  deleteUser(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteUserMutationVariables,
  APITypes.DeleteUserMutation
>;
export const createAchievement = /* GraphQL */ `mutation CreateAchievement(
  $input: CreateAchievementInput!
  $condition: ModelAchievementConditionInput
) {
  createAchievement(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateAchievementMutationVariables,
  APITypes.CreateAchievementMutation
>;
export const updateAchievement = /* GraphQL */ `mutation UpdateAchievement(
  $input: UpdateAchievementInput!
  $condition: ModelAchievementConditionInput
) {
  updateAchievement(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateAchievementMutationVariables,
  APITypes.UpdateAchievementMutation
>;
export const deleteAchievement = /* GraphQL */ `mutation DeleteAchievement(
  $input: DeleteAchievementInput!
  $condition: ModelAchievementConditionInput
) {
  deleteAchievement(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteAchievementMutationVariables,
  APITypes.DeleteAchievementMutation
>;
export const createProgress = /* GraphQL */ `mutation CreateProgress(
  $input: CreateProgressInput!
  $condition: ModelProgressConditionInput
) {
  createProgress(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateProgressMutationVariables,
  APITypes.CreateProgressMutation
>;
export const updateProgress = /* GraphQL */ `mutation UpdateProgress(
  $input: UpdateProgressInput!
  $condition: ModelProgressConditionInput
) {
  updateProgress(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateProgressMutationVariables,
  APITypes.UpdateProgressMutation
>;
export const deleteProgress = /* GraphQL */ `mutation DeleteProgress(
  $input: DeleteProgressInput!
  $condition: ModelProgressConditionInput
) {
  deleteProgress(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteProgressMutationVariables,
  APITypes.DeleteProgressMutation
>;
export const createModule = /* GraphQL */ `mutation CreateModule(
  $input: CreateModuleInput!
  $condition: ModelModuleConditionInput
) {
  createModule(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateModuleMutationVariables,
  APITypes.CreateModuleMutation
>;
export const updateModule = /* GraphQL */ `mutation UpdateModule(
  $input: UpdateModuleInput!
  $condition: ModelModuleConditionInput
) {
  updateModule(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateModuleMutationVariables,
  APITypes.UpdateModuleMutation
>;
export const deleteModule = /* GraphQL */ `mutation DeleteModule(
  $input: DeleteModuleInput!
  $condition: ModelModuleConditionInput
) {
  deleteModule(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteModuleMutationVariables,
  APITypes.DeleteModuleMutation
>;
export const createLesson = /* GraphQL */ `mutation CreateLesson(
  $input: CreateLessonInput!
  $condition: ModelLessonConditionInput
) {
  createLesson(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateLessonMutationVariables,
  APITypes.CreateLessonMutation
>;
export const updateLesson = /* GraphQL */ `mutation UpdateLesson(
  $input: UpdateLessonInput!
  $condition: ModelLessonConditionInput
) {
  updateLesson(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateLessonMutationVariables,
  APITypes.UpdateLessonMutation
>;
export const deleteLesson = /* GraphQL */ `mutation DeleteLesson(
  $input: DeleteLessonInput!
  $condition: ModelLessonConditionInput
) {
  deleteLesson(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteLessonMutationVariables,
  APITypes.DeleteLessonMutation
>;
export const createQuestion = /* GraphQL */ `mutation CreateQuestion(
  $input: CreateQuestionInput!
  $condition: ModelQuestionConditionInput
) {
  createQuestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateQuestionMutationVariables,
  APITypes.CreateQuestionMutation
>;
export const updateQuestion = /* GraphQL */ `mutation UpdateQuestion(
  $input: UpdateQuestionInput!
  $condition: ModelQuestionConditionInput
) {
  updateQuestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateQuestionMutationVariables,
  APITypes.UpdateQuestionMutation
>;
export const deleteQuestion = /* GraphQL */ `mutation DeleteQuestion(
  $input: DeleteQuestionInput!
  $condition: ModelQuestionConditionInput
) {
  deleteQuestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteQuestionMutationVariables,
  APITypes.DeleteQuestionMutation
>;
export const createBrailleSymbol = /* GraphQL */ `mutation CreateBrailleSymbol(
  $input: CreateBrailleSymbolInput!
  $condition: ModelBrailleSymbolConditionInput
) {
  createBrailleSymbol(input: $input, condition: $condition) {
    id
    letter
    description
    imageKey
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateBrailleSymbolMutationVariables,
  APITypes.CreateBrailleSymbolMutation
>;
export const updateBrailleSymbol = /* GraphQL */ `mutation UpdateBrailleSymbol(
  $input: UpdateBrailleSymbolInput!
  $condition: ModelBrailleSymbolConditionInput
) {
  updateBrailleSymbol(input: $input, condition: $condition) {
    id
    letter
    description
    imageKey
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateBrailleSymbolMutationVariables,
  APITypes.UpdateBrailleSymbolMutation
>;
export const deleteBrailleSymbol = /* GraphQL */ `mutation DeleteBrailleSymbol(
  $input: DeleteBrailleSymbolInput!
  $condition: ModelBrailleSymbolConditionInput
) {
  deleteBrailleSymbol(input: $input, condition: $condition) {
    id
    letter
    description
    imageKey
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteBrailleSymbolMutationVariables,
  APITypes.DeleteBrailleSymbolMutation
>;
