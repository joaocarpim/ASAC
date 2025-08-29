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
  modulesCompleted?: string | null,
  precision?: string | null,
  correctAnswers?: number | null,
  timeSpent?: string | null,
};

export type ModelUserConditionInput = {
  name?: ModelStringInput | null,
  email?: ModelStringInput | null,
  role?: ModelStringInput | null,
  coins?: ModelIntInput | null,
  points?: ModelIntInput | null,
  modulesCompleted?: ModelStringInput | null,
  precision?: ModelStringInput | null,
  correctAnswers?: ModelIntInput | null,
  timeSpent?: ModelStringInput | null,
  and?: Array< ModelUserConditionInput | null > | null,
  or?: Array< ModelUserConditionInput | null > | null,
  not?: ModelUserConditionInput | null,
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

export type User = {
  __typename: "User",
  id: string,
  name: string,
  email: string,
  role: string,
  coins?: number | null,
  points?: number | null,
  modulesCompleted?: string | null,
  precision?: string | null,
  correctAnswers?: number | null,
  timeSpent?: string | null,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type UpdateUserInput = {
  id: string,
  name?: string | null,
  email?: string | null,
  role?: string | null,
  coins?: number | null,
  points?: number | null,
  modulesCompleted?: string | null,
  precision?: string | null,
  correctAnswers?: number | null,
  timeSpent?: string | null,
};

export type DeleteUserInput = {
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
};

export type Module = {
  __typename: "Module",
  id: string,
  title: string,
  description: string,
  moduleNumber: number,
  lessons?: ModelLessonConnection | null,
  questions?: ModelQuestionConnection | null,
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
  module?: Module | null,
  moduleId: string,
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
  module?: Module | null,
  moduleId: string,
  createdAt: string,
  updatedAt: string,
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

export type ModelUserFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  email?: ModelStringInput | null,
  role?: ModelStringInput | null,
  coins?: ModelIntInput | null,
  points?: ModelIntInput | null,
  modulesCompleted?: ModelStringInput | null,
  precision?: ModelStringInput | null,
  correctAnswers?: ModelIntInput | null,
  timeSpent?: ModelStringInput | null,
  and?: Array< ModelUserFilterInput | null > | null,
  or?: Array< ModelUserFilterInput | null > | null,
  not?: ModelUserFilterInput | null,
};

export type ModelUserConnection = {
  __typename: "ModelUserConnection",
  items:  Array<User | null >,
  nextToken?: string | null,
};

export type ModelModuleFilterInput = {
  id?: ModelIDInput | null,
  title?: ModelStringInput | null,
  description?: ModelStringInput | null,
  moduleNumber?: ModelIntInput | null,
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
  and?: Array< ModelLessonFilterInput | null > | null,
  or?: Array< ModelLessonFilterInput | null > | null,
  not?: ModelLessonFilterInput | null,
};

export type ModelQuestionFilterInput = {
  id?: ModelIDInput | null,
  questionText?: ModelStringInput | null,
  options?: ModelStringInput | null,
  correctAnswerIndex?: ModelIntInput | null,
  moduleId?: ModelIDInput | null,
  and?: Array< ModelQuestionFilterInput | null > | null,
  or?: Array< ModelQuestionFilterInput | null > | null,
  not?: ModelQuestionFilterInput | null,
};

export type ModelBrailleSymbolFilterInput = {
  id?: ModelIDInput | null,
  letter?: ModelStringInput | null,
  description?: ModelStringInput | null,
  imageKey?: ModelStringInput | null,
  and?: Array< ModelBrailleSymbolFilterInput | null > | null,
  or?: Array< ModelBrailleSymbolFilterInput | null > | null,
  not?: ModelBrailleSymbolFilterInput | null,
};

export type ModelBrailleSymbolConnection = {
  __typename: "ModelBrailleSymbolConnection",
  items:  Array<BrailleSymbol | null >,
  nextToken?: string | null,
};

export type ModelIntKeyConditionInput = {
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelSubscriptionUserFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  name?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  role?: ModelSubscriptionStringInput | null,
  coins?: ModelSubscriptionIntInput | null,
  points?: ModelSubscriptionIntInput | null,
  modulesCompleted?: ModelSubscriptionStringInput | null,
  precision?: ModelSubscriptionStringInput | null,
  correctAnswers?: ModelSubscriptionIntInput | null,
  timeSpent?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUserFilterInput | null > | null,
  or?: Array< ModelSubscriptionUserFilterInput | null > | null,
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

export type ModelSubscriptionModuleFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  title?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  moduleNumber?: ModelSubscriptionIntInput | null,
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
  and?: Array< ModelSubscriptionLessonFilterInput | null > | null,
  or?: Array< ModelSubscriptionLessonFilterInput | null > | null,
};

export type ModelSubscriptionQuestionFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  questionText?: ModelSubscriptionStringInput | null,
  options?: ModelSubscriptionStringInput | null,
  correctAnswerIndex?: ModelSubscriptionIntInput | null,
  moduleId?: ModelSubscriptionIDInput | null,
  and?: Array< ModelSubscriptionQuestionFilterInput | null > | null,
  or?: Array< ModelSubscriptionQuestionFilterInput | null > | null,
};

export type ModelSubscriptionBrailleSymbolFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  letter?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  imageKey?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionBrailleSymbolFilterInput | null > | null,
  or?: Array< ModelSubscriptionBrailleSymbolFilterInput | null > | null,
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
    modulesCompleted?: string | null,
    precision?: string | null,
    correctAnswers?: number | null,
    timeSpent?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
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
    modulesCompleted?: string | null,
    precision?: string | null,
    correctAnswers?: number | null,
    timeSpent?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
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
    modulesCompleted?: string | null,
    precision?: string | null,
    correctAnswers?: number | null,
    timeSpent?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
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
    modulesCompleted?: string | null,
    precision?: string | null,
    correctAnswers?: number | null,
    timeSpent?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type ListUsersQueryVariables = {
  filter?: ModelUserFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
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
      modulesCompleted?: string | null,
      precision?: string | null,
      correctAnswers?: number | null,
      timeSpent?: string | null,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
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
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListModulesQueryVariables = {
  filter?: ModelModuleFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListLessonsQueryVariables = {
  filter?: ModelLessonFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListQuestionsQueryVariables = {
  filter?: ModelQuestionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
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
  filter?: ModelBrailleSymbolFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
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

export type OnCreateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  owner?: string | null,
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
    modulesCompleted?: string | null,
    precision?: string | null,
    correctAnswers?: number | null,
    timeSpent?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnUpdateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  owner?: string | null,
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
    modulesCompleted?: string | null,
    precision?: string | null,
    correctAnswers?: number | null,
    timeSpent?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};

export type OnDeleteUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  owner?: string | null,
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
    modulesCompleted?: string | null,
    precision?: string | null,
    correctAnswers?: number | null,
    timeSpent?: string | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
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
    module?:  {
      __typename: "Module",
      id: string,
      title: string,
      description: string,
      moduleNumber: number,
      createdAt: string,
      updatedAt: string,
    } | null,
    moduleId: string,
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
