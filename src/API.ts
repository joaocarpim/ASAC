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

export type ModelUserConnection = {
  __typename: "ModelUserConnection",
  items:  Array<User | null >,
  nextToken?: string | null,
};

export type ModelSubscriptionUserFilterInput = {
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
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  id?: string | null,
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
  } | null,
};

export type OnUpdateUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  id?: string | null,
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
  } | null,
};

export type OnDeleteUserSubscriptionVariables = {
  filter?: ModelSubscriptionUserFilterInput | null,
  id?: string | null,
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
  } | null,
};
