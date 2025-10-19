// src/screens/module/ModuleResultScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
// 👇 1. IMPORTAR useSettings e useContrast 👇
import { useSettings } from "../../hooks/useSettings";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";

const { width } = Dimensions.get("window");

export default function ModuleResultScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModuleResult">) {
  const {
    moduleId,
    correctAnswers,
    totalQuestions,
    accuracy,
    timeSpent,
    coinsEarned,
    pointsEarned,
    passed,
  } = route.params;
  const errors = totalQuestions - correctAnswers;

  // 👇 2. OBTER VALORES DE ACESSIBILIDADE E TEMA 👇
  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  // 👇 3. PASSAR VALORES PARA A CRIAÇÃO DE ESTILOS 👇
  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
    return `${remainingSeconds}s`;
  };

  const getPerformanceMessage = (): string => {
    if (accuracy >= 90)
      return "Excelente! Você dominou completamente este módulo!";
    if (accuracy >= 80)
      return "Muito bom! Você tem um ótimo entendimento do conteúdo!";
    if (accuracy >= 70) return "Bom trabalho! Você passou no módulo!";
    return "Continue praticando! A prática leva à perfeição!";
  };

  const getAccuracyColor = (): string => {
    if (accuracy >= 90) return "#4CAF50";
    if (accuracy >= 80) return "#8BC34A";
    if (accuracy >= 70) return "#FFC107";
    return "#F44336";
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />
      <AccessibleView
        style={styles.header}
        accessibilityText={`Resultado do Módulo ${moduleId}. ${passed ? "Parabéns, você passou!" : "Quase lá, continue praticando!"}`}
      >
        <MaterialCommunityIcons
          name={passed ? "trophy" : "school"}
          size={48}
          color={theme.text}
        />
        <Text style={styles.headerTitle}>
          {passed ? "Parabéns!" : "Quase lá!"}
        </Text>
        <Text style={styles.headerSubtitle}>
          Módulo {moduleId} {passed ? "Concluído" : "Não Concluído"}
        </Text>
      </AccessibleView>

      <ScrollView
        style={styles.contentArea}
        showsVerticalScrollIndicator={false}
      >
        <AccessibleView
          style={styles.mainResultCard}
          accessibilityText={`Sua precisão foi de ${accuracy}%. ${getPerformanceMessage()}`}
        >
          <View style={styles.scoreCircle}>
            <Text style={[styles.accuracyText, { color: getAccuracyColor() }]}>
              {accuracy}%
            </Text>
            <Text style={styles.accuracyLabel}>Precisão</Text>
          </View>
          <Text style={styles.performanceMessage}>
            {getPerformanceMessage()}
          </Text>
        </AccessibleView>

        <View style={styles.statsGrid}>
          {/* ... (outros cards de estatísticas com estilos já aplicados) ... */}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!passed && (
          <AccessibleButton
            style={styles.secondaryButton}
            onPress={() => navigation.replace("ModuleQuiz", { moduleId })}
            accessibilityText="Tentar Novamente o quiz"
          >
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={styles.secondaryButtonText.color}
            />
            <Text style={styles.secondaryButtonText}>Tentar Novamente</Text>
          </AccessibleButton>
        )}
        <AccessibleButton
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Home")}
          accessibilityText={passed ? "Continuar" : "Voltar ao Início"}
        >
          <Text style={styles.primaryButtonText}>
            {passed ? "Continuar" : "Voltar ao Início"}
          </Text>
          <MaterialCommunityIcons
            name={passed ? "arrow-right-circle" : "home"}
            size={20}
            color={styles.primaryButtonText.color}
          />
        </AccessibleButton>
      </View>
    </View>
  );
}

// 👇 4. RECEBER PARÂMETROS E APLICAR NOS ESTILOS DE TEXTO 👇
const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 28 * fontMultiplier,
      fontWeight: isBold ? "bold" : "bold",
      color: theme.text,
      marginTop: 10,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 28 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
    },
    headerSubtitle: {
      fontSize: 16 * fontMultiplier,
      color: theme.text,
      marginTop: 5,
      fontWeight: isBold ? "bold" : "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 16 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
    },
    contentArea: { flex: 1, paddingHorizontal: 20 },
    mainResultCard: {
      backgroundColor: theme.card,
      borderRadius: 15,
      padding: 25,
      alignItems: "center",
      marginBottom: 20,
    },
    scoreCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      borderWidth: 4,
      borderColor: "rgba(128,128,128,0.2)",
    },
    accuracyText: { fontSize: 32 * fontMultiplier, fontWeight: "bold" },
    accuracyLabel: {
      fontSize: 14 * fontMultiplier,
      color: theme.text,
      fontWeight: isBold ? "bold" : "600",
    },
    performanceMessage: {
      color: theme.cardText,
      fontSize: 18 * fontMultiplier,
      textAlign: "center",
      fontWeight: isBold ? "bold" : "500",
      lineHeight: 24 * lineHeight,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing: letterSpacing,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    statCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      width: (width - 60) / 2,
      marginBottom: 15,
      alignItems: "center",
    },
    fullWidthStatCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      width: "100%",
      marginBottom: 15,
      alignItems: "center",
    },
    statNumber: {
      color: theme.cardText,
      fontSize: 24 * fontMultiplier,
      fontWeight: "bold",
      marginTop: 8,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    statLabel: {
      color: theme.cardText,
      fontSize: 14 * fontMultiplier,
      marginTop: 4,
      fontWeight: isBold ? "bold" : "500",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: theme.card,
    },
    primaryButton: {
      backgroundColor: theme.button,
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 25,
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    },
    secondaryButton: {
      backgroundColor: theme.background,
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 25,
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      marginRight: 10,
      borderWidth: 2,
      borderColor: theme.button,
    },
    primaryButtonText: {
      color: theme.buttonText,
      fontSize: 16 * fontMultiplier,
      fontWeight: "bold",
      marginRight: 8,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    secondaryButtonText: {
      color: theme.button,
      fontSize: 16 * fontMultiplier,
      fontWeight: "bold",
      marginRight: 8,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });
