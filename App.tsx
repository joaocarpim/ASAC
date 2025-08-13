// App.tsx
import React from "react";
import { Amplify } from "aws-amplify";
import outputs from "./amplify_outputs.json";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import BemVindoScreen from "./src/screens/BemvindoScreen";
import HomeScreen from "./src/screens/HomeScreen";

// Configuração do Amplify
Amplify.configure(outputs);

// Tipagem das rotas
export type RootStackParamList = {
  BemVindoScreen: undefined;
  HomeScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="BemVindoScreen">
        <Stack.Screen
          name="BemVindoScreen"
          component={BemVindoScreen}
          options={{ title: "Bem-vindo" }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: "Home" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
