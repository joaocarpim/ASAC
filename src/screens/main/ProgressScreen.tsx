import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
import { useSettings } from "../../hooks/useSettings";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
// ✅ REMOVIDO: A importação do 'react-native-reanimated' foi removida.
import { useAuthStore } from "../../store/authStore";
import { getUserById } from "../../services/progressService";

export default function ProgressScreen() {
  const navigation = useNavigation();
  const { theme } = useContrast();
  const { user } = useAuthStore();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const [userProgress, setUserProgress] = useState({
    accuracy: 0,
    correct: 0,
    durationSec: 0,
    finishedModules: 0,
    totalModules: 3,
  });
  const [loading, setLoading] = useState(true);

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const fetchProgress = useCallback(async () => {
    if (!user?.userId) return;

    setLoading(true);
    try {
      const dbUser = await getUserById(user.userId);
      if (dbUser) {
        const modulesCompleted = Array.isArray(dbUser.modulesCompleted)
          ? dbUser.modulesCompleted.length
          : 0;

        const totalAnswers =
          (dbUser.correctAnswers || 0) + (dbUser.wrongAnswers || 0);
        const accuracy =
          totalAnswers > 0 ? (dbUser.correctAnswers || 0) / totalAnswers : 0;

        setUserProgress({
          accuracy,
          correct: dbUser.correctAnswers || 0,
          durationSec: dbUser.timeSpent || 0,
          finishedModules: modulesCompleted,
          totalModules: 3,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar progresso:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useFocusEffect(
    useCallback(() => {
      fetchProgress();
    }, [fetchProgress])
  );

  const formatDuration = (s: number) =>
    new Date(s * 1000).toISOString().substr(14, 5);

  const handleGoHome = () => {
    navigation.navigate("Home" as never);
  };

  const panGesture = Gesture.Pan().onEnd((event) => {
    const SWIPE_THRESHOLD = 50;

    if (
      event.translationX > SWIPE_THRESHOLD &&
      event.translationX > Math.abs(event.translationY)
    ) {
      // ✅ ALTERADO: Chamando a função de navegação diretamente.
      handleGoHome();
    }
  });

  const renderModuleBlocks = () => {
    const blocks = [];
    for (let i = 1; i <= userProgress.totalModules; i++) {
      const isCompleted = i <= userProgress.finishedModules;
      blocks.push(
        <AccessibleButton
          key={i}
          style={[
            styles.moduloBlock,
            isCompleted && styles.moduloBlockCompleted,
          ]}
          onPress={() => {}}
          accessibilityText={`Módulo ${i}. ${
            isCompleted ? "Concluído" : "Não concluído"
          }`}
        >
          {isCompleted ? (
            <Text style={styles.moduloBlockText}>{i}</Text>
          ) : (
            <MaterialCommunityIcons
              name="lock"
              size={22}
              color={theme.buttonText}
            />
          )}
        </AccessibleButton>
      );
    }
    return blocks;
  };

  if (loading) {
    return (
      <GestureDetector gesture={panGesture}>
        <View style={styles.page}>
          <StatusBar
            barStyle={theme.statusBarStyle}
            backgroundColor={theme.background}
          />
          <View style={styles.header}>
            <AccessibleButton
              onPress={handleGoHome}
              accessibilityText="Voltar para a tela inicial"
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={28}
                color={styles.headerTitle.color}
              />
            </AccessibleButton>
            <AccessibleHeader level={1} style={styles.headerTitle}>
              Meu Progresso
            </AccessibleHeader>
            <View style={styles.headerIconPlaceholder} />
          </View>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        </View>
      </GestureDetector>
    );
  }

  return (
    <GestureDetector gesture={panGesture}>
      <AccessibleView
        style={styles.page}
        accessibilityText="Tela de Meu Progresso. Deslize para a direita para voltar para a tela inicial."
      >
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <View style={styles.header}>
          <AccessibleButton
            onPress={handleGoHome}
            accessibilityText="Voltar para a tela inicial"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color={styles.headerTitle.color}
            />
          </AccessibleButton>
          <AccessibleHeader level={1} style={styles.headerTitle}>
            Meu Progresso
          </AccessibleHeader>
          <View style={styles.headerIconPlaceholder} />
        </View>
        <View style={styles.mainContent}>
          <AccessibleView
            style={styles.centered}
            accessibilityText="Foguete, representando seu progresso"
          >
            <Text style={styles.rocketEmoji}>🚀</Text>
          </AccessibleView>
          <View style={styles.metricsRow}>
            <AccessibleView
              accessibilityText={`Precisão: ${(
                userProgress.accuracy * 100
              ).toFixed(0)} por cento.`}
            >
              <View style={styles.metricCard}>
                <MaterialCommunityIcons
                  name="bullseye-arrow"
                  size={22}
                  color={theme.cardText}
                />
                <Text style={styles.metricValue}>
                  {(userProgress.accuracy * 100).toFixed(0)}%
                </Text>
                <Text style={styles.metricLabel}>Precisão</Text>
              </View>
            </AccessibleView>
            <AccessibleView
              accessibilityText={`Acertos: ${userProgress.correct}.`}
            >
              <View style={styles.metricCard}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={22}
                  color={theme.cardText}
                />
                <Text style={styles.metricValue}>{userProgress.correct}</Text>
                <Text style={styles.metricLabel}>Acertos</Text>
              </View>
            </AccessibleView>
            <AccessibleView
              accessibilityText={`Tempo total: ${formatDuration(
                userProgress.durationSec
              )}.`}
            >
              <View style={styles.metricCard}>
                <MaterialCommunityIcons
                  name="clock-time-three-outline"
                  size={22}
                  color={theme.cardText}
                />
                <Text style={styles.metricValue}>
                  {formatDuration(userProgress.durationSec)}
                </Text>
                <Text style={styles.metricLabel}>Tempo</Text>
              </View>
            </AccessibleView>
          </View>
          <AccessibleView accessibilityText="Meu progresso. Acompanhe seu desenvolvimento no ASAC.">
            <View style={styles.progressSummaryCard}>
              <View style={styles.progressTextContent}>
                <Text style={styles.progressSummaryTitle}>Meu progresso</Text>
                <Text style={styles.progressSummarySubtitle}>
                  Acompanhe seu desenvolvimento no ASAC
                </Text>
              </View>
              <MaterialCommunityIcons
                name="face-recognition"
                style={styles.mascoteIcon}
              />
            </View>
          </AccessibleView>
          <AccessibleHeader level={2} style={styles.modulosTitle}>
            Módulos
          </AccessibleHeader>
          <View style={styles.modulosRow}>{renderModuleBlocks()}</View>
        </View>
      </AccessibleView>
    </GestureDetector>
  );
}

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 15,
      paddingHorizontal: 20,
      width: "100%",
    },
    headerTitle: {
      color: theme.text,
      opacity: 0.8,
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    headerIconPlaceholder: { width: 28 },
    mainContent: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: "flex-start",
      paddingTop: 40,
    },
    centered: { alignItems: "center" },
    rocketEmoji: { fontSize: 60, marginTop: 10, marginBottom: 20 },
    metricsRow: {
      flexDirection: "row",
      justifyContent: "center",
      width: "100%",
      marginBottom: 20,
    },
    metricCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 30,
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      marginHorizontal: 5,
    },
    metricValue: {
      color: theme.cardText,
      fontSize: 14 * fontMultiplier,
      fontWeight: "bold",
      marginTop: 6,
      lineHeight: 14 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    metricLabel: {
      color: theme.cardText,
      fontSize: 10 * fontMultiplier,
      marginTop: 4,
      textAlign: "center",
      fontWeight: isBold ? "bold" : "normal",
      lineHeight: 10 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    progressSummaryCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: 20,
    },
    progressTextContent: { flex: 1 },
    progressSummaryTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginBottom: 2,
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    progressSummarySubtitle: {
      fontSize: 13 * fontMultiplier,
      color: theme.cardText,
      lineHeight: 16 * lineHeight,
      fontWeight: isBold ? "bold" : "normal",
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    mascoteIcon: {
      fontSize: 50,
      color: theme.cardText,
      opacity: 0.5,
      marginLeft: 10,
    },
    modulosTitle: {
      fontSize: 15 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 10,
      textAlign: "center",
      marginTop: 20,
      lineHeight: 15 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    modulosRow: {
      flexDirection: "row",
      justifyContent: "center",
      width: "100%",
      marginTop: 10,
    },
    moduloBlock: {
      width: 45,
      height: 45,
      borderRadius: 10,
      backgroundColor: theme.button,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 5,
      opacity: 0.5,
    },
    moduloBlockCompleted: {
      opacity: 1,
    },
    moduloBlockText: {
      color: theme.buttonText,
      fontSize: 22 * fontMultiplier,
      fontWeight: "bold",
      lineHeight: 22 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });
