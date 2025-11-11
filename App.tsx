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
import {
  NavigationContainer,
  DefaultTheme,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ViewShot from "react-native-view-shot";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";

// Store & Contextos
import { useAuthStore } from "./src/store/authStore";
import {
  ContrastProvider,
  useContrastTheme,
} from "./src/context/ContrastProvider";
import {
  AccessibilityProvider,
  useAccessibility,
} from "./src/context/AccessibilityProvider";
import { SettingsProvider as AccessibilitySettingsProvider } from "./src/context/SettingsProvider";

// ✅ 1. IMPORTAR O SUJEITO E O OBSERVADOR
import { moduleCompletionSubject } from "./src/services/ModuleCompletionSubject";
import { notificationObserver } from "./src/observers/NotificationObserver";

// ✅ 2. IMPORTAR O MODAL VISUAL
import { CompletionModal } from "./src/components/modal/CompletionModal";

// Rotas
import { RootStackParamList } from "./src/navigation/types";
const Stack = createNativeStackNavigator<RootStackParamList>();

// Telas (importações)
import WelcomeScreen from "./src/screens/onboarding/welcome";
import TutorialStep1Screen from "./src/screens/onboarding/TutorialStep1Screen";
import TutorialStep2Screen from "./src/screens/onboarding/TutorialStep2Screen";
import TutorialStep3Screen from "./src/screens/onboarding/TutorialStep3Screen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";
import ConfirmSignUpScreen from "./src/screens/auth/ConfirmSignUpScreen";
import NewPasswordScreen from "./src/screens/auth/NewPasswordScreen";
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
import LearningPathScreen from "./src/screens/session/LearningPathScreen";
import BraillePracticeScreen from "./src/screens/session/BraillePracticeScreen";
import IncorrectAnswersScreen from "./src/screens/main/IncorrectAnswersScreen";
import AlphabetSectionsScreen from "./src/screens/session/AlphabetSectionsScreen";
import AlphabetLessonScreen from "./src/screens/session/AlphabetLessonScreen";
import AdminDashboardScreen from "./src/screens/admin/AdminDashboardScreen";
import AdminUserDetailScreen from "./src/screens/admin/AdminUserDetailScreen";
import AdminIncorrectAnswersScreen from "./src/screens/admin/AdminIncorrectAnswersScreen";
import AdminRegisterUserScreen from "./src/screens/admin/AdminRegisterUserScreen";

function AppNavigation() {
  const { theme } = useContrastTheme();
  const { user, isLoading, checkUser, signOut } = useAuthStore();
  const { panResponder, magnifier, magnifierPanResponder } = useAccessibility();
  const viewShotRef = useRef<ViewShot>(null);
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    checkUser();
    const sub = Hub.listen("auth", ({ payload }: { payload: any }) => {
      if (payload.event === "signedIn" || payload.event === "tokenRefresh")
        checkUser();
      if (payload.event === "signedOut") signOut();
    });
    return () => sub();
  }, [checkUser, signOut]);

  // Efeito para registrar o observador
  useEffect(() => {
    console.log("[App] Registrando NotificationObserver...");
    moduleCompletionSubject.subscribe(notificationObserver);
    return () => {
      console.log("[App] Desregistrando NotificationObserver...");
      moduleCompletionSubject.unsubscribe(notificationObserver);
    };
  }, []);

  return (
    <View style={[styles.fullscreen, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <ViewShot
        ref={viewShotRef}
        style={{ flex: 1 }}
        options={{ format: "jpg", quality: 0.9 }}
      >
        <View
          style={{ flex: 1 }}
          {...(magnifier.isActive
            ? magnifierPanResponder.panHandlers
            : panResponder.panHandlers)}
        >
          <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {isLoading ? (
                <Stack.Screen name="Loading">
                  {() => (
                    <View
                      style={[
                        styles.loadingContainer,
                        { backgroundColor: theme.background },
                      ]}
                    >
                      <ActivityIndicator size="large" color={theme.text} />
                    </View>
                  )}
                </Stack.Screen>
              ) : !user ? (
                <>
                  <Stack.Screen name="Welcome" component={WelcomeScreen} />
                  <Stack.Screen
                    name="TutorialStep1"
                    component={TutorialStep1Screen}
                  />
                  <Stack.Screen
                    name="TutorialStep2"
                    component={TutorialStep2Screen}
                  />
                  <Stack.Screen
                    name="TutorialStep3"
                    component={TutorialStep3Screen}
                  />
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen
                    name="ForgotPassword"
                    component={ForgotPasswordScreen}
                  />
                  <Stack.Screen
                    name="ResetPassword"
                    component={ResetPasswordScreen}
                  />
                  <Stack.Screen
                    name="ConfirmSignUp"
                    component={ConfirmSignUpScreen}
                  />
                  <Stack.Screen
                    name="NewPassword"
                    component={NewPasswordScreen}
                  />
                </>
              ) : user.isAdmin ? (
                <>
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
                </>
              ) : (
                <>
                  <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen name="Ranking" component={RankingScreen} />
                  <Stack.Screen
                    name="Achievements"
                    component={AchievementsScreen}
                  />
                  <Stack.Screen name="Progress" component={ProgressScreen} />
                  <Stack.Screen name="Settings" component={SettingsScreen} />
                  <Stack.Screen
                    name="ModuleContent"
                    component={ModuleContentScreen}
                  />
                  <Stack.Screen
                    name="ModulePreQuiz"
                    component={ModulePreQuizScreen}
                  />
                  <Stack.Screen
                    name="ModuleQuiz"
                    component={ModuleQuizScreen}
                  />
                  <Stack.Screen
                    name="ModuleResult"
                    component={ModuleResultScreen}
                  />
                  <Stack.Screen
                    name="Contrast"
                    component={SelectedContrastScreen}
                  />
                  <Stack.Screen
                    name="LearningPath"
                    component={LearningPathScreen}
                  />
                  <Stack.Screen
                    name="BraillePractice"
                    component={BraillePracticeScreen}
                  />
                  <Stack.Screen
                    name="IncorrectAnswers"
                    component={IncorrectAnswersScreen}
                  />
                  <Stack.Screen
                    name="AlphabetSections"
                    component={AlphabetSectionsScreen}
                  />
                  <Stack.Screen
                    name="AlphabetLesson"
                    component={AlphabetLessonScreen}
                  />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
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
    <AccessibilityProvider
      speechConfig={{ lang: "pt-BR", rate: 0.9, volume: 1.0 }}
    >
      <ContrastProvider>
        <AccessibilitySettingsProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppNavigation />

            {/* ✅ 3. RENDERIZAR O MODAL AQUI (FORA DA NAVEGAÇÃO) */}
            <CompletionModal />
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
