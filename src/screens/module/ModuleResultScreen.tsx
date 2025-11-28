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
  SafeAreaView,
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

import { Gesture, GestureDetector } from "react-native-gesture-handler";
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

  const [successSound, setSuccessSound] = useState<Audio.Sound | null>(null);
  const [failureSound, setFailureSound] = useState<Audio.Sound | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

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

  useEffect(() => {
    if (passed) {
      // Pequeno delay para garantir que o som carregou
      setTimeout(() => {
        successSound?.playAsync();
      }, 500);

      setShowConfetti(true);

      const title = "🎉 Módulo Concluído!";
      const body = `Parabéns! Você completou o Módulo ${moduleId} com ${accuracy}% de acertos!`;

      showModal(title, body);

      setTimeout(() => setShowConfetti(false), 2500);
    } else {
      setTimeout(() => {
        failureSound?.playAsync();
      }, 500);
    }
  }, [passed, successSound, failureSound]); // Adicionado dependências de som

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

  const content = (
    <SafeAreaView style={styles.container} {...panResponder}>
      <StatusBar barStyle={"light-content"} />

      <AccessibleView
        accessibilityText="Resumo do resultado do módulo"
        style={styles.header}
      >
        <MaterialCommunityIcons
          name={passed ? "trophy" : "school"}
          size={normalize(52)}
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
              size={normalize(16)}
              color="#4CAF50"
            />
            <Text style={styles.savedBadgeText}>Progresso salvo!</Text>
          </View>
        )}
      </AccessibleView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.resultCard}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreText, { color: accuracyColor }]}>
              {accuracy}%
            </Text>
            <Text style={styles.scoreLabel}>Precisão</Text>
          </View>

          <Text style={styles.performanceMessage}>{performanceMessage}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="timer-sand"
              size={normalize(28)}
              color={theme.cardText}
            />
            <Text style={styles.statNumber}>{formatTime(timeSpent)}</Text>
            <Text style={styles.statLabel}>Tempo</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={normalize(28)}
              color="#4CAF50"
            />
            <Text style={styles.statNumber}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Acertos</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={normalize(28)}
              color="#F44336"
            />
            <Text style={styles.statNumber}>{wrongAnswers}</Text>
            <Text style={styles.statLabel}>Erros</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="hand-coin"
              size={normalize(28)}
              color="#FFC107"
            />
            <Text style={styles.statNumber}>+{coinsEarned}</Text>
            <Text style={styles.statLabel}>Moedas</Text>
          </View>
        </View>

        {/* Dica de Navegação por Gesto (Já que removemos o botão) */}
        {passed && (
          <View style={styles.tipBox}>
            <Text style={styles.tipIcon}>👈</Text>
            <Text style={styles.tipText}>
              Arraste para a esquerda para sair.
            </Text>
          </View>
        )}
      </ScrollView>

      
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          <ConfettiCannon
            count={160}
            origin={{ x: WINDOW_WIDTH / 2, y: -20 }}
            fadeOut
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
      paddingBottom: hp(2),
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
      backgroundColor: "rgba(76,175,80,0.2)",
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
    tipIcon: {
      fontSize: 20,
      marginRight: 10,
    },
    tipText: {
      color: theme.cardText,
      fontSize: 14,
      fontWeight: "500",
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
