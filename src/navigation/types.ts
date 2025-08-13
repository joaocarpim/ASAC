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
};

// Este é um tipo genérico que vamos usar em cada tela
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
