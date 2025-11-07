// src/screens/settings/SelectedContrast.tsx

import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  useWindowDimensions, // ✅ 1. Importado
} from "react-native";
import { useContrast } from "../../hooks/useContrast";
import { ContrastMode } from "../../types/contrast";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
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
  scaleFont: (size: number) => number; // Pass scaleFont como prop
}

const ContrastScreen: React.FC<ContrastScreenProps> = ({ navigation }) => {
  const { changeContrastMode } = useContrast();
  const [selection, setSelection] = useState<ContrastMode>("blue_yellow");

  // ✅ 2. Use o hook DENTRO do componente
  const { width } = useWindowDimensions();
  const FONT_SCALE = width > 0 ? width / 375 : 1; // Previne divisão por zero
  const scaleFont = (size: number) => Math.round(size * FONT_SCALE);

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

  // ✅ 3. Crie os estilos DINAMICAMENTE
  const styles = createStyles(scaleFont);

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
          {/* Os OptionCards agora recebem scaleFont */}
          <OptionCard
            colors={PREVIEW_COLORS}
            currentSelection={selection}
            mode="blue_yellow"
            label="Azul"
            accessibilityHint="Tema padrão do aplicativo."
            onPress={setSelection}
            scaleFont={scaleFont}
          />
          <OptionCard
            colors={PREVIEW_COLORS}
            currentSelection={selection}
            mode="black_white"
            label="Escuro"
            accessibilityHint="Alto contraste com fundo preto."
            onPress={setSelection}
            scaleFont={scaleFont}
          />
          <OptionCard
            colors={PREVIEW_COLORS}
            currentSelection={selection}
            mode="white_black"
            label="Claro"
            accessibilityHint="Alto contraste com fundo branco."
            onPress={setSelection}
            scaleFont={scaleFont}
          />
          <OptionCard
            colors={PREVIEW_COLORS}
            currentSelection={selection}
            mode="sepia"
            label="Sépia"
            accessibilityHint="Para leitura confortável, reduz a luz azul."
            onPress={setSelection}
            scaleFont={scaleFont}
          />
          <OptionCard
            colors={PREVIEW_COLORS}
            currentSelection={selection}
            mode="grayscale"
            label="Cinza"
            accessibilityHint="Para visão acromática, sem cores."
            onPress={setSelection}
            scaleFont={scaleFont}
          />
          <OptionCard
            colors={PREVIEW_COLORS}
            currentSelection={selection}
            mode="cyan_dark"
            label="Ciano"
            accessibilityHint="Tema escuro eficaz para daltonismo."
            onPress={setSelection}
            scaleFont={scaleFont}
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
  scaleFont, // Recebe a função
}) => {
  const isSelected = currentSelection === mode;
  const accessibilityFullText = `Opção ${label}. ${accessibilityHint} ${
    isSelected ? "Atualmente selecionado." : ""
  }`;

  // ✅ 4. Recria os estilos dinamicamente
  const styles = createStyles(scaleFont);

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

// ✅ 5. Transforme os estilos em uma função
const createStyles = (scaleFont: (size: number) => number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center", // Centraliza o conteúdo
      // marginTop: 100, // ❌ REMOVIDO: Isso quebrava o layout
      alignItems: "center",
      paddingHorizontal: 10,
      paddingBottom: 20, // Garante que o botão não cole na borda
    },
    title: {
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
      padding: 24,
      borderRadius: 12,
    },
    selectedCard: {
      borderWidth: 3,
      borderColor: "#0066CC",
      elevation: 5,
      transform: [{ scale: 1.05 }],
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
