// src/screens/module/ModulePreQuizScreen.tsx (Corrigido)
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
import { useProgressStore } from "../../store/progressStore"; // ✅ Importa o store do timer

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
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  // ✅ Pega a função 'startTimer' do store
  const { startTimer } = useProgressStore();

  const { width } = useWindowDimensions();
  const scaleFactor = width > 0 ? width / 375 : 1;
  const responsiveFontSize = (size: number) => Math.round(size * scaleFactor);

  const styles = getStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
    responsiveFontSize
  );

  useEffect(() => {
    setLoadingQuiz(true);
    const numericModuleId = parseInt(String(moduleId), 10);
    const data = getQuizByModuleId(numericModuleId);

    if (data) {
      setQuizData(data);
    } else {
      console.error(`[PreQuiz] Quiz para módulo ${moduleId} não encontrado.`);
      Alert.alert(
        "Erro",
        "Não foi possível carregar as informações do questionário.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    }
    setLoadingQuiz(false);
  }, [moduleId, navigation]);

  useEffect(() => {
    if (!loadingQuiz && quizData) {
      const accessibilityInstructions = `Tela de instruções do questionário para ${quizData.title}. Questões: ${quizData.questions.length}. Para passar: ${quizData.passingScore} acertos. Moedas por acerto: ${quizData.coinsPerCorrect}. Arraste para a esquerda para começar, ou para a direita para voltar.`;
      speakText(accessibilityInstructions);
    }
  }, [loadingQuiz, quizData, speakText]);

  const handleStartQuiz = async () => {
    setCheckingPermission(true);

    // ======================================================
    // ✅ CORREÇÃO (Bug 2): Inicia o timer ANTES de ir para o quiz
    // ======================================================
    startTimer();

    setTimeout(() => {
      setCheckingPermission(false);
      navigation.navigate("ModuleQuiz", { moduleId });
    }, 250);
  };

  const handleGoBack = () => navigation.goBack();
  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleGoBack);
  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(handleStartQuiz);
  const composedGestures = Gesture.Race(flingLeft, flingRight);

  const statusBarStyle = isColorDark(theme.background)
    ? "light-content"
    : "dark-content";

  if (loadingQuiz || !quizData) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title="Carregando Quiz..." />
        <ActivityIndicator color={theme.text} size="large" />
      </View>
    );
  }

  const accessibilityInstructions = `Tela de instruções do questionário para ${quizData.title}. Questões: ${quizData.questions.length}. Para passar: ${quizData.passingScore} acertos. Moedas por acerto: ${quizData.coinsPerCorrect}. Arraste para a esquerda para começar, ou para a direita para voltar.`;

  return (
    <GestureDetector gesture={composedGestures}>
      <AccessibleView
        style={styles.container}
        accessibilityText={accessibilityInstructions}
      >
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title={quizData.title || "Questionário"} />
        <View style={styles.centeredContent}>
          <View style={styles.contentContainer}>
            <AccessibleHeader level={1} style={styles.title}>
              {" "}
              Você concluiu o conteúdo!{" "}
            </AccessibleHeader>
            <AccessibleHeader level={2} style={styles.subtitle}>
              {" "}
              Sobre o Questionário{" "}
            </AccessibleHeader>
            <AccessibleView
              style={styles.infoContainer}
              accessibilityText="Informações sobre o questionário."
            >
              <AccessibleText
                baseSize={15}
                style={styles.infoText}
                accessibilityLabel={`Questões: ${quizData.questions.length}.`}
              >
                {" "}
                📝 Questões: {quizData.questions.length}{" "}
              </AccessibleText>
              <AccessibleText
                baseSize={15}
                style={styles.infoText}
                accessibilityLabel={`Para passar: ${quizData.passingScore} acertos.`}
              >
                {" "}
                ✅ Para passar: {quizData.passingScore} acertos{" "}
              </AccessibleText>
              <AccessibleText
                baseSize={15}
                style={styles.infoText}
                accessibilityLabel={`Moedas por acerto: ${quizData.coinsPerCorrect}.`}
              >
                {" "}
                🪙 Moedas por acerto: {quizData.coinsPerCorrect}{" "}
              </AccessibleText>
              <AccessibleText
                baseSize={15}
                style={styles.infoText}
                accessibilityLabel={`Pontuação Total Possível: ${quizData.totalCoins}.`}
              >
                {" "}
                🏆 Pontuação Total: {quizData.totalCoins}{" "}
              </AccessibleText>
            </AccessibleView>
            <AccessibleView
              style={styles.tipContainer}
              accessibilityText="Dica: Leia todo o conteúdo com atenção antes de iniciar o questionário."
            >
              <Text style={styles.icon}> 💡 </Text>
              <Text style={styles.tipText}>
                {" "}
                Dica: Leia todo o conteúdo com atenção antes de iniciar o
                questionário.{" "}
              </Text>
            </AccessibleView>
            {checkingPermission && (
              <AccessibleView accessibilityText="Iniciando o questionário. Por favor, aguarde.">
                <ActivityIndicator
                  style={{ marginTop: 20 }}
                  size="large"
                  color={theme.text}
                />
              </AccessibleView>
            )}
          </View>
        </View>
      </AccessibleView>
    </GestureDetector>
  );
}

// ... (Estilos não mudam) ...
const getStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number,
  isDyslexiaFont: boolean,
  responsiveFontSize: (size: number) => number
): StyleSheet.NamedStyles<any> => {
  const isHighContrastTheme = theme.background === "#0055A4";
  const textColor = isHighContrastTheme ? "#FFFFFF" : theme.text;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
    },
    centeredContent: { flex: 1, justifyContent: "center" },
    contentContainer: { padding: 20 },
    title: {
      fontSize: responsiveFontSize(22) * fontMultiplier,
      fontWeight: isBold ? "bold" : "bold",
      color: textColor,
      marginBottom: 5,
      textAlign: "center",
      lineHeight:
        responsiveFontSize(22) * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    subtitle: {
      fontSize: responsiveFontSize(18) * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      color: textColor,
      marginBottom: 15,
      textAlign: "center",
      lineHeight:
        responsiveFontSize(18) * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    infoContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      gap: 15,
    },
    infoText: {
      fontSize: responsiveFontSize(15) * fontMultiplier,
      color: theme.cardText,
      fontWeight: isBold ? "bold" : "normal",
      lineHeight:
        responsiveFontSize(15) * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    tipContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.card,
    },
    icon: {
      marginRight: 12,
      fontSize: responsiveFontSize(18),
      color: textColor,
    },
    tipText: {
      fontSize: responsiveFontSize(14) * fontMultiplier,
      color: textColor,
      flex: 1,
      fontWeight: isBold ? "bold" : "normal",
      lineHeight:
        responsiveFontSize(14) * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
  });
};
