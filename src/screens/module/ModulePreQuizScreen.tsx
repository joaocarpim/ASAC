// src/screens/module/ModulePreQuizScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  ColorValue,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import {
  AccessibleView,
  AccessibleHeader,
  AccessibleText,
  AccessibleButton,
} from "../../components/AccessibleComponents";
import { useSettings } from "../../hooks/useSettings";
import {
  getQuizByModuleId,
  ModuleQuiz,
} from "../../navigation/moduleQuestionTypes";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { useAccessibility } from "../../context/AccessibilityProvider";
import { useProgressStore } from "../../store/progressStore";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// Funções de responsividade
const wp = (percentage: number) => (WINDOW_WIDTH * percentage) / 100;
const hp = (percentage: number) => (WINDOW_HEIGHT * percentage) / 100;
const normalize = (size: number) => {
  const scale = WINDOW_WIDTH / 375; // Base: iPhone 11
  return Math.round(size * scale);
};

function isColorDark(color: ColorValue | undefined): boolean {
  if (!color || typeof color !== "string" || !color.startsWith("#"))
    return false;
  const hex = color.replace("#", "");
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 149;
}

export default function ModulePreQuizScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModulePreQuiz">) {
  const { moduleId } = route.params;

  const [checkingPermission, setCheckingPermission] = useState(false);
  const [quizData, setQuizData] = useState<ModuleQuiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);

  const { theme } = useContrast();
  const { speakText } = useAccessibility();
  const { startTimer } = useProgressStore();

  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const styles = getStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  useEffect(() => {
    setLoadingQuiz(true);

    const numericModuleId = parseInt(String(moduleId), 10);
    const quiz = getQuizByModuleId(numericModuleId);

    if (!quiz) {
      Alert.alert(
        "Erro",
        "Não foi possível carregar os dados do questionário.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      return;
    }

    quiz.totalCoins = 12250;

    setQuizData(quiz);
    setLoadingQuiz(false);
  }, [moduleId]);

  useEffect(() => {
    if (!loadingQuiz && quizData && speakText) {
      speakText(
        `Tela de introdução ao questionário ${quizData.title}. 
         Arraste para a esquerda para começar.`
      );
    }
  }, [loadingQuiz, quizData]);

  const handleStartQuiz = () => {
    setCheckingPermission(true);
    startTimer();

    setTimeout(() => {
      setCheckingPermission(false);
      navigation.navigate("ModuleQuiz", { moduleId });
    }, 200);
  };

  const handleGoBack = () => navigation.goBack();

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.translationX < -40) handleStartQuiz();
      if (e.translationX > 40) handleGoBack();
    });

  const statusBarStyle = isColorDark(theme.background)
    ? "light-content"
    : "dark-content";

  if (loadingQuiz || !quizData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title="Carregando Quiz..." />
        <ActivityIndicator size="large" color={theme.text} />
      </SafeAreaView>
    );
  }

  const instructions = `Questões: ${quizData.questions.length}. Para passar: ${quizData.passingScore}.`;

  return (
    <GestureDetector gesture={panGesture}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title={quizData.title} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.centerWrapper}>
            <AccessibleHeader level={1} style={styles.title}>
              Você concluiu o conteúdo!
            </AccessibleHeader>

            <AccessibleHeader level={2} style={styles.subtitle}>
              Sobre o Questionário
            </AccessibleHeader>

            <View style={styles.card}>
              <AccessibleText baseSize={15} style={styles.infoText}>
                📝 Questões: {quizData.questions.length}
              </AccessibleText>

              <AccessibleText baseSize={15} style={styles.infoText}>
                ✅ Para passar: {quizData.passingScore}
              </AccessibleText>

              <AccessibleText baseSize={15} style={styles.infoText}>
                🪙 Moedas por acerto: {quizData.coinsPerCorrect}
              </AccessibleText>

              <AccessibleText baseSize={15} style={styles.infoText}>
                🏆 Total possível: {quizData.totalCoins.toLocaleString("pt-BR")}
              </AccessibleText>
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                Leia com atenção antes de iniciar.
              </Text>
            </View>

            {checkingPermission && (
              <ActivityIndicator
                style={{ marginTop: hp(2) }}
                size="large"
                color={theme.text}
              />
            )}
          </View>
        </ScrollView>

        
      </SafeAreaView>
    </GestureDetector>
  );
}

const getStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  dyslexia: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },

    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
      paddingBottom: hp(2),
    },

    centerWrapper: {
      alignItems: "center",
    },

    title: {
      fontSize: Math.min(normalize(22) * fontMultiplier, wp(7)),
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      textAlign: "center",
      marginBottom: hp(1.5),
      paddingHorizontal: wp(2),
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },

    subtitle: {
      fontSize: Math.min(normalize(17) * fontMultiplier, wp(5.5)),
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      textAlign: "center",
      marginBottom: hp(2.5),
      paddingHorizontal: wp(2),
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },

    card: {
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      backgroundColor: theme.card,
      padding: wp(5),
      borderRadius: 16,
      marginBottom: hp(2.5),
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: { elevation: 4 },
      }),
    },

    infoText: {
      fontSize: Math.min(normalize(15) * fontMultiplier, wp(4.3)),
      color: theme.cardText,
      marginBottom: hp(1.5),
      lineHeight: Math.min(normalize(22), wp(6.5)),
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },

    tipBox: {
      flexDirection: "row",
      alignItems: "center",
      padding: wp(4),
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 2,
      borderColor: theme.button,
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      ...Platform.select({
        ios: {
          shadowColor: theme.button,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: { elevation: 2 },
      }),
    },

    tipIcon: {
      fontSize: normalize(22),
      marginRight: wp(3),
    },

    tipText: {
      flex: 1,
      color: theme.cardText,
      fontSize: Math.min(normalize(14) * fontMultiplier, wp(4)),
      fontWeight: "500",
      lineHeight: Math.min(normalize(20), wp(5.5)),
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
  });