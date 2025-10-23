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
  ModuleContent: { moduleId: string }; // ✅ ALTERADO PARA STRING
  ModulePreQuiz: { moduleId: string }; // ✅ ALTERADO PARA STRING
  ModuleQuiz: { moduleId: string };    // ✅ ALTERADO PARA STRING

  ModuleResult: {                 // ✅ ALTERADO PARA STRING
    moduleId: string;
    // Os outros campos permanecem como estão (provavelmente numbers, confira se necessário)
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
    timeSpent: number; // Supondo que seja segundos (number)
    coinsEarned: number;
    passed: boolean;
    // errors: number; // Este campo não estava no seu App.tsx, mas estava aqui. Removi por consistência, adicione se precisar.
    // score: number; // Este campo não estava no seu App.tsx, mas estava aqui. Removi por consistência, adicione se precisar.
    pointsEarned: number;
  };

  // Admin
  AdminDashboard: undefined;
  AdminUserDetail: { userId: string; userName: string };
  AdminIncorrectAnswers: { userId: string }; // Pode precisar de moduleId: string também?
  AdminRegisterUser: undefined;
};

// O tipo RootStackScreenProps permanece o mesmo
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;