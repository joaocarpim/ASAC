import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ErrorDetail } from "../services/progressService";

export type RootStackParamList = {
  // Onboarding
  Welcome: undefined;
  Tutorial: undefined;

  // Auth
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  ConfirmSignUp: { email: string; password?: string };
  NewPassword: { username: string };

  Loading: undefined;

  // Main App
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
  };

  // Admin
  AdminDashboard: undefined;
  AdminUserDetail: { userId: string; userName: string };
  AdminIncorrectAnswers: { userId: string; moduleNumber: number };
  AdminRegisterUser: undefined;

  // Writing Challenges (Grau 1)
  WritingChallengeIntro: undefined;
  WritingChallengeRoullete: undefined;
  WritingChallengeGame: { word: string };
  WritingChallengeSuccess: { word: string };

  // ✅ ======================================
  // ✅ NOVAS TELAS DE CONTRAÇÕES (GRAU 2)
  // ✅ ======================================
  ContractionsHome: undefined;
  ContractionsLesson: undefined;
  ContractionsRoullete: undefined;
  ContractionsGame: { word: string; dots: number[] }; // Mudei de 'contraction' para 'dots'
  ContractionsSuccess: { word: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
