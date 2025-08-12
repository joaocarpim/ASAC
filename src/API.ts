/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateModuleInput = {
  id?: string | null,
  title: string,
  description?: string | null,
};

export type ModelModuleConditionInput = {
  title?: ModelStringInput | null,
  description?: ModelStringInput | null,
  and?: Array< ModelModuleConditionInput | null > | null,
  or?: Array< ModelModuleConditionInput | null > | null,
  not?: ModelModuleConditionInput | null,
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

export type Module = {
  __typename: "Module",
  id: string,
  title: string,
  description?: string | null,
  exercises?: ModelExerciseConnection | null,
  createdAt: string,
  updatedAt: string,
};

export type ModelExerciseConnection = {
  __typename: "ModelExerciseConnection",
  items:  Array<Exercise | null >,
  nextToken?: string | null,
};

export type Exercise = {
  __typename: "Exercise",
  id: string,
  moduleID: string,
  question: string,
  correctAnswer: string,
  mediaUrl?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type UpdateModuleInput = {
  id: string,
  title?: string | null,
  description?: string | null,
};

export type DeleteModuleInput = {
  id: string,
};

export type CreateExerciseInput = {
  id?: string | null,
  moduleID: string,
  question: string,
  correctAnswer: string,
  mediaUrl?: string | null,
};

export type ModelExerciseConditionInput = {
  moduleID?: ModelIDInput | null,
  question?: ModelStringInput | null,
  correctAnswer?: ModelStringInput | null,
  mediaUrl?: ModelStringInput | null,
  and?: Array< ModelExerciseConditionInput | null > | null,
  or?: Array< ModelExerciseConditionInput | null > | null,
  not?: ModelExerciseConditionInput | null,
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

export type UpdateExerciseInput = {
  id: string,
  moduleID?: string | null,
  question?: string | null,
  correctAnswer?: string | null,
  mediaUrl?: string | null,
};

export type DeleteExerciseInput = {
  id: string,
};

export type CreateProgressInput = {
  id?: string | null,
  userID: string,
  moduleID: string,
  hits: number,
  misses: number,
  timeSpent: number,
  completed: boolean,
};

export type ModelProgressConditionInput = {
  userID?: ModelIDInput | null,
  moduleID?: ModelIDInput | null,
  hits?: ModelIntInput | null,
  misses?: ModelIntInput | null,
  timeSpent?: ModelIntInput | null,
  completed?: ModelBooleanInput | null,
  and?: Array< ModelProgressConditionInput | null > | null,
  or?: Array< ModelProgressConditionInput | null > | null,
  not?: ModelProgressConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
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

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Progress = {
  __typename: "Progress",
  id: string,
  userID: string,
  moduleID: string,
  hits: number,
  misses: number,
  timeSpent: number,
  completed: boolean,
  createdAt: string,
  updatedAt: string,
};

export type UpdateProgressInput = {
  id: string,
  userID?: string | null,
  moduleID?: string | null,
  hits?: number | null,
  misses?: number | null,
  timeSpent?: number | null,
  completed?: boolean | null,
};

export type DeleteProgressInput = {
  id: string,
};

export type CreateUserInput = {
  id?: string | null,
  email: string,
  name: string,
  role: string,
  coins: number,
  points: number,
};

export type ModelUserConditionInput = {
  email?: ModelStringInput | null,
  name?: ModelStringInput | null,
  role?: ModelStringInput | null,
  coins?: ModelIntInput | null,
  points?: ModelIntInput | null,
  and?: Array< ModelUserConditionInput | null > | null,
  or?: Array< ModelUserConditionInput | null > | null,
  not?: ModelUserConditionInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  owner?: ModelStringInput | null,
};

export type User = {
  __typename: "User",
  id: string,
  email: string,
  name: string,
  role: string,
  coins: number,
  points: number,
  progresses?: ModelProgressConnection | null,
  createdAt: string,
  updatedAt: string,
  owner?: string | null,
};

export type ModelProgressConnection = {
  __typename: "ModelProgressConnection",
  items:  Array<Progress | null >,
  nextToken?: string | null,
};

export type UpdateUserInput = {
  id: string,
  email?: string | null,
  name?: string | null,
  role?: string | null,
  coins?: number | null,
  points?: number | null,
};

export type DeleteUserInput = {
  id: string,
};

export type ModelModuleFilterInput = {
  id?: ModelIDInput | null,
  title?: ModelStringInput | null,
  description?: ModelStringInput | null,
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

export type ModelExerciseFilterInput = {
  id?: ModelIDInput | null,
  moduleID?: ModelIDInput | null,
  question?: ModelStringInput | null,
  correctAnswer?: ModelStringInput | null,
  mediaUrl?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelExerciseFilterInput | null > | null,
  or?: Array< ModelExerciseFilterInput | null > | null,
  not?: ModelExerciseFilterInput | null,
};

export type ModelProgressFilterInput = {
  id?: ModelIDInput | null,
  userID?: ModelIDInput | null,
  moduleID?: ModelIDInput | null,
  hits?: ModelIntInput | null,
  misses?: ModelIntInput | null,
  timeSpent?: ModelIntInput | null,
  completed?: ModelBooleanInput | null,
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
  email?: ModelStringInput | null,
  name?: ModelStringInput | null,
  role?: ModelStringInput | null,
  coins?: ModelIntInput | null,
  points?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  and?: Array< ModelUserFilterInput | null > | null,
  or?: Array< ModelUserFilterInput | null > | null,
  not?: ModelUserFilterInput | null,
  owner?: ModelStringInput | null,
};

export type ModelUserConnection = {
  __typename: "ModelUserConnection",
  items:  Array<User | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionModuleFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  title?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionModuleFilterInput | null > | null,
  or?: Array< ModelSubscriptionModuleFilterInput | null > | null,
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

export type ModelSubscriptionExerciseFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  moduleID?: ModelSubscriptionIDInput | null,
  question?: ModelSubscriptionStringInput | null,
  correctAnswer?: ModelSubscriptionStringInput | null,
  mediaUrl?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionExerciseFilterInput | null > | null,
  or?: Array< ModelSubscriptionExerciseFilterInput | null > | null,
};

export type ModelSubscriptionProgressFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  userID?: ModelSubscriptionIDInput | null,
  moduleID?: ModelSubscriptionIDInput | null,
  hits?: ModelSubscriptionIntInput | null,
  misses?: ModelSubscriptionIntInput | null,
  timeSpent?: ModelSubscriptionIntInput | null,
  completed?: ModelSubscriptionBooleanInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionProgressFilterInput | null > | null,
  or?: Array< ModelSubscriptionProgressFilterInput | null > | null,
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

export type ModelSubscriptionBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
};

export type ModelSubscriptionUserFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  email?: ModelSubscriptionStringInput | null,
  name?: ModelSubscriptionStringInput | null,
  role?: ModelSubscriptionStringInput | null,
  coins?: ModelSubscriptionIntInput | null,
  points?: ModelSubscriptionIntInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionUserFilterInput | null > | null,
  or?: Array< ModelSubscriptionUserFilterInput | null > | null,
  owner?: ModelStringInput | null,
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
    description?: string | null,
    exercises?:  {
      __typename: "ModelExerciseConnection",
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
    description?: string | null,
    exercises?:  {
      __typename: "ModelExerciseConnection",
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
    description?: string | null,
    exercises?:  {
      __typename: "ModelExerciseConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateExerciseMutationVariables = {
  input: CreateExerciseInput,
  condition?: ModelExerciseConditionInput | null,
};

export type CreateExerciseMutation = {
  createExercise?:  {
    __typename: "Exercise",
    id: string,
    moduleID: string,
    question: string,
    correctAnswer: string,
    mediaUrl?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateExerciseMutationVariables = {
  input: UpdateExerciseInput,
  condition?: ModelExerciseConditionInput | null,
};

export type UpdateExerciseMutation = {
  updateExercise?:  {
    __typename: "Exercise",
    id: string,
    moduleID: string,
    question: string,
    correctAnswer: string,
    mediaUrl?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteExerciseMutationVariables = {
  input: DeleteExerciseInput,
  condition?: ModelExerciseConditionInput | null,
};

export type DeleteExerciseMutation = {
  deleteExercise?:  {
    __typename: "Exercise",
    id: string,
    moduleID: string,
    question: string,
    correctAnswer: string,
    mediaUrl?: string | null,
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
    userID: string,
    moduleID: string,
    hits: number,
    misses: number,
    timeSpent: number,
    completed: boolean,
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
    userID: string,
    moduleID: string,
    hits: number,
    misses: number,
    timeSpent: number,
    completed: boolean,
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
    userID: string,
    moduleID: string,
    hits: number,
    misses: number,
    timeSpent: number,
    completed: boolean,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateUserMutationVariables = {
  input: CreateUserInput,
  condition?: ModelUserConditionInput | null,
};

export type CreateUserMutation = {
  createUser?:  {
    __typename: "User",
    id: string,
    email: string,
    name: string,
    role: string,
    coins: number,
    points: number,
    progresses?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
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
    email: string,
    name: string,
    role: string,
    coins: number,
    points: number,
    progresses?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
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
    email: string,
    name: string,
    role: string,
    coins: number,
    points: number,
    progresses?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
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
    description?: string | null,
    exercises?:  {
      __typename: "ModelExerciseConnection",
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
      description?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetExerciseQueryVariables = {
  id: string,
};

export type GetExerciseQuery = {
  getExercise?:  {
    __typename: "Exercise",
    id: string,
    moduleID: string,
    question: string,
    correctAnswer: string,
    mediaUrl?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListExercisesQueryVariables = {
  filter?: ModelExerciseFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListExercisesQuery = {
  listExercises?:  {
    __typename: "ModelExerciseConnection",
    items:  Array< {
      __typename: "Exercise",
      id: string,
      moduleID: string,
      question: string,
      correctAnswer: string,
      mediaUrl?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetProgressQueryVariables = {
  id: string,
};

export type GetProgressQuery = {
  getProgress?:  {
    __typename: "Progress",
    id: string,
    userID: string,
    moduleID: string,
    hits: number,
    misses: number,
    timeSpent: number,
    completed: boolean,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListProgressesQueryVariables = {
  filter?: ModelProgressFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListProgressesQuery = {
  listProgresses?:  {
    __typename: "ModelProgressConnection",
    items:  Array< {
      __typename: "Progress",
      id: string,
      userID: string,
      moduleID: string,
      hits: number,
      misses: number,
      timeSpent: number,
      completed: boolean,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ExercisesByModuleIDQueryVariables = {
  moduleID: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelExerciseFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ExercisesByModuleIDQuery = {
  exercisesByModuleID?:  {
    __typename: "ModelExerciseConnection",
    items:  Array< {
      __typename: "Exercise",
      id: string,
      moduleID: string,
      question: string,
      correctAnswer: string,
      mediaUrl?: string | null,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ProgressesByUserIDQueryVariables = {
  userID: string,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelProgressFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ProgressesByUserIDQuery = {
  progressesByUserID?:  {
    __typename: "ModelProgressConnection",
    items:  Array< {
      __typename: "Progress",
      id: string,
      userID: string,
      moduleID: string,
      hits: number,
      misses: number,
      timeSpent: number,
      completed: boolean,
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
    email: string,
    name: string,
    role: string,
    coins: number,
    points: number,
    progresses?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
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
      email: string,
      name: string,
      role: string,
      coins: number,
      points: number,
      createdAt: string,
      updatedAt: string,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
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
    description?: string | null,
    exercises?:  {
      __typename: "ModelExerciseConnection",
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
    description?: string | null,
    exercises?:  {
      __typename: "ModelExerciseConnection",
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
    description?: string | null,
    exercises?:  {
      __typename: "ModelExerciseConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateExerciseSubscriptionVariables = {
  filter?: ModelSubscriptionExerciseFilterInput | null,
};

export type OnCreateExerciseSubscription = {
  onCreateExercise?:  {
    __typename: "Exercise",
    id: string,
    moduleID: string,
    question: string,
    correctAnswer: string,
    mediaUrl?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateExerciseSubscriptionVariables = {
  filter?: ModelSubscriptionExerciseFilterInput | null,
};

export type OnUpdateExerciseSubscription = {
  onUpdateExercise?:  {
    __typename: "Exercise",
    id: string,
    moduleID: string,
    question: string,
    correctAnswer: string,
    mediaUrl?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteExerciseSubscriptionVariables = {
  filter?: ModelSubscriptionExerciseFilterInput | null,
};

export type OnDeleteExerciseSubscription = {
  onDeleteExercise?:  {
    __typename: "Exercise",
    id: string,
    moduleID: string,
    question: string,
    correctAnswer: string,
    mediaUrl?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateProgressSubscriptionVariables = {
  filter?: ModelSubscriptionProgressFilterInput | null,
};

export type OnCreateProgressSubscription = {
  onCreateProgress?:  {
    __typename: "Progress",
    id: string,
    userID: string,
    moduleID: string,
    hits: number,
    misses: number,
    timeSpent: number,
    completed: boolean,
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
    userID: string,
    moduleID: string,
    hits: number,
    misses: number,
    timeSpent: number,
    completed: boolean,
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
    userID: string,
    moduleID: string,
    hits: number,
    misses: number,
    timeSpent: number,
    completed: boolean,
    createdAt: string,
    updatedAt: string,
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
    email: string,
    name: string,
    role: string,
    coins: number,
    points: number,
    progresses?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
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
    email: string,
    name: string,
    role: string,
    coins: number,
    points: number,
    progresses?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
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
    email: string,
    name: string,
    role: string,
    coins: number,
    points: number,
    progresses?:  {
      __typename: "ModelProgressConnection",
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    owner?: string | null,
  } | null,
};
