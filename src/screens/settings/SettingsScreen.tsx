// src/screens/settings/SettingsScreen.tsx

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  SafeAreaView,
  StatusBar,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import CommunitySlider from "@react-native-community/slider";
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
import {
  Gesture,
  GestureDetector, // <--- GESTO (1. Importado)
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
  } = useSettings();

  // --- LOG 1 ---
  console.log(
    "----------------------------------------------------\n" +
      "[SettingsScreen Render] Estado atual das configs:",
    {
      fontSize: fontSizeMultiplier,
      bold: isBoldTextEnabled,
      lineHeight: lineHeightMultiplier,
      letterSpacing: letterSpacing,
      dyslexia: isDyslexiaFontEnabled,
    }
  );

  const MAX_FONT_SIZE_MULTIPLIER = 1.2;

  const fadeAnims = Array.from(
    { length: 7 },
    () => useRef(new Animated.Value(0)).current
  );
  const scaleAnims = Array.from(
    { length: 7 },
    () => useRef(new Animated.Value(0.9)).current
  );

  useEffect(() => {
    fadeAnims.forEach((fade, index) => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 400,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnims[index], {
          toValue: 1,
          friction: 8,
          tension: 40,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handleGoBack = () => navigation.goBack();

  // <--- GESTO (2. Definindo o gesto de arrastar para a direita)
  const flingRight =
    Platform.OS !== "web" // O gesto é desabilitado na web
      ? Gesture.Fling()
          .direction(Directions.RIGHT) // Apenas para a direita
          .onEnd(() => navigation.navigate("Home" as never)) // Navega para Home
      : undefined;

  // --- LOG 2 ---
  useEffect(() => {
    console.log(
      "[Settings Effect] Verificando limites...",
      `Fonte: ${fontSizeMultiplier}`,
      `Linha: ${lineHeightMultiplier}`,
      `Letra: ${letterSpacing}`
    );

    if (fontSizeMultiplier > MAX_FONT_SIZE_MULTIPLIER) {
      console.warn(
        `[Settings Effect] CONFLITO: Tamanho da Fonte (${fontSizeMultiplier}) > MAX (1.2). Corrigindo...`
      );
      setFontSizeMultiplier(MAX_FONT_SIZE_MULTIPLIER);
    }
    if (lineHeightMultiplier < 1.0) {
      console.warn(
        `[Settings Effect] CONFLITO: Altura da Linha (${lineHeightMultiplier}) < MIN (1.0). Corrigindo...`
      );
      setLineHeightMultiplier(1.0);
    }
    if (letterSpacing < 0) {
      console.warn(
        `[Settings Effect] CONFLITO: Espaço da Letra (${letterSpacing}) < MIN (0). Corrigindo...`
      );
      setLetterSpacing(0);
    }
  }, [
    fontSizeMultiplier,
    setFontSizeMultiplier,
    lineHeightMultiplier,
    setLineHeightMultiplier,
    letterSpacing,
    setLetterSpacing,
  ]);

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const SettingCard = ({
    children,
    fadeAnim,
    scaleAnim,
  }: {
    children: React.ReactNode;
    fadeAnim: Animated.Value;
    scaleAnim: Animated.Value;
  }) => (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {children}
    </Animated.View>
  );

  const SliderCard = ({
    label,
    value,
    onValueChange,
    min,
    max,
    step,
    unit = "",
    fadeAnim,
    scaleAnim,
  }: any) => {
    // --- LOG 3 ---
    const handleWebChange = (direction: "increase" | "decrease") => {
      let newValue = value;
      if (direction === "increase") {
        newValue = Math.min(value + step, max);
      } else {
        newValue = Math.max(value - step, min);
      }
      console.log(
        `[SliderCard: ${label}] (Web Botão ${direction}) Novo valor:`,
        newValue
      );
      onValueChange(newValue);
    };

    const handleNativeChange = (newValue: number) => {
      console.log(`[SliderCard: ${label}] (Nativo) Novo valor:`, newValue);
      onValueChange(newValue);
    };

    return (
      <SettingCard fadeAnim={fadeAnim} scaleAnim={scaleAnim}>
        <View style={styles.cardHeader}>
          <AccessibleText baseSize={16} style={styles.cardLabel}>
            {label}
          </AccessibleText>
          {Platform.OS !== "web" && (
            <View style={styles.valueBadge}>
              <Text style={styles.valueText}>
                {unit === "%" ? (value * 100).toFixed(0) : value.toFixed(1)}
                {unit}
              </Text>
            </View>
          )}
        </View>

        {Platform.OS === "web" ? (
          <View style={styles.webSliderContainer}>
            <AccessibleButton
              onPress={() => handleWebChange("decrease")}
              accessibilityText={`Diminuir ${label}`}
              disabled={value <= min}
            >
              <View
                style={[
                  styles.webSliderButton,
                  value <= min && styles.webSliderButtonDisabled,
                ]}
              >
                <Text style={styles.webSliderButtonText}>-</Text>
              </View>
            </AccessibleButton>
            <Text style={styles.webSliderValue}>
              {unit === "%" ? (value * 100).toFixed(0) : value.toFixed(1)}
              {unit}
            </Text>
            <AccessibleButton
              onPress={() => handleWebChange("increase")}
              accessibilityText={`Aumentar ${label}`}
              disabled={value >= max}
            >
              <View
                style={[
                  styles.webSliderButton,
                  value >= max && styles.webSliderButtonDisabled,
                ]}
              >
                <Text style={styles.webSliderButtonText}>+</Text>
              </View>
            </AccessibleButton>
          </View>
        ) : (
          <CommunitySlider
            style={styles.slider}
            minimumValue={min}
            maximumValue={max}
            step={step}
            value={value}
            onSlidingComplete={handleNativeChange}
            minimumTrackTintColor={theme.button}
            maximumTrackTintColor={theme.card}
            thumbTintColor={theme.button}
          />
        )}
      </SettingCard>
    );
  };

  const SwitchCard = ({
    label,
    value,
    onValueChange,
    fadeAnim,
    scaleAnim,
  }: any) => {
    // --- LOG 4 ---
    const handleSwitchChange = (newValue: boolean) => {
      console.log(`[SwitchCard: ${label}] Novo valor:`, newValue);
      onValueChange(newValue);
    };

    return (
      <SettingCard fadeAnim={fadeAnim} scaleAnim={scaleAnim}>
        <View style={styles.switchRow}>
          <AccessibleText baseSize={16} style={styles.cardLabel}>
            {label}
          </AccessibleText>
          <Switch
            value={value}
            onValueChange={handleSwitchChange}
            trackColor={{ false: "#767577", true: theme.button }}
            thumbColor={value ? theme.buttonText : "#f4f3f4"}
            ios_backgroundColor="#767577"
          />
        </View>
      </SettingCard>
    );
  };

  // Esta é a função que renderiza todo o conteúdo da tela
  const renderContent = () => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />
      <ScreenHeader title="Acessibilidade" onBackPress={handleGoBack} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <AccessibleHeader level={2} style={styles.sectionTitle}>
            📝 Texto
          </AccessibleHeader>
          <SliderCard
            label="Tamanho da Fonte"
            value={fontSizeMultiplier}
            onValueChange={setFontSizeMultiplier}
            min={0.8}
            max={MAX_FONT_SIZE_MULTIPLIER}
            step={0.1}
            unit="%"
            fadeAnim={fadeAnims[0]}
            scaleAnim={scaleAnims[0]}
          />
          <SwitchCard
            label="Texto em Negrito"
            value={isBoldTextEnabled}
            onValueChange={toggleBoldText}
            fadeAnim={fadeAnims[1]}
            scaleAnim={scaleAnims[1]}
          />
          <SliderCard
            label="Espaçamento entre Linhas"
            value={lineHeightMultiplier}
            onValueChange={setLineHeightMultiplier}
            min={1.0}
            max={2.0}
            step={0.1}
            unit="x"
            fadeAnim={fadeAnims[2]}
            scaleAnim={scaleAnims[2]}
          />
          <SliderCard
            label="Espaçamento entre Letras"
            value={letterSpacing}
            onValueChange={setLetterSpacing}
            min={0}
            max={3}
            step={0.25}
            fadeAnim={fadeAnims[3]}
            scaleAnim={scaleAnims[3]}
          />
          <SwitchCard
            label="Fonte para Dislexia"
            value={isDyslexiaFontEnabled}
            onValueChange={toggleDyslexiaFont}
            fadeAnim={fadeAnims[4]}
            scaleAnim={scaleAnims[4]}
          />
        </View>
        <View style={styles.section}>
          <AccessibleHeader level={2} style={styles.sectionTitle}>
            🖥️ Tela
          </AccessibleHeader>
          <SettingCard fadeAnim={fadeAnims[5]} scaleAnim={scaleAnims[5]}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <AccessibleText baseSize={16} style={styles.cardLabel}>
                  Modo de Contraste
                </AccessibleText>
                <Text style={styles.cardSubtitle}>{contrastMode}</Text>
              </View>
              <AccessibleButton
                onPress={() => navigation.navigate("Contrast" as never)}
                accessibilityText={`Alterar modo de contraste. Modo atual: ${contrastMode}`}
              >
                <View style={styles.changeButton}>
                  <Text style={styles.changeButtonText}>Alterar</Text>
                </View>
              </AccessibleButton>
            </View>
          </SettingCard>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );

  // <--- GESTO (3. Aplicando o gesto na tela)
  // Se não for web E o gesto estiver definido...
  if (Platform.OS !== "web" && flingRight) {
    // Renderiza o conteúdo DENTRO do Detector de Gestos
    return (
      <GestureDetector gesture={flingRight}>{renderContent()}</GestureDetector>
    );
  }

  // Se for web, renderiza o conteúdo normalmente
  return renderContent();
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
    safeArea: { flex: 1, backgroundColor: theme.background },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
    section: { marginBottom: 32 },
    sectionTitle: {
      color: theme.text,
      fontSize: 22 * fontMultiplier,
      fontWeight: "bold",
      marginBottom: 16,
      marginLeft: 4,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    cardLabel: {
      color: theme.cardText,
      fontSize: 16 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 16 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
      flex: 1,
    },
    cardSubtitle: {
      color: theme.cardText,
      fontSize: 13 * fontMultiplier,
      opacity: 0.6,
      marginTop: 4,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    valueBadge: {
      backgroundColor: theme.button,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      minWidth: 60,
      alignItems: "center",
    },
    valueText: {
      color: theme.buttonText,
      fontSize: 14 * fontMultiplier,
      fontWeight: "bold",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    slider: { width: "100%", height: 40 },
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    changeButton: {
      backgroundColor: theme.button,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
    },
    changeButtonText: {
      color: theme.buttonText,
      fontSize: 14 * fontMultiplier,
      fontWeight: "bold",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    webSliderContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingVertical: 8,
    },
    webSliderButton: {
      backgroundColor: theme.button,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    webSliderButtonDisabled: {
      backgroundColor: theme.card,
      opacity: 0.7,
    },
    webSliderButtonText: {
      color: theme.buttonText,
      fontSize: 24,
      fontWeight: "bold",
      lineHeight: 26,
    },
    webSliderValue: {
      color: theme.cardText,
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      minWidth: 80,
      textAlign: "center",
    },
  });
