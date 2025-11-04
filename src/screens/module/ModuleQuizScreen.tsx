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
  ColorValue,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { RootStackScreenProps } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { useProgressStore } from "../../store/progressStore";
import {
  ensureModuleProgress,
  registerCorrect,
  registerWrong,
  finishModule,
  ErrorDetail,
} from "../../services/progressService";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
import { useAccessibility } from "../../context/AccessibilityProvider";
import { getQuizByModuleId } from "../../navigation/moduleQuestionTypes";
import { useSettings } from "../../hooks/useSettings";
import { Audio } from "expo-av";

const { width } = Dimensions.get("window");

function isColorDark(color: ColorValue | undefined): boolean {
  if (typeof color === "string" && color.startsWith("#")) {
    const hex = color.replace("#", "");
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return r * 0.299 + g * 0.587 + b * 0.114 < 149;
    }
  }
  return false;
}

export default function ModuleQuizScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModuleQuiz">) {
  const { moduleId } = route.params;
  const [questions, setQuestions] = useState<any[]>([]);
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
  const { activeProgressId, setActive, startTimer, stopTimer } = useProgressStore();
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
        setCorrectSound(correct);

        const { sound: wrong } = await Audio.Sound.createAsync(
          require("../../../assets/som/incorrect.mp3")
        );
        setWrongSound(wrong);
      } catch (error) {
        console.error("Erro ao carregar os sons", error);
      }
    }

    loadSounds();

    return () => {
      correctSound?.unloadAsync();
      wrongSound?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      setIsLoading(true);
      const moduleObj = getQuizByModuleId(parseInt(String(moduleId), 10));
      if (!moduleObj) {
        Alert.alert("Erro", "Quiz do módulo não encontrado.");
        if (mounted) navigation.goBack();
        return;
      }

      const qList = moduleObj.questions ?? [];
      if (!qList || qList.length === 0) {
        Alert.alert("Erro", "Nenhuma pergunta encontrada para este módulo.");
        if (mounted) navigation.goBack();
        return;
      }

      if (mounted) setQuestions(qList);

      if (user?.userId) {
        try {
          const progress = await ensureModuleProgress(
            user.userId,
            String(moduleId),
            moduleObj.moduleId
          );
          if (progress?.id) {
            setActive(progress.id);
            startTimer && startTimer();
          }
        } catch (e) {
          console.warn("Erro ao garantir progresso:", e);
        }
      }
      if (mounted) setIsLoading(false);
    };
    initialize();
    return () => {
      mounted = false;
    };
  }, [moduleId, navigation, user, setActive, startTimer]);

  useEffect(() => {
    if (!isLoading && questions.length > 0 && speakText) {
      const q = questions[currentQuestionIndex];
      speakText && speakText(`Pergunta ${currentQuestionIndex + 1}: ${q.question}`);
    }
  }, [currentQuestionIndex, questions, isLoading, speakText]);

  const handleSelect = (index: number) => {
    if (!isAnswerChecked) setSelectedAnswer(index);
  };

  const handleConfirm = useCallback(async () => {
    if (selectedAnswer === null || !user?.userId || !activeProgressId) return;
    setIsAnswerChecked(true);
    const q = questions[currentQuestionIndex];

    if (selectedAnswer === q.correctAnswer) {
      correctSound?.replayAsync();
      setCorrectCount((prev) => prev + 1);
      Vibration.vibrate(80);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
      try {
        await registerCorrect(user.userId, activeProgressId);
      } catch (e) {
        console.warn("Erro registerCorrect:", e);
      }
    } else {
      wrongSound?.replayAsync();
      setWrongCount((prev) => prev + 1);
      Vibration.vibrate([0, 100, 50, 100]);
      const err: ErrorDetail = {
        questionNumber: currentQuestionIndex + 1,
        questionId: q.id,
        questionText: q.question,
        userAnswer: q.options?.[selectedAnswer] ?? null,
        expectedAnswer: q.options?.[q.correctAnswer] ?? null,
      };
      setErrorDetails((prev) => [...prev, err]);
      try {
        await registerWrong(activeProgressId, err);
      } catch (e) {
        console.warn("Erro registerWrong:", e);
      }
    }
  }, [selectedAnswer, user, activeProgressId, currentQuestionIndex, questions, correctSound, wrongSound]);

  const handleNext = useCallback(async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((p) => p + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      const duration = stopTimer ? stopTimer() : 0;
      const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

      const moduleData = getQuizByModuleId(parseInt(String(moduleId), 10));
      const passed = moduleData ? correctCount >= moduleData.passingScore : false;
      const coinsEarned = moduleData ? correctCount * moduleData.coinsPerCorrect : 0;
      const pointsEarned = 12250;

      console.log("🎯 Finalizando módulo:");
      console.log("  Acertos:", correctCount);
      console.log("  Erros:", wrongCount);
      console.log("  Total questões:", questions.length);
      console.log("  Tempo:", duration);
      console.log("  Erros detalhados:", errorDetails);

      if (user?.userId && activeProgressId) {
        try {
          await finishModule(
            user.userId,
            activeProgressId,
            parseInt(String(moduleId), 10),
            duration,
            `Concluiu o módulo ${moduleId}`,
            coinsEarned,
            correctCount,
            wrongCount
          );
          console.log("✅ Módulo finalizado com sucesso!");
        } catch (e) {
          console.warn("❌ Erro finishModule:", e);
        }
      }

      navigation.replace("ModuleResult", {
        moduleId,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        accuracy,
        timeSpent: duration,
        coinsEarned,
        pointsEarned,
        passed,
      });
    }
  }, [currentQuestionIndex, correctCount, wrongCount, errorDetails, questions, user, activeProgressId, moduleId, stopTimer, navigation]);

  const current = questions[currentQuestionIndex];
  const statusBarStyle = isColorDark(theme.background) ? "light-content" : "dark-content";

  if (isLoading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );

  if (!current)
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Nenhuma pergunta disponível.</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
      <AccessibleView
        accessibilityText={`Cabeçalho: Módulo ${moduleId} - pergunta ${currentQuestionIndex + 1} de ${questions.length}`}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Módulo {moduleId} - Quiz</Text>
        <Text style={styles.questionCounter}>
          {currentQuestionIndex + 1} / {questions.length}
        </Text>
      </AccessibleView>

      <ScrollView style={styles.scrollArea}>
        <AccessibleHeader level={2} style={styles.questionText}>
          {current.question}
        </AccessibleHeader>
        {Array.isArray(current.options) &&
          current.options.map((opt: string, idx: number) => (
            <AccessibleButton
              key={idx}
              onPress={() => handleSelect(idx)}
              style={[
                styles.option,
                selectedAnswer === idx && styles.optionSelected,
                isAnswerChecked && idx === current.correctAnswer && styles.optionCorrect,
                isAnswerChecked && selectedAnswer === idx && idx !== current.correctAnswer && styles.optionWrong,
              ]}
              accessibilityLabel={`Opção ${idx + 1}: ${opt}`}
            >
              <Text style={styles.optionText}>{opt}</Text>
            </AccessibleButton>
          ))}
        {isAnswerChecked && selectedAnswer !== current.correctAnswer && current.explanation && (
          <AccessibleView accessibilityText={`Explicação: ${current.explanation}`} style={styles.explanationBox}>
            <Text style={styles.explanationText}>💡 {current.explanation}</Text>
          </AccessibleView>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <AccessibleButton style={styles.button} onPress={isAnswerChecked ? handleNext : handleConfirm}>
          <Text style={styles.buttonText}>
            {isAnswerChecked
              ? currentQuestionIndex === questions.length - 1
                ? "Ver Resultado"
                : "Próxima"
              : "Confirmar"}
          </Text>
        </AccessibleButton>
      </View>

      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          <ConfettiCannon count={120} origin={{ x: width / 2, y: -20 }} fadeOut />
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
  isDyslexiaFontEnabled: boolean
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: {
      color: theme.text,
      marginTop: 8,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    scrollArea: { padding: 15 },
    header: { alignItems: "center", paddingVertical: 10 },
    headerTitle: {
      color: theme.text,
      fontSize: 18 * fontMultiplier,
      fontWeight: "700",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    questionCounter: {
      color: theme.text,
      marginTop: 5,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    questionText: {
      fontSize: 17 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      textAlign: "center",
      marginHorizontal: 10,
      marginBottom: 20,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    option: {
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.text,
      marginVertical: 6,
      backgroundColor: theme.background,
    },
    optionSelected: { borderColor: "#0af" },
    optionCorrect: { borderColor: "green", backgroundColor: "#D4EDDA" },
    optionWrong: { borderColor: "red", backgroundColor: "#F8D7DA" },
    optionText: {
      color: theme.text,
      fontSize: 15 * fontMultiplier,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    explanationBox: {
      marginTop: 10,
      backgroundColor: theme.card,
      padding: 10,
      borderRadius: 8,
    },
    explanationText: {
      color: theme.cardText,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    footer: { padding: 15, paddingBottom: 90 },
    button: {
      backgroundColor: theme.button,
      padding: 12,
      borderRadius: 10,
      alignItems: "center",
    },
    buttonText: {
      color: theme.buttonText,
      fontWeight: "bold",
      fontSize: 16,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
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