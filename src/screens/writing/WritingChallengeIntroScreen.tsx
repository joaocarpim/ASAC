import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  StatusBar,
  Dimensions,
  ScrollView,
  Animated,
  AccessibilityInfo,
  findNodeHandle,
  Text,
  TouchableOpacity, // <--- ADICIONADO IMPORTANTE
} from "react-native";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";

// AccessibleButton removido do uso no botão principal para evitar aninhamento
import { AccessibleButton } from "../../components/AccessibleComponents";
import ScreenHeader from "../../components/layout/ScreenHeader";

const { width, height } = Dimensions.get("window");
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;
const normalize = (size: number) => Math.round((width / 375) * size);

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "WritingChallengeIntro"
>;

export default function WritingChallengeIntroScreen({
  navigation,
}: ScreenProps) {
  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled,
    lineHeightMultiplier,
    letterSpacing,
  } = useSettings();
  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled,
    lineHeightMultiplier,
    letterSpacing
  );

  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const headerRef = useRef<View>(null);

  const setFocus = (ref: React.RefObject<View | null>) => {
    if (Platform.OS === "web") return;
    if (ref.current) {
      const reactTag = findNodeHandle(ref.current);
      if (reactTag) AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setFocus(headerRef), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setLoading(true);
    if (Platform.OS === "android") {
      AccessibilityInfo.announceForAccessibility("Carregando desafio...");
    }
    setTimeout(() => {
      setLoading(false);
      navigation.navigate("WritingChallengeRoullete");
    }, 500);
  };

  const handleGoBack = () => navigation.canGoBack() && navigation.goBack();

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.translationX > 50) handleGoBack();
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title="Desafio" onBackPress={handleGoBack} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          importantForAccessibility="no"
        >
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Bloco 1: Cabeçalho Principal */}
            <View
              ref={headerRef}
              style={styles.headerSection}
              accessible={true}
              focusable={true}
              accessibilityLabel="Título: Desafio de Escrita. Subtítulo: Teste suas habilidades em Braille."
              accessibilityRole="header"
            >
              <View style={styles.iconContainer} importantForAccessibility="no">
                <MaterialCommunityIcons
                  name="keyboard-variant"
                  size={normalize(80)}
                  color={theme.button}
                />
              </View>
              <Text style={styles.title} importantForAccessibility="no">
                Desafio de Escrita
              </Text>
              <Text style={styles.subtitle} importantForAccessibility="no">
                Teste suas habilidades em Braille
              </Text>
            </View>

            {/* Bloco 2: Card de Descrição */}
            <View
              style={styles.descriptionCard}
              accessible={true}
              focusable={true}
              accessibilityRole="text"
              accessibilityLabel="Seção: Como Funciona. Gire a roleta para sortear uma palavra aleatória e teste sua velocidade e precisão de escrita em Braille!"
            >
              <View style={styles.cardHeader} importantForAccessibility="no">
                <Ionicons
                  name="information-circle"
                  size={normalize(24)}
                  color={theme.button}
                  style={{ marginRight: wp(2) }}
                />
                <Text style={styles.cardHeaderText}>Como Funciona</Text>
              </View>
              <Text style={styles.description} importantForAccessibility="no">
                Gire a roleta para sortear uma palavra aleatória e teste sua
                velocidade e precisão de escrita em Braille!
              </Text>
            </View>

            {/* Bloco 3: Grid de Features */}
            <View style={styles.featuresGrid} importantForAccessibility="no">
              <View
                style={styles.featureCard}
                accessible={true}
                focusable={true}
                accessibilityRole="text"
                accessibilityLabel="Recurso: 50 Palavras. Vocabulário diversificado."
              >
                <View
                  style={styles.featureIconContainer}
                  importantForAccessibility="no"
                >
                  <Ionicons
                    name="text"
                    size={normalize(28)}
                    color={theme.button}
                  />
                </View>
                <Text
                  style={styles.featureTitleStatic}
                  importantForAccessibility="no"
                >
                  50 Palavras
                </Text>
                <Text
                  style={styles.featureDescStatic}
                  importantForAccessibility="no"
                >
                  Vocabulário diversificado
                </Text>
              </View>

              <View
                style={styles.featureCard}
                accessible={true}
                focusable={true}
                accessibilityRole="text"
                accessibilityLabel="Recurso: Roleta. Sorteio aleatório."
              >
                <View
                  style={styles.featureIconContainer}
                  importantForAccessibility="no"
                >
                  <Ionicons
                    name="shuffle"
                    size={normalize(28)}
                    color={theme.button}
                  />
                </View>
                <Text
                  style={styles.featureTitleStatic}
                  importantForAccessibility="no"
                >
                  Roleta
                </Text>
                <Text
                  style={styles.featureDescStatic}
                  importantForAccessibility="no"
                >
                  Sorteio aleatório
                </Text>
              </View>

              <View
                style={styles.featureCard}
                accessible={true}
                focusable={true}
                accessibilityRole="text"
                accessibilityLabel="Recurso: Feedback. Instantâneo."
              >
                <View
                  style={styles.featureIconContainer}
                  importantForAccessibility="no"
                >
                  <Ionicons
                    name="flash"
                    size={normalize(28)}
                    color={theme.button}
                  />
                </View>
                <Text
                  style={styles.featureTitleStatic}
                  importantForAccessibility="no"
                >
                  Feedback
                </Text>
                <Text
                  style={styles.featureDescStatic}
                  importantForAccessibility="no"
                >
                  Instantâneo
                </Text>
              </View>

              <View
                style={styles.featureCard}
                accessible={true}
                focusable={true}
                accessibilityRole="text"
                accessibilityLabel="Recurso: Progresso. Acompanhe resultados."
              >
                <View
                  style={styles.featureIconContainer}
                  importantForAccessibility="no"
                >
                  <Ionicons
                    name="stats-chart"
                    size={normalize(28)}
                    color={theme.button}
                  />
                </View>
                <Text
                  style={styles.featureTitleStatic}
                  importantForAccessibility="no"
                >
                  Progresso
                </Text>
                <Text
                  style={styles.featureDescStatic}
                  importantForAccessibility="no"
                >
                  Acompanhe resultados
                </Text>
              </View>
            </View>

            {/* Bloco 4: Card de Dicas */}
            <View
              style={styles.tipsCard}
              accessible={true}
              focusable={true}
              accessibilityRole="text"
              accessibilityLabel="Seção: Dicas. Dica 1: Use fones de ouvido. Dica 2: Escreva com calma. Dica 3: Pratique regularmente."
            >
              <View style={styles.tipsHeader} importantForAccessibility="no">
                <Ionicons
                  name="bulb-outline"
                  size={normalize(22)}
                  color={theme.button}
                  style={{ marginRight: wp(2) }}
                />
                <Text style={styles.tipsHeaderText}>Dicas</Text>
              </View>

              <View style={styles.tipsList} importantForAccessibility="no">
                <View style={styles.tipItem}>
                  <Ionicons
                    name="chevron-forward"
                    size={normalize(16)}
                    color={theme.button}
                    style={{ marginRight: wp(2) }}
                  />
                  <Text style={styles.tipTextStatic}>Use fones de ouvido</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons
                    name="chevron-forward"
                    size={normalize(16)}
                    color={theme.button}
                    style={{ marginRight: wp(2) }}
                  />
                  <Text style={styles.tipTextStatic}>Escreva com calma</Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons
                    name="chevron-forward"
                    size={normalize(16)}
                    color={theme.button}
                    style={{ marginRight: wp(2) }}
                  />
                  <Text style={styles.tipTextStatic}>
                    Pratique regularmente
                  </Text>
                </View>
              </View>
            </View>

            {/* Bloco 5: Botão - AGORA USANDO TouchableOpacity NATIVO PARA CORRIGIR O BUG */}
            <View style={styles.footer}>
              {loading ? (
                <View
                  style={styles.loadingContainer}
                  accessibilityLiveRegion="assertive"
                  accessible={true}
                  focusable={true}
                  accessibilityRole="alert"
                  accessibilityLabel="Carregando o desafio, por favor aguarde."
                >
                  <ActivityIndicator size="large" color={theme.button} />
                  <Text
                    style={styles.loadingTextStatic}
                    importantForAccessibility="no"
                  >
                    Carregando...
                  </Text>
                </View>
              ) : (
                <View style={{ width: "100%", alignItems: "center" }}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleStart}
                    activeOpacity={0.8}
                    // Configurações de Acessibilidade Nativas
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Começar Desafio"
                    accessibilityHint="Toque duas vezes para iniciar"
                  >
                    {/* importantForAccessibility="no" esconde os filhos para criar um único alvo de clique */}
                    <Text
                      style={styles.buttonText}
                      importantForAccessibility="no"
                    >
                      Começar Desafio
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={normalize(24)}
                      color={theme.buttonText ?? "#FFFFFF"}
                      style={{ marginLeft: wp(3) }}
                      importantForAccessibility="no"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Bloco 6: Dica de Gesto */}
            <View
              style={styles.gestureHint}
              accessible={true}
              focusable={true}
              accessibilityRole="text"
              accessibilityLabel="Dica de Navegação: Deslize para a direita para voltar."
            >
              <Ionicons
                name="arrow-back"
                size={normalize(18)}
                color={theme.text}
                style={{ opacity: 0.6, marginRight: wp(2) }}
                importantForAccessibility="no"
              />
              <Text
                style={styles.gestureHintTextStatic}
                importantForAccessibility="no"
              >
                Deslize para a direita para voltar
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </GestureDetector>
  );
}

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexiaFontEnabled: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollView: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: wp(5),
      paddingBottom: hp(3),
    },
    content: { alignItems: "center", paddingTop: hp(2) },
    headerSection: {
      alignItems: "center",
      marginBottom: hp(3),
      width: "100%",
    },
    iconContainer: {
      marginBottom: hp(2),
      padding: wp(5),
      borderRadius: 100,
      backgroundColor: `${theme.button}20`,
      borderWidth: 3,
      borderColor: `${theme.button}40`,
    },
    title: {
      fontSize: Math.min(normalize(28) * fontMultiplier, wp(8)),
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      marginBottom: hp(1),
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Bold" : undefined,
      lineHeight: Math.min(normalize(34) * lineHeightMultiplier, wp(10)),
      letterSpacing,
    },
    subtitle: {
      fontSize: Math.min(normalize(16) * fontMultiplier, wp(4.5)),
      color: theme.text,
      opacity: 0.8,
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    descriptionCard: {
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: wp(5),
      marginBottom: hp(2.5),
      borderWidth: 1,
      borderColor: `${theme.button}30`,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp(1.5),
    },
    cardHeaderText: {
      fontSize: Math.min(normalize(18) * fontMultiplier, wp(5)),
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    description: {
      fontSize: Math.min(normalize(15) * fontMultiplier, wp(4.2)),
      color: theme.cardText,
      textAlign: "left",
      lineHeight: Math.min(normalize(22) * lineHeightMultiplier, wp(6)),
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      letterSpacing,
    },
    featuresGrid: {
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: hp(2.5),
    },
    featureCard: {
      width: "48%",
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: wp(4),
      alignItems: "center",
      marginBottom: hp(1.5),
    },
    featureIconContainer: {
      width: wp(12),
      height: wp(12),
      borderRadius: wp(6),
      backgroundColor: `${theme.button}15`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: hp(1),
    },
    featureTitleStatic: {
      fontSize: Math.min(normalize(14) * fontMultiplier, wp(4)),
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      marginBottom: hp(0.5),
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    featureDescStatic: {
      fontSize: Math.min(normalize(12) * fontMultiplier, wp(3.3)),
      color: theme.cardText,
      opacity: 0.7,
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    tipsCard: {
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: wp(5),
      marginBottom: hp(2.5),
      borderWidth: 2,
      borderColor: `${theme.button}40`,
    },
    tipsHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp(1.5),
    },
    tipsHeaderText: {
      fontSize: Math.min(normalize(16) * fontMultiplier, wp(4.5)),
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    tipsList: { gap: hp(1) },
    tipItem: { flexDirection: "row", alignItems: "flex-start" },
    tipTextStatic: {
      flex: 1,
      fontSize: Math.min(normalize(13) * fontMultiplier, wp(3.8)),
      color: theme.cardText,
      lineHeight: Math.min(normalize(20), wp(5.5)),
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    footer: { width: "100%", alignItems: "center", marginBottom: hp(2) },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: wp(5),
    },
    loadingTextStatic: {
      color: theme.text,
      fontWeight: "600",
      marginTop: hp(1),
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    button: {
      flexDirection: "row",
      backgroundColor: theme.button ?? "#191970",
      paddingVertical: hp(2),
      paddingHorizontal: wp(8),
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
      width: wp(85),
      maxWidth: 400,
    },
    buttonText: {
      color: theme.buttonText ?? "#FFFFFF",
      fontWeight: isBold ? "bold" : "700",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
      fontSize: Math.min(normalize(18) * fontMultiplier, wp(5)),
    },
    gestureHint: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: hp(2),
      padding: wp(3),
      backgroundColor: `${theme.card}80`,
      borderRadius: 20,
    },
    gestureHintTextStatic: {
      fontSize: Math.min(normalize(12) * fontMultiplier, wp(3.3)),
      color: theme.text,
      opacity: 0.6,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });
