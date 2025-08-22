import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./src/navigation/types";

// Amplify
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "@aws-amplify/auth";
import { Hub, HubCapsule } from "aws-amplify/utils";
// @ts-ignore
import awsconfig from "./aws-exports";

Amplify.configure(awsconfig);

// Seus imports de telas
import WelcomeScreen from "./src/screens/onboarding/welcome";
import TutorialStep1Screen from "./src/screens/onboarding/TutorialStep1Screen";
import TutorialStep2Screen from "./src/screens/onboarding/TutorialStep2Screen";
import TutorialStep3Screen from "./src/screens/onboarding/TutorialStep3Screen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";
import ConfirmSignUpScreen from "./src/screens/auth/ConfirmSignUpScreen";
import HomeScreen from "./src/screens/main/HomeScreen";
import RankingScreen from "./src/screens/main/RankingScreen";
import AchievementsScreen from "./src/screens/main/AchievementsScreen";
import ProgressScreen from "./src/screens/main/ProgressScreen";
import SettingsScreen from "./src/screens/settings/SettingsScreen";
import ModuleContentScreen from "./src/screens/module/ModuleContentScreen";
import ModulePreQuizScreen from "./src/screens/module/ModulePreQuizScreen";
import ModuleQuizScreen from "./src/screens/module/ModuleQuizScreen";
import AdminDashboardScreen from "./src/screens/admin/AdminDashboardScreen";
import AdminUserDetailScreen from "./src/screens/admin/AdminUserDetailScreen";
import AdminIncorrectAnswersScreen from "./src/screens/admin/AdminIncorrectAnswersScreen";
import AdminRegisterUserScreen from "./src/screens/admin/AdminRegisterUserScreen";
import { SettingsProvider } from "./src/context/SettingsContext";

type User = { userId: string; username: string };
type AuthEventPayload = { event: string; data?: any; message?: string };

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { tokens } = await fetchAuthSession();
        if (!tokens) {
          setUser(null);
          setIsAdmin(false);
          return;
        }
        const { sub, username } = tokens.accessToken.payload;
        setUser({ userId: sub as string, username: username as string });

        const cognitoGroups = tokens.accessToken.payload["cognito:groups"];
        if (Array.isArray(cognitoGroups) && cognitoGroups.includes("Admins")) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        setUser(null);
        setIsAdmin(false);
      }
    };
    checkUser();

    const hubListener = (data: HubCapsule<"auth", AuthEventPayload>) => {
      if (data.payload.event === "signedIn") checkUser();
      if (data.payload.event === "signedOut") {
        setUser(null);
        setIsAdmin(false);
      }
    };
    const unsubscribe = Hub.listen("auth", hubListener);
    return () => unsubscribe();
  }, []);

  if (user === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#191970" />
      </View>
    );
  }

  const getInitialRoute = (): keyof RootStackParamList => {
    if (user) {
      return isAdmin ? "AdminDashboard" : "Home";
    }
    return "Welcome";
  };

  return (
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={getInitialRoute()}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="TutorialStep1" component={TutorialStep1Screen} />
          <Stack.Screen name="TutorialStep2" component={TutorialStep2Screen} />
          <Stack.Screen name="TutorialStep3" component={TutorialStep3Screen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="ConfirmSignUp" component={ConfirmSignUpScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Ranking" component={RankingScreen} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ModuleContent" component={ModuleContentScreen} />
          <Stack.Screen name="ModulePreQuiz" component={ModulePreQuizScreen} />
          <Stack.Screen name="ModuleQuiz" component={ModuleQuizScreen} />
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboardScreen}
          />
          <Stack.Screen
            name="AdminUserDetail"
            component={AdminUserDetailScreen}
          />
          <Stack.Screen
            name="AdminIncorrectAnswers"
            component={AdminIncorrectAnswersScreen}
          />
          <Stack.Screen
            name="AdminRegisterUser"
            component={AdminRegisterUserScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFC700",
  },
});
