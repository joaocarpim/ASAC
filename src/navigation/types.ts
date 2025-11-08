// src/navigation/types.ts (Corrigido)
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ErrorDetail } from "../services/progressService";

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
  // ======================================================
  // ✅ NOVA TELA DE ERROS DO USUÁRIO
  // ======================================================
  IncorrectAnswers: { moduleNumber: number };

  // Sessões e Prática
  LearningPath: undefined;
  BraillePractice: {
    title: string;
    characters: string[];
  };

  // Settings & Accessibility
  Settings: undefined;
  Contrast: undefined;

  // Modules
  Alphabet: undefined;
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
    errorDetails?: string; // (JSON string)
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