// src/screens/contractions/ContractionsGameScreen.tsx (CORREÇÃO DE CONTRASTE)

import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Vibration,
  View,
  Animated,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleText,
  AccessibleButton,
} from "../../components/AccessibleComponents";

// ... (loadSounds e BRAILLE_MAP) ...
let soundCorrect: Audio.Sound | null = null;
let soundIncorrect: Audio.Sound | null = null;
async function loadSounds() {
  try {
    if (!soundCorrect) {
      const { sound } = await Audio.Sound.createAsync(
        require("../../../assets/som/correct.mp3")
      );
      soundCorrect = sound;
    }
    if (!soundIncorrect) {
      const { sound } = await Audio.Sound.createAsync(
        require("../../../assets/som/incorrect.mp3")
      );
      soundIncorrect = sound;
    }
  } catch (error) {
    console.log("Erro ao carregar sons", error);
  }
}

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ContractionsGame"
>;

export default function ContractionsGameScreen({
  route,
  navigation,
}: ScreenProps) {
  const { word, dots } = route.params;
  const [pressedDots, setPressedDots] = useState<number[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    loadSounds();
    return () => {
      soundCorrect?.unloadAsync();
      soundIncorrect?.unloadAsync();
      soundCorrect = null;
      soundIncorrect = null;
    };
  }, []);

  const handleDotToggle = (dotNumber: number) => {
    setPressedDots((prev) => {
      const isPressed = prev.includes(dotNumber);
      if (isPressed) {
        return prev.filter((d) => d !== dotNumber);
      } else {
        return [...prev, dotNumber].sort((a, b) => a - b);
      }
    });
  };

  const triggerShake = () => {
    shakeAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCheckAnswer = async () => {
    const correctDots = dots;

    const isCorrect =
      pressedDots.length === correctDots.length &&
      pressedDots.every((value, index) => value === correctDots[index]);

    if (isCorrect) {
      await soundCorrect?.replayAsync();
      navigation.replace("ContractionsSuccess", { word });
    } else {
      await soundIncorrect?.replayAsync();
      Vibration.vibrate(100);
      triggerShake();
    }
  };

  const handleGoBack = () => {
    Alert.alert(
      "Sair do Desafio?",
      "Tem certeza que quer voltar para a roleta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => navigation.navigate("ContractionsRoullete"),
        },
      ]
    );
  };

  const BrailleDot = ({ number }: { number: number }) => {
    const isPressed = pressedDots.includes(number);
    return (
      <TouchableOpacity
        style={[
          styles.dot, // Estilo base (inativo)
          isPressed && styles.dotPressed, // Estilo extra (ativo)
        ]}
        onPress={() => handleDotToggle(number)}
        accessibilityLabel={`Ponto ${number}`}
        accessibilityState={{ selected: isPressed }}
      />
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <MaterialCommunityIcons
          name="arrow-left"
          size={30}
          color={theme.text}
        />
      </TouchableOpacity>

      <AccessibleView
        style={styles.wordContainer}
        accessibilityLabel={`Palavra: ${word}`}
        accessibilityText="Escreva a contração para esta palavra"
      >
        <AccessibleText style={styles.currentLetter} baseSize={52}>
          {word}
        </AccessibleText>
      </AccessibleView>

      <View style={styles.brailleInputArea}>
        <Animated.View
          style={[
            styles.brailleCellOutline,
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          <AccessibleView
            style={styles.dotColumn}
            accessibilityText="Coluna esquerda dos pontos Braille, 1, 2, 3"
          >
            <BrailleDot number={1} />
            <BrailleDot number={2} />
            <BrailleDot number={3} />
          </AccessibleView>
          <AccessibleView
            style={styles.dotColumn}
            accessibilityText="Coluna direita dos pontos Braille, 4, 5, 6"
          >
            <BrailleDot number={4} />
            <BrailleDot number={5} />
            <BrailleDot number={6} />
          </AccessibleView>
        </Animated.View>

        <AccessibleButton
          style={styles.checkButton}
          onPress={handleCheckAnswer}
          accessibilityText="Verificar resposta"
        >
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={24 * fontSizeMultiplier}
            color={theme.buttonText ?? "#FFFFFF"}
          />
          <AccessibleText style={styles.checkButtonText} baseSize={18}>
            Verificar
          </AccessibleText>
        </AccessibleButton>
      </View>
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
    container: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: "center",
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 + 40,
    },
    backButton: {
      position: "absolute",
      top: Platform.OS === "android" ? StatusBar.currentHeight : 0 + 15,
      left: 15,
      zIndex: 10,
      padding: 5,
    },
    wordContainer: {
      flexDirection: "row",
      marginBottom: 20,
      height: 80,
      alignItems: "center",
    },
    currentLetter: {
      fontSize: 52 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      opacity: 1,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    brailleInputArea: {
      flex: 1,
      justifyContent: "space-around",
      alignItems: "center",
      width: "100%",
      paddingVertical: 20,
    },
    brailleCellOutline: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: 250,
      height: 350,
      borderRadius: 20,
      borderWidth: 4,
      borderColor: theme.button ?? "#191970",
      backgroundColor: theme.card,
      paddingVertical: 20,
      paddingHorizontal: 10,
      elevation: 5,
    },
    dotColumn: {
      justifyContent: "space-around",
      height: "100%",
    },
    // ✅ CORREÇÃO DE CONTRASTE (PONTO INATIVO)
    dot: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.card, // Cor do fundo (azul)
      borderWidth: 2,
      borderColor: theme.cardText, // Borda branca
      marginVertical: 10,
      opacity: 0.3, // Aparência de "buraco"
    },
    // ✅ CORREÇÃO DE CONTRASTE (PONTO ATIVO)
    dotPressed: {
      backgroundColor: theme.background, // Cor de destaque (amarelo)
      borderColor: theme.text, // Borda azul
      opacity: 1, // Opacidade total
    },
    checkButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.button ?? "#191970",
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 30,
      marginTop: 20,
      elevation: 4,
    },
    checkButtonText: {
      color: theme.buttonText ?? "#FFFFFF",
      fontSize: 18 * fontMultiplier,
      fontWeight: (isBold ? "bold" : "700") as "bold" | "700",
      marginLeft: 10,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });
