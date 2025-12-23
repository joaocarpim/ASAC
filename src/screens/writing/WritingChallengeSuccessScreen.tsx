import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  Platform,
  Animated,
  AccessibilityInfo,
  findNodeHandle,
  ScrollView,
  Text,
  TouchableOpacity, // <--- Importante: Usar componente nativo
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import ConfettiCannon from "react-native-confetti-cannon";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
// AccessibleButton removido do uso direto para evitar conflito
import { AccessibleButton } from "../../components/AccessibleComponents";

const { width, height } = Dimensions.get("window");
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;
const normalize = (size: number) => Math.round((width / 375) * size);

let soundHappy: Audio.Sound | null = null;

async function loadHappySound() {
  try {
    if (!soundHappy) {
      const { sound } = await Audio.Sound.createAsync(
        require("../../../assets/som/happy.mp3")
      );
      soundHappy = sound;
    }
    await soundHappy?.replayAsync();
  } catch (error) {
    console.log(error);
  }
}

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "WritingChallengeSuccess"
>;

export default function WritingChallengeSuccessScreen({
  route,
  navigation,
}: ScreenProps) {
  const { word } = route.params;
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

  const [showConfetti, setShowConfetti] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [bounceAnim] = useState(new Animated.Value(0));

  // Refs para controle de foco
  const headerRef = useRef<View>(null);

  const setFocus = (ref: React.RefObject<View | null>) => {
    if (Platform.OS === "web") return;
    if (ref.current) {
      const reactTag = findNodeHandle(ref.current);
      if (reactTag) AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  };

  useEffect(() => {
    loadHappySound();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    setTimeout(() => setShowConfetti(false), 3000);

    // Foca no cabeçalho assim que a tela monta
    setTimeout(() => {
      setFocus(headerRef);
    }, 500);

    return () => {
      soundHappy?.unloadAsync();
      soundHappy = null;
    };
  }, [word]);

  const handleNext = () => navigation.replace("WritingChallengeRoullete");
  const handleHome = () => navigation.popToTop();

  return (
    <View style={styles.container}>
      {showConfetti && (
        <View
          style={styles.confettiContainer}
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          <ConfettiCannon
            count={200}
            origin={{ x: -10, y: 0 }}
            fadeOut
            fallSpeed={3000}
          />
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        // Impede que o foco pare na barra de rolagem
        importantForAccessibility="no"
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Bloco 1: Header - BOX DE CIMA CORRIGIDA */}
          <View
            ref={headerRef}
            style={styles.header}
            accessible={true}
            focusable={true} // Permite TAB parar aqui
            accessibilityRole="header"
            // Garante leitura completa
            accessibilityLabel="Título: Parabéns! Subtítulo: Você completou o desafio!"
          >
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ translateY: bounceAnim }] },
              ]}
              importantForAccessibility="no"
            >
              <Ionicons name="trophy" size={normalize(80)} color="#FFD700" />
            </Animated.View>
            <Text style={styles.title} importantForAccessibility="no">
              Parabéns!
            </Text>
            <Text style={styles.subtitle} importantForAccessibility="no">
              Você completou o desafio!
            </Text>
          </View>

          {/* Bloco 2: Card da Palavra */}
          <View
            style={styles.wordCard}
            accessible={true}
            focusable={true} // Permite TAB parar aqui
            accessibilityLabel={`Cartão: Palavra Escrita. ${word}. ${word.length} letras.`}
            accessibilityHint="Resultado do seu exercício"
          >
            <View style={styles.wordCardHeader} importantForAccessibility="no">
              <Ionicons
                name="checkmark-circle"
                size={normalize(28)}
                color="#4CAF50"
              />
              <Text style={styles.wordCardTitle}>Palavra Escrita</Text>
            </View>
            <View style={styles.wordContainer} importantForAccessibility="no">
              <Text style={styles.word}>{word}</Text>
            </View>
            <View style={styles.wordStats} importantForAccessibility="no">
              <View style={styles.wordStat}>
                <Ionicons
                  name="text"
                  size={normalize(20)}
                  color={theme.button}
                />
                <Text style={styles.wordStatText}>{word.length} letras</Text>
              </View>
            </View>
          </View>

          {/* Bloco 3: Card de Conquista */}
          <View
            style={styles.achievementCard}
            accessible={true}
            focusable={true} // Permite TAB parar aqui
            accessibilityLabel="Conquista: Excelente Trabalho! Você escreveu uma palavra em Braille com sucesso!"
          >
            <View
              style={styles.achievementIconContainer}
              importantForAccessibility="no"
            >
              <Ionicons name="star" size={normalize(32)} color="#FFD700" />
            </View>
            <View
              style={styles.achievementTextContainer}
              importantForAccessibility="no"
            >
              <Text style={styles.achievementTitle}>Excelente Trabalho!</Text>
              <Text style={styles.achievementDescription}>
                Você escreveu uma palavra em Braille com sucesso!
              </Text>
            </View>
          </View>

          {/* Bloco 4: Botões - CORRIGIDOS PARA 1 CLIQUE */}
          <View style={styles.actionsContainer}>
            <View>
              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={handleNext}
                activeOpacity={0.8}
                // Acessibilidade no PAI
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Girar Próxima"
                accessibilityHint="Sorteia uma nova palavra"
                focusable={true}
              >
                {/* Filhos escondidos para evitar duplo foco */}
                <Ionicons
                  name="shuffle"
                  size={normalize(20)}
                  color={theme.buttonText ?? "#FFFFFF"}
                  style={{ marginRight: wp(2) }}
                  importantForAccessibility="no"
                />
                <Text
                  style={styles.buttonTextPrimary}
                  importantForAccessibility="no"
                >
                  Girar Próxima
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: hp(2) }}>
              <TouchableOpacity
                style={styles.buttonSecondary}
                onPress={handleHome}
                activeOpacity={0.8}
                // Acessibilidade no PAI
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Voltar ao Início"
                focusable={true}
              >
                <Ionicons
                  name="home-outline"
                  size={normalize(18)}
                  color={theme.text}
                  style={{ marginRight: wp(1.5), opacity: 0.8 }}
                  importantForAccessibility="no"
                />
                <Text
                  style={styles.buttonTextSecondary}
                  importantForAccessibility="no"
                >
                  Voltar ao Início
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bloco 5: Card Motivacional */}
          <View
            style={styles.motivationalCard}
            accessible={true}
            focusable={true} // Permite TAB parar aqui
            accessibilityLabel="Mensagem: Continue praticando! Cada palavra escrita é um passo em direção ao domínio do Braille."
          >
            <Ionicons
              name="sparkles"
              size={normalize(20)}
              color={theme.button}
              style={{ marginRight: wp(2) }}
              importantForAccessibility="no"
            />
            <Text
              style={styles.motivationalText}
              importantForAccessibility="no"
            >
              Continue praticando! Cada palavra escrita é um passo em direção ao
              domínio do Braille.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
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
    confettiContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    },
    scrollView: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(3),
      paddingBottom: hp(5),
    },
    content: { alignItems: "center" },
    header: { alignItems: "center", marginBottom: hp(3), width: "100%" },
    iconContainer: {
      marginBottom: hp(2),
      padding: wp(5),
      borderRadius: 100,
      backgroundColor: `${theme.button}15`,
      borderWidth: 4,
      borderColor: `${theme.button}30`,
    },
    title: {
      fontSize: Math.min(normalize(36) * fontMultiplier, wp(10)),
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      marginBottom: hp(1),
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      letterSpacing: letterSpacing + 2,
    },
    subtitle: {
      fontSize: Math.min(normalize(16) * fontMultiplier, wp(4.5)),
      color: theme.text,
      opacity: 0.8,
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    wordCard: {
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: wp(6),
      marginBottom: hp(2.5),
      borderWidth: 2,
      borderColor: "#4CAF50",
    },
    wordCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp(2),
      gap: wp(2),
    },
    wordCardTitle: {
      fontSize: Math.min(normalize(14) * fontMultiplier, wp(4)),
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      opacity: 0.8,
      textTransform: "uppercase",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    wordContainer: {
      alignItems: "center",
      paddingVertical: hp(3),
      backgroundColor: `${theme.button}10`,
      borderRadius: 12,
      marginBottom: hp(2),
    },
    word: {
      fontSize: Math.min(normalize(36) * fontMultiplier, wp(10)),
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      letterSpacing: letterSpacing + 6,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    wordStats: { flexDirection: "row", justifyContent: "center" },
    wordStat: { flexDirection: "row", alignItems: "center", gap: wp(1.5) },
    wordStatText: {
      fontSize: Math.min(normalize(13) * fontMultiplier, wp(3.8)),
      color: theme.cardText,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    achievementCard: {
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${theme.button}15`,
      borderRadius: 16,
      padding: wp(5),
      marginBottom: hp(3),
      borderWidth: 2,
      borderColor: `${theme.button}40`,
    },
    achievementIconContainer: {
      width: wp(14),
      height: wp(14),
      borderRadius: wp(7),
      backgroundColor: theme.card,
      alignItems: "center",
      justifyContent: "center",
      marginRight: wp(4),
    },
    achievementTextContainer: { flex: 1 },
    achievementTitle: {
      fontSize: Math.min(normalize(16) * fontMultiplier, wp(4.5)),
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      marginBottom: hp(0.5),
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    achievementDescription: {
      fontSize: Math.min(normalize(13) * fontMultiplier, wp(3.8)),
      color: theme.cardText,
      opacity: 0.8,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    actionsContainer: {
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      marginBottom: hp(2),
    },
    buttonPrimary: {
      flexDirection: "row",
      backgroundColor: theme.button ?? "#191970",
      paddingVertical: hp(2),
      paddingHorizontal: wp(8),
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonTextPrimary: {
      color: theme.buttonText ?? "#FFFFFF",
      fontWeight: isBold ? "bold" : "700",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      fontSize: Math.min(normalize(16) * fontMultiplier, wp(4.5)),
    },
    buttonSecondary: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: wp(4),
    },
    buttonTextSecondary: {
      color: theme.text,
      opacity: 0.8,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      fontSize: Math.min(normalize(14) * fontMultiplier, wp(4)),
    },
    motivationalCard: {
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${theme.button}10`,
      borderRadius: 12,
      padding: wp(4),
      borderWidth: 1,
      borderColor: `${theme.button}30`,
    },
    motivationalText: {
      flex: 1,
      fontSize: Math.min(normalize(13) * fontMultiplier, wp(3.8)),
      color: theme.cardText,
      lineHeight: Math.min(normalize(20), wp(5.5)),
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });
