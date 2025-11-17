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
  useWindowDimensions,
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  GestureDetector,
  Gesture,
  Directions,
} from "react-native-gesture-handler";
import {
  AccessibleView,
  AccessibleHeader,
  AccessibleText,
} from "../../components/AccessibleComponents";
import { useSettings } from "../../hooks/useSettings";
import {
  getQuizByModuleId,
  ModuleQuiz,
} from "../../navigation/moduleQuestionTypes";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { useAccessibility } from "../../context/AccessibilityProvider";
import { useProgressStore } from "../../store/progressStore";

/* -----------------------------------------------------
   FUNÇÃO PARA DEFINIR SE A COR DO TEMA É ESCURA
----------------------------------------------------- */
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

  const { width } = useWindowDimensions();
  const scaleFactor = width / 380;
  const dynamicSize = (value: number) => Math.max(12, value * scaleFactor);

  const styles = getStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
    dynamicSize
  );

  /* -----------------------------------------------------
     LOAD QUIZ DATA
  ----------------------------------------------------- */
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

    // Corrige pontuação total
    quiz.totalCoins = 12250;

    setQuizData(quiz);
    setLoadingQuiz(false);
  }, [moduleId]);

  /* -----------------------------------------------------
     ACESSIBILIDADE - LEITURA EM VOZ ALTA
  ----------------------------------------------------- */
  useEffect(() => {
    if (!loadingQuiz && quizData && speakText) {
      speakText(
        `Tela de introdução ao questionário ${quizData.title}. 
         Arraste para a esquerda ou use o mouse segurando botão esquerdo para começar.`
      );
    }
  }, [loadingQuiz, quizData]);

  /* -----------------------------------------------------
     HANDLERS
  ----------------------------------------------------- */
  const handleStartQuiz = () => {
    setCheckingPermission(true);
    startTimer();

    setTimeout(() => {
      setCheckingPermission(false);
      navigation.navigate("ModuleQuiz", { moduleId });
    }, 200);
  };

  const handleGoBack = () => navigation.goBack();

  /* -----------------------------------------------------
     GESTO UNIVERSAL (WEB + MOBILE)
     Suporte: Mouse (web), Touch (android/ios)
  ----------------------------------------------------- */

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.translationX < -40) handleStartQuiz(); // esquerda
      if (e.translationX > 40) handleGoBack(); // direita
    });

  /* -----------------------------------------------------
     STATUSBAR
  ----------------------------------------------------- */
  const statusBarStyle = isColorDark(theme.background)
    ? "light-content"
    : "dark-content";

  /* -----------------------------------------------------
     LOADING
  ----------------------------------------------------- */
  if (loadingQuiz || !quizData) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title="Carregando Quiz..." />
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  const instructions = `Questões: ${quizData.questions.length}. Para passar: ${quizData.passingScore}.`;

  /* -----------------------------------------------------
     TELA PRINCIPAL
  ----------------------------------------------------- */
  return (
    <GestureDetector gesture={panGesture}>
      <AccessibleView style={styles.container} accessibilityText={instructions}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title={quizData.title} />

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
              style={{ marginTop: 20 }}
              size="large"
              color={theme.text}
            />
          )}
        </View>

        <View style={{ height: 80 }} />
      </AccessibleView>
    </GestureDetector>
  );
}

/* -----------------------------------------------------
   ESTILOS
----------------------------------------------------- */
const getStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  dyslexia: boolean,
  rs: (n: number) => number
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding:55,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },

    /* Layout central */
    centerWrapper: {
      paddingHorizontal: -2,
      paddingTop: 30,
      alignItems: "center",
    },

    /* Títulos */
    title: {
      fontSize: rs(24) * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      textAlign: "center",
      marginBottom: 8,
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    subtitle: {
      fontSize: rs(18) * fontMultiplier,
      fontWeight: isBold ? "bold" : "500",
      color: theme.text,
      textAlign: "center",
      marginBottom: 18,
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },

    /* Cartão Informativo */
    card: {
      width: "100%",
      backgroundColor: theme.card,
      padding: 20,
      borderRadius: 12,
      marginBottom: 20,
    },
    infoText: {
      fontSize: rs(15) * fontMultiplier,
      color: theme.cardText,
      marginBottom: 10,
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },

    /* Dica */
    tipBox: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.card,
      marginTop: 6,
    },
    tipIcon: {
      fontSize: rs(20),
      marginRight: 10,
    },
    tipText: {
      color: theme.text,
      fontSize: rs(14) * fontMultiplier,
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
  });
