import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  AccessibilityInfo,
  Platform,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ConfettiCannon from "react-native-confetti-cannon";
import { ALL_BRAILLE_CHARS } from "../../navigation/brailleLetters";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { RootStackParamList } from "../../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width, height } = Dimensions.get("window");

type BraillePracticeRouteProp = RouteProp<
  RootStackParamList,
  "BraillePractice"
>;
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const shuffleArray = (array: string[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function BraillePracticeScreen() {
  const route = useRoute<BraillePracticeRouteProp>();
  const navigation = useNavigation<NavigationProps>();
  const { title, characters } = route.params;

  const initialShuffledChars = useMemo(
    () => shuffleArray(characters),
    [characters]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const { theme } = useContrast();
  const { fontSizeMultiplier, isBoldTextEnabled, isDyslexiaFontEnabled } =
    useSettings();
  const styles = useMemo(
    () =>
      createStyles(
        theme,
        fontSizeMultiplier,
        isBoldTextEnabled,
        isDyslexiaFontEnabled
      ),
    [theme, fontSizeMultiplier, isBoldTextEnabled, isDyslexiaFontEnabled]
  );

  const soundObjects = useMemo(
    () => ({
      correct: new Audio.Sound(),
      incorrect: new Audio.Sound(),
      happy: new Audio.Sound(),
    }),
    []
  );

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await soundObjects.correct.loadAsync(
          require("../../../assets/som/correct.mp3")
        );
        await soundObjects.incorrect.loadAsync(
          require("../../../assets/som/incorrect.mp3")
        );
        await soundObjects.happy.loadAsync(
          require("../../../assets/som/happy.mp3")
        );
      } catch (error) {
        console.warn("❌ Erro ao carregar sons:", error);
      }
    };
    loadSounds();
    return () => {
      Object.values(soundObjects).forEach((sound) => sound.unloadAsync());
    };
  }, [soundObjects]);

  const playSound = useCallback(
    async (soundType: "correct" | "incorrect" | "happy") => {
      try {
        await soundObjects[soundType].replayAsync();
      } catch (error) {
        console.warn(`❌ Erro ao tocar ${soundType}:`, error);
      }
    },
    [soundObjects]
  );

  const setupNewChallenge = useCallback(() => {
    if (currentIndex >= initialShuffledChars.length) {
      setSessionComplete(true);
      playSound("happy");
      // Anúncio via API direta garante que o usuário ouça, independente do foco visual
      AccessibilityInfo.announceForAccessibility("Sessão concluída! Parabéns!");
      return;
    }
    setActiveDots([]);
    setFeedback("");
    setIsCorrect(null);
  }, [
    currentIndex,
    initialShuffledChars.length,
    initialShuffledChars,
    playSound,
  ]);

  useEffect(() => {
    setupNewChallenge();
  }, [currentIndex, setupNewChallenge]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, []);

  const handleDotPress = useCallback(
    (dotNumber: number) => {
      if (isCorrect) return;
      setActiveDots((prev) =>
        prev.includes(dotNumber)
          ? prev.filter((d) => d !== dotNumber)
          : [...prev, dotNumber]
      );
    },
    [isCorrect]
  );

  const checkAnswer = useCallback(() => {
    const currentCharacter = initialShuffledChars[currentIndex];
    if (!currentCharacter) return;
    const correctPattern =
      ALL_BRAILLE_CHARS[currentCharacter as keyof typeof ALL_BRAILLE_CHARS];
    const sortedUserPattern = [...activeDots].sort();
    const sortedCorrectPattern = [...correctPattern].sort();

    if (
      JSON.stringify(sortedUserPattern) === JSON.stringify(sortedCorrectPattern)
    ) {
      setFeedback("Correto! 🎉");
      setIsCorrect(true);
      playSound("correct");
      AccessibilityInfo.announceForAccessibility(
        "Correto! Botão Próximo disponível."
      );
    } else {
      setFeedback("Tente Novamente. 🤔");
      setIsCorrect(false);
      playSound("incorrect");
      AccessibilityInfo.announceForAccessibility("Incorreto, tente novamente.");
    }
  }, [initialShuffledChars, currentIndex, activeDots, playSound]);

  const panGesture = useMemo(
    () =>
      Platform.OS !== "web"
        ? Gesture.Pan().onEnd((event) => {
            if (
              event.translationX > 50 &&
              Math.abs(event.translationX) > Math.abs(event.translationY)
            ) {
              navigation.goBack();
            }
          })
        : Gesture.Pan(),
    [navigation]
  );

  const renderContent = () => {
    // -----------------------------------------------------------
    // TELA DE PARABÉNS (SESSÃO CONCLUÍDA) - CORRIGIDA
    // -----------------------------------------------------------
    if (sessionComplete) {
      return (
        <View style={styles.container}>
          <ConfettiCannon
            count={200}
            origin={{ x: -10, y: 0 }}
            fallSpeed={2500}
            fadeOut={true}
          />
          <StatusBar
            barStyle={theme.statusBarStyle}
            backgroundColor={theme.background}
          />

          {/* CORREÇÃO DE DETECÇÃO: 
             Usamos 'accessibilityRole="header"' que tem alta prioridade no Android.
             Removemos 'accessibilityLiveRegion' daqui para evitar conflitos de foco.
          */}
          <View
            accessible={true}
            focusable={true}
            accessibilityRole="header"
            accessibilityLabel={`Parabéns! Você concluiu a sessão ${title}!`}
            style={{ alignItems: "center", width: "100%", marginBottom: 40 }}
          >
            {/* Esconde os elementos visuais individuais */}
            <View
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden={true}
              style={{ alignItems: "center" }}
            >
              <MaterialCommunityIcons
                name="party-popper"
                size={80}
                color="#FFD700"
                style={{ marginBottom: 20 }}
              />
              <Text style={styles.completionTitle}>Parabéns!</Text>
              <Text style={styles.completionSubtitle}>
                Você concluiu a sessão "{title}"!
              </Text>
            </View>
          </View>

          {/* Botão Voltar - Bloco Único */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
            accessible={true}
            focusable={true}
            accessibilityRole="button"
            accessibilityLabel="Voltar para a Jornada"
          >
            <Text
              style={[styles.buttonText, { color: theme.buttonText ?? "#FFF" }]}
              importantForAccessibility="no-hide-descendants"
              accessibilityElementsHidden={true}
            >
              Voltar para a Jornada
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    // -----------------------------------------------------------
    // TELA DE PRÁTICA NORMAL
    // -----------------------------------------------------------
    const currentCharacter = initialShuffledChars[currentIndex];

    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />

        {/* Header Agrupado */}
        <View
          style={styles.header}
          accessible={true}
          focusable={true}
          accessibilityRole="header"
          accessibilityLabel={`${title}. Progresso: ${currentIndex + 1} de ${
            initialShuffledChars.length
          }`}
        >
          <View
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden={true}
          >
            <Text style={styles.titleHeader}>{title}</Text>
            <Text style={styles.progressIndicator}>
              {currentIndex + 1} / {initialShuffledChars.length}
            </Text>
          </View>
        </View>

        {/* Prompt Agrupado */}
        <View
          accessible={true}
          focusable={true}
          accessibilityRole="text"
          accessibilityLabel={`Forme a letra: ${currentCharacter}`}
          style={{ marginVertical: 10 }}
        >
          <Text
            style={styles.prompt}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden={true}
          >
            Forme: <Text style={styles.letter}>{currentCharacter}</Text>
          </Text>
        </View>

        {/* Cela Braille (Pontos Individuais - Interativos) */}
        <View style={styles.brailleCell}>
          {/* COLUNA ESQUERDA */}
          <View style={styles.column}>
            {[1, 2, 3].map((dotNumber) => {
              const isActive = activeDots.includes(dotNumber);
              return (
                <TouchableOpacity
                  key={dotNumber}
                  style={styles.dotContainer}
                  onPress={() => handleDotPress(dotNumber)}
                  disabled={!!isCorrect}
                  accessible={true}
                  focusable={true}
                  accessibilityLabel={`Ponto ${dotNumber}`}
                  accessibilityState={{ selected: isActive }}
                  accessibilityHint={
                    isActive ? "Toque para desmarcar" : "Toque para marcar"
                  }
                  accessibilityRole="togglebutton"
                >
                  <View
                    style={[
                      styles.dot,
                      isActive ? styles.dotActive : styles.dotInactive,
                    ]}
                  >
                    <Text
                      style={styles.dotNumber}
                      importantForAccessibility="no-hide-descendants"
                    >
                      {dotNumber}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* COLUNA DIREITA */}
          <View style={styles.column}>
            {[4, 5, 6].map((dotNumber) => {
              const isActive = activeDots.includes(dotNumber);
              return (
                <TouchableOpacity
                  key={dotNumber}
                  style={styles.dotContainer}
                  onPress={() => handleDotPress(dotNumber)}
                  disabled={!!isCorrect}
                  accessible={true}
                  focusable={true}
                  accessibilityLabel={`Ponto ${dotNumber}`}
                  accessibilityState={{ selected: isActive }}
                  accessibilityHint={
                    isActive ? "Toque para desmarcar" : "Toque para marcar"
                  }
                  accessibilityRole="togglebutton"
                >
                  <View
                    style={[
                      styles.dot,
                      isActive ? styles.dotActive : styles.dotInactive,
                    ]}
                  >
                    <Text
                      style={styles.dotNumber}
                      importantForAccessibility="no-hide-descendants"
                    >
                      {dotNumber}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Feedback Area - Agrupada */}
        <View style={styles.feedbackContainer}>
          {!!feedback && (
            <View
              accessible={true}
              focusable={true}
              accessibilityRole="alert"
              accessibilityLabel={feedback}
            >
              <Text
                style={[
                  styles.feedback,
                  { color: isCorrect ? "#28a745" : "#dc3545" },
                ]}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden={true}
              >
                {feedback}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actionContainer}>
          {isCorrect ? (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.button ?? "#28a745" },
              ]}
              onPress={handleNext}
              accessible={true}
              focusable={true}
              accessibilityLabel="Resposta correta. Toque duas vezes para ir para o próximo."
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.buttonText ?? "#FFF" },
                ]}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden={true}
              >
                Próximo
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.button ?? "#007bff" },
              ]}
              onPress={checkAnswer}
              accessible={true}
              focusable={true}
              accessibilityLabel="Verificar resposta"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.buttonText ?? "#FFF" },
                ]}
                importantForAccessibility="no-hide-descendants"
                accessibilityElementsHidden={true}
              >
                Verificar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (Platform.OS !== "web" && panGesture) {
    return (
      <GestureDetector gesture={panGesture}>{renderContent()}</GestureDetector>
    );
  }

  return renderContent();
}

const createStyles = (
  theme: any,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexia: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-evenly",
      alignItems: "center",
      backgroundColor: theme.background,
      paddingVertical: height * 0.02,
      paddingHorizontal: 16,
    },
    header: {
      alignItems: "center",
      marginTop: 40,
      width: "100%",
    },
    titleHeader: {
      fontSize: 20 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
      marginBottom: 4,
      textAlign: "center",
    },
    progressIndicator: {
      fontSize: 14 * fontMultiplier,
      color: theme.text,
      opacity: 0.7,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
    },
    prompt: {
      fontSize: 20 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      textAlign: "center",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    letter: {
      color: theme.button ?? "#005a9c",
      fontSize: 24 * fontMultiplier,
      fontWeight: "bold",
    },
    brailleCell: {
      width: width * 0.5,
      height: width * 0.5 * 1.4,
      backgroundColor: theme.card,
      borderRadius: 20,
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      paddingVertical: 10,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    column: {
      flexDirection: "column",
      justifyContent: "space-around",
      height: "100%",
      width: "45%",
      alignItems: "center",
    },
    dotContainer: {
      width: "100%",
      height: "33%",
      justifyContent: "center",
      alignItems: "center",
    },
    dot: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
    },
    dotInactive: {
      backgroundColor: theme.background,
      borderColor: "#c0c8d0",
    },
    dotActive: {
      backgroundColor: theme.button ?? "#005a9c",
      borderColor: "#003d69",
    },
    dotNumber: {
      fontSize: 12 * fontMultiplier,
      color: "rgba(0,0,0,0.4)",
      fontWeight: "bold",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    feedbackContainer: {
      height: 28,
      justifyContent: "center",
      width: "100%",
    },
    feedback: {
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      textAlign: "center",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    actionContainer: {
      width: "85%",
      maxWidth: 400,
    },
    button: {
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: "center",
      backgroundColor: theme.button ?? "#007bff",
      width: "100%",
    },
    buttonText: {
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    completionTitle: {
      fontSize: 32 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
    },
    completionSubtitle: {
      fontSize: 18 * fontMultiplier,
      color: theme.text,
      opacity: 0.8,
      textAlign: "center",
      marginBottom: 32,
      paddingHorizontal: 20,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
  });
