// src/screens/settings/SelectedContrast.tsx - Versão Corrigida e Responsiva

import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions, // ✅ 1. Importado para criar responsividade
} from "react-native";
import { useContrast } from "../../hooks/useContrast";
import { ContrastMode } from "../../types/contrast";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types"; // ✅ Corrigido o caminho do import
import {
  AccessibleView,
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
  accessibilityHint: string;
  onPress: (mode: ContrastMode) => void;
}

const ContrastScreen: React.FC<ContrastScreenProps> = ({ navigation }) => {
  const { changeContrastMode } = useContrast();
  const [selection, setSelection] = useState<ContrastMode>("blue_yellow");

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PREVIEW_COLORS.yellowBg }}>
      <StatusBar
        backgroundColor={PREVIEW_COLORS.yellowBg}
        barStyle="dark-content"
      />
      <AccessibleView
        style={styles.container}
        accessibilityText="Tela de seleção de contraste."
      >
        <AccessibleHeader
          level={1}
          style={[styles.title, { color: PREVIEW_COLORS.blueText }]}
        >
          Escolha o melhor contraste
        </AccessibleHeader>

        <View style={styles.optionsContainer}>
          {/* Os OptionCards permanecem os mesmos */}
          <OptionCard
            colors={PREVIEW_COLORS}
            currentSelection={selection}
            mode="blue_yellow"
            label="Azul"
            accessibilityHint="Tema padrão do aplicativo."
            onPress={setSelection}
          />
          <OptionCard
            colors={PREVIEW_COLORS}
            currentSelection={selection}
            mode="black_white"
            label="Escuro"
            accessibilityHint="Alto contraste com fundo preto."
            onPress={setSelection}
          />
          <OptionCard
            colors={PREVIEW_COLORS}
            currentSelection={selection}
            mode="white_black"
            label="Claro"
            accessibilityHint="Alto contraste com fundo branco."
            onPress={setSelection}
          />
          <OptionCard
            colors={PREVIEW_COLORS}
            currentSelection={selection}
            mode="sepia"
            label="Sépia"
            accessibilityHint="Para leitura confortável, reduz a luz azul."
            onPress={setSelection}
          />
          <OptionCard
            colors={PREVIEW_COLORS}
            currentSelection={selection}
            mode="grayscale"
            label="Cinza"
            accessibilityHint="Para visão acromática, sem cores."
            onPress={setSelection}
          />
          <OptionCard
            colors={PREVIEW_COLORS}
            currentSelection={selection}
            mode="cyan_dark"
            label="Ciano"
            accessibilityHint="Tema escuro eficaz para daltonismo."
            onPress={setSelection}
          />
        </View>

        <AccessibleButton
          style={[styles.button, { backgroundColor: PREVIEW_COLORS.blueText }]}
          onPress={handleContinue}
          accessibilityText="Botão Prosseguir."
        >
          <Text style={[styles.buttonText, { color: PREVIEW_COLORS.white }]}>
            Prosseguir
          </Text>
        </AccessibleButton>
      </AccessibleView>
    </SafeAreaView>
  );
};

const OptionCard: React.FC<OptionCardProps> = ({
  colors,
  currentSelection,
  mode,
  label,
  accessibilityHint,
  onPress,
}) => {
  const isSelected = currentSelection === mode;
  const accessibilityFullText = `Opção ${label}. ${accessibilityHint} ${
    isSelected ? "Atualmente selecionado." : ""
  }`;

  const cardStyles: Record<
    ContrastMode,
    { backgroundColor: string; color: string; borderColor?: string }
  > = {
    blue_yellow: {
      backgroundColor: colors.yellowBg,
      color: colors.blueText,
      borderColor: colors.blueText,
    },
    black_white: { backgroundColor: colors.black, color: colors.white },
    white_black: { backgroundColor: colors.white, color: colors.black },
    sepia: { backgroundColor: colors.sepiaBg, color: colors.sepiaText },
    grayscale: { backgroundColor: colors.grayBg, color: colors.grayText },
    cyan_dark: { backgroundColor: colors.cyanDarkBg, color: colors.cyanText },
  };

  return (
    <View style={styles.cardWrapper}>
      <AccessibleButton
        onPress={() => onPress(mode)}
        accessibilityText={accessibilityFullText}
        style={{ flex: 1 }}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: cardStyles[mode].backgroundColor,
              borderWidth: cardStyles[mode].borderColor ? 2 : 0,
              borderColor: cardStyles[mode].borderColor,
            },
            isSelected && styles.selectedCard,
          ]}
        >
          <Text style={[styles.cardText, { color: cardStyles[mode].color }]}>
            {label}
          </Text>
        </View>
      </AccessibleButton>
    </View>
  );
};

// ✅ 2. Lógica para fontes responsivas
const { width } = Dimensions.get("window");
// Usamos uma tela de referência (ex: iPhone 8) para criar um fator de escala
const FONT_SCALE = width / 375;

const scaleFont = (size: number) => size * FONT_SCALE;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // ✅ 3. A centralização agora é controlada pelo flexbox para melhor adaptação
    justifyContent: "center",
    marginTop:100,
    alignItems: "center",
    paddingHorizontal: 10,
    // marginTop: 100, // Removido para permitir centralização vertical automática
  },
  title: {
    // ✅ 4. Aplicando a fonte responsiva
    fontSize: scaleFont(24),
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    marginBottom: 20,
  },
  cardWrapper: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 10,
  },
  card: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // ✅ 5. Padding corrigido para ser uniforme e não achatar o texto
    padding: 24,
    borderRadius: 12,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: "#0066CC", // Cor de seleção mais vibrante
    elevation: 5,
    transform: [{ scale: 1.05 }], // Efeito de zoom sutil quando selecionado
  },
  cardText: {
    fontSize: scaleFont(14),
    fontWeight: "bold",
    textAlign: "center",
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: "95%",
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
  },
  buttonText: {
    fontSize: scaleFont(18),
    fontWeight: "bold",
  },
});

export default ContrastScreen;
