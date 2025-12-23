import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  View,
  Dimensions,
  Platform,
  Animated,
  AccessibilityInfo,
  findNodeHandle,
  ScrollView,
  Text,
  TouchableOpacity, // Usando componente nativo para o botão
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import { AccessibleButton } from "../../components/AccessibleComponents";

const { width, height } = Dimensions.get("window");
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;
const normalize = (size: number) => Math.round((width / 375) * size);

const MASTER_WORD_LIST = [
  "BOLA",
  "GATO",
  "MESA",
  "FOGO",
  "DEDO",
  "PATO",
  "RATO",
  "LUA",
  "SOL",
  "VIDA",
  "AMOR",
  "PAI",
  "MAE",
  "AGUA",
  "LIVRO",
  "CASA",
  "JOGO",
  "PEIXE",
  "FLOR",
  "REI",
  "CAFE",
  "PAO",
  "CEU",
  "MAR",
  "RUA",
  "VOVO",
  "SAPO",
  "FACA",
  "COPO",
  "LUVA",
  "RODA",
  "FOCA",
  "NAVE",
  "REDE",
  "SINO",
  "UVA",
  "VELA",
  "SOFA",
  "DADO",
  "BEBE",
  "DEZ",
  "UM",
  "DOIS",
  "SEIS",
  "NOVE",
  "ZERO",
  "OITO",
  "SETE",
  "TRES",
  "VAI",
];

function shuffleArray(array: string[]) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

let sessionWordList: string[] = [];

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "WritingChallengeRoullete"
>;

export default function WritingChallengeRoulleteScreen({
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

  const [isSpinning, setIsSpinning] = useState(false);
  const [spinAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  // CORREÇÃO DO ERRO DE TYPESCRIPT:
  // TouchableOpacity é um valor, para usar como tipo usamos React.ElementRef ou View (já que ele herda de View no native)
  // Usar 'View' aqui é seguro para findNodeHandle.
  const spinButtonRef = useRef<View>(null);
  const headerRef = useRef<View>(null);

  const setFocus = (ref: React.RefObject<any>) => {
    if (Platform.OS === "web") return;
    if (ref.current) {
      const reactTag = findNodeHandle(ref.current);
      if (reactTag) AccessibilityInfo.setAccessibilityFocus(reactTag);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (sessionWordList.length === 0) {
        sessionWordList = shuffleArray([...MASTER_WORD_LIST]);
      }
      setTimeout(() => {
        // CORREÇÃO: Focamos no HEADER primeiro para o usuário saber onde está
        setFocus(headerRef);

        if (Platform.OS === "android") {
          // Anúncio breve para contexto
          AccessibilityInfo.announceForAccessibility("Tela da Roleta.");
        }
      }, 500);
    }, [])
  );

  const handleSpin = () => {
    setIsSpinning(true);
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      if (sessionWordList.length === 0) {
        sessionWordList = shuffleArray([...MASTER_WORD_LIST]);
      }
      const word = sessionWordList.pop() as string;
      setIsSpinning(false);
      spinAnim.setValue(0);
      navigation.navigate("WritingChallengeGame", { word: word });
    }, 1500);
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      importantForAccessibility="no" // Impede foco no container scroll
    >
      {isSpinning ? (
        <View
          style={styles.spinningContainer}
          accessibilityLiveRegion="assertive"
          accessible={true}
          focusable={true}
          accessibilityLabel="Status: Sorteando palavra..."
        >
          <Animated.View
            style={[
              styles.spinnerIcon,
              { transform: [{ rotate: spin }, { scale: scaleAnim }] },
            ]}
          >
            <Ionicons
              name="shuffle"
              size={normalize(80)}
              color={theme.button}
              importantForAccessibility="no"
            />
          </Animated.View>
          <Text style={styles.spinText} importantForAccessibility="no">
            Sorteando palavra...
          </Text>
          <ActivityIndicator
            size="large"
            color={theme.button}
            style={{ marginTop: hp(2) }}
          />
        </View>
      ) : (
        <>
          {/* Bloco 1: Header - CORRIGIDO PARA DETECÇÃO */}
          <View
            ref={headerRef} // Ref adicionada aqui
            style={styles.header}
            accessible={true}
            focusable={true} // Permite TAB
            accessibilityRole="header"
            // Garante prioridade no TalkBack
            importantForAccessibility="yes"
            accessibilityLabel="Título: Roleta de Palavras. Subtítulo: Gire para sortear seu desafio."
          >
            <Ionicons
              name="trophy"
              size={normalize(48)}
              color={theme.button}
              importantForAccessibility="no"
            />
            <Text style={styles.title} importantForAccessibility="no">
              Roleta de Palavras
            </Text>
            <Text style={styles.subtitle} importantForAccessibility="no">
              Gire para sortear seu desafio
            </Text>
          </View>

          {/* Bloco 2: Botão de Girar - NATIVO E ÁGIL */}
          <View style={styles.spinButtonContainer}>
            <TouchableOpacity
              ref={spinButtonRef}
              style={styles.spinButton}
              onPress={handleSpin}
              activeOpacity={0.8}
              // Acessibilidade no componente pai (botão único)
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Botão GIRAR"
              accessibilityHint="Toque duas vezes para sortear uma palavra aleatória."
              focusable={true}
            >
              {/* Filhos escondidos para evitar duplo foco */}
              <Ionicons
                name="shuffle"
                size={normalize(60)}
                color={theme.buttonText ?? "#FFFFFF"}
                importantForAccessibility="no"
              />
              <Text
                style={styles.spinButtonText}
                importantForAccessibility="no"
              >
                GIRAR
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bloco 3: Card de Informação */}
          <View
            style={styles.infoCard}
            accessible={true}
            focusable={true} // Navegação TAB
            accessibilityLabel={`Informação: Banco de Palavras. ${MASTER_WORD_LIST.length} palavras disponíveis.`}
          >
            <View style={styles.infoRow} importantForAccessibility="no">
              <View style={styles.infoIconContainer}>
                <Ionicons
                  name="library"
                  size={normalize(24)}
                  color={theme.button}
                />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Banco de Palavras</Text>
                <Text style={styles.infoValue}>
                  {MASTER_WORD_LIST.length} palavras disponíveis
                </Text>
              </View>
            </View>
          </View>

          {/* Bloco 4: Card de Dica */}
          <View
            style={styles.tipCard}
            accessible={true}
            focusable={true} // Navegação TAB
            accessibilityLabel="Dica: Quando todas as palavras forem sorteadas, a lista será embaralhada novamente!"
          >
            <Ionicons
              name="information-circle"
              size={normalize(20)}
              color={theme.button}
              style={{ marginRight: wp(2) }}
              importantForAccessibility="no"
            />
            <Text style={styles.tipText} importantForAccessibility="no">
              Quando todas as palavras forem sorteadas, a lista será embaralhada
              novamente!
            </Text>
          </View>
        </>
      )}
    </ScrollView>
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
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: wp(5),
      paddingTop: hp(3),
      paddingBottom: hp(5),
      alignItems: "center",
      justifyContent: "center",
    },
    spinningContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      minHeight: hp(60),
    },
    spinnerIcon: { marginBottom: hp(3) },
    spinText: {
      fontSize: Math.min(normalize(18) * fontMultiplier, wp(5)),
      color: theme.text,
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    header: { alignItems: "center", marginBottom: hp(3), width: "100%" },
    title: {
      fontSize: Math.min(normalize(26) * fontMultiplier, wp(7)),
      color: theme.text,
      fontWeight: isBold ? "bold" : "700",
      marginTop: hp(1.5),
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: Math.min(normalize(32) * lineHeightMultiplier, wp(9)),
      letterSpacing,
    },
    subtitle: {
      fontSize: Math.min(normalize(14) * fontMultiplier, wp(4)),
      color: theme.text,
      opacity: 0.7,
      marginTop: hp(0.5),
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    spinButtonContainer: { marginVertical: hp(3) },
    spinButton: {
      width: wp(60),
      height: wp(60),
      maxWidth: 250,
      maxHeight: 250,
      borderRadius: wp(30),
      backgroundColor: theme.button ?? "#191970",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 6,
      borderColor: `${theme.button}40`,
    },
    spinButtonText: {
      color: theme.buttonText ?? "#FFFFFF",
      fontSize: Math.min(normalize(24) * fontMultiplier, wp(7)),
      fontWeight: isBold ? "bold" : "700",
      marginTop: hp(1),
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      letterSpacing: 2,
    },
    infoCard: {
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: wp(4),
      marginBottom: hp(2),
    },
    infoRow: { flexDirection: "row", alignItems: "center" },
    infoIconContainer: {
      width: wp(12),
      height: wp(12),
      borderRadius: wp(6),
      backgroundColor: `${theme.button}15`,
      alignItems: "center",
      justifyContent: "center",
      marginRight: wp(3),
    },
    infoTextContainer: { flex: 1 },
    infoLabel: {
      fontSize: Math.min(normalize(12) * fontMultiplier, wp(3.3)),
      color: theme.cardText,
      opacity: 0.7,
      marginBottom: hp(0.3),
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    infoValue: {
      fontSize: Math.min(normalize(16) * fontMultiplier, wp(4.5)),
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    tipCard: {
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
    tipText: {
      flex: 1,
      fontSize: Math.min(normalize(12) * fontMultiplier, wp(3.5)),
      color: theme.cardText,
      lineHeight: Math.min(normalize(18), wp(5)),
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });
