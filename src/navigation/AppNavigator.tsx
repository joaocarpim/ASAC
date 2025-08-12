// src/navigation/AppNavigator.tsx

import React, { useState, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { type AuthUser, getCurrentUser } from "aws-amplify/auth";
// CORREÇÃO 1: O tipo 'HubPayload' foi removido da importação.
import { Hub } from "aws-amplify/utils";

// Importe suas telas
import SignUpScreen from "../screens/auth/SignUpScreen";
import HomeScreen from "../screens/HomeScreen";

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={HomeScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  const checkUser = async () => {
    try {
      const authUser = await getCurrentUser();
      setUser(authUser);
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    // CORREÇÃO 2: A assinatura da função foi alterada para descrever o formato do objeto diretamente.
    const listener = ({ payload }: { payload: { event: string } }) => {
      if (payload.event === "signedIn" || payload.event === "signedOut") {
        checkUser();
      }
    };

    const unsubscribe = Hub.listen("auth", listener);
    return unsubscribe;
  }, []);

  if (user === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return user ? <MainStack /> : <AuthStack />;
};

export default AppNavigator;
