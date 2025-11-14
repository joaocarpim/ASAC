/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateUserInput = {
  id?: string | null,
  name: string,
  email: string,
  role: string,
  coins?: number | null,
  points?: number | null,
  modulesCompleted?: Array< number | null > | null,
  currentModule?: number | null,
  precision?: number | null,
  correctAnswers?: number | null,
  wrongAnswers?: number | null,
  timeSpent?: number | null,
};

export type ModelUserConditionInput = {
  name?: ModelStringInput | null,
  email?: ModelStringInput | null,
  role?: ModelStringInput | null,
  coins?: ModelIntInput | null,
  points?: ModelIntInput | null,
  modulesCompleted?: ModelIntInput | null,
  currentModule?: ModelIntInput | null,
  precision?: ModelFloatInput | null,
  correctAnswers?: ModelIntInput | null,
  wrongAnswers?: ModelIntInput | null,
  timeSpent?: ModelFloatInput | null,
  and?: Array< ModelUserConditionInput | null > | null,
  or?: Array< ModelUserConditionInput | null > | null,
  not?: ModelUserConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ModelFloatInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type User = {
  __typename: "User",
  id: string,
  name: string,
  email: string,
  role: string,
  coins?: number | null,
  points?: number | null,
  modulesCompleted?: Array< number | null > | null,
  currentModule?: number | null,
  precision?: number | null,
  correctAnswers?: number | null,
  wrongAnswers?: number | null,
  timeSpent?: number | null,
  achievements?: ModelAchievementConnection | null,
  progress?: ModelProgressConnection | null,
  createdAt: string,
  updatedAt: string,
};

export type ModelAchievementConnection = {
  __typename: "ModelAchievementConnection",
  items:  Array<Achievement | null >,
  nextToken?: string | null,
};

export type Achievement = {
  __typename: "Achievement",
  id: string,
  title: string,
  description?: string | null,
  moduleNumber?: number | null,
  userId: string,
  user?: User | null,
  createdAt: string,
  updatedAt: string,
};

export type ModelProgressConnection = {
  __typename: "ModelProgressConnection",
  items:  Array<Progress | null >,
  nextToken?: string | null,
};

export type Progress = {
  __typename: "Progress",
  id: string,
  userId: string,
  user?: User | null,
  moduleId: string,
  module?: Module | null,
  moduleNumber?: number | null,
  accuracy?: number | null,
  correctAnswers?: number | null,
  wrongAnswers?: number | null,
  timeSpent?: number | null,
  completed?: boolean | null,
  completedAt?: string | null,
  errorDetails?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type Module = {
  __typename: "Module",
  id: string,
  title: string,
  description: string,
  moduleNumber: number,
  lessons?: ModelLessonConnection | null,
  questions?: ModelQuestionConnection | null,
  progress?: ModelProgressConnection | null,
  createdAt: string,
  updatedAt: string,
};

export type ModelLessonConnection = {
  __typename: "ModelLessonConnection",
  items:  Array<Lesson | null >,
  nextToken?: string | null,
};

export type Lesson = {
  __typename: "Lesson",
  id: string,
  title: string,
  content: string,
  image?: string | null,
  lessonNumber: number,
  moduleId: string,
  module?: Module | null,
  createdAt: string,
  updatedAt: string,
};

export type ModelQuestionConnection = {
  __typename: "ModelQuestionConnection",
  items:  Array<Question | null >,
  nextToken?: string | null,
};

export type Question = {
  __typename: "Question",
  id: string,
  questionText: string,
  options: Array< string >,
  correctAnswerIndex: number,
  moduleId: string,
  module?: Module | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateUserInput = {
  id: string,
  name?: string | null,
  email?: string | null,
  role?: string | null,
  coins?: number | null,
  points?: number | null,
  modulesCompleted?: Array< number | null > | null,
  currentModule?: number | null,
  precision?: number | null,
  correctAnswers?: number | null,
  wrongAnswers?: number | null,
  timeSpent?: number | null,
};

export type DeleteUserInput = {
  id: string,
};

export type CreateAchievementInput = {
  id?: string | null,
  title: string,
  description?: string | null,
  moduleNumber?: number | null,
  userId: string,
};

export type ModelAchievementConditionInput = {
  title?: ModelStringInput | null,
  description?: ModelStringInput | null,
  moduleNumber?: ModelIntInput | null,
  userId?: ModelIDInput | null,
  and?: Array< ModelAchievementConditionInput | null > | null,
  or?: Array< ModelAchievementConditionInput | null > | null,
  not?: ModelAchievementConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type UpdateAchievementInput = {
  id: string,
  title?: string | null,
  description?: string | null,
  moduleNumber?: number | null,
  userId?: string | null,
};

export type DeleteAchievementInput = {
  id: string,
};

export type CreateProgressInput = {
  id?: string | null,
  userId: string,
  moduleId: string,
  moduleNumber?: number | null,
  accuracy?: number | null,
  correctAnswers?: number | null,
  wrongAnswers?: number | null,
  timeSpent?: number | null,
  completed?: boolean | null,
  completedAt?: string | null,
  errorDetails?: string | null,
};

export type ModelProgressConditionInput = {
  userId?: ModelIDInput | null,
  moduleId?: ModelIDInput | null,
  moduleNumber?: ModelIntInput | null,
  accuracy?: ModelFloatInput | null,
  correctAnswers?: ModelIntInput | null,
  wrongAnswers?: ModelIntInput | null,
  timeSpent?: ModelFloatInput | null,
  completed?: ModelBooleanInput | null,
  completedAt?: ModelStringInput | null,
  errorDetails?: ModelStringInput | null,
  and?: Array< ModelProgressConditionInput | null > | null,
  or?: Array< ModelProgressConditionInput | null > | null,
  not?: ModelProgressConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type UpdateProgressInput = {
  id: string,
  userId?: string | null,
  moduleId?: string | null,
  moduleNumber?: number | null,
  accuracy?: number | null,
  correctAnswers?: number | null,
  wrongAnswers?: number | null,
  timeSpent?: number | null,
  completed?: boolean | null,
  completedAt?: string | null,
  errorDetails?: string | null,
};

export type DeleteProgressInput = {
  id: string,
};

export type CreateModuleInput = {
  id?: string | null,
  title: string,
  description: string,
  moduleNumber: number,
};

export type ModelModuleConditionInput = {
  title?: ModelStringInput | null,
  description?: ModelStringInput | null,
  moduleNumber?: ModelIntInput | null,
  and?: Array< ModelModuleConditionInput | null > | null,
  or?: Array< ModelModuleConditionInput | null > | null,
  not?: ModelModuleConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type UpdateModuleInput = {
  id: string,
  title?: string | null,
  description?: string | null,
  moduleNumber?: number | null,
};

export type DeleteModuleInput = {
  id: string,
};

export type CreateLessonInput = {
  id?: string | null,
  title: string,
  content: string,
  image?: string | null,
  lessonNumber: number,
  moduleId: string,
};

export type ModelLessonConditionInput = {
  title?: ModelStringInput | null,
  content?: ModelStringInput | null,
  image?: ModelStringInput | null,
  lessonNumber?: ModelIntInput | null,
  moduleId?: ModelIDInput | null,
  and?: Array< ModelLessonConditionInput | null > | null,
  or?: Array< ModelLessonConditionInput | null > | null,
  not?: ModelLessonConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type UpdateLessonInput = {
  id: string,
  title?: string | null,
  content?: string | null,
  image?: string | null,
  lessonNumber?: number | null,
  moduleId?: string | null,
};

export type DeleteLessonInput = {
  id: string,
};

export type CreateQuestionInput = {
  id?: string | null,
  questionText: string,
  options: Array< string >,
  correctAnswerIndex: number,
  moduleId: string,
};

export type ModelQuestionConditionInput = {
  questionText?: ModelStringInput | null,
  options?: ModelStringInput | null,
  correctAnswerIndex?: ModelIntInput | null,
  moduleId?: ModelIDInput | null,
  and?: Array< ModelQuestionConditionInput | null > | null,
  or?: Array< ModelQuestionConditionInput | null > | null,
  not?: ModelQuestionConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type UpdateQuestionInput = {
  id: string,
  questionText?: string | null,
  options?: Array< string > | null,
  correctAnswerIndex?: number | null,
  moduleId?: string | null,
};

export type DeleteQuestionInput = {
  id: string,
};

export type CreateBrailleSymbolInput = {
  id?: string | null,
  letter: string,
  description: string,
  imageKey: string,
};

export type ModelBrailleSymbolConditionInput = {
  letter?: ModelStringInput | null,
  description?: ModelStringInput | null,
  imageKey?: ModelStringInput | null,
  and?: Array< ModelBrailleSymbolConditionInput | null > | null,
  or?: Array< ModelBrailleSymbolConditionInput | null > | null,
  not?: ModelBrailleSymbolConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type BrailleSymbol = {
  __typename: "BrailleSymbol",
  id: string,
  letter: string,
  description: string,
  imageKey: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateBrailleSymbolInput = {
  id: string,
  letter?: string | null,
  description?: string | null,
  imageKey?: string | null,
};

export type DeleteBrailleSymbolInput = {
  id: string,
};

export type ModelProgressFilterInput = {
  id?: ModelIDInput | null,
  userId?: ModelIDInput | null,
  moduleId?: ModelIDInput | null,
  moduleNumber?: ModelIntInput | null,
  accuracy?: ModelFloatInput | null,
  correctAnswers?: ModelIntInput | null,
  wrongAnswers?: ModelIntInput | null,
  timeSpent?: ModelFloatInput | null,
  completed?: ModelBooleanInput | null,
  completedAt?: ModelStringInput | null,
  errorDetails?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelProgressFilterInput | null > | null,
  or?: Array< ModelProgressFilterInput | null > | null,
  not?: ModelProgressFilterInput | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelUserFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  email?: ModelStringInput | null,
  role?: ModelStringInput | null,
  coins?: ModelIntInput | null,
  points?: ModelIntInput | null,
  modulesCompleted?: ModelIntInput | null,
  currentModule?: ModelIntInput | null,
  precision?: ModelFloatInput | null,
  correctAnswers?: ModelIntInput | null,
  wrongAnswers?: ModelIntInput | null,
  timeSpent?: ModelFloatInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelUserFilterInput | null > | null,
  or?: Array< ModelUserFilterInput | null > | null,
  not?: ModelUserFilterInput | null,
};

export type ModelUserConnection = {
  __typename: "ModelUserConnection",
  items:  Array<User | null >,
  nextToken?: string | null,
};

export type ModelAchievementFilterInput = {
  id?: ModelIDInput | null,
  title?: ModelStringInput | null,
  description?: ModelStringInput | null,
  moduleNumber?: ModelIntInput | null,
  userId?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelAchievementFilterInput | null > | null,
  or?: Array< ModelAchievementFilterInput | null > | null,
  not?: ModelAchievementFilterInput | null,
};

export type ModelModuleFilterInput = {
  id?: ModelIDInput | null,
  title?: ModelStringInput | null,
  description?: ModelStringInput | null,
  moduleNumber?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelModuleFilterInput | null > | null,
  or?: Array< ModelModuleFilterInput | null > | null,
  not?: ModelModuleFilterInput | null,
};

export type ModelModuleConnection = {
  __typename: "ModelModuleConnection",
  items:  Array<Module | null >,
  nextToken?: string | null,
};

export type ModelLessonFilterInput = {
  id?: ModelIDInput | null,
  title?: ModelStringInput | null,
  content?: ModelStringInput | null,
  image?: ModelStringInput | null,
  lessonNumber?: ModelIntInput | null,
  moduleId?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelLessonFilterInput | null > | null,
  or?: Array< ModelLessonFilterInput | null > | null,
  not?: ModelLessonFilterInput | null,
};

export type ModelIntKeyConditionInput = {
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelQuestionFilterInput = {
  id?: ModelIDInput | null,
  questionText?: ModelStringInput | null,
  options?: ModelStringInput | null,
  correctAnswerIndex?: ModelIntInput | null,
  moduleId?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelQuestionFilterInput | null > | null,
  or?: Array< ModelQuestionFilterInput | null > | null,
  not?: ModelQuestionFilterInput | null,
};

export type ModelBrailleSymbolFilterInput = {
  id?: ModelIDInput | null,
  letter?: ModelStringInput | null,
  description?: ModelStringInput | null,
  imageKey?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelBrailleSymbolFilterInput | null > | null,
  or?: Array< ModelBrailleSymbolFilterInput | null > | null,
  not?: ModelBrailleSymbolFilterInput | null,
};

export type ModelBrailleSymbolConnection = {
  __typename: "ModelBrailleSymbolConnection",
  items:  Array<BrailleSymbol | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionProgressFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  userId?: ModelSubscriptionIDInput | null,
  moduleId?: ModelSubscriptionIDInput | null,
  moduleNumber?: ModelSubscriptionIntInput | null,
  accuracy?: ModelSubscriptionFloatInput | null,
  correctAnswers?: ModelSubscriptionIntInput | null,
  wrongAnswers?: ModelSubscriptionIntInput | null,
  timeSpent?: ModelSubscriptionFloatInput | null,
  completed?: ModelSubscriptionBooleanInput | null,
  completedAt?: ModelSubscriptionStringInput | null,
  errorDetails?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionProgressFilterInput | null > | null,
  or?: Array< ModelSubscriptionProgressFilterInput | null > | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionFloatInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  in?: Array< number | null > | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionUserFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  role?: ModelSubscriptionStringInput | null,
  coins?: ModelSubscriptionIntInput | null,
  points?: ModelSubscriptionIntInput | null,
  modulesCompleted?: ModelSubscriptionIntInput | null,
  currentModule?: ModelSubscriptionIntInput | null,
  precision?: ModelSubscriptionFloatInput | null,
  correctAnswers?: ModelSubscriptionIntInput | null,
  wrongAnswers?: ModelSubscriptionIntInput | null,
  timeSpent?: ModelSubscriptionFloatInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUserFilterInput | null > | null,
  or?: Array< ModelSubscriptionUserFilterInput | null > | null,
};

export type ModelSubscriptionAchievementFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  title?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  moduleNumber?: ModelSubscriptionIntInput | null,
  userId?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionAchievementFilterInput | null > | null,
  or?: Array< ModelSubscriptionAchievementFilterInput | null > | null,
};

export type ModelSubscriptionModuleFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  title?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  moduleNumber?: ModelSubscriptionIntInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionModuleFilterInput | null > | null,
  or?: Array< ModelSubscriptionModuleFilterInput | null > | null,
};

export type ModelSubscriptionLessonFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  title?: ModelSubscriptionStringInput | null,
  content?: ModelSubscriptionStringInput | null,
  image?: ModelSubscriptionStringInput | null,
  lessonNumber?: ModelSubscriptionIntInput | null,
  moduleId?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionLessonFilterInput | null > | null,
  or?: Array< ModelSubscriptionLessonFilterInput | null > | null,
};

export type ModelSubscriptionQuestionFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  questionText?: ModelSubscriptionStringInput | null,
  options?: ModelSubscriptionStringInput | null,
  correctAnswerIndex?: ModelSubscriptionIntInput | null,
  moduleId?: ModelSubscriptionIDInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionQuestionFilterInput | null > | null,
  or?: Array< ModelSubscriptionQuestionFilterInput | null > | null,
};

export type ModelSubscriptionBrailleSymbolFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  letter?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  imageKey?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionBrailleSymbolFilterInput | null > | null,
  or?: Array< ModelSubscriptionBrailleSymbolFilterInput | null > | null,
};

export type AdminRegisterUserMutationVariables = {
  name: string,
  email: string,
  password: string,
};

export type AdminRegisterUserMutation = {
  adminRegisterUser?: string | null,
};

export type AdminDeleteCognitoUserMutationVariables = {
  username: string,
};

export type AdminDeleteCognitoUserMutation = {
  adminDeleteCognitoUser?: boolean | null,
};

export type CreateUserMutationVariables = {
  input: CreateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type CreateUserMutation = {
  createUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    role: string,
    coins?: number | null,
    points?: number | null,
    modulesCompleted?: Array< number | null > | null,
    currentModule?: number | null,
    precision?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    achievements?:  {
      __typename: "ModelAchievementConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateUserMutationVariables = {
  input: UpdateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type UpdateUserMutation = {
  updateUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    role: string,
    coins?: number | null,
    points?: number | null,
    modulesCompleted?: Array< number | null > | null,
    currentModule?: number | null,
    precision?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    achievements?:  {
      __typename: "ModelAchievementConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteUserMutationVariables = {
  input: DeleteUserInput,
  condition?: ModelUserConditionInput | null,
};

export type DeleteUserMutation = {
  deleteUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    role: string,
    coins?: number | null,
    points?: number | null,
    modulesCompleted?: Array< number | null > | null,
    currentModule?: number | null,
    precision?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    achievements?:  {
      __typename: "ModelAchievementConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateAchievementMutationVariables = {
  input: CreateAchievementInput,
  condition?: ModelAchievementConditionInput | null,
};

export type CreateAchievementMutation = {
  createAchievement?:  {
    __typename: "Achievement",
    id: string,
    title: string,
    description?: string | null,
    moduleNumber?: number | null,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateAchievementMutationVariables = {
  input: UpdateAchievementInput,
  condition?: ModelAchievementConditionInput | null,
};

export type UpdateAchievementMutation = {
  updateAchievement?:  {
    __typename: "Achievement",
    id: string,
    title: string,
    description?: string | null,
    moduleNumber?: number | null,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteAchievementMutationVariables = {
  input: DeleteAchievementInput,
  condition?: ModelAchievementConditionInput | null,
};

export type DeleteAchievementMutation = {
  deleteAchievement?:  {
    __typename: "Achievement",
    id: string,
    title: string,
    description?: string | null,
    moduleNumber?: number | null,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateProgressMutationVariables = {
  input: CreateProgressInput,
  condition?: ModelProgressConditionInput | null,
};

export type CreateProgressMutation = {
  createProgress?:  {
    __typename: "Progress",
    id: string,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleNumber?: number | null,
    accuracy?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    completed?: boolean | null,
    completedAt?: string | null,
    errorDetails?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateProgressMutationVariables = {
  input: UpdateProgressInput,
  condition?: ModelProgressConditionInput | null,
};

export type UpdateProgressMutation = {
  updateProgress?:  {
    __typename: "Progress",
    id: string,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleNumber?: number | null,
    accuracy?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    completed?: boolean | null,
    completedAt?: string | null,
    errorDetails?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteProgressMutationVariables = {
  input: DeleteProgressInput,
  condition?: ModelProgressConditionInput | null,
};

export type DeleteProgressMutation = {
  deleteProgress?:  {
    __typename: "Progress",
    id: string,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleNumber?: number | null,
    accuracy?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    completed?: boolean | null,
    completedAt?: string | null,
    errorDetails?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateModuleMutationVariables = {
  input: CreateModuleInput,
  condition?: ModelModuleConditionInput | null,
};

export type CreateModuleMutation = {
  createModule?:  {
    __typename: "Module",
    id: string,
    title: string,
    description: string,
    moduleNumber: number,
    lessons?:  {
      __typename: "ModelLessonConnection",
      nextToken?: string | null,
    } | null,
    questions?:  {
      __typename: "ModelQuestionConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateModuleMutationVariables = {
  input: UpdateModuleInput,
  condition?: ModelModuleConditionInput | null,
};

export type UpdateModuleMutation = {
  updateModule?:  {
    __typename: "Module",
    id: string,
    title: string,
    description: string,
    moduleNumber: number,
    lessons?:  {
      __typename: "ModelLessonConnection",
      nextToken?: string | null,
    } | null,
    questions?:  {
      __typename: "ModelQuestionConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteModuleMutationVariables = {
  input: DeleteModuleInput,
  condition?: ModelModuleConditionInput | null,
};

export type DeleteModuleMutation = {
  deleteModule?:  {
    __typename: "Module",
    id: string,
    title: string,
    description: string,
    moduleNumber: number,
    lessons?:  {
      __typename: "ModelLessonConnection",
      nextToken?: string | null,
    } | null,
    questions?:  {
      __typename: "ModelQuestionConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateLessonMutationVariables = {
  input: CreateLessonInput,
  condition?: ModelLessonConditionInput | null,
};

export type CreateLessonMutation = {
  createLesson?:  {
    __typename: "Lesson",
    id: string,
    title: string,
    content: string,
    image?: string | null,
    lessonNumber: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateLessonMutationVariables = {
  input: UpdateLessonInput,
  condition?: ModelLessonConditionInput | null,
};

export type UpdateLessonMutation = {
  updateLesson?:  {
    __typename: "Lesson",
    id: string,
    title: string,
    content: string,
    image?: string | null,
    lessonNumber: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteLessonMutationVariables = {
  input: DeleteLessonInput,
  condition?: ModelLessonConditionInput | null,
};

export type DeleteLessonMutation = {
  deleteLesson?:  {
    __typename: "Lesson",
    id: string,
    title: string,
    content: string,
    image?: string | null,
    lessonNumber: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateQuestionMutationVariables = {
  input: CreateQuestionInput,
  condition?: ModelQuestionConditionInput | null,
};

export type CreateQuestionMutation = {
  createQuestion?:  {
    __typename: "Question",
    id: string,
    questionText: string,
    options: Array< string >,
    correctAnswerIndex: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateQuestionMutationVariables = {
  input: UpdateQuestionInput,
  condition?: ModelQuestionConditionInput | null,
};

export type UpdateQuestionMutation = {
  updateQuestion?:  {
    __typename: "Question",
    id: string,
    questionText: string,
    options: Array< string >,
    correctAnswerIndex: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteQuestionMutationVariables = {
  input: DeleteQuestionInput,
  condition?: ModelQuestionConditionInput | null,
};

export type DeleteQuestionMutation = {
  deleteQuestion?:  {
    __typename: "Question",
    id: string,
    questionText: string,
    options: Array< string >,
    correctAnswerIndex: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateBrailleSymbolMutationVariables = {
  input: CreateBrailleSymbolInput,
  condition?: ModelBrailleSymbolConditionInput | null,
};

export type CreateBrailleSymbolMutation = {
  createBrailleSymbol?:  {
    __typename: "BrailleSymbol",
    id: string,
    letter: string,
    description: string,
    imageKey: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateBrailleSymbolMutationVariables = {
  input: UpdateBrailleSymbolInput,
  condition?: ModelBrailleSymbolConditionInput | null,
};

export type UpdateBrailleSymbolMutation = {
  updateBrailleSymbol?:  {
    __typename: "BrailleSymbol",
    id: string,
    letter: string,
    description: string,
    imageKey: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteBrailleSymbolMutationVariables = {
  input: DeleteBrailleSymbolInput,
  condition?: ModelBrailleSymbolConditionInput | null,
};

export type DeleteBrailleSymbolMutation = {
  deleteBrailleSymbol?:  {
    __typename: "BrailleSymbol",
    id: string,
    letter: string,
    description: string,
    imageKey: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetProgressQueryVariables = {
  id: string,
};

export type GetProgressQuery = {
  getProgress?:  {
    __typename: "Progress",
    id: string,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleNumber?: number | null,
    accuracy?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    completed?: boolean | null,
    completedAt?: string | null,
    errorDetails?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListProgressesQueryVariables = {
  id?: string | null,
  filter?: ModelProgressFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListProgressesQuery = {
  listProgresses?:  {
    __typename: "ModelProgressConnection",
    items:  Array< {
      __typename: "Progress",
      id: string,
      userId: string,
      moduleId: string,
      moduleNumber?: number | null,
      accuracy?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      completed?: boolean | null,
      completedAt?: string | null,
      errorDetails?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ProgressesByUserIdQueryVariables = {
  userId: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelProgressFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ProgressesByUserIdQuery = {
  progressesByUserId?:  {
    __typename: "ModelProgressConnection",
    items:  Array< {
      __typename: "Progress",
      id: string,
      userId: string,
      moduleId: string,
      moduleNumber?: number | null,
      accuracy?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      completed?: boolean | null,
      completedAt?: string | null,
      errorDetails?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ProgressesByModuleIdQueryVariables = {
  moduleId: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelProgressFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ProgressesByModuleIdQuery = {
  progressesByModuleId?:  {
    __typename: "ModelProgressConnection",
    items:  Array< {
      __typename: "Progress",
      id: string,
      userId: string,
      moduleId: string,
      moduleNumber?: number | null,
      accuracy?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      completed?: boolean | null,
      completedAt?: string | null,
      errorDetails?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetUserQueryVariables = {
  id: string,
};

export type GetUserQuery = {
  getUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    role: string,
    coins?: number | null,
    points?: number | null,
    modulesCompleted?: Array< number | null > | null,
    currentModule?: number | null,
    precision?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    achievements?:  {
      __typename: "ModelAchievementConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListUsersQueryVariables = {
  id?: string | null,
  filter?: ModelUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListUsersQuery = {
  listUsers?:  {
    __typename: "ModelUserConnection",
    items:  Array< {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type UsersByEmailQueryVariables = {
  email: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type UsersByEmailQuery = {
  usersByEmail?:  {
    __typename: "ModelUserConnection",
    items:  Array< {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetAchievementQueryVariables = {
  id: string,
};

export type GetAchievementQuery = {
  getAchievement?:  {
    __typename: "Achievement",
    id: string,
    title: string,
    description?: string | null,
    moduleNumber?: number | null,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListAchievementsQueryVariables = {
  id?: string | null,
  filter?: ModelAchievementFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListAchievementsQuery = {
  listAchievements?:  {
    __typename: "ModelAchievementConnection",
    items:  Array< {
      __typename: "Achievement",
      id: string,
      title: string,
      description?: string | null,
      moduleNumber?: number | null,
      userId: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type AchievementsByUserIdQueryVariables = {
  userId: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelAchievementFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type AchievementsByUserIdQuery = {
  achievementsByUserId?:  {
    __typename: "ModelAchievementConnection",
    items:  Array< {
      __typename: "Achievement",
      id: string,
      title: string,
      description?: string | null,
      moduleNumber?: number | null,
      userId: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetModuleQueryVariables = {
  id: string,
};

export type GetModuleQuery = {
  getModule?:  {
    __typename: "Module",
    id: string,
    title: string,
    description: string,
    moduleNumber: number,
    lessons?:  {
      __typename: "ModelLessonConnection",
      nextToken?: string | null,
    } | null,
    questions?:  {
      __typename: "ModelQuestionConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListModulesQueryVariables = {
  id?: string | null,
  filter?: ModelModuleFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListModulesQuery = {
  listModules?:  {
    __typename: "ModelModuleConnection",
    items:  Array< {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetLessonQueryVariables = {
  id: string,
};

export type GetLessonQuery = {
  getLesson?:  {
    __typename: "Lesson",
    id: string,
    title: string,
    content: string,
    image?: string | null,
    lessonNumber: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListLessonsQueryVariables = {
  id?: string | null,
  filter?: ModelLessonFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListLessonsQuery = {
  listLessons?:  {
    __typename: "ModelLessonConnection",
    items:  Array< {
      __typename: "Lesson",
      id: string,
      title: string,
      content: string,
      image?: string | null,
      lessonNumber: number,
      moduleId: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type LessonsByModuleIdAndLessonNumberQueryVariables = {
  moduleId: string,
  lessonNumber?: ModelIntKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelLessonFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type LessonsByModuleIdAndLessonNumberQuery = {
  lessonsByModuleIdAndLessonNumber?:  {
    __typename: "ModelLessonConnection",
    items:  Array< {
      __typename: "Lesson",
      id: string,
      title: string,
      content: string,
      image?: string | null,
      lessonNumber: number,
      moduleId: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetQuestionQueryVariables = {
  id: string,
};

export type GetQuestionQuery = {
  getQuestion?:  {
    __typename: "Question",
    id: string,
    questionText: string,
    options: Array< string >,
    correctAnswerIndex: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListQuestionsQueryVariables = {
  id?: string | null,
  filter?: ModelQuestionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListQuestionsQuery = {
  listQuestions?:  {
    __typename: "ModelQuestionConnection",
    items:  Array< {
      __typename: "Question",
      id: string,
      questionText: string,
      options: Array< string >,
      correctAnswerIndex: number,
      moduleId: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type QuestionsByModuleIdQueryVariables = {
  moduleId: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelQuestionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type QuestionsByModuleIdQuery = {
  questionsByModuleId?:  {
    __typename: "ModelQuestionConnection",
    items:  Array< {
      __typename: "Question",
      id: string,
      questionText: string,
      options: Array< string >,
      correctAnswerIndex: number,
      moduleId: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetBrailleSymbolQueryVariables = {
  id: string,
};

export type GetBrailleSymbolQuery = {
  getBrailleSymbol?:  {
    __typename: "BrailleSymbol",
    id: string,
    letter: string,
    description: string,
    imageKey: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListBrailleSymbolsQueryVariables = {
  id?: string | null,
  filter?: ModelBrailleSymbolFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  sortDirection?: ModelSortDirection | null,
};

export type ListBrailleSymbolsQuery = {
  listBrailleSymbols?:  {
    __typename: "ModelBrailleSymbolConnection",
    items:  Array< {
      __typename: "BrailleSymbol",
      id: string,
      letter: string,
      description: string,
      imageKey: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateProgressSubscriptionVariables = {
  filter?: ModelSubscriptionProgressFilterInput | null,
};

export type OnCreateProgressSubscription = {
  onCreateProgress?:  {
    __typename: "Progress",
    id: string,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleNumber?: number | null,
    accuracy?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    completed?: boolean | null,
    completedAt?: string | null,
    errorDetails?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateProgressSubscriptionVariables = {
  filter?: ModelSubscriptionProgressFilterInput | null,
};

export type OnUpdateProgressSubscription = {
  onUpdateProgress?:  {
    __typename: "Progress",
    id: string,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleNumber?: number | null,
    accuracy?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    completed?: boolean | null,
    completedAt?: string | null,
    errorDetails?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteProgressSubscriptionVariables = {
  filter?: ModelSubscriptionProgressFilterInput | null,
};

export type OnDeleteProgressSubscription = {
  onDeleteProgress?:  {
    __typename: "Progress",
    id: string,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleNumber?: number | null,
    accuracy?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    completed?: boolean | null,
    completedAt?: string | null,
    errorDetails?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
};

export type OnCreateUserSubscription = {
  onCreateUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    role: string,
    coins?: number | null,
    points?: number | null,
    modulesCompleted?: Array< number | null > | null,
    currentModule?: number | null,
    precision?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    achievements?:  {
      __typename: "ModelAchievementConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
};

export type OnUpdateUserSubscription = {
  onUpdateUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    role: string,
    coins?: number | null,
    points?: number | null,
    modulesCompleted?: Array< number | null > | null,
    currentModule?: number | null,
    precision?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    achievements?:  {
      __typename: "ModelAchievementConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
};

export type OnDeleteUserSubscription = {
  onDeleteUser?:  {
    __typename: "User",
    id: string,
    name: string,
    email: string,
    role: string,
    coins?: number | null,
    points?: number | null,
    modulesCompleted?: Array< number | null > | null,
    currentModule?: number | null,
    precision?: number | null,
    correctAnswers?: number | null,
    wrongAnswers?: number | null,
    timeSpent?: number | null,
    achievements?:  {
      __typename: "ModelAchievementConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateAchievementSubscriptionVariables = {
  filter?: ModelSubscriptionAchievementFilterInput | null,
};

export type OnCreateAchievementSubscription = {
  onCreateAchievement?:  {
    __typename: "Achievement",
    id: string,
    title: string,
    description?: string | null,
    moduleNumber?: number | null,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateAchievementSubscriptionVariables = {
  filter?: ModelSubscriptionAchievementFilterInput | null,
};

export type OnUpdateAchievementSubscription = {
  onUpdateAchievement?:  {
    __typename: "Achievement",
    id: string,
    title: string,
    description?: string | null,
    moduleNumber?: number | null,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteAchievementSubscriptionVariables = {
  filter?: ModelSubscriptionAchievementFilterInput | null,
};

export type OnDeleteAchievementSubscription = {
  onDeleteAchievement?:  {
    __typename: "Achievement",
    id: string,
    title: string,
    description?: string | null,
    moduleNumber?: number | null,
    userId: string,
    user?:  {
      __typename: "User",
      id: string,
      name: string,
      email: string,
      role: string,
      coins?: number | null,
      points?: number | null,
      modulesCompleted?: Array< number | null > | null,
      currentModule?: number | null,
      precision?: number | null,
      correctAnswers?: number | null,
      wrongAnswers?: number | null,
      timeSpent?: number | null,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateModuleSubscriptionVariables = {
  filter?: ModelSubscriptionModuleFilterInput | null,
};

export type OnCreateModuleSubscription = {
  onCreateModule?:  {
    __typename: "Module",
    id: string,
    title: string,
    description: string,
    moduleNumber: number,
    lessons?:  {
      __typename: "ModelLessonConnection",
      nextToken?: string | null,
    } | null,
    questions?:  {
      __typename: "ModelQuestionConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateModuleSubscriptionVariables = {
  filter?: ModelSubscriptionModuleFilterInput | null,
};

export type OnUpdateModuleSubscription = {
  onUpdateModule?:  {
    __typename: "Module",
    id: string,
    title: string,
    description: string,
    moduleNumber: number,
    lessons?:  {
      __typename: "ModelLessonConnection",
      nextToken?: string | null,
    } | null,
    questions?:  {
      __typename: "ModelQuestionConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteModuleSubscriptionVariables = {
  filter?: ModelSubscriptionModuleFilterInput | null,
};

export type OnDeleteModuleSubscription = {
  onDeleteModule?:  {
    __typename: "Module",
    id: string,
    title: string,
    description: string,
    moduleNumber: number,
    lessons?:  {
      __typename: "ModelLessonConnection",
      nextToken?: string | null,
    } | null,
    questions?:  {
      __typename: "ModelQuestionConnection",
      nextToken?: string | null,
    } | null,
    progress?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateLessonSubscriptionVariables = {
  filter?: ModelSubscriptionLessonFilterInput | null,
};

export type OnCreateLessonSubscription = {
  onCreateLesson?:  {
    __typename: "Lesson",
    id: string,
    title: string,
    content: string,
    image?: string | null,
    lessonNumber: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateLessonSubscriptionVariables = {
  filter?: ModelSubscriptionLessonFilterInput | null,
};

export type OnUpdateLessonSubscription = {
  onUpdateLesson?:  {
    __typename: "Lesson",
    id: string,
    title: string,
    content: string,
    image?: string | null,
    lessonNumber: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteLessonSubscriptionVariables = {
  filter?: ModelSubscriptionLessonFilterInput | null,
};

export type OnDeleteLessonSubscription = {
  onDeleteLesson?:  {
    __typename: "Lesson",
    id: string,
    title: string,
    content: string,
    image?: string | null,
    lessonNumber: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateQuestionSubscriptionVariables = {
  filter?: ModelSubscriptionQuestionFilterInput | null,
};

export type OnCreateQuestionSubscription = {
  onCreateQuestion?:  {
    __typename: "Question",
    id: string,
    questionText: string,
    options: Array< string >,
    correctAnswerIndex: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateQuestionSubscriptionVariables = {
  filter?: ModelSubscriptionQuestionFilterInput | null,
};

export type OnUpdateQuestionSubscription = {
  onUpdateQuestion?:  {
    __typename: "Question",
    id: string,
    questionText: string,
    options: Array< string >,
    correctAnswerIndex: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteQuestionSubscriptionVariables = {
  filter?: ModelSubscriptionQuestionFilterInput | null,
};

export type OnDeleteQuestionSubscription = {
  onDeleteQuestion?:  {
    __typename: "Question",
    id: string,
    questionText: string,
    options: Array< string >,
    correctAnswerIndex: number,
    moduleId: string,
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateBrailleSymbolSubscriptionVariables = {
  filter?: ModelSubscriptionBrailleSymbolFilterInput | null,
};

export type OnCreateBrailleSymbolSubscription = {
  onCreateBrailleSymbol?:  {
    __typename: "BrailleSymbol",
    id: string,
    letter: string,
    description: string,
    imageKey: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateBrailleSymbolSubscriptionVariables = {
  filter?: ModelSubscriptionBrailleSymbolFilterInput | null,
};

export type OnUpdateBrailleSymbolSubscription = {
  onUpdateBrailleSymbol?:  {
    __typename: "BrailleSymbol",
    id: string,
    letter: string,
    description: string,
    imageKey: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteBrailleSymbolSubscriptionVariables = {
  filter?: ModelSubscriptionBrailleSymbolFilterInput | null,
};

export type OnDeleteBrailleSymbolSubscription = {
  onDeleteBrailleSymbol?:  {
    __typename: "BrailleSymbol",
    id: string,
    letter: string,
    description: string,
    imageKey: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};
