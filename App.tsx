// App.tsx

import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import awsmobile from "./src/aws-exports";
import amplifyConfig from "./src/config/amplify-config";

if (process.env.NODE_ENV === "production") {
  Amplify.configure(amplifyConfig);
} else {
  Amplify.configure(awsmobile);
}

import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ViewShot from "react-native-view-shot";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";

// Store & Contextos
import { useAuthStore } from "./src/store/authStore";
import { ContrastProvider, useContrastTheme } from "./src/context/ContrastProvider";
import { AccessibilityProvider, useAccessibility } from "./src/context/AccessibilityProvider";
import { SettingsProvider as AccessibilitySettingsProvider } from "./src/context/SettingsProvider";

// Componentes Acessibilidade
import MagnifierLens from "./src/components/MagnifierLens";
import AccessibilityHub from "./src/components/AccessibilityHub";

// Rotas
import { RootStackParamList } from "./src/navigation/types";
const Stack = createNativeStackNavigator<RootStackParamList>();

// Telas Onboarding/Auth
import WelcomeScreen from "./src/screens/onboarding/welcome";
import TutorialStep1Screen from "./src/screens/onboarding/TutorialStep1Screen";
import TutorialStep2Screen from "./src/screens/onboarding/TutorialStep2Screen";
import TutorialStep3Screen from "./src/screens/onboarding/TutorialStep3Screen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";
import ConfirmSignUpScreen from "./src/screens/auth/ConfirmSignUpScreen";
import NewPasswordScreen from "./src/screens/auth/NewPasswordScreen";

// Telas Usuário
import HomeScreen from "./src/screens/main/HomeScreen";
import RankingScreen from "./src/screens/main/RankingScreen";
import AchievementsScreen from "./src/screens/main/AchievementsScreen";
import ProgressScreen from "./src/screens/main/ProgressScreen";
import SettingsScreen from "./src/screens/settings/SettingsScreen";
import SelectedContrastScreen from "./src/screens/settings/SelectedContrast";
import ModuleContentScreen from "./src/screens/module/ModuleContentScreen";
import ModulePreQuizScreen from "./src/screens/module/ModulePreQuizScreen";
import ModuleQuizScreen from "./src/screens/module/ModuleQuizScreen";
import ModuleResultScreen from "./src/screens/module/ModuleResultScreen";
import BrailleScreen from "./src/screens/module/BrailleScreen";
import BrailleAlphabetScreen from "./src/screens/module/BrailleAlphabetScreen";
import LearningPathScreen from "./src/screens/session/LearningPathScreen";
import BraillePracticeScreen from "./src/screens/session/BraillePracticeScreen";

// Telas Admin
import AdminDashboardScreen from "./src/screens/admin/AdminDashboardScreen";
import AdminUserDetailScreen from "./src/screens/admin/AdminUserDetailScreen";
import AdminIncorrectAnswersScreen from "./src/screens/admin/AdminIncorrectAnswersScreen";
import AdminRegisterUserScreen from "./src/screens/admin/AdminRegisterUserScreen";

function AppNavigation() {
  const { theme } = useContrastTheme();
  const { user, isLoading, checkUser, signOut } = useAuthStore();
  const { panResponder, magnifier, magnifierPanResponder, clearAllElements } = useAccessibility();
  const viewShotRef = useRef<ViewShot>(null);
  const navigationRef = useNavigationContainerRef();
  const [currentRouteName, setCurrentRouteName] = useState<string | undefined>();

  useEffect(() => {
    checkUser();

    const sub = Hub.listen("auth", ({ payload }: { payload: any }) => {
      if (payload.event === "signedIn" || payload.event === "tokenRefresh") checkUser();
      if (payload.event === "signedOut") signOut();
    });

    return () => sub();
  }, [checkUser, signOut]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  return (
    <View style={[styles.fullscreen, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />

      <ViewShot ref={viewShotRef} style={{ flex: 1 }} options={{ format: "jpg", quality: 0.9 }}>
        <View
          style={{ flex: 1 }}
          {...(magnifier.isActive ? magnifierPanResponder.panHandlers : panResponder.panHandlers)}
        >
          <NavigationContainer
            ref={navigationRef}
            onReady={() => setCurrentRouteName(navigationRef.getCurrentRoute()?.name)}
          >
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {!user ? (
                <>
                  <Stack.Screen name="Welcome" component={WelcomeScreen} />
                  <Stack.Screen name="TutorialStep1" component={TutorialStep1Screen} />
                  <Stack.Screen name="TutorialStep2" component={TutorialStep2Screen} />
                  <Stack.Screen name="TutorialStep3" component={TutorialStep3Screen} />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                  <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                  <Stack.Screen name="ConfirmSignUp" component={ConfirmSignUpScreen} />
                  <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
                </>
              ) : user.isAdmin ? (
                <>
                  <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
                  <Stack.Screen name="AdminUserDetail" component={AdminUserDetailScreen} />
                  <Stack.Screen name="AdminIncorrectAnswers" component={AdminIncorrectAnswersScreen} />
                  <Stack.Screen name="AdminRegisterUser" component={AdminRegisterUserScreen} />
                </>
              ) : (
                <>
                  <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen name="Ranking" component={RankingScreen} />
                  <Stack.Screen name="Achievements" component={AchievementsScreen} />
                  <Stack.Screen name="Progress" component={ProgressScreen} />
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                  <Stack.Screen name="ModuleContent" component={ModuleContentScreen} />
                  <Stack.Screen name="ModulePreQuiz" component={ModulePreQuizScreen} />
                  <Stack.Screen name="ModuleQuiz" component={ModuleQuizScreen} />
                  <Stack.Screen name="ModuleResult" component={ModuleResultScreen} />
                  <Stack.Screen name="Alphabet" component={BrailleAlphabetScreen} />
                  <Stack.Screen name="Contrast" component={SelectedContrastScreen} />
                  <Stack.Screen name="Braille" component={BrailleScreen} />
                  <Stack.Screen name="LearningPath" component={LearningPathScreen} />
                  <Stack.Screen name="BraillePractice" component={BraillePracticeScreen} />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>

          {magnifier.isActive && <MagnifierLens viewShotRef={viewShotRef} />}
          <AccessibilityHub />
        </View>
      </ViewShot>
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    "OpenDyslexic-Regular": require("./assets/fonts/OpenDyslexic-Regular.otf"),
  });

  if (!fontsLoaded) return null;

  return (
    <AccessibilityProvider>
      <ContrastProvider>
        <AccessibilitySettingsProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppNavigation />
          </GestureHandlerRootView>
        </AccessibilitySettingsProvider>
      </ContrastProvider>
    </AccessibilityProvider>
  );
}

const styles = StyleSheet.create({
  fullscreen: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
