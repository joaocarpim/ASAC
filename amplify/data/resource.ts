// amplify/data/resource.ts

import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/* VERSÃO 4 - FINAL
  - A sintaxe correta é um array de strings, ex: ['userId'], como segundo argumento.
  - Removemos o objeto { references: ... }
*/
const schema = a.schema({
  User: a
    .model({
      username: a.string().required(),
      email: a.string().required(),
      points: a.integer(),
      coins: a.integer(),
      // Relação com sintaxe correta: a tabela Progress tem um campo 'userId'
      progress: a.hasMany("Progress", ["userId"]),
    })
    .authorization((allow) => [
      allow.owner().to(["read", "update"]),
      allow.group("Admin").to(["read"]),
    ]),

  Module: a
    .model({
      title: a.string().required(),
      description: a.string(),
      content: a.string(),
      mediaUrl: a.string(),
      // Relação com sintaxe correta: a tabela Exercise tem um campo 'moduleId'
      exercises: a.hasMany("Exercise", ["moduleId"]),
      // Relação com sintaxe correta: a tabela Progress tem um campo 'moduleId'
      progresses: a.hasMany("Progress", ["moduleId"]),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.group("Admin").to(["create", "read", "update", "delete"]),
    ]),

  Exercise: a
    .model({
      question: a.string().required(),
      options: a.string().array(),
      correctAnswer: a.string().required(),
      // 1. Definimos o campo de ligação
      moduleId: a.id().required(),
      // 2. Criamos a relação, referenciando o campo com a sintaxe correta
      module: a.belongsTo("Module", ["moduleId"]),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.group("Admin").to(["create", "read", "update", "delete"]),
    ]),

  Progress: a
    .model({
      accuracy: a.float(),
      correctAnswers: a.integer(),
      timeSpent: a.integer(),
      // 1. Definimos os campos de ligação
      userId: a.id().required(),
      moduleId: a.id().required(),
      // 2. Criamos as relações, referenciando os campos com a sintaxe correta
      user: a.belongsTo("User", ["userId"]),
      module: a.belongsTo("Module", ["moduleId"]),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group("Admin").to(["read"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
