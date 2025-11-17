// App.tsx CORRIGIDO FINAL

import "react-native-gesture-handler";
import React, { useEffect, useRef } from "react";
import { View, ActivityIndicator, StatusBar, StyleSheet } from "react-native";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ViewShot from "react-native-view-shot";
import { useFonts } from "expo-font";

// ===============================
// 🔐 AMPLIFY CONFIG
// ===============================
import "./src/config/amplify-config";
import { Hub } from "aws-amplify/utils";
import { useAuthStore } from "./src/store/authStore";

// ===============================
// CONTEXTOS
// ===============================
import { ContrastProvider, useContrast } from "./src/context/ContrastProvider";
import {
  AccessibilityProvider,
  useAccessibility,
} from "./src/context/AccessibilityProvider";
import { SettingsProvider as AccessibilitySettingsProvider } from "./src/context/SettingsProvider";

// ===============================
// OBSERVERS
// ===============================
import { moduleCompletionSubject } from "./src/services/ModuleCompletionSubject";
import { notificationObserver } from "./src/observers/NotificationObserver";
import { CompletionModal } from "./src/components/modal/CompletionModal";

// ===============================
// ROTAS & TIPOS
// ===============================
import { RootStackParamList } from "./src/navigation/types";
const Stack = createNativeStackNavigator<RootStackParamList>();

import IncorrectAnswersScreen from "./src/screens/main/IncorrectAnswersScreen";

// ===============================
// TELAS
// ===============================
import WelcomeScreen from "./src/screens/onboarding/welcome";
import TutorialStep1Screen from "./src/screens/onboarding/TutorialStepScreen";
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
import AlphabetSectionsScreen from "./src/screens/session/AlphabetSectionsScreen";
import AlphabetLessonScreen from "./src/screens/session/AlphabetLessonScreen";
import AdminDashboardScreen from "./src/screens/admin/AdminDashboardScreen";
import AdminUserDetailScreen from "./src/screens/admin/AdminUserDetailScreen";
import AdminIncorrectAnswersScreen from "./src/screens/admin/AdminIncorrectAnswersScreen";
import AdminRegisterUserScreen from "./src/screens/admin/AdminRegisterUserScreen";
import WritingChallengeIntroScreen from "./src/screens/writing/WritingChallengeIntroScreen";
import WritingChallengeRoulleteScreen from "./src/screens/writing/WritingChallengeRoulleteScreen";
import WritingChallengeGameScreen from "./src/screens/writing/WritingChallengeGameScreen";
import WritingChallengeSuccessScreen from "./src/screens/writing/WritingChallengeSuccessScreen";
import ContractionsHomeScreen from "./src/screens/contractions/ContractionsHomeScreen";
import ContractionsLessonScreen from "./src/screens/contractions/ContractionsLessonScreen";
import ContractionsRoulleteScreen from "./src/screens/contractions/ContractionsRoulleteScreen";
import ContractionsGameScreen from "./src/screens/contractions/ContractionsGameScreen";
import ContractionsSuccessScreen from "./src/screens/contractions/ContractionsSuccessScreen";

/* ============================================================
  📱 APP NAVIGATION
============================================================ */
function AppNavigation() {
  const navigationRef = useNavigationContainerRef();

  const { theme } = useContrast();
  const { user, isLoading, checkUser } = useAuthStore();

  const { panResponder, magnifier, magnifierPanResponder } = useAccessibility();

  const viewShotRef = useRef(null);

  // 🔐 Listener do Auth — SEM LOOP
  useEffect(() => {
    checkUser(); // carrega sessão ao abrir app

    const sub = Hub.listen("auth", ({ payload }) => {
      if (payload?.event === "signedIn") {
        checkUser();
      }
      if (payload?.event === "tokenRefresh") {
        checkUser();
      }

      // ⚠️ Nunca chamar signOut() aqui!
    });

    return () => sub();
  }, []);

  // 🔔 Observer de completions
  useEffect(() => {
    moduleCompletionSubject.subscribe(notificationObserver);
    return () => moduleCompletionSubject.unsubscribe(notificationObserver);
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <ViewShot ref={viewShotRef} style={{ flex: 1 }}>
        <View
          style={{ flex: 1, backgroundColor: theme.background }}
          {...(magnifier.isActive
            ? magnifierPanResponder.panHandlers
            : panResponder.panHandlers)}
        >
          <StatusBar
            barStyle={theme.statusBarStyle}
            backgroundColor={theme.background}
          />

          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* LOADING */}
            {isLoading && (
              <Stack.Screen name="Loading">
                {() => (
                  <View
                    style={[
                      styles.loading,
                      { backgroundColor: theme.background },
                    ]}
                  >
                    <ActivityIndicator size="large" color={theme.text} />
                  </View>
                )}
              </Stack.Screen>
            )}

            {/* PUBLIC ROUTES */}
            {!isLoading && !user && (
              <>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Tutorial" component={TutorialStep1Screen} />
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
            )}

            {/* ADMIN ROUTES */}
            {!isLoading && user?.isAdmin && (
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
            )}

            {/* NORMAL USER ROUTES */}
            {!isLoading && user && !user.isAdmin && (
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
                <Stack.Screen name="ModuleQuiz" component={ModuleQuizScreen} />
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
                <Stack.Screen
                  name="WritingChallengeIntro"
                  component={WritingChallengeIntroScreen}
                />
                <Stack.Screen
                  name="WritingChallengeRoullete"
                  component={WritingChallengeRoulleteScreen}
                />
                <Stack.Screen
                  name="WritingChallengeGame"
                  component={WritingChallengeGameScreen}
                />
                <Stack.Screen
                  name="WritingChallengeSuccess"
                  component={WritingChallengeSuccessScreen}
                />
                <Stack.Screen
                  name="ContractionsHome"
                  component={ContractionsHomeScreen}
                />
                <Stack.Screen
                  name="ContractionsLesson"
                  component={ContractionsLessonScreen}
                />
                <Stack.Screen
                  name="ContractionsRoullete"
                  component={ContractionsRoulleteScreen}
                />
                <Stack.Screen
                  name="ContractionsGame"
                  component={ContractionsGameScreen}
                />
                <Stack.Screen
                  name="ContractionsSuccess"
                  component={ContractionsSuccessScreen}
                />
              </>
            )}
          </Stack.Navigator>
        </View>
      </ViewShot>
    </NavigationContainer>
  );
}

/* ===============================
  ROOT WRAPPER
=============================== */
export default function App() {
  const [fontsLoaded] = useFonts({
    "OpenDyslexic-Regular": require("./assets/fonts/OpenDyslexic-Regular.otf"),
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AccessibilityProvider
        speechConfig={{ lang: "pt-BR", rate: 0.9, volume: 1.0 }}
      >
        <ContrastProvider>
          <AccessibilitySettingsProvider>
            <AppNavigation />
            <CompletionModal />
          </AccessibilitySettingsProvider>
        </ContrastProvider>
      </AccessibilityProvider>
    </GestureHandlerRootView>
  );
}

// ===============================
// STYLES
// ===============================
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
