// src/screens/module/ModuleResultScreen.tsx - COM HAPPY.MP3 APÓS MODAL
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
  SafeAreaView,
  AccessibilityInfo,
  findNodeHandle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import { RootStackScreenProps } from "../../navigation/types";

import { useSettings } from "../../hooks/useSettings";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";

import { Audio } from "expo-av";
import { useAuthStore } from "../../store/authStore";
import progressService, { ErrorDetail } from "../../services/progressService";
import { useModalStore } from "../../store/useModalStore";

import { useSwipeNavigation } from "../../hooks/useSwipeNavigation";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

const wp = (percentage: number) => (WINDOW_WIDTH * percentage) / 100;
const hp = (percentage: number) => (WINDOW_HEIGHT * percentage) / 100;
const normalize = (size: number) => {
  const scale = WINDOW_WIDTH / 375;
  return Math.round(size * scale);
};

export default function ModuleResultScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModuleResult">) {
  const {
    moduleId,
    correctAnswers,
    wrongAnswers,
    totalQuestions,
    accuracy,
    timeSpent,
    coinsEarned,
    pointsEarned,
    passed,
    progressId,
    errorDetails,
  } = route.params;

  const { user } = useAuthStore();
  const { showModal } = useModalStore();

  const [happySound, setHappySound] = useState<Audio.Sound | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const isMounted = useRef(true);

  const headerRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const { panResponder, gestureWrapper } = useSwipeNavigation({
    onSwipeLeft: () => navigation.navigate("Home"),
    onSwipeRight: () => navigation.replace("ModuleQuiz", { moduleId }),
  });

  const announceToTalkBack = useCallback((message: string) => {
    if (Platform.OS === "android") {
      AccessibilityInfo.announceForAccessibility(message);
    } else {
      AccessibilityInfo.setAccessibilityFocus(0);
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(message);
      }, 100);
    }
  }, []);

  // ✅ Carrega apenas o som HAPPY
  useEffect(() => {
    isMounted.current = true;
    async function load() {
      try {
        const { sound: happy } = await Audio.Sound.createAsync(
          require("../../../assets/som/happy.mp3")
        );
        if (isMounted.current) {
          setHappySound(happy);
        }
      } catch (err) {
        console.log("Erro ao carregar som:", err);
      }
    }
    if (Platform.OS !== "web") load();

    return () => {
      isMounted.current = false;
      happySound?.unloadAsync();
    };
  }, []);

  // Foco inicial no Header
  useEffect(() => {
    const timer = setTimeout(() => {
      if (headerRef.current && Platform.OS !== "web") {
        const reactTag = findNodeHandle(headerRef.current);
        if (reactTag) {
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        }
      }

      const resultMessage = passed
        ? `Parabéns! Aprovado no módulo ${moduleId}. ${accuracy}% de precisão.`
        : `Não aprovado. ${accuracy}%. Tente novamente!`;

      announceToTalkBack(resultMessage);
    }, 500);

    return () => clearTimeout(timer);
  }, [passed, accuracy, moduleId, announceToTalkBack]);

  // ✅ MODAL + SOM HAPPY APÓS CLICAR EM OK
  useEffect(() => {
    const timer = setTimeout(() => {
      // 🔍 DEBUG
      if (__DEV__) {
        const errorsCount = wrongAnswers ?? 0;
        console.log("═══════════════════════════════════════");
        console.log("🔍 DEBUG - RESULTADO DO MÓDULO");
        console.log("═══════════════════════════════════════");
        console.log("📊 Total de questões:", totalQuestions);
        console.log("✅ Acertos:", correctAnswers);
        console.log("❌ Erros:", errorsCount);
        console.log("🧮 Soma (acertos + erros):", correctAnswers + errorsCount);
        console.log(
          "⚠️ Diferença:",
          totalQuestions - (correctAnswers + errorsCount)
        );
        console.log("📈 Precisão:", accuracy + "%");
        console.log("✔️ Passou?:", passed);
        console.log("═══════════════════════════════════════");
      }

      const title =
        accuracy >= 70
          ? passed
            ? "Módulo Concluído!"
            : "Bom Desempenho!"
          : "Continue Praticando!";
      const body =
        accuracy >= 70
          ? `Parabéns! ${accuracy}% de precisão!`
          : `Você atingiu ${accuracy}%. Tente novamente!`;

      // Mostra o modal
      showModal(title, body);

      // 🎵 TOCA SOM HAPPY logo após mostrar o modal
      setTimeout(() => {
        if (__DEV__) console.log("🎵 Tocando: happy.mp3");

        if (happySound) {
          happySound.setPositionAsync(0).then(() => {
            happySound.playAsync();
          });
        }

        // Confetti se passou
        if (accuracy >= 70) {
          setShowConfetti(true);
          setTimeout(() => {
            if (isMounted.current) setShowConfetti(false);
          }, 2500);
        }
      }, 300);
    }, 500);

    return () => clearTimeout(timer);
  }, [
    passed,
    happySound,
    accuracy,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    showModal,
  ]);

  const handleSaveProgress = useCallback(async () => {
    if (!user?.userId || !progressId) return;
    setSaving(true);
    try {
      const moduleNumber =
        parseInt(String(moduleId).replace(/\D/g, "")) || Number(moduleId) || 1;
      const achievementTitle = `Módulo ${moduleNumber} Concluído`;
      const errorCount = wrongAnswers ?? totalQuestions - correctAnswers;

      if (__DEV__) {
        console.log("💾 Salvando progresso:");
        console.log("- Erros calculados:", errorCount);
        console.log("- Acertos:", correctAnswers);
      }

      let parsedErrors: ErrorDetail[] = [];
      if (errorDetails) {
        try {
          parsedErrors = JSON.parse(errorDetails as any);
          if (__DEV__) {
            console.log(
              "- Detalhes de erros:",
              parsedErrors.length,
              "erros registrados"
            );
          }
        } catch {}
      }

      const result = await progressService.finishModule(
        user.userId,
        progressId,
        moduleNumber,
        timeSpent,
        achievementTitle,
        coinsEarned || 0,
        correctAnswers,
        errorCount,
        parsedErrors
      );

      if (isMounted.current && result) {
        setSaved(true);
        if (__DEV__) console.log("✅ Progresso salvo com sucesso!");
      }
    } catch (e) {
      console.log("❌ Erro ao salvar progresso:", e);
    } finally {
      if (isMounted.current) setSaving(false);
    }
  }, [
    user?.userId,
    progressId,
    moduleId,
    wrongAnswers,
    totalQuestions,
    correctAnswers,
    errorDetails,
    timeSpent,
    coinsEarned,
  ]);

  useEffect(() => {
    if (!saved && !saving) {
      handleSaveProgress();
    }
  }, [saved, saving, handleSaveProgress]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const accuracyColor =
    accuracy >= 90
      ? "#4CAF50"
      : accuracy >= 80
      ? "#8BC34A"
      : accuracy >= 70
      ? "#FFC107"
      : "#F44336";

  const performanceMessage =
    accuracy >= 90
      ? "Excelente! Você dominou o módulo!"
      : accuracy >= 80
      ? "Muito bom! Grande desempenho!"
      : accuracy >= 70
      ? "Bom trabalho! Você passou!"
      : "Continue praticando! Você consegue.";

  const headerAccessibilityLabel = `
    ${passed ? "Parabéns!" : "Quase lá!"}. 
    Módulo ${moduleId}. ${passed ? "Concluído" : "Tente Novamente"}.
    ${saving ? "Sincronizando..." : saved ? "Progresso salvo." : ""}
  `;

  const scoreAccessibilityLabel = `
    Sua pontuação final.
    ${accuracy}% de precisão.
    ${performanceMessage}
  `;

  const statsAccessibilityLabel = `
    Resumo do desempenho.
    Tempo total: ${formatTime(timeSpent)}.
    Acertos: ${correctAnswers}.
    Erros: ${wrongAnswers ?? 0}.
    Moedas ganhas: ${coinsEarned}.
  `;

  const content = (
    <SafeAreaView style={styles.container} {...panResponder}>
      <StatusBar barStyle={"light-content"} />

      <View
        ref={headerRef}
        style={styles.header}
        accessible={true}
        focusable={true}
        accessibilityRole="header"
        accessibilityLabel={headerAccessibilityLabel}
      >
        <MaterialCommunityIcons
          name={passed ? "trophy" : "school"}
          size={normalize(52)}
          color={theme.text}
          importantForAccessibility="no"
        />
        <Text style={styles.headerTitle} importantForAccessibility="no">
          {passed ? "Parabéns!" : "Quase lá!"}
        </Text>
        <Text style={styles.headerSubtitle} importantForAccessibility="no">
          Módulo {moduleId} — {passed ? "Concluído" : "Tente Novamente"}
        </Text>

        {saving && (
          <View style={styles.savingBadge} importantForAccessibility="no">
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.savingBadgeText}>Sincronizando...</Text>
          </View>
        )}

        {saved && !saving && (
          <View style={styles.savedBadge} importantForAccessibility="no">
            <MaterialCommunityIcons
              name="check-circle"
              size={normalize(16)}
              color="#4CAF50"
              importantForAccessibility="no"
            />
            <Text style={styles.savedBadgeText}>Salvo</Text>
          </View>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        importantForAccessibility="no"
      >
        <View
          style={styles.resultCard}
          accessible={true}
          focusable={true}
          accessibilityRole="text"
          accessibilityLabel={scoreAccessibilityLabel}
        >
          <View style={styles.scoreCircle} importantForAccessibility="no">
            <Text style={[styles.scoreText, { color: accuracyColor }]}>
              {accuracy}%
            </Text>
            <Text style={styles.scoreLabel}>Precisão</Text>
          </View>
          <Text
            style={styles.performanceMessage}
            importantForAccessibility="no"
          >
            {performanceMessage}
          </Text>
        </View>

        <View
          style={styles.statsGrid}
          accessible={true}
          focusable={true}
          accessibilityRole="text"
          accessibilityLabel={statsAccessibilityLabel}
        >
          <View style={styles.statCard} importantForAccessibility="no">
            <MaterialCommunityIcons
              name="timer-sand"
              size={normalize(28)}
              color={theme.cardText}
              importantForAccessibility="no"
            />
            <Text style={styles.statNumber}>{formatTime(timeSpent)}</Text>
            <Text style={styles.statLabel}>Tempo</Text>
          </View>

          <View style={styles.statCard} importantForAccessibility="no">
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={normalize(28)}
              color="#4CAF50"
              importantForAccessibility="no"
            />
            <Text style={styles.statNumber}>{correctAnswers || 0}</Text>
            <Text style={styles.statLabel}>Acertos</Text>
          </View>

          <View style={styles.statCard} importantForAccessibility="no">
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={normalize(28)}
              color="#F44336"
              importantForAccessibility="no"
            />
            <Text style={styles.statNumber}>{wrongAnswers ?? 0}</Text>
            <Text style={styles.statLabel}>Erros</Text>
          </View>

          <View style={styles.statCard} importantForAccessibility="no">
            <MaterialCommunityIcons
              name="hand-coin"
              size={normalize(28)}
              color="#FFC107"
              importantForAccessibility="no"
            />
            <Text style={styles.statNumber}>+{coinsEarned || 0}</Text>
            <Text style={styles.statLabel}>Moedas</Text>
          </View>
        </View>

        {pointsEarned > 0 && (
          <View
            style={[styles.tipBox, { borderColor: "#4ECDC4" }]}
            accessible={true}
            focusable={true}
            accessibilityRole="text"
            accessibilityLabel={`Você ganhou ${pointsEarned} pontos de experiência!`}
          >
            <Text style={styles.tipText} importantForAccessibility="no">
              +{pointsEarned} pontos de XP ganhos!
            </Text>
          </View>
        )}

        <View
          style={styles.tipBox}
          accessible={true}
          focusable={true}
          accessibilityRole="text"
          accessibilityLabel="Dica: Arraste para a esquerda para voltar ao início, ou arraste para a direita para refazer."
        >
          <Text style={styles.tipText} importantForAccessibility="no">
            Arraste p/ esquerda para sair ou direita p/ refazer.
          </Text>
        </View>
      </ScrollView>

      {showConfetti && (
        <View
          style={styles.confettiContainer}
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          <ConfettiCannon
            count={50}
            origin={{ x: WINDOW_WIDTH / 2, y: -20 }}
            fadeOut={true}
            fallSpeed={3000}
          />
        </View>
      )}
    </SafeAreaView>
  );

  if (gestureWrapper && Platform.OS !== "web") {
    const { GestureDetector } = require("react-native-gesture-handler");
    return (
      <GestureDetector gesture={gestureWrapper}>{content}</GestureDetector>
    );
  }

  return content;
}

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: wp(4),
      paddingBottom: hp(5),
    },
    header: {
      paddingTop: hp(3),
      paddingBottom: hp(2),
      alignItems: "center",
      paddingHorizontal: wp(4),
    },
    headerTitle: {
      fontSize: Math.min(normalize(28) * fontMultiplier, wp(8)),
      fontWeight: "bold",
      color: theme.text,
      marginTop: hp(1),
      letterSpacing,
      textAlign: "center",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    headerSubtitle: {
      fontSize: Math.min(normalize(16) * fontMultiplier, wp(4.5)),
      color: theme.text,
      marginTop: hp(0.5),
      fontWeight: "400",
      textAlign: "center",
    },
    savingBadge: {
      marginTop: hp(1),
      flexDirection: "row",
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.7),
      borderRadius: 20,
      alignItems: "center",
    },
    savingBadgeText: {
      marginLeft: wp(2),
      color: "#fff",
      fontWeight: "600",
      fontSize: normalize(13),
    },
    savedBadge: {
      marginTop: hp(1),
      flexDirection: "row",
      backgroundColor: "rgba(76,175,80,0.1)",
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.7),
      borderRadius: 20,
      alignItems: "center",
    },
    savedBadgeText: {
      marginLeft: wp(1.5),
      color: "#4CAF50",
      fontWeight: "700",
      fontSize: normalize(13),
    },
    resultCard: {
      backgroundColor: theme.card,
      marginVertical: hp(2),
      padding: wp(6),
      borderRadius: 14,
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    scoreCircle: {
      width: wp(30),
      height: wp(30),
      maxWidth: 120,
      maxHeight: 120,
      borderRadius: wp(15),
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: theme.cardText,
      marginBottom: hp(2),
    },
    scoreText: {
      fontSize: Math.min(normalize(34) * fontMultiplier, wp(10)),
      fontWeight: "bold",
    },
    scoreLabel: {
      color: theme.text,
      marginTop: hp(0.5),
      fontSize: Math.min(normalize(14), wp(3.8)),
    },
    performanceMessage: {
      marginTop: hp(1),
      textAlign: "center",
      fontSize: Math.min(normalize(18) * fontMultiplier, wp(5)),
      color: theme.cardText,
      fontWeight: "600",
      lineHeight: Math.min(
        normalize(24) * fontMultiplier * lineHeightMultiplier,
        wp(6.5)
      ),
      paddingHorizontal: wp(2),
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginTop: hp(1),
      marginBottom: hp(2),
    },
    statCard: {
      backgroundColor: theme.card,
      width: "48%",
      paddingVertical: hp(2.5),
      paddingHorizontal: wp(2),
      borderRadius: 12,
      alignItems: "center",
      marginBottom: hp(1.5),
      minHeight: hp(12),
      justifyContent: "center",
      elevation: 1,
    },
    statNumber: {
      color: theme.cardText,
      fontSize: Math.min(normalize(22) * fontMultiplier, wp(6)),
      fontWeight: "bold",
      marginTop: hp(0.7),
    },
    statLabel: {
      color: theme.cardText,
      opacity: 0.85,
      marginTop: hp(0.4),
      fontSize: Math.min(normalize(14), wp(3.8)),
    },
    tipBox: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 15,
      backgroundColor: theme.card,
      borderRadius: 12,
      marginTop: 10,
      borderWidth: 1,
      borderColor: theme.button + "50",
    },
    tipText: {
      color: theme.cardText,
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
    },
    confettiContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    },
  });
