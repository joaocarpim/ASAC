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
  } = useSettings();

  // --- LOG ---
  console.log("[SettingsScreen Render] Estado atual das configs:", {
    fontSize: fontSizeMultiplier,
    bold: isBoldTextEnabled,
    lineHeight: lineHeightMultiplier,
    letterSpacing: letterSpacing,
    dyslexia: isDyslexiaFontEnabled,
  });

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

  // Gesto de voltar
  const flingRight =
    Platform.OS !== "web"
      ? Gesture.Fling()
          .direction(Directions.RIGHT)
          .onEnd(() => navigation.navigate("Home" as never))
      : undefined;

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
    const handleWebChange = (direction: "increase" | "decrease") => {
      let newValue = value;
      if (direction === "increase") {
        newValue = Math.min(value + step, max);
      } else {
        newValue = Math.max(value - step, min);
      }
      onValueChange(newValue);
    };

    return (
      <SettingCard fadeAnim={fadeAnim} scaleAnim={scaleAnim}>
        <View style={styles.cardHeader}>
          <AccessibleText baseSize={24} style={styles.cardLabel}>
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
            onSlidingComplete={onValueChange}
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
    return (
      <SettingCard fadeAnim={fadeAnim} scaleAnim={scaleAnim}>
        <View style={styles.switchRow}>
          <AccessibleText baseSize={24} style={styles.cardLabel}>
            {label}
          </AccessibleText>
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: "#767577", true: theme.button }}
            thumbColor={value ? theme.buttonText : "#f4f3f4"}
            ios_backgroundColor="#767577"
          />
        </View>
      </SettingCard>
    );
  };

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
            label="Espaçamento Linhas"
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
            label="Espaçamento Letras"
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
                <AccessibleText baseSize={24} style={styles.cardLabel}>
                  Modo de Contraste
                </AccessibleText>
                {/* Descrição removida conforme solicitado */}
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

  if (Platform.OS !== "web" && flingRight) {
    return (
      <GestureDetector gesture={flingRight}>{renderContent()}</GestureDetector>
    );
  }

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
      // Título ligeiramente maior que o label de 24
      fontSize: 28 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      marginBottom: 16,
      marginLeft: 4,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      // Aplicando configurações globais ao Título
      lineHeight: 32 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
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
      // FONTE 24 (SOLICITADO)
      fontSize: 24 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      // Aplicando configurações globais ao Label
      lineHeight: 28 * fontMultiplier * lineHeightMultiplier, // Ajustado para não cortar a fonte 24
      letterSpacing: letterSpacing,
      flex: 1,
    },
    // cardSubtitle removido
    valueBadge: {
      backgroundColor: theme.button,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      minWidth: 70, // Aumentado um pouco para acomodar fonte maior
      alignItems: "center",
    },
    valueText: {
      color: theme.buttonText,
      fontSize: 16 * fontMultiplier, // Aumentado proporcionalmente
      fontWeight: isBold ? "bold" : "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 20 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
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
      paddingVertical: 10,
      borderRadius: 12,
    },
    changeButtonText: {
      color: theme.buttonText,
      fontSize: 16 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 20 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
    },
    webSliderContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      paddingVertical: 8,
    },
    webSliderButton: {
      backgroundColor: theme.button,
      width: 44,
      height: 44,
      borderRadius: 22,
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
      fontSize: 20 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      minWidth: 80,
      textAlign: "center",
      lineHeight: 24 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
    },
  });
