// src/screens/settings/SelectedContrast.tsx

import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  useWindowDimensions,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useContrast } from "../../hooks/useContrast";
import { ContrastMode } from "../../types/contrast";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { AccessibleHeader } from "../../components/AccessibleComponents";

type ContrastScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Contrast"
>;

interface OptionCardProps {
  colors: Record<string, string>;
  currentSelection: ContrastMode;
  mode: ContrastMode;
  label: string;
  description: string;
  accessibilityHint: string;
  onPress: (mode: ContrastMode) => void;
  scaleFont: (size: number) => number;
  cardWidth: number;
}

const ContrastScreen: React.FC<ContrastScreenProps> = ({ navigation }) => {
  const { changeContrastMode } = useContrast();
  const [selection, setSelection] = useState<ContrastMode>("blue_yellow");
  const { width } = useWindowDimensions();

  const FONT_SCALE = width > 0 ? Math.min(width / 375, 1.2) : 1;
  const scaleFont = (size: number) => Math.round(size * FONT_SCALE);

  const isTablet = width >= 768;
  const isDesktop = width >= 1024;
  const isWeb = Platform.OS === "web";
  const columnsCount = isDesktop ? 3 : isTablet ? 3 : 2;
  const maxWidth = Math.min(width, 1200);
  const horizontalPadding = isWeb ? 40 : 20;
  const gap = isTablet ? 20 : 16;
  const CARD_WIDTH =
    (maxWidth - horizontalPadding * 2 - gap * (columnsCount - 1)) /
    columnsCount;

  const handleContinue = () => {
    changeContrastMode(selection);
    navigation.replace("Home");
  };

  const PREVIEW_COLORS = {
    yellowBg: "#FFC700",
    blueText: "#191970",
    black: "#000000",
    white: "#FFFFFF",
    sepiaBg: "#FBF0D9",
    sepiaText: "#5B4636",
    grayBg: "#E0E0E0",
    grayText: "#000000",
    cyanDarkBg: "#121212",
    cyanText: "#00FFFF",
  };

  const styles = createStyles(
    scaleFont,
    horizontalPadding,
    gap,
    maxWidth,
    isWeb
  );

  const contrastOptions: Array<{
    mode: ContrastMode;
    label: string;
    description: string;
    hint: string;
  }> = [
    {
      mode: "blue_yellow",
      label: "Azul Escuro",
      description: "Tema padrão",
      hint: "Contraste azul e amarelo.",
    },
    {
      mode: "black_white",
      label: "Alto Contraste",
      description: "Fundo preto",
      hint: "Fundo preto e texto branco.",
    },
    {
      mode: "white_black",
      label: "Claro",
      description: "Fundo branco",
      hint: "Fundo branco e texto preto.",
    },
    {
      mode: "sepia",
      label: "Sépia",
      description: "Leitura confortável",
      hint: "Reduz luz azul.",
    },
    {
      mode: "grayscale",
      label: "Monocromático",
      description: "Sem cores",
      hint: "Tons de cinza.",
    },
    {
      mode: "cyan_dark",
      label: "Ciano Escuro",
      description: "Para daltonismo",
      hint: "Otimizado para daltonismo.",
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PREVIEW_COLORS.yellowBg }}>
      <StatusBar
        backgroundColor={PREVIEW_COLORS.yellowBg}
        barStyle="dark-content"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* HEADER SECTION - AGRUPADO */}
          <View
            style={styles.headerSection}
            accessible={true}
            focusable={true}
            importantForAccessibility="yes"
            accessibilityRole="header"
            accessibilityLabel="Escolha seu Contraste. Selecione o tema que melhor atende suas necessidades de acessibilidade."
          >
            <View importantForAccessibility="no-hide-descendants">
              <Text style={[styles.title, { color: PREVIEW_COLORS.blueText }]}>
                Escolha seu Contraste
              </Text>
              <Text
                style={[styles.subtitle, { color: PREVIEW_COLORS.blueText }]}
              >
                Selecione o tema que melhor atende suas necessidades de
                acessibilidade
              </Text>
            </View>
          </View>

          <View style={styles.optionsContainer}>
            {contrastOptions.map((option) => (
              <OptionCard
                key={option.mode}
                colors={PREVIEW_COLORS}
                currentSelection={selection}
                mode={option.mode}
                label={option.label}
                description={option.description}
                accessibilityHint={option.hint}
                onPress={setSelection}
                scaleFont={scaleFont}
                cardWidth={CARD_WIDTH}
              />
            ))}
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: PREVIEW_COLORS.blueText },
              ]}
              onPress={handleContinue}
              accessible={true}
              focusable={true}
              accessibilityRole="button"
              accessibilityLabel="Confirmar e Prosseguir"
            >
              <Text
                style={[styles.buttonText, { color: PREVIEW_COLORS.yellowBg }]}
              >
                Confirmar e Prosseguir
              </Text>
            </TouchableOpacity>

            {/* CORREÇÃO: Removemos focusable={true} deste Text */}
            <Text
              style={[styles.helpText, { color: PREVIEW_COLORS.blueText }]}
              accessible={true}
            >
              Você pode alterar essa configuração a qualquer momento
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const OptionCard: React.FC<OptionCardProps> = ({
  colors,
  currentSelection,
  mode,
  label,
  description,
  accessibilityHint,
  onPress,
  scaleFont,
  cardWidth,
}) => {
  const isSelected = currentSelection === mode;
  const styles = createStyles(scaleFont);

  // Texto completo para evitar navegação interna
  const a11yLabel = `${label}. ${description}. ${accessibilityHint}. ${
    isSelected ? "Selecionado" : "Não selecionado"
  }. Toque para selecionar.`;

  const cardStyles = {
    blue_yellow: {
      backgroundColor: colors.yellowBg,
      color: colors.blueText,
      borderColor: colors.blueText,
      iconBg: colors.blueText,
      iconText: colors.yellowBg,
    },
    black_white: {
      backgroundColor: colors.black,
      color: colors.white,
      borderColor: colors.white,
      iconBg: colors.white,
      iconText: colors.black,
    },
    white_black: {
      backgroundColor: colors.white,
      color: colors.black,
      borderColor: colors.black,
      iconBg: colors.black,
      iconText: colors.white,
    },
    sepia: {
      backgroundColor: colors.sepiaBg,
      color: colors.sepiaText,
      borderColor: colors.sepiaText,
      iconBg: colors.sepiaText,
      iconText: colors.white,
    },
    grayscale: {
      backgroundColor: colors.grayBg,
      color: colors.grayText,
      borderColor: colors.grayText,
      iconBg: colors.grayText,
      iconText: colors.grayBg,
    },
    cyan_dark: {
      backgroundColor: colors.cyanDarkBg,
      color: colors.cyanText,
      borderColor: colors.cyanText,
      iconBg: colors.cyanText,
      iconText: colors.cyanDarkBg,
    },
  };

  const style = cardStyles[mode];

  return (
    <View style={[styles.cardWrapper, { width: cardWidth }]}>
      <TouchableOpacity
        onPress={() => onPress(mode)}
        activeOpacity={0.8}
        style={{ flex: 1 }}
        // BOX UNIFICADO FOCÁVEL
        accessible={true}
        focusable={true}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={a11yLabel}
        importantForAccessibility="yes"
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: style.backgroundColor,
              borderWidth: isSelected ? 4 : 2,
              borderColor: isSelected ? "#003D99" : style.borderColor,
            },
            isSelected && styles.selectedCard,
          ]}
          // Esconde filhos para evitar duplo clique e forçar leitura do pai
          importantForAccessibility="no-hide-descendants"
        >
          {isSelected && (
            <View
              style={[styles.selectedBadge, { backgroundColor: "#003D99" }]}
            >
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
          <View
            style={[styles.colorPreview, { backgroundColor: style.iconBg }]}
          >
            <Text
              style={{
                color: style.iconText,
                fontWeight: "bold",
                fontSize: 18,
              }}
            >
              1
            </Text>
          </View>
          <Text style={[styles.cardLabel, { color: style.color }]}>
            {label}
          </Text>
          <Text
            style={[
              styles.cardDescription,
              { color: style.color, opacity: 0.8 },
            ]}
          >
            {description}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (
  scaleFont: (size: number) => number,
  horizontalPadding = 20,
  gap = 16,
  maxWidth = 1200,
  isWeb = false
) =>
  StyleSheet.create({
    scrollContent: { flexGrow: 1, paddingBottom: 40, alignItems: "center" },
    container: {
      flex: 1,
      width: "100%",
      maxWidth: maxWidth,
      alignItems: "center",
      paddingHorizontal: horizontalPadding,
      paddingTop: Platform.OS === "android" ? 50 : 20,
    },
    headerSection: {
      width: "100%",
      alignItems: "center",
      marginBottom: 32,
      paddingHorizontal: 10,
    },
    title: {
      fontSize: scaleFont(28),
      textAlign: "center",
      fontWeight: "bold",
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    subtitle: {
      fontSize: scaleFont(15),
      textAlign: "center",
      lineHeight: scaleFont(22),
      opacity: 0.85,
      maxWidth: 500,
    },
    optionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      width: "100%",
      marginBottom: 32,
      gap: gap,
    },
    cardWrapper: { marginBottom: gap, minHeight: 140 },
    card: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 20,
      paddingHorizontal: 12,
      borderRadius: 16,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      position: "relative",
    },
    selectedCard: {
      elevation: 6,
      shadowOpacity: 0.25,
      shadowRadius: 8,
      transform: [{ scale: 1.02 }],
    },
    selectedBadge: {
      position: "absolute",
      top: -8,
      right: -8,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    checkmark: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
    colorPreview: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginBottom: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    cardLabel: {
      fontSize: scaleFont(16),
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: scaleFont(12),
      textAlign: "center",
      lineHeight: scaleFont(16),
    },
    actionSection: { width: "100%", alignItems: "center", marginTop: 8 },
    button: {
      paddingVertical: 18,
      paddingHorizontal: 40,
      borderRadius: 30,
      width: "100%",
      maxWidth: 400,
      alignItems: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
    },
    buttonText: {
      fontSize: scaleFont(18),
      fontWeight: "bold",
      letterSpacing: 0.5,
    },
    helpText: {
      fontSize: scaleFont(13),
      textAlign: "center",
      marginTop: 16,
      opacity: 0.7,
      lineHeight: scaleFont(18),
    },
  });

export default ContrastScreen;
