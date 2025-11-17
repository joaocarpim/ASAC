import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
import { RootStackScreenProps } from "../../navigation/types";

import { useSettings } from "../../hooks/useSettings";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";

import {
  AccessibleView,
  AccessibleButton,
  AccessibleHeader,
  AccessibleText,
} from "../../components/AccessibleComponents";

import { Audio } from "expo-av";
import { useAuthStore } from "../../store/authStore";
import progressService, { ErrorDetail } from "../../services/progressService";
import { useModalStore } from "../../store/useModalStore";

import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";
import { useSwipeNavigation } from "../../hooks/useSwipeNavigation";

const { width } = Dimensions.get("window");

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

  // Sounds
  const [successSound, setSuccessSound] = useState<Audio.Sound | null>(null);
  const [failureSound, setFailureSound] = useState<Audio.Sound | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Theme + Accessibility
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

  // Swipe Navigation (universal handler)
  const { panResponder, gestureWrapper } = useSwipeNavigation({
    onSwipeLeft: () => navigation.navigate("Home"),
    onSwipeRight: () => navigation.replace("ModuleQuiz", { moduleId }),
  });

  // Load sounds
  useEffect(() => {
    async function load() {
      try {
        const { sound: success } = await Audio.Sound.createAsync(
          require("../../../assets/som/happy.mp3")
        );
        const { sound: fail } = await Audio.Sound.createAsync(
          require("../../../assets/som/incorrect.mp3")
        );

        setSuccessSound(success);
        setFailureSound(fail);
      } catch (err) {
        console.log("Erro ao carregar som:", err);
      }
    }
    load();

    return () => {
      successSound?.unloadAsync();
      failureSound?.unloadAsync();
    };
  }, []);

  // Play sounds + Confetti
  useEffect(() => {
    if (passed) {
      successSound?.playAsync();
      setShowConfetti(true);

      const title = "🎉 Módulo Concluído!";
      const body = `Parabéns! Você completou o Módulo ${moduleId} com ${accuracy}% de acertos!`;

      showModal(title, body);

      setTimeout(() => setShowConfetti(false), 2500);
    } else {
      failureSound?.playAsync();
    }
  }, [passed]);

  // Save Progress Automatic
  const handleSaveProgress = useCallback(async () => {
    if (!user?.userId || !progressId) return;

    setSaving(true);

    try {
      const moduleNumber =
        parseInt(String(moduleId).replace(/\D/g, "")) || Number(moduleId) || 1;

      const achievementTitle = `Módulo ${moduleNumber} Concluído`;
      const errorCount = wrongAnswers ?? totalQuestions - correctAnswers;

      let parsedErrors: ErrorDetail[] = [];

      if (errorDetails) {
        try {
          parsedErrors = JSON.parse(errorDetails);
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

      if (result) setSaved(true);
    } catch (e) {
      console.log("Erro ao salvar progresso:", e);
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    if (!saved && !saving) {
      handleSaveProgress();
    }
  }, [saved, saving]);

  // ============ Helpers ============

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
      : "Continue praticando! Você está progredindo.";

  // MAIN UI -----------------------------------------------------

  const content = (
    <View style={styles.container} {...panResponder}>
      <StatusBar barStyle={"light-content"} />

      {/* HEADER */}
      <AccessibleView
        accessibilityText="Resumo do resultado do módulo"
        style={styles.header}
      >
        <MaterialCommunityIcons
          name={passed ? "trophy" : "school"}
          size={52}
          color={theme.text}
        />

        <AccessibleHeader level={1} style={styles.headerTitle}>
          {passed ? "Parabéns!" : "Você tentou!"}
        </AccessibleHeader>

        <AccessibleText baseSize={15} style={styles.headerSubtitle}>
          Módulo {moduleId} — {passed ? "Concluído" : "Não passou"}
        </AccessibleText>

        {saving && (
          <View style={styles.savingBadge}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.savingBadgeText}>Salvando...</Text>
          </View>
        )}

        {saved && !saving && (
          <View style={styles.savedBadge}>
            <MaterialCommunityIcons
              name="check-circle"
              size={16}
              color="#4CAF50"
            />
            <Text style={styles.savedBadgeText}>Progresso salvo!</Text>
          </View>
        )}
      </AccessibleView>

      {/* RESULT MAIN CARD */}
      <ScrollView style={styles.scroll}>
        <View style={styles.resultCard}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreText, { color: accuracyColor }]}>
              {accuracy}%
            </Text>
            <Text style={styles.scoreLabel}>Precisão</Text>
          </View>

          <Text style={styles.performanceMessage}>{performanceMessage}</Text>
        </View>

        {/* GRID DE ESTATÍSTICAS */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="timer-sand" size={28} color="#fff" />
            <Text style={styles.statNumber}>{formatTime(timeSpent)}</Text>
            <Text style={styles.statLabel}>Tempo</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={28}
              color="#4CAF50"
            />
            <Text style={styles.statNumber}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Acertos</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={28}
              color="#F44336"
            />
            <Text style={styles.statNumber}>{wrongAnswers}</Text>
            <Text style={styles.statLabel}>Erros</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="hand-coin"
              size={28}
              color="#FFC107"
            />
            <Text style={styles.statNumber}>+{coinsEarned}</Text>
            <Text style={styles.statLabel}>Moedas</Text>
          </View>
        </View>
      </ScrollView>

      {/* BUTTONS */}
      <View style={styles.footer}>
        {!passed && (
          <AccessibleButton
            onPress={() => navigation.replace("ModuleQuiz", { moduleId })}
            style={styles.secondaryButton}
            accessibilityText="Tentar novamente"
          >
            <Text style={styles.secondaryButtonText}>Tentar Novamente</Text>
          </AccessibleButton>
        )}

        <AccessibleButton
          onPress={() => navigation.navigate("Home")}
          style={styles.primaryButton}
          accessibilityText="Voltar ao Início"
        >
          <Text style={styles.primaryButtonText}>
            {passed ? "Continuar" : "Voltar"}
          </Text>
        </AccessibleButton>
      </View>

      {/* CONFETTI */}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          <ConfettiCannon
            count={160}
            origin={{ x: width / 2, y: -20 }}
            fadeOut
          />
        </View>
      )}
    </View>
  );

  // Mobile → envolve em GestureDetector
  if (gestureWrapper && Platform.OS !== "web") {
    const { GestureDetector } = require("react-native-gesture-handler");
    return (
      <GestureDetector gesture={gestureWrapper}>{content}</GestureDetector>
    );
  }

  return content;
}

// ============================================================
// STYLESHEET
// ============================================================

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
      paddingHorizontal: 20,
    },

    header: {
      paddingTop: 50,
      paddingBottom: 15,
      alignItems: "center",
    },

    headerTitle: {
      fontSize: 28 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 10,
      letterSpacing,
      lineHeight: 28 * lineHeightMultiplier * fontMultiplier,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },

    headerSubtitle: {
      fontSize: 16 * fontMultiplier,
      color: theme.text,
      marginTop: 4,
      fontWeight: "400",
    },

    savingBadge: {
      marginTop: 10,
      flexDirection: "row",
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignItems: "center",
    },
    savingBadgeText: {
      marginLeft: 8,
      color: "#fff",
      fontWeight: "600",
    },

    savedBadge: {
      marginTop: 10,
      flexDirection: "row",
      backgroundColor: "rgba(76,175,80,0.2)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignItems: "center",
    },
    savedBadgeText: {
      marginLeft: 6,
      color: "#4CAF50",
      fontWeight: "700",
    },

    resultCard: {
      backgroundColor: theme.card,
      marginVertical: 20,
      padding: 25,
      borderRadius: 14,
      alignItems: "center",
    },
    scoreCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: "#fff",
      marginBottom: 20,
    },
    scoreText: {
      fontSize: 34 * fontMultiplier,
      fontWeight: "bold",
    },
    scoreLabel: {
      color: theme.text,
      marginTop: 5,
      fontSize: 14,
    },
    performanceMessage: {
      marginTop: 10,
      textAlign: "center",
      fontSize: 18 * fontMultiplier,
      color: theme.cardText,
      fontWeight: "600",
      lineHeight: 24 * fontMultiplier * lineHeightMultiplier,
    },

    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginTop: 10,
      marginBottom: 20,
    },

    statCard: {
      backgroundColor: theme.card,
      width: "48%",
      paddingVertical: 20,
      paddingHorizontal: 10,
      borderRadius: 12,
      alignItems: "center",
      marginBottom: 15,
    },
    statNumber: {
      color: theme.cardText,
      fontSize: 22 * fontMultiplier,
      fontWeight: "bold",
      marginTop: 6,
    },
    statLabel: {
      color: theme.cardText,
      opacity: 0.85,
      marginTop: 3,
    },

    footer: {
      flexDirection: "row",
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.15)",
      gap: 10,
    },

    primaryButton: {
      flex: 1,
      backgroundColor: theme.button,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    primaryButtonText: {
      color: theme.buttonText,
      fontSize: 16,
      fontWeight: "700",
    },

    secondaryButton: {
      flex: 1,
      borderWidth: 2,
      borderColor: theme.button,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      backgroundColor: "transparent",
    },
    secondaryButtonText: {
      color: theme.button,
      fontWeight: "700",
      fontSize: 16,
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
