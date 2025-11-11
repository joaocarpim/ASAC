// src/navigation/types.ts
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ErrorDetail } from "../services/progressService"; // Mantenha este import

export type RootStackParamList = {
  // Onboarding
  Welcome: undefined;
  TutorialStep1: undefined;
  TutorialStep2: undefined;
  TutorialStep3: undefined; // Auth

  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  ConfirmSignUp: { email: string; password?: string };
  NewPassword: { username: string };

  // ✅ ADICIONE ESTA LINHA:
  Loading: undefined; // Main App

  Home: undefined;
  Ranking: undefined;
  Achievements: undefined;
  Progress: undefined;
  IncorrectAnswers: { moduleNumber: number };
  LearningPath: undefined;
  BraillePractice: {
    title: string;
    characters: string[];
  };
  AlphabetSections: undefined;
  AlphabetLesson: {
    title: string;
    characters: string[];
  };
  Settings: undefined;
  Contrast: undefined;
  ModuleContent: { moduleId: string };
  ModulePreQuiz: { moduleId: string };
  ModuleQuiz: { moduleId: string };
  ModuleResult: {
    moduleId: string;
    correctAnswers: number;
    wrongAnswers?: number;
    totalQuestions: number;
    accuracy: number;
    timeSpent: number;
    coinsEarned: number;
    passed: boolean;
    progressId?: string;
    errorDetails?: string;
    pointsEarned: number;
  }; // Admin

  AdminDashboard: undefined;
  AdminUserDetail: { userId: string; userName: string };
  AdminIncorrectAnswers: { userId: string; moduleNumber: number };
  AdminRegisterUser: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
