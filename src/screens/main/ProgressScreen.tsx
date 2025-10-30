import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
import { useSettings } from "../../hooks/useSettings";
import { Gesture, GestureDetector, Directions } from "react-native-gesture-handler";
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
    wrong: 0,
    durationSec: 0,
    finishedModules: 0,
    totalModules: 3,
    modulesCompletedList: [] as number[],
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
          ? dbUser.modulesCompleted
          : [];

        const totalAnswers =
          (dbUser.correctAnswers || 0) + (dbUser.wrongAnswers || 0);
        const accuracy =
          totalAnswers > 0 ? (dbUser.correctAnswers || 0) / totalAnswers : 0;

        setUserProgress({
          accuracy,
          correct: dbUser.correctAnswers || 0,
          wrong: dbUser.wrongAnswers || 0,
          durationSec: dbUser.timeSpent || 0,
          finishedModules: modulesCompleted.length,
          totalModules: 3,
          modulesCompletedList: modulesCompleted,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar progresso:", error);
      setUserProgress({
        accuracy: 0,
        correct: 0,
        wrong: 0,
        durationSec: 0,
        finishedModules: 0,
        totalModules: 3,
        modulesCompletedList: [],
      });
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useFocusEffect(
    useCallback(() => {
      fetchProgress();
    }, [fetchProgress])
  );

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleGoBack);

  const renderModuleBlocks = () => {
    const blocks = [];
    for (let i = 1; i <= userProgress.totalModules; i++) {
      const isCompleted = userProgress.modulesCompletedList.includes(i);
      blocks.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.moduloBlock,
            isCompleted && styles.moduloBlockCompleted,
          ]}
          onPress={() => {
            if (isCompleted) {
              // Pode adicionar navegação para detalhes do módulo aqui
              console.log(`Módulo ${i} concluído`);
            }
          }}
          accessibilityLabel={`Módulo ${i}. ${isCompleted ? 'Concluído' : 'Não concluído'}`}
        >
          {isCompleted ? (
            <MaterialCommunityIcons
              name="check-circle"
              size={28}
              color={theme.buttonText}
            />
          ) : (
            <MaterialCommunityIcons
              name="lock"
              size={28}
              color={theme.buttonText}
            />
          )}
          <Text style={styles.moduloBlockText}>{i}</Text>
        </TouchableOpacity>
      );
    }
    return blocks;
  };

  if (loading) {
    return (
      <GestureDetector gesture={flingRight}>
        <View style={styles.page}>
          <StatusBar
            barStyle={theme.statusBarStyle}
            backgroundColor={theme.background}
          />
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} accessibilityLabel="Voltar">
              <MaterialCommunityIcons
                name="arrow-left"
                size={28}
                color={theme.text}
              />
            </TouchableOpacity>
            <AccessibleHeader level={1} style={styles.headerTitle}>
              Meu Progresso
            </AccessibleHeader>
            <View style={styles.headerIconPlaceholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        </View>
      </GestureDetector>
    );
  }

  return (
    <GestureDetector gesture={flingRight}>
      <View style={styles.page}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} accessibilityLabel="Voltar">
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color={theme.text}
            />
          </TouchableOpacity>
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
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <MaterialCommunityIcons
                name="bullseye-arrow"
                size={28}
                color={theme.cardText}
              />
              <Text style={styles.metricValue}>
                {(userProgress.accuracy * 100).toFixed(0)}%
              </Text>
              <Text style={styles.metricLabel}>Precisão</Text>
            </View>

            <View style={styles.metricCard}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={28}
                color={theme.cardText}
              />
              <Text style={styles.metricValue}>{userProgress.correct}</Text>
              <Text style={styles.metricLabel}>Acertos</Text>
            </View>

            <View style={styles.metricCard}>
              <MaterialCommunityIcons
                name="close-circle-outline"
                size={28}
                color={theme.cardText}
              />
              <Text style={styles.metricValue}>{userProgress.wrong}</Text>
              <Text style={styles.metricLabel}>Erros</Text>
            </View>

            <View style={styles.metricCard}>
              <MaterialCommunityIcons
                name="clock-time-three-outline"
                size={28}
                color={theme.cardText}
              />
              <Text style={styles.metricValue}>
                {formatDuration(userProgress.durationSec)}
              </Text>
              <Text style={styles.metricLabel}>Tempo</Text>
            </View>
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
            Módulos Concluídos
          </AccessibleHeader>
          <View style={styles.modulosRow}>{renderModuleBlocks()}</View>
        </View>
      </View>
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
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
      paddingTop: 20,
    },
    centered: { alignItems: "center" },
    rocketEmoji: { fontSize: 60, marginBottom: 20 },
    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    metricCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 10,
      alignItems: "center",
      justifyContent: "center",
      width: "48%",
      marginBottom: 10,
    },
    metricValue: {
      color: theme.cardText,
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      marginTop: 8,
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    metricLabel: {
      color: theme.cardText,
      fontSize: 12 * fontMultiplier,
      marginTop: 4,
      textAlign: "center",
      fontWeight: isBold ? "bold" : "normal",
      lineHeight: 12 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    progressSummaryCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 15,
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
      marginBottom: 4,
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
      fontSize: 16 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 15,
      textAlign: "center",
      lineHeight: 16 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    modulosRow: {
      flexDirection: "row",
      justifyContent: "center",
      width: "100%",
    },
    moduloBlock: {
      width: 70,
      height: 70,
      borderRadius: 12,
      backgroundColor: theme.button,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 8,
      opacity: 0.4,
      borderWidth: 2,
      borderColor: theme.buttonText,
    },
    moduloBlockCompleted: {
      opacity: 1,
      backgroundColor: "#4CD964",
      borderColor: "#2E7D32",
    },
    moduloBlockText: {
      color: theme.buttonText,
      fontSize: 16 * fontMultiplier,
      fontWeight: "bold",
      marginTop: 4,
      lineHeight: 16 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });