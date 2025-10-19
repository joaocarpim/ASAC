// src/navigation/types.ts
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  // Onboarding
  Welcome: undefined;
  TutorialStep1: undefined;
  TutorialStep2: undefined;
  TutorialStep3: undefined;

  // Auth
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  ConfirmSignUp: { email: string; password?: string };
  NewPassword: { username: string };

  // Main App
  Home: undefined;
  Ranking: undefined;
  Achievements: undefined;
  Progress: undefined;
  Braille: undefined;
  
  // Settings & Accessibility
  Settings: undefined;
  Contrast: undefined;

  // Modules
  Alphabet: undefined;
  ModuleContent: { moduleId: number };
  ModulePreQuiz: { moduleId: number };
  ModuleQuiz: { moduleId: number };
  
  ModuleResult: {
    moduleId: number;
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
    timeSpent: number;
    coinsEarned: number;
    passed: boolean;
    errors: number;
    score: number;
    pointsEarned: number;
  };

  // Admin
  AdminDashboard: undefined;
  AdminUserDetail: { userId: string; userName: string };
  AdminIncorrectAnswers: { userId: string };
  AdminRegisterUser: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
