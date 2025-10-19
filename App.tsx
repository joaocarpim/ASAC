import { Amplify } from "aws-amplify";
import { Hub } from "aws-amplify/utils";
import awsmobile from "./aws-exports";
Amplify.configure(awsmobile);

import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, StyleSheet, StatusBar } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import ViewShot from "react-native-view-shot";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Providers
import {
  AccessibilityProvider,
  useAccessibility,
} from "./src/context/AccessibilityProvider";
import { ContrastProvider } from "./src/context/ContrastProvider";
import { useContrast } from "./src/hooks/useContrast";
import { SettingsProvider as AccessibilitySettingsProvider } from "./src/context/SettingsProvider";

// Tipagem e Store
import { RootStackParamList } from "./src/navigation/types";
import { useAuthStore } from "./src/store/authStore";

// Componentes
import AccessibilityHub from "./src/components/AccessibilityHub";
import MagnifierLens from "./src/components/MagnifierLens";

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
import AlphabetScreen from "./src/screens/module/AlphabetScreen";
import ModuleResultScreen from "./src/screens/module/ModuleResultScreen";
import BrailleScreen from "./src/screens/module/BrailleScreen";
import AdminDashboardScreen from "./src/screens/admin/AdminDashboardScreen";
import AdminUserDetailScreen from "./src/screens/admin/AdminUserDetailScreen";
import AdminIncorrectAnswersScreen from "./src/screens/admin/AdminIncorrectAnswersScreen";
import AdminRegisterUserScreen from "./src/screens/admin/AdminRegisterUserScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function isColorDark(hexColor: string): boolean {
  if (!hexColor || typeof hexColor !== "string") return false;
  const color = hexColor.startsWith("#") ? hexColor.slice(1) : hexColor;
  if (color.length !== 6) return false;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 149;
}

function AppNavigation() {
  const { user, isLoading, checkUser, signOut } = useAuthStore();
  const { panResponder, clearAllElements, magnifier, magnifierPanResponder } =
    useAccessibility();
  const { theme } = useContrast();
  const viewShotRef = useRef<ViewShot>(null);

  const navigationRef = useNavigationContainerRef();
  const [currentRouteName, setCurrentRouteName] = useState<
    string | undefined
  >();

  // Lista de telas onde o botão de acessibilidade NÃO deve aparecer
  const screensWithoutHub = [
    "ConfirmSignUp",
    "ForgotPassword",
    "Login",
    "NewPassword",
    "ResetPassword",
    "TutorialStep1",
    "TutorialStep2",
    "TutorialStep3",
    "Welcome",
    "Contrast", // Nome da rota para a tela SelectedContrast
  ];

  // Variável que controla a visibilidade do botão
  const showAccessibilityHub =
    !user?.isAdmin &&
    currentRouteName &&
    !screensWithoutHub.includes(currentRouteName);

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.background,
      card: theme.background,
    },
  };

  const isThemeDark = isColorDark(theme.background);

  useEffect(() => {
    checkUser();
    const hubListener = (capsule: any) => {
      const event = capsule?.payload?.event;
      if (event === "signedIn" || event === "tokenRefresh") checkUser();
      else if (event === "signedOut") signOut();
    };
    const unsubscribe = Hub.listen("auth", hubListener);
    return () => unsubscribe();
  }, [checkUser, signOut]);

  if (isLoading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  return (
    <View style={[styles.fullscreen, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isThemeDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <ViewShot
        ref={viewShotRef}
        style={{ flex: 1 }}
        options={{ format: "jpg", quality: 0.9 }}
        {...(magnifier.isActive
          ? magnifierPanResponder.panHandlers
          : panResponder.panHandlers)}
      >
        <View style={styles.fullscreen}>
          <NavigationContainer
            ref={navigationRef}
            theme={navigationTheme}
            onReady={() => {
              setCurrentRouteName(navigationRef.getCurrentRoute()?.name);
            }}
            onStateChange={() => {
              clearAllElements();
              const newRouteName = navigationRef.getCurrentRoute()?.name;
              setCurrentRouteName(newRouteName);
            }}
          >
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.background },
              }}
            >
              {!user ? (
                <Stack.Group>
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
                </Stack.Group>
              ) : user.isAdmin ? (
                <Stack.Group>
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
                </Stack.Group>
              ) : (
                <Stack.Group>
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
                  <Stack.Screen name="Alphabet" component={AlphabetScreen} />
                  <Stack.Screen
                    name="ModuleResult"
                    component={ModuleResultScreen}
                  />
                  <Stack.Screen
                    name="Contrast"
                    component={SelectedContrastScreen}
                  />
                  <Stack.Screen name="Braille" component={BrailleScreen} />
                </Stack.Group>
              )}
            </Stack.Navigator>
          </NavigationContainer>

          <MagnifierLens viewShotRef={viewShotRef} />
          {/* Renderização condicional do botão de acessibilidade */}
          {showAccessibilityHub && <AccessibilityHub />}
        </View>
      </ViewShot>
    </View>
  );
}

function AppContent() {
  const [fontsLoaded] = useFonts({
    "OpenDyslexic-Regular": require("./assets/fonts/OpenDyslexic-Regular.otf"),
  });
  const { theme } = useContrast();

  if (!fontsLoaded) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView
      style={[styles.fullscreen, { backgroundColor: theme.background }]}
    >
      <AppNavigation />
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <AccessibilityProvider
      speechConfig={{ lang: "pt-BR", rate: 0.9, volume: 1.0 }}
    >
      <ContrastProvider>
        <AccessibilitySettingsProvider>
          <AppContent />
        </AccessibilitySettingsProvider>
      </ContrastProvider>
    </AccessibilityProvider>
  );
}

const styles = StyleSheet.create({
  fullscreen: { flex: 1 },
  loadingContainer: {
    backgroundColor: "#fff",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
