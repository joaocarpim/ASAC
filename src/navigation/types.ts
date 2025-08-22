import type { NativeStackScreenProps } from "@react-navigation/native-stack";

// Esta lista define todas as telas da sua aplicação e os parâmetros que elas esperam
export type RootStackParamList = {
  // Onboarding
  Welcome: undefined;
  TutorialStep1: undefined;
  TutorialStep2: undefined;
  TutorialStep3: undefined;

  // Auth
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string }; // Rota com o parâmetro 'email'
  ConfirmSignUp: { email: string };
  
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

// Este é um tipo genérico que usamos nas props de cada tela
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
