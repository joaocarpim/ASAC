// src/screens/settings/SettingsScreen.tsx

import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  SafeAreaView,
  StatusBar,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import { useSettings } from "../../hooks/useSettings";
import { useContrast } from "../../hooks/useContrast";
import {
  AccessibleText,
  AccessibleHeader,
  AccessibleButton,
} from "../../components/AccessibleComponents";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { Theme } from "../../types/contrast";
// 👇 1. IMPORTAR OS COMPONENTES DE GESTO 👇
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { theme, contrastMode } = useContrast();
  const {
    fontSizeMultiplier,
    setFontSizeMultiplier,
    isBoldTextEnabled,
    toggleBoldText,
    lineHeightMultiplier,
    setLineHeightMultiplier,
    letterSpacing,
    setLetterSpacing,
    isDyslexiaFontEnabled,
    toggleDyslexiaFont,
    imageScale,
    setImageScale,
  } = useSettings();

  const MAX_FONT_SIZE_MULTIPLIER = 1.2;

  // 👇 2. DEFINIR A FUNÇÃO E O GESTO 👇
  const handleGoBack = () => {
    navigation.goBack();
  };

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleGoBack);

  useEffect(() => {
    if (fontSizeMultiplier > MAX_FONT_SIZE_MULTIPLIER) {
      setFontSizeMultiplier(MAX_FONT_SIZE_MULTIPLIER);
    }
    if (lineHeightMultiplier < 1.0) {
      setLineHeightMultiplier(1.0);
    }
    if (letterSpacing < 0) {
      setLetterSpacing(0);
    }
  }, [
    fontSizeMultiplier,
    setFontSizeMultiplier,
    lineHeightMultiplier,
    setLineHeightMultiplier,
    letterSpacing,
    setLetterSpacing,
    isDyslexiaFontEnabled,
    MAX_FONT_SIZE_MULTIPLIER,
  ]);

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const SettingRow = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.row}>
      <AccessibleText baseSize={16} style={styles.label}>
        {label}
      </AccessibleText>
      <View style={styles.controlContainer}>{children}</View>
    </View>
  );

  return (
    // 👇 3. ENVOLVER A TELA COM O DETECTOR DE GESTOS 👇
    <GestureDetector gesture={flingRight}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        {/* Passando a função handleGoBack para o ScreenHeader também */}
        <ScreenHeader title="Acessibilidade" onBackPress={handleGoBack} />

        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <SettingRow
              label={`Tamanho da Fonte: ${(fontSizeMultiplier * 100).toFixed(
                0
              )}%`}
            >
              <Slider
                style={styles.slider}
                minimumValue={0.8}
                maximumValue={MAX_FONT_SIZE_MULTIPLIER}
                step={0.1}
                value={fontSizeMultiplier}
                onSlidingComplete={setFontSizeMultiplier}
                minimumTrackTintColor={theme.text}
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor={theme.text}
              />
            </SettingRow>

            <SettingRow label="Texto em Negrito">
              <Switch
                value={isBoldTextEnabled}
                onValueChange={toggleBoldText}
                trackColor={{ false: "#767577", true: theme.button }}
                thumbColor={isBoldTextEnabled ? theme.buttonText : "#f4f3f4"}
              />
            </SettingRow>

            <SettingRow
              label={`Espaçamento Linhas: ${lineHeightMultiplier.toFixed(1)}x`}
            >
              <Slider
                style={styles.slider}
                minimumValue={1.0}
                maximumValue={2.0}
                step={0.1}
                value={lineHeightMultiplier}
                onSlidingComplete={setLineHeightMultiplier}
                minimumTrackTintColor={theme.text}
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor={theme.text}
              />
            </SettingRow>

            <SettingRow
              label={`Espaçamento Letras: ${letterSpacing.toFixed(1)}`}
            >
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={3}
                step={0.25}
                value={letterSpacing}
                onSlidingComplete={setLetterSpacing}
                minimumTrackTintColor={theme.text}
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor={theme.text}
              />
            </SettingRow>

            <SettingRow label="Fonte para Dislexia">
              <Switch
                value={isDyslexiaFontEnabled}
                onValueChange={toggleDyslexiaFont}
                trackColor={{ false: "#767577", true: theme.button }}
                thumbColor={
                  isDyslexiaFontEnabled ? theme.buttonText : "#f4f3f4"
                }
              />
            </SettingRow>
          </View>

          <View style={styles.section}>
            <AccessibleHeader level={2} style={styles.sectionHeader}>
              Tela
            </AccessibleHeader>
            <SettingRow label={`Contraste (${contrastMode})`}>
              <AccessibleButton
                onPress={() => navigation.navigate("Contrast" as never)}
                accessibilityText={`Alterar modo de contraste. Modo atual: ${contrastMode}`}
              >
                <Text style={styles.linkText}>Alterar</Text>
              </AccessibleButton>
            </SettingRow>
            <SettingRow
              label={`Tamanho das Imagens: ${(imageScale * 100).toFixed(0)}%`}
            >
              <Slider
                style={styles.slider}
                minimumValue={0.6}
                maximumValue={1.2}
                step={0.1}
                value={imageScale}
                onSlidingComplete={setImageScale}
                minimumTrackTintColor={theme.text}
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor={theme.text}
              />
            </SettingRow>
          </View>
        </View>
      </SafeAreaView>
    </GestureDetector>
  );
}

// --- Estilos dinâmicos ---
const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: "space-evenly",
    },
    section: {},
    sectionHeader: {
      marginBottom: 8,
      paddingBottom: 4,
      color: theme.text,
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
    },
    label: {
      color: theme.text,
      flex: 1.2,
      fontSize: 16 * fontMultiplier,
      fontWeight: isBold ? "bold" : "normal",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 16 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
    },
    controlContainer: {
      flex: 1,
      alignItems: "flex-end",
    },
    slider: {
      width: "100%",
      height: 40,
    },
    linkText: {
      color: theme.text,
      fontWeight: "bold",
      textDecorationLine: "underline",
      fontSize: 16 * fontMultiplier,
    },
  });
