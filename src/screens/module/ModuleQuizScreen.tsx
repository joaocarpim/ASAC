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

const { width } = Dimensions.get("window");

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

  /** 🔊 Carregar sons */
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
  }, []);

  /** 🔄 Carregar perguntas do módulo */
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

  /** 🔊 Ler a pergunta atual */
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

  /** ✔ Confirmar Resposta */
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

  /** 👉 Próxima Pergunta ou Resultado */
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );

  if (!current)
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Nenhuma pergunta encontrada.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <AccessibleView
        style={styles.header}
        accessibilityText={`Quiz do módulo ${moduleId}. Pergunta ${
          currentQuestionIndex + 1
        } de ${questions.length}.`}
      ></AccessibleView>

      <ScrollView style={styles.scrollArea}>
        <AccessibleHeader style={styles.questionText}>
          {current.question}
        </AccessibleHeader>

        {current.options.map((opt, idx) => (
          <AccessibleButton
            key={idx}
            onPress={() => handleSelect(idx)}
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
            <Text style={styles.optionText}>{opt}</Text>
          </AccessibleButton>
        ))}

        {isAnswerChecked && current.explanation && (
          <AccessibleView
            style={styles.explanationBox}
            accessibilityText={`Explicação: ${current.explanation}`}
          >
            <Text style={styles.explanationText}>💡 {current.explanation}</Text>
          </AccessibleView>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <AccessibleButton
          style={styles.button}
          onPress={isAnswerChecked ? handleNext : handleConfirm}
        >
          <Text style={styles.buttonText}>
            {isAnswerChecked
              ? currentQuestionIndex === questions.length - 1
                ? "Finalizar"
                : "Próxima"
              : "Confirmar"}
          </Text>
        </AccessibleButton>
      </View>

      {showConfetti && (
        <View style={styles.confettiContainer}>
          <ConfettiCannon
            count={120}
            origin={{ x: width / 2, y: -20 }}
            fadeOut
          />
        </View>
      )}
    </View>
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
    container: { flex: 1, backgroundColor: theme.background },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: { color: theme.text },
    header: { alignItems: "center", padding: 15 },
    headerTitle: {
      color: theme.text,
      fontSize: 20 * fontMultiplier,
      fontWeight: "bold",
    },
    questionCounter: { color: theme.text, marginTop: 5 },
    scrollArea: { padding: 15 },
    questionText: {
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      marginBottom: 20,
      lineHeight: 22 * lineHeightMultiplier,
    },
    option: {
      padding: 15,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.text,
      marginBottom: 10,
    },
    optionSelected: { backgroundColor: "#d0e0ff", borderColor: "#007AFF" },
    optionCorrect: { backgroundColor: "#d4edda", borderColor: "green" },
    optionWrong: { backgroundColor: "#f8d7da", borderColor: "red" },
    optionText: { color: theme.text, fontSize: 16 },
    explanationBox: {
      marginTop: 12,
      padding: 12,
      backgroundColor: theme.card,
      borderRadius: 8,
    },
    explanationText: { color: theme.cardText },
    footer: {
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: theme.card,
    },
    button: {
      backgroundColor: theme.button,
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
    },
    buttonText: { color: theme.buttonText, fontSize: 16, fontWeight: "bold" },
    confettiContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    },
  });
