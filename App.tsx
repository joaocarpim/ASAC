import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./src/navigation/types";

// Onboarding Screens
import WelcomeScreen from "./src/screens/onboarding/welcome";
import TutorialStep1Screen from "./src/screens/onboarding/TutorialStep1Screen";
import TutorialStep2Screen from "./src/screens/onboarding/TutorialStep2Screen";
import TutorialStep3Screen from "./src/screens/onboarding/TutorialStep3Screen";

// Auth Screens
import LoginScreen from "./src/screens/auth/LoginScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";

// Main App Screens
import HomeScreen from "./src/screens/main/HomeScreen";
import RankingScreen from "./src/screens/main/RankingScreen";
import AchievementsScreen from "./src/screens/main/AchievementsScreen";
import ProgressScreen from "./src/screens/main/ProgressScreen";

// Settings App Screens
import SettingsScreen from "./src/screens/settings/SettingsScreen";
import { SettingsProvider } from "./src/context/SettingsContext";

// Modules App Screens
import ModuleContentScreen from "./src/screens/module/ModuleContentScreen";
import ModulePreQuizScreen from "./src/screens/module/ModulePreQuizScreen";
import ModuleQuizScreen from "./src/screens/module/ModuleQuizScreen";


// Admin App Screens
import AdminDashboardScreen from "./src/screens/admin/AdminDashboardScreen";
import AdminUserDetailScreen from "./src/screens/admin/AdminUserDetailScreen";
import AdminIncorrectAnswersScreen from "./src/screens/admin/AdminIncorrectAnswersScreen";
import AdminRegisterUserScreen from "./src/screens/admin/AdminRegisterUserScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{ headerShown: false }}
        >
          {/* Onboarding Flow */}
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="TutorialStep1" component={TutorialStep1Screen} />
          <Stack.Screen name="TutorialStep2" component={TutorialStep2Screen} />
          <Stack.Screen name="TutorialStep3" component={TutorialStep3Screen} />

          {/* Auth Flow */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

          {/* Main App Flow */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Ranking" component={RankingScreen} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />

          {/* Settings App Flow */}
          <Stack.Screen name="Settings" component={SettingsScreen} />

          {/* Modules App Flow */}
          <Stack.Screen name="ModuleContent" component={ModuleContentScreen} />
          <Stack.Screen name="ModulePreQuiz" component={ModulePreQuizScreen} />
          <Stack.Screen name="ModuleQuiz" component={ModuleQuizScreen} />

          {/* Admin App Flow */}
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="AdminUserDetail" component={AdminUserDetailScreen} />
          <Stack.Screen name="AdminIncorrectAnswers" component={AdminIncorrectAnswersScreen} />
          <Stack.Screen name="AdminRegisterUser" component={AdminRegisterUserScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}
