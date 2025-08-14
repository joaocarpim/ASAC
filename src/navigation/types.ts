import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// Esta lista define todas as telas e seus parâmetros
export type RootStackParamList = {
  // Onboarding
  Welcome: undefined;
  TutorialStep1: undefined;
  TutorialStep2: undefined;
  TutorialStep3: undefined;

  // Auth
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;

  // Main App
  Home: undefined;
  Ranking: undefined;
  Achievements: undefined;
  Progress: undefined;

  // Settings
  Settings: undefined;

  // Modules
  ModuleContent: { moduleId: number };
  ModulePreQuiz: { moduleId: number };
  ModuleQuiz: { moduleId: number };

  // Admin
  AdminDashboard: undefined;
  AdminUserDetail: { userId: string; userName: string };
  AdminIncorrectAnswers: { userId: string };
  AdminRegisterUser: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
