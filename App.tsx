import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./src/navigation/types";
import { useAuthStore } from "./src/store/authStore";

// Amplify
import { Amplify } from "aws-amplify";
import { Hub, HubCapsule } from "aws-amplify/utils";

// @ts-ignore
import awsconfig from "./aws-exports";
Amplify.configure(awsconfig);

// Importe TODAS as suas telas aqui
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
import AlphabetScreen from "./src/screens/module/AlphabetScreen"; // 👈 Importe a nova tela
import ModuleResultsScreen from "./src/screens/module/ModuleResultScreen";

type AuthEventPayload = { event: string; data?: any; message?: string };
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { user, isLoading, checkUser, logout } = useAuthStore();

  useEffect(() => {
    console.log("🚀 App: Inicializando...");

    // Verifica o usuário na inicialização
    checkUser();

    // Configura o Hub para escutar eventos de autenticação
    const hubListener = (data: HubCapsule<"auth", AuthEventPayload>) => {
      console.log("🔔 App: Evento do Hub:", data.payload.event);

      if (data.payload.event === "signedIn") {
        console.log("✅ App: usuário logou - verificando dados...");
        checkUser();
      } else if (data.payload.event === "signedOut") {
        console.log("🚪 App: usuário deslogou");
        logout();
      }
    };

    const unsubscribe = Hub.listen("auth", hubListener);
    return () => {
      console.log("🔌 App: Desconectando Hub listener");
      unsubscribe();
    };
  }, [checkUser, logout]);

  // Log do estado atual para debug
  useEffect(() => {
    console.log("📊 App Estado:", {
      isLoading,
      hasUser: !!user,
      isAdmin: user?.isAdmin,
      username: user?.username,
    });
  }, [user, isLoading]);

  if (isLoading) {
    console.log("⏳ App: Mostrando loading...");
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#191970" />
      </View>
    );
  }

  return (
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            // Grupo de Telas para Usuários Deslogados
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
            </Stack.Group>
          ) : user.isAdmin ? (
            // Grupo de Telas para Administradores Logados
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
            // Grupo de Telas para Usuários Normais Logados
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
              <Stack.Screen name="ModuleQuiz" component={ModuleQuizScreen} />
              <Stack.Screen name="Alphabet" component={AlphabetScreen} />
              <Stack.Screen
                name="ModuleResults"
                component={ModuleResultsScreen}
              />
            </Stack.Group>
          )}
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
