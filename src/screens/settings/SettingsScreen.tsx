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
  TouchableOpacity,
} from "react-native";
import CommunitySlider from "@react-native-community/slider";
import { useNavigation } from "@react-navigation/native";
import { useSettings } from "../../hooks/useSettings";
import { useContrast } from "../../hooks/useContrast";
import {
  AccessibleText,
  AccessibleHeader,
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

  const MAX_FONT_SIZE_MULTIPLIER = 1.4;

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

  const flingRight =
    Platform.OS !== "web"
      ? Gesture.Fling()
          .direction(Directions.RIGHT)
          .onEnd(() => navigation.navigate("Home" as never))
      : undefined;

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const SettingCard = ({ children, fadeAnim, scaleAnim, style }: any) => (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  // --- SLIDER CORRIGIDO ---
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
    const displayValue =
      unit === "%" ? (value * 100).toFixed(0) : value.toFixed(1);
    const infoLabel = `${label}. Valor atual: ${displayValue}${unit}.`;

    return (
      <SettingCard fadeAnim={fadeAnim} scaleAnim={scaleAnim}>
        {/* PARTE 1: LABEL E VALOR (Apenas Informativo) */}
        <View
          accessible={true}
          focusable={true} // Permite TAB
          importantForAccessibility="yes"
          accessibilityLabel={infoLabel}
          style={styles.cardHeader}
        >
          <View
            importantForAccessibility="no-hide-descendants"
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <AccessibleText baseSize={24} style={styles.cardLabel}>
              {label}
            </AccessibleText>
            {Platform.OS !== "web" && (
              <View style={styles.valueBadge}>
                <Text style={styles.valueText}>
                  {displayValue}
                  {unit}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* PARTE 2: O SLIDER EM SI (Interativo) */}
        {/* NÃO coloque accessible={true} na View pai do slider, isso mata o slider no Android */}
        <View style={{ width: "100%", height: 50, justifyContent: "center" }}>
          <CommunitySlider
            style={styles.slider}
            minimumValue={min}
            maximumValue={max}
            step={step}
            value={value}
            onSlidingComplete={onValueChange}
            minimumTrackTintColor={styles.sliderActive.backgroundColor}
            maximumTrackTintColor={styles.sliderInactive.backgroundColor}
            thumbTintColor={styles.sliderThumb.backgroundColor}
            // ACESSIBILIDADE DIRETA NO SLIDER
            accessible={true}
            focusable={true} // Essencial para Tab
            accessibilityLabel={`Controle deslizante para ${label}`}
            accessibilityRole="adjustable"
            accessibilityValue={{ min, max, now: value }}
            importantForAccessibility="yes"
          />
        </View>
      </SettingCard>
    );
  };

  // --- SWITCH CORRIGIDO ---
  const SwitchCard = ({
    label,
    value,
    onValueChange,
    fadeAnim,
    scaleAnim,
  }: any) => {
    const a11yLabel = `${label}. Estado: ${
      value ? "Ativado" : "Desativado"
    }. Toque duas vezes para alternar.`;

    return (
      <Animated.View
        style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => onValueChange(!value)}
          activeOpacity={0.8}
          accessible={true}
          focusable={true}
          accessibilityRole="switch"
          accessibilityState={{ checked: value }}
          accessibilityLabel={a11yLabel}
          importantForAccessibility="yes"
        >
          <View
            style={styles.switchRow}
            importantForAccessibility="no-hide-descendants"
          >
            <AccessibleText baseSize={24} style={styles.cardLabel}>
              {label}
            </AccessibleText>
            <View pointerEvents="none">
              <Switch
                value={value}
                trackColor={{
                  false: styles.switchTrackOff.backgroundColor,
                  true: styles.switchTrackOn.backgroundColor,
                }}
                thumbColor={
                  value
                    ? styles.switchThumbOn.backgroundColor
                    : styles.switchThumbOff.backgroundColor
                }
                ios_backgroundColor={styles.switchTrackOff.backgroundColor}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
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

          <Animated.View
            style={{
              opacity: fadeAnims[5],
              transform: [{ scale: scaleAnims[5] }],
            }}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("Contrast" as never)}
              accessible={true}
              focusable={true}
              accessibilityRole="button"
              accessibilityLabel={`Modo de Contraste. Atual: ${contrastMode}. Toque duas vezes para alterar.`}
              importantForAccessibility="yes"
            >
              <View
                style={styles.switchRow}
                importantForAccessibility="no-hide-descendants"
              >
                <AccessibleText baseSize={24} style={styles.cardLabel}>
                  Modo de Contraste
                </AccessibleText>
                <View style={styles.changeButton}>
                  <Text style={styles.changeButtonText}>Alterar</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
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
) => {
  const isBlueTheme =
    theme.background.toLowerCase().includes("blue") ||
    theme.background === "#000033" ||
    theme.background === "#001a33";

  const colors = {
    badgeBackground: isBlueTheme ? "#FFA500" : theme.button,
    badgeText: isBlueTheme ? "#000000" : theme.buttonText,
    sliderActive: isBlueTheme ? "#FFD700" : theme.button,
    sliderInactive: isBlueTheme ? "#4A4A4A" : theme.card,
    sliderThumb: isBlueTheme ? "#FFA500" : theme.button,
    switchTrackOn: isBlueTheme ? "#32CD32" : theme.button,
    switchTrackOff: isBlueTheme ? "#696969" : "#B8860B",
    switchThumbOn: isBlueTheme ? "#90EE90" : theme.card,
    switchThumbOff: isBlueTheme ? "#D3D3D3" : "#FFE066",
    changeButtonBg: isBlueTheme ? "#32CD32" : theme.button,
    changeButtonText: isBlueTheme ? "#000000" : theme.buttonText,
  };

  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.background },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
    section: { marginBottom: 32 },
    sectionTitle: {
      color: theme.text,
      fontSize: 28 * fontMultiplier,
      fontWeight: isBold ? "800" : "700",
      marginBottom: 16,
      marginLeft: 4,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 32 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.text + "20",
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
      fontSize: 24 * fontMultiplier,
      fontWeight: isBold ? "800" : "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 28 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
      flex: 1,
    },
    valueBadge: {
      backgroundColor: colors.badgeBackground,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      minWidth: 70,
      alignItems: "center",
      borderWidth: 2,
      borderColor: "#000000",
    },
    valueText: {
      color: colors.badgeText,
      fontSize: 16 * fontMultiplier,
      fontWeight: isBold ? "800" : "700",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 20 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
    },
    slider: { width: "100%", height: 40 },
    sliderActive: { backgroundColor: colors.sliderActive },
    sliderInactive: { backgroundColor: colors.sliderInactive },
    sliderThumb: { backgroundColor: colors.sliderThumb },
    switchRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    switchTrackOn: { backgroundColor: colors.switchTrackOn },
    switchTrackOff: { backgroundColor: colors.switchTrackOff },
    switchThumbOn: { backgroundColor: colors.switchThumbOn },
    switchThumbOff: { backgroundColor: colors.switchThumbOff },
    changeButton: {
      backgroundColor: colors.changeButtonBg,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: "#000000",
    },
    changeButtonText: {
      color: colors.changeButtonText,
      fontSize: 16 * fontMultiplier,
      fontWeight: isBold ? "800" : "700",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 20 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
    },
  });
};
