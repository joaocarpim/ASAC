// App.tsx
import React from "react";
import { Amplify } from "aws-amplify";
import outputs from "./amplify_outputs.json";

// Importe a nova tela de boas-vindas
import BemVindoScreen from "./src/screens/BemvindoScreen";

// Configure o Amplify (isso já estava correto)
Amplify.configure(outputs);

const App = () => {
  // Por enquanto, vamos retornar apenas a tela de boas-vindas
  return <BemVindoScreen />;
};

export default App;
