// src/screens/module/ModuleQuizScreen.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Vibration,
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { RootStackScreenProps } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { useProgressStore } from "../../store/progressStore";

import progressService, { ErrorDetail } from "../../services/progressService";

import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
import { useAccessibility } from "../../context/AccessibilityProvider";
import {
  getQuizByModuleId,
  QuizQuestion,
} from "../../navigation/moduleQuestionTypes";
import { useSettings } from "../../hooks/useSettings";
import { Audio } from "expo-av";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

const wp = (percentage: number) => (WINDOW_WIDTH * percentage) / 100;
const hp = (percentage: number) => (WINDOW_HEIGHT * percentage) / 100;
const normalize = (size: number) => {
  const scale = WINDOW_WIDTH / 375;
  return Math.round(size * scale);
};

const playSound = async (sound: Audio.Sound | null) => {
  if (!sound) return;
  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {}
};

export default function ModuleQuizScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModuleQuiz">) {
  const { moduleId } = route.params;
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<ErrorDetail[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
  const [wrongSound, setWrongSound] = useState<Audio.Sound | null>(null);

  const { user } = useAuthStore();
  const { activeProgressId, setActive, stopTimer } = useProgressStore();
  const { theme } = useContrast();
  const { speakText } = useAccessibility();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const styles = getStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  useEffect(() => {
    async function loadSounds() {
      try {
        const { sound: correct } = await Audio.Sound.createAsync(
          require("../../../assets/som/correct.mp3")
        );
        const { sound: wrong } = await Audio.Sound.createAsync(
          require("../../../assets/som/incorrect.mp3")
        );
        setCorrectSound(correct);
        setWrongSound(wrong);
      } catch (err) {
        console.warn("Erro ao carregar sons:", err);
      }
    }
    loadSounds();

    return () => {
      correctSound?.unloadAsync();
      wrongSound?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      const moduleObj = getQuizByModuleId(parseInt(String(moduleId), 10));
      if (!moduleObj) {
        Alert.alert("Erro", "Quiz não encontrado.");
        return navigation.goBack();
      }

      setQuestions(moduleObj.questions);

      if (user?.userId) {
        const progress = await progressService.ensureModuleProgress(
          user.userId,
          String(moduleId),
          moduleObj.moduleId
        );
        if (progress?.id) setActive(progress.id);
      }

      setIsLoading(false);
    };

    init();
  }, [moduleId]);

  useEffect(() => {
    if (!isLoading && speakText && questions[currentQuestionIndex]) {
      speakText(
        `Pergunta ${currentQuestionIndex + 1}: ${
          questions[currentQuestionIndex].question
        }`
      );
    }
  }, [currentQuestionIndex, questions, isLoading]);

  const handleSelect = (index: number) => {
    if (!isAnswerChecked) setSelectedAnswer(index);
  };

  const handleConfirm = useCallback(() => {
    if (selectedAnswer === null) return;

    const q = questions[currentQuestionIndex];
    setIsAnswerChecked(true);

    if (selectedAnswer === q.correctAnswer) {
      playSound(correctSound);
      Vibration.vibrate(70);
      setCorrectCount((p) => p + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1200);
    } else {
      playSound(wrongSound);
      Vibration.vibrate([0, 80, 50, 80]);
      setWrongCount((p) => p + 1);

      setErrorDetails((prev) => [
        ...prev,
        {
          questionId: q.id,
          questionText: q.question,
          userAnswer: q.options[selectedAnswer],
          expectedAnswer: q.options[q.correctAnswer],
        },
      ]);
    }
  }, [selectedAnswer, currentQuestionIndex, questions]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((p) => p + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      return;
    }

    const timeSpent = stopTimer ? stopTimer() : 0;
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const moduleObj = getQuizByModuleId(parseInt(String(moduleId), 10));
    const coinsEarned = correctCount * (moduleObj?.coinsPerCorrect ?? 0);

    navigation.replace("ModuleResult", {
      moduleId,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      totalQuestions: questions.length,
      accuracy,
      timeSpent,
      coinsEarned,
      pointsEarned: 12250,
      passed: correctCount >= (moduleObj?.passingScore ?? 0),
      progressId: activeProgressId ?? undefined,
      errorDetails: JSON.stringify(errorDetails),
    });
  }, [
    currentQuestionIndex,
    correctCount,
    wrongCount,
    questions.length,
    navigation,
    moduleId,
    errorDetails,
  ]);

  const current = questions[currentQuestionIndex];

  if (isLoading)
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={styles.loadingText}>Carregando quiz...</Text>
      </SafeAreaView>
    );

  if (!current)
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Nenhuma pergunta encontrada.</Text>
      </SafeAreaView>
    );

  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />

      {/* HEADER COM PROGRESSO */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.questionCounter}>
            Pergunta {currentQuestionIndex + 1} de {questions.length}
          </Text>
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeEmoji}>✅</Text>
            <Text style={styles.scoreBadgeText}>{correctCount}</Text>
          </View>
          <View style={[styles.scoreBadge, styles.scoreBadgeWrong]}>
            <Text style={styles.scoreBadgeEmoji}>❌</Text>
            <Text style={styles.scoreBadgeText}>{wrongCount}</Text>
          </View>
        </View>
      </View>

      {/* ÁREA DE SCROLL */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionCard}>
          <AccessibleHeader style={styles.questionText}>
            {current.question}
          </AccessibleHeader>

          <View style={styles.optionsContainer}>
            {current.options.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSelect(idx)}
                activeOpacity={0.7}
                disabled={isAnswerChecked}
                style={[
                  styles.option,
                  selectedAnswer === idx && styles.optionSelected,
                  isAnswerChecked &&
                    idx === current.correctAnswer &&
                    styles.optionCorrect,
                  isAnswerChecked &&
                    selectedAnswer === idx &&
                    idx !== current.correctAnswer &&
                    styles.optionWrong,
                ]}
                accessibilityLabel={`Opção ${idx + 1}: ${opt}`}
              >
                <View style={styles.optionNumber}>
                  <Text style={styles.optionNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {isAnswerChecked && current.explanation && (
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>💡 Explicação</Text>
              <Text style={styles.explanationText}>{current.explanation}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* FOOTER COM BOTÃO */}
      <View style={styles.footer}>
        <AccessibleButton
          style={[
            styles.button,
            selectedAnswer === null &&
              !isAnswerChecked &&
              styles.buttonDisabled,
          ]}
          onPress={isAnswerChecked ? handleNext : handleConfirm}
          disabled={selectedAnswer === null && !isAnswerChecked}
        >
          <Text style={styles.buttonText}>
            {isAnswerChecked
              ? currentQuestionIndex === questions.length - 1
                ? "Finalizar Quiz"
                : "Próxima Pergunta →"
              : "Confirmar Resposta"}
          </Text>
        </AccessibleButton>
      </View>

      {/* CONFETTI */}
      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          <ConfettiCannon
            count={120}
            origin={{ x: WINDOW_WIDTH / 2, y: -20 }}
            fadeOut
            fallSpeed={3000}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number,
  isDyslexia: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      paddingHorizontal: wp(5),
    },

    loadingText: {
      color: theme.text,
      fontSize: normalize(16),
      marginTop: hp(2),
      textAlign: "center",
    },

    header: {
      paddingHorizontal: wp(4),
      paddingTop: hp(1.5),
      paddingBottom: hp(2),
      backgroundColor: theme.card,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.1)",
    },

    progressContainer: {
      marginBottom: hp(1.5),
    },

    progressBarBackground: {
      height: hp(1),
      backgroundColor: "rgba(255,255,255,0.2)",
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: hp(1),
    },

    progressBarFill: {
      height: "100%",
      backgroundColor: theme.button,
      borderRadius: 10,
    },

    questionCounter: {
      color: theme.cardText,
      fontSize: Math.min(normalize(13), wp(3.8)),
      fontWeight: "600",
      textAlign: "center",
    },

    scoreRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: wp(4),
    },

    scoreBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(76, 175, 80, 0.2)",
      paddingHorizontal: wp(3),
      paddingVertical: hp(0.8),
      borderRadius: 20,
      borderWidth: 2,
      borderColor: "#4CAF50",
    },

    scoreBadgeWrong: {
      backgroundColor: "rgba(244, 67, 54, 0.2)",
      borderColor: "#F44336",
    },

    scoreBadgeEmoji: {
      fontSize: normalize(14),
      marginRight: wp(1),
    },

    scoreBadgeText: {
      color: theme.cardText,
      fontSize: normalize(14),
      fontWeight: "bold",
    },

    scrollArea: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      paddingBottom: hp(3),
    },

    questionCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: wp(5),
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
        },
        android: { elevation: 6 },
      }),
    },

    questionText: {
      fontSize: Math.min(normalize(17) * fontMultiplier, wp(5.2)),
      fontWeight: isBold ? "bold" : "700",
      color: theme.cardText,
      marginBottom: hp(3),
      lineHeight: Math.min(normalize(24) * lineHeightMultiplier, wp(7)),
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },

    optionsContainer: {
      gap: hp(1.5),
    },

    option: {
      flexDirection: "row",
      alignItems: "center",
      padding: wp(4),
      borderRadius: 12,
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.2)",
      backgroundColor: "rgba(255,255,255,0.05)",
      minHeight: hp(7),
    },

    optionSelected: {
      backgroundColor: "rgba(33, 150, 243, 0.2)",
      borderColor: "#2196F3",
      ...Platform.select({
        ios: {
          shadowColor: "#2196F3",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: { elevation: 3 },
      }),
    },

    optionCorrect: {
      backgroundColor: "rgba(76, 175, 80, 0.25)",
      borderColor: "#4CAF50",
      borderWidth: 3,
    },

    optionWrong: {
      backgroundColor: "rgba(244, 67, 54, 0.25)",
      borderColor: "#F44336",
      borderWidth: 3,
    },

    optionNumber: {
      width: wp(7),
      height: wp(7),
      borderRadius: wp(3.5),
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: wp(3),
    },

    optionNumberText: {
      color: theme.cardText,
      fontSize: normalize(12),
      fontWeight: "bold",
    },

    optionText: {
      flex: 1,
      color: theme.cardText,
      fontSize: Math.min(normalize(15) * fontMultiplier, wp(4.2)),
      lineHeight: Math.min(normalize(20), wp(5.5)),
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },

    explanationBox: {
      marginTop: hp(2.5),
      padding: wp(4),
      backgroundColor: "rgba(33, 150, 243, 0.1)",
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: "#2196F3",
    },

    explanationTitle: {
      color: theme.cardText,
      fontSize: Math.min(normalize(15), wp(4.2)),
      fontWeight: "bold",
      marginBottom: hp(1),
    },

    explanationText: {
      color: theme.cardText,
      fontSize: Math.min(normalize(14) * fontMultiplier, wp(4)),
      lineHeight: Math.min(normalize(20) * lineHeightMultiplier, wp(5.5)),
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },

    footer: {
      padding: wp(4),
      paddingBottom: Platform.OS === "ios" ? hp(1) : hp(2),
      backgroundColor: theme.background,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.1)",
    },

    button: {
      backgroundColor: theme.button,
      paddingVertical: hp(2),
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      minHeight: hp(7),
      ...Platform.select({
        ios: {
          shadowColor: theme.button,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
        android: { elevation: 4 },
      }),
    },

    buttonDisabled: {
      opacity: 0.4,
    },

    buttonText: {
      color: theme.buttonText,
      fontSize: Math.min(normalize(15), wp(4.5)),
      fontWeight: "bold",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },

    confettiContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    },
  });
