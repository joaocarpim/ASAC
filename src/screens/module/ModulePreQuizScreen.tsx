// src/screens/module/ModulePreQuizScreen.tsx
import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  TouchableOpacity,
  AccessibilityInfo,
  findNodeHandle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { useSettings } from "../../hooks/useSettings";
import {
  getQuizByModuleId,
  ModuleQuiz,
} from "../../navigation/moduleQuestionTypes";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { useAccessibility } from "../../context/AccessibilityProvider";
import { useProgressStore } from "../../store/progressStore";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

const wp = (percentage: number) => (WINDOW_WIDTH * percentage) / 100;
const hp = (percentage: number) => (WINDOW_HEIGHT * percentage) / 100;
const normalize = (size: number) => {
  const scale = WINDOW_WIDTH / 375;
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
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

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

  const mainContentRef = useRef<View>(null);

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

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [moduleId]);

  useEffect(() => {
    if (!loadingQuiz && quizData) {
      const message = `Tela de introdução ao questionário ${quizData.title}.`;
      if (Platform.OS === "android") {
        AccessibilityInfo.announceForAccessibility(message);
      }
      setTimeout(() => {
        if (mainContentRef.current && Platform.OS !== "web") {
          const reactTag = findNodeHandle(mainContentRef.current);
          if (reactTag) AccessibilityInfo.setAccessibilityFocus(reactTag);
        }
      }, 500);
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

  const estimatedTime = Math.ceil(quizData.questions.length * 1.5);
  const difficulty =
    quizData.questions.length > 15
      ? "Avançado"
      : quizData.questions.length > 10
      ? "Intermediário"
      : "Básico";

  // CRIAÇÃO DO TEXTO UNIFICADO PARA O LEITOR DE TELA
  const quizInfoLabel = `
    Informações do Questionário.
    ${quizData.questions.length} questões.
    Tempo estimado: ${estimatedTime} minutos.
    Dificuldade: ${difficulty}.
    Pontuação mínima para aprovação: ${quizData.passingScore} pontos.
    Recompensa por acerto: ${quizData.coinsPerCorrect} moedas.
    Total possível: ${quizData.totalCoins} moedas.
  `;

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
          importantForAccessibility="no"
        >
          <Animated.View
            style={[
              styles.centerWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header de conclusão */}
            <View
              ref={mainContentRef}
              style={styles.headerBadge}
              accessible={true}
              focusable={true}
              accessibilityRole="header"
              accessibilityLabel="Conteúdo Concluído! Agora vamos testar seus conhecimentos."
            >
              <View
                style={styles.badgeIconContainer}
                importantForAccessibility="no"
              >
                <Ionicons
                  name="checkmark-circle"
                  size={normalize(40)}
                  color={theme.button}
                />
              </View>
              <View
                style={styles.badgeTextContainer}
                importantForAccessibility="no"
              >
                <Text style={styles.badgeTitle}>Conteúdo Concluído!</Text>
                <Text style={styles.badgeSubtitle}>
                  Agora vamos testar seus conhecimentos
                </Text>
              </View>
            </View>

            {/* CARD PRINCIPAL UNIFICADO: Informações + Stats + Detalhes */}
            <View
              style={styles.mainCard}
              accessible={true} // Agrupa tudo
              focusable={true} // Permite Tab
              accessibilityRole="summary"
              accessibilityLabel={quizInfoLabel} // Lê tudo de uma vez
            >
              {/* Header do Card (Visual) */}
              <View style={styles.cardHeader} importantForAccessibility="no">
                <Ionicons
                  name="clipboard-outline"
                  size={normalize(22)}
                  color={theme.button}
                  style={{ marginRight: wp(3) }}
                />
                <Text style={styles.cardHeaderText}>
                  Informações do Questionário
                </Text>
              </View>

              {/* Grid de Stats (Visual) */}
              <View style={styles.statsGrid} importantForAccessibility="no">
                <View style={styles.statItem}>
                  <Ionicons
                    name="help-circle-outline"
                    size={normalize(28)}
                    color={theme.button}
                    style={{ marginBottom: hp(1) }}
                  />
                  <Text style={styles.statLabel}>Questões</Text>
                  <Text style={styles.statValue}>
                    {quizData.questions.length}
                  </Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Ionicons
                    name="time-outline"
                    size={normalize(28)}
                    color={theme.button}
                    style={{ marginBottom: hp(1) }}
                  />
                  <Text style={styles.statLabel}>Tempo estimado</Text>
                  <Text style={styles.statValue}>{estimatedTime} min</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Ionicons
                    name="bar-chart-outline"
                    size={normalize(28)}
                    color={theme.button}
                    style={{ marginBottom: hp(1) }}
                  />
                  <Text style={styles.statLabel}>Dificuldade</Text>
                  <Text style={styles.statValue}>{difficulty}</Text>
                </View>
              </View>

              <View style={styles.dividerLine} importantForAccessibility="no" />

              {/* Detalhes (Visual) */}
              <View
                style={styles.detailsSection}
                importantForAccessibility="no"
              >
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons
                      name="checkmark-done"
                      size={normalize(20)}
                      color={theme.button}
                    />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>
                      Pontuação mínima para aprovação
                    </Text>
                    <Text style={styles.detailValue}>
                      {quizData.passingScore} pontos
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons
                      name="cash-outline"
                      size={normalize(20)}
                      color={theme.button}
                    />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>
                      Recompensa por acerto
                    </Text>
                    <Text style={styles.detailValue}>
                      {quizData.coinsPerCorrect} moedas
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons
                      name="trophy"
                      size={normalize(20)}
                      color={theme.button}
                    />
                  </View>
                  <View style={styles.detailTextContainer}>
                    <Text style={styles.detailLabel}>Total possível</Text>
                    <Text style={styles.detailValueHighlight}>
                      {quizData.totalCoins.toLocaleString("pt-BR")} moedas
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Card de Dicas */}
            <View
              style={styles.tipsCard}
              accessible={true}
              focusable={true}
              accessibilityRole="text"
              accessibilityLabel="Dicas: Leia cada questão com atenção. Revise o conteúdo se necessário. Não há limite de tempo. Você pode refazer o questionário."
            >
              <View style={styles.tipsHeader} importantForAccessibility="no">
                <Ionicons
                  name="bulb-outline"
                  size={normalize(24)}
                  color={theme.button}
                  style={{ marginRight: wp(2.5) }}
                />
                <Text style={styles.tipsTitle}>Dicas para o Questionário</Text>
              </View>

              <View style={styles.tipsList} importantForAccessibility="no">
                <View style={styles.tipItem}>
                  <Ionicons
                    name="chevron-forward"
                    size={normalize(16)}
                    color={theme.button}
                    style={{ marginRight: wp(3), marginTop: hp(0.2) }}
                  />
                  <Text style={styles.tipText}>
                    Leia cada questão com atenção antes de responder
                  </Text>
                </View>
                {/* Outras dicas... */}
              </View>
            </View>

            {/* Botão Iniciar (Nativo) */}
            <TouchableOpacity
              onPress={handleStartQuiz}
              style={styles.startButton}
              activeOpacity={0.8}
              accessible={true}
              focusable={true}
              accessibilityRole="button"
              accessibilityLabel="Iniciar Questionário"
              accessibilityHint="Toque duas vezes para começar"
            >
              <Text
                style={styles.startButtonText}
                importantForAccessibility="no"
              >
                Iniciar Questionário
              </Text>
              <Ionicons
                name="arrow-forward"
                size={24}
                color={theme.buttonText}
                style={{ marginLeft: 10 }}
                importantForAccessibility="no"
              />
            </TouchableOpacity>

            {/* Loading */}
            {checkingPermission && (
              <View
                style={styles.loadingOverlay}
                accessible={true}
                accessibilityLiveRegion="assertive"
                accessibilityLabel="Preparando questionário..."
              >
                <ActivityIndicator size="large" color={theme.button} />
                <Text style={styles.loadingText} importantForAccessibility="no">
                  Preparando questionário...
                </Text>
              </View>
            )}
          </Animated.View>
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
    container: { flex: 1, backgroundColor: theme.background },
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
      paddingBottom: hp(4),
    },
    centerWrapper: { alignItems: "center" },
    headerBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      paddingVertical: hp(2),
      paddingHorizontal: wp(5),
      borderRadius: 20,
      marginBottom: hp(3),
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      ...Platform.select({
        ios: {
          shadowColor: theme.button,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        },
        android: { elevation: 6 },
      }),
    },
    badgeIconContainer: { marginRight: wp(4) },
    badgeTextContainer: { flex: 1 },
    badgeTitle: {
      fontSize: Math.min(normalize(20) * fontMultiplier, wp(6)),
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      marginBottom: hp(0.5),
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    badgeSubtitle: {
      fontSize: Math.min(normalize(13) * fontMultiplier, wp(3.8)),
      color: theme.cardText,
      opacity: 0.8,
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    mainCard: {
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      backgroundColor: theme.card,
      borderRadius: 20,
      marginBottom: hp(2.5),
      overflow: "hidden",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: { elevation: 5 },
      }),
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: hp(2),
      paddingHorizontal: wp(5),
      backgroundColor: `${theme.button}15`,
      borderBottomWidth: 1,
      borderBottomColor: `${theme.button}30`,
    },
    cardHeaderText: {
      fontSize: Math.min(normalize(17) * fontMultiplier, wp(5)),
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    statsGrid: {
      flexDirection: "row",
      paddingVertical: hp(3),
      paddingHorizontal: wp(3),
    },
    statItem: { flex: 1, alignItems: "center", justifyContent: "center" },
    statLabel: {
      fontSize: Math.min(normalize(12) * fontMultiplier, wp(3.3)),
      color: theme.cardText,
      opacity: 0.7,
      marginBottom: hp(0.5),
      textAlign: "center",
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    statValue: {
      fontSize: Math.min(normalize(20) * fontMultiplier, wp(5.5)),
      fontWeight: isBold ? "bold" : "700",
      color: theme.button,
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    statDivider: {
      width: 1,
      height: "70%",
      backgroundColor: `${theme.cardText}20`,
      alignSelf: "center",
    },
    dividerLine: {
      height: 1,
      backgroundColor: `${theme.cardText}15`,
      marginHorizontal: wp(5),
    },
    detailsSection: { paddingVertical: hp(2.5), paddingHorizontal: wp(5) },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp(2),
    },
    detailIconContainer: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(5),
      backgroundColor: `${theme.button}15`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: wp(3),
    },
    detailTextContainer: { flex: 1 },
    detailLabel: {
      fontSize: Math.min(normalize(13) * fontMultiplier, wp(3.5)),
      color: theme.cardText,
      opacity: 0.7,
      marginBottom: hp(0.3),
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    detailValue: {
      fontSize: Math.min(normalize(16) * fontMultiplier, wp(4.5)),
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    detailValueHighlight: {
      fontSize: Math.min(normalize(16) * fontMultiplier, wp(4.5)),
      fontWeight: isBold ? "bold" : "700",
      color: theme.button,
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    tipsCard: {
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: wp(5),
      marginBottom: hp(2),
      borderWidth: 2,
      borderColor: `${theme.button}40`,
      ...Platform.select({
        ios: {
          shadowColor: theme.button,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
        },
        android: { elevation: 3 },
      }),
    },
    tipsHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp(2),
    },
    tipsTitle: {
      fontSize: Math.min(normalize(16) * fontMultiplier, wp(4.5)),
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    tipsList: { gap: hp(1.5) },
    tipItem: { flexDirection: "row", alignItems: "flex-start" },
    tipText: {
      flex: 1,
      fontSize: Math.min(normalize(13) * fontMultiplier, wp(3.8)),
      color: theme.cardText,
      lineHeight: Math.min(normalize(20), wp(5.5)),
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    startButton: {
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      backgroundColor: theme.button ?? "#191970",
      paddingVertical: hp(2),
      borderRadius: 30,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: hp(2),
      marginBottom: hp(4),
      elevation: 4,
    },
    startButtonText: {
      fontSize: Math.min(normalize(18) * fontMultiplier, wp(5)),
      fontWeight: isBold ? "bold" : "700",
      color: theme.buttonText ?? "#FFFFFF",
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    loadingOverlay: {
      marginTop: hp(3),
      alignItems: "center",
      padding: wp(5),
      backgroundColor: theme.card,
      borderRadius: 16,
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
    },
    loadingText: {
      marginTop: hp(1.5),
      fontSize: Math.min(normalize(14) * fontMultiplier, wp(4)),
      color: theme.text,
      fontFamily: dyslexia ? "OpenDyslexic-Regular" : undefined,
    },
  });
