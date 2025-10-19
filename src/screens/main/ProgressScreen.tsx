import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
import { useSettings } from "../../hooks/useSettings";
// 👇 1. IMPORTAR OS COMPONENTES DE GESTO 👇
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";

export default function ProgressScreen() {
  const navigation = useNavigation();
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

  const userProgress = {
    accuracy: 0.7,
    correct: 13,
    durationSec: 2220,
    finishedModules: 1,
    totalModules: 3,
  };
  const formatDuration = (s: number) =>
    new Date(s * 1000).toISOString().substr(14, 5);

  // 👇 2. DEFINIR A FUNÇÃO E O GESTO 👇
  const handleGoBack = () => {
    navigation.goBack();
  };

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleGoBack);

  const renderModuleBlocks = () => {
    const blocks = [];
    for (let i = 1; i <= userProgress.totalModules; i++) {
      blocks.push(
        <AccessibleButton
          key={i}
          style={styles.moduloBlock}
          onPress={() => alert(`Módulo ${i}`)}
          accessibilityText={`Módulo ${i}. Toque para ver detalhes.`}
        >
          <Text style={styles.moduloBlockText}>{i}</Text>
        </AccessibleButton>
      );
    }
    return blocks;
  };

  return (
    // 👇 3. ENVOLVER A TELA COM O DETECTOR DE GESTOS 👇
    <GestureDetector gesture={flingRight}>
      <AccessibleView
        style={styles.page}
        accessibilityText="Tela de Meu Progresso. Deslize para a direita para voltar."
      >
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <View style={styles.header}>
          <AccessibleButton
            onPress={handleGoBack} // Reutilizando a função
            accessibilityText="Voltar"
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
          <AccessibleView accessibilityText="Meu progresso. Acompanhe seu desenvolvimento no Molingo.">
            <View style={styles.progressSummaryCard}>
              <View style={styles.progressTextContent}>
                <Text style={styles.progressSummaryTitle}>Meu progresso</Text>
                <Text style={styles.progressSummarySubtitle}>
                  Acompanhe seu desenvolvimento no Molingo
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

// A função createStyles permanece exatamente a mesma
const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.background, marginTop: "-5%" },
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
      paddingTop: 20,
    },
    centered: { alignItems: "center" },
    rocketEmoji: { fontSize: 60, marginTop: 10, marginBottom: 20 },
    metricsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginBottom: 20,
    },
    metricCard: {
      backgroundColor: theme.card,
      marginLeft: -5,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 40,
      alignItems: "center",
      width: "25%",
      height: 75,
      marginHorizontal: 4,
      marginVertical: 6,
    },

    metricValue: {
      color: theme.cardText,
      fontSize: 14 * fontMultiplier,
      fontWeight: "bold",
      marginTop: 4,
      lineHeight: 14 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    metricLabel: {
      color: theme.cardText,
      fontSize: 10 * fontMultiplier,
      marginTop: 2,
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
      marginBottom: 8,
      textAlign: "center",
      marginTop: "-5%",
      lineHeight: 15 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    modulosRow: {
      flexDirection: "row",
      justifyContent: "center",
      width: "100%",
      marginTop: "-2%",
    },
    moduloBlock: {
      width: 45,
      height: 45,
      borderRadius: 10,
      backgroundColor: theme.button,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 5,
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
