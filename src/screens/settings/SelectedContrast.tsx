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
} from "react-native";
import { useContrast } from "../../hooks/useContrast";
import { ContrastMode } from "../../types/contrast";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import {
  AccessibleHeader,
  AccessibleButton,
} from "../../components/AccessibleComponents";

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
  const isWeb = Platform.OS === "web";
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  // Responsividade adaptativa
  const FONT_SCALE = width > 0 ? Math.min(width / 375, 1.2) : 1;
  const scaleFont = (size: number) => Math.round(size * FONT_SCALE);

  // Layout responsivo: 2 colunas mobile, 3 tablet, até 4 desktop
  const columnsCount = isDesktop ? 3 : isTablet ? 3 : 2;
  const maxWidth = Math.min(width, 1200);
  const horizontalPadding = isWeb ? 40 : 20;
  const gap = isTablet ? 20 : 16;
  const CARD_WIDTH =
    (maxWidth - horizontalPadding * 2 - gap * (columnsCount - 1)) /
    columnsCount;

  console.log(`[ContrastScreen] Seleção: ${selection}, Largura: ${width}`);

  const handleContinue = () => {
    console.log(`[ContrastScreen] Salvando: ${selection}`);
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
      hint: "Tema padrão do aplicativo com contraste azul e amarelo.",
    },
    {
      mode: "black_white",
      label: "Alto Contraste",
      description: "Fundo preto",
      hint: "Alto contraste com fundo preto e texto branco.",
    },
    {
      mode: "white_black",
      label: "Claro",
      description: "Fundo branco",
      hint: "Alto contraste com fundo branco e texto preto.",
    },
    {
      mode: "sepia",
      label: "Sépia",
      description: "Leitura confortável",
      hint: "Reduz luz azul para leitura prolongada.",
    },
    {
      mode: "grayscale",
      label: "Monocromático",
      description: "Sem cores",
      hint: "Para visão acromática, apenas tons de cinza.",
    },
    {
      mode: "cyan_dark",
      label: "Ciano Escuro",
      description: "Para daltonismo",
      hint: "Tema escuro otimizado para daltonismo.",
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
          {/* Cabeçalho com espaçamento profissional */}
          <View style={styles.headerSection}>
            <AccessibleHeader
              level={1}
              style={[styles.title, { color: PREVIEW_COLORS.blueText }]}
            >
              Escolha seu Contraste
            </AccessibleHeader>
            <Text style={[styles.subtitle, { color: PREVIEW_COLORS.blueText }]}>
              Selecione o tema que melhor atende suas necessidades de
              acessibilidade
            </Text>
          </View>

          {/* Grid de opções com layout profissional */}
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

          {/* Botão de ação com melhor UX */}
          <View style={styles.actionSection}>
            <AccessibleButton
              style={[
                styles.button,
                { backgroundColor: PREVIEW_COLORS.blueText },
              ]}
              onPress={handleContinue}
              accessibilityText="Botão Prosseguir. Confirma a seleção e avança para a tela inicial."
            >
              <Text
                style={[styles.buttonText, { color: PREVIEW_COLORS.white }]}
              >
                Confirmar e Prosseguir
              </Text>
            </AccessibleButton>

            <Text style={[styles.helpText, { color: PREVIEW_COLORS.blueText }]}>
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
  const accessibilityFullText = `${label}. ${description}. ${accessibilityHint} ${
    isSelected ? "Atualmente selecionado." : "Toque para selecionar."
  }`;

  const styles = createStyles(scaleFont);

  const cardStyles: Record<
    ContrastMode,
    {
      backgroundColor: string;
      color: string;
      borderColor: string;
      iconBg: string;
    }
  > = {
    blue_yellow: {
      backgroundColor: colors.yellowBg,
      color: colors.blueText,
      borderColor: colors.blueText,
      iconBg: colors.blueText,
    },
    black_white: {
      backgroundColor: colors.black,
      color: colors.white,
      borderColor: colors.white,
      iconBg: colors.white,
    },
    white_black: {
      backgroundColor: colors.white,
      color: colors.black,
      borderColor: colors.black,
      iconBg: colors.black,
    },
    sepia: {
      backgroundColor: colors.sepiaBg,
      color: colors.sepiaText,
      borderColor: colors.sepiaText,
      iconBg: colors.sepiaText,
    },
    grayscale: {
      backgroundColor: colors.grayBg,
      color: colors.grayText,
      borderColor: colors.grayText,
      iconBg: colors.grayText,
    },
    cyan_dark: {
      backgroundColor: colors.cyanDarkBg,
      color: colors.cyanText,
      borderColor: colors.cyanText,
      iconBg: colors.cyanText,
    },
  };

  const handlePress = () => {
    console.log(`[OptionCard] Selecionado: ${mode}`);
    onPress(mode);
  };

  return (
    <View style={[styles.cardWrapper, { width: cardWidth }]}>
      <AccessibleButton
        onPress={handlePress}
        accessibilityText={accessibilityFullText}
        style={{ flex: 1 }}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: cardStyles[mode].backgroundColor,
              borderWidth: isSelected ? 3 : 2,
              borderColor: isSelected
                ? "#0066CC"
                : cardStyles[mode].borderColor,
            },
            isSelected && styles.selectedCard,
          ]}
        >
          {/* Indicador visual de seleção */}
          {isSelected && (
            <View
              style={[styles.selectedBadge, { backgroundColor: "#0066CC" }]}
            >
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}

          {/* Preview colorido */}
          <View
            style={[
              styles.colorPreview,
              { backgroundColor: cardStyles[mode].iconBg },
            ]}
          />

          {/* Textos do card */}
          <Text style={[styles.cardLabel, { color: cardStyles[mode].color }]}>
            {label}
          </Text>
          <Text
            style={[
              styles.cardDescription,
              { color: cardStyles[mode].color, opacity: 0.8 },
            ]}
          >
            {description}
          </Text>
        </View>
      </AccessibleButton>
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
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 40,
      alignItems: "center",
    },
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
    cardWrapper: {
      marginBottom: gap,
      minHeight: 140,
    },
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
      overflow: "visible",
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
    checkmark: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "bold",
    },
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
    actionSection: {
      width: "100%",
      alignItems: "center",
      marginTop: 8,
    },
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
