// src/screens/module/ModuleQuizScreen.tsx
// ✅ VERSÃO COM TALKBACK/TAB NAVIGATION OTIMIZADO

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  AccessibilityInfo,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { Audio } from "expo-av";

import { RootStackScreenProps } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { useProgressStore } from "../../store/progressStore";
import progressService, { ErrorDetail } from "../../services/progressService";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import { useAccessibility } from "../../context/AccessibilityProvider";
import {
  getQuizByModuleId,
  QuizQuestion,
} from "../../navigation/moduleQuestionTypes";
import { useSettings } from "../../hooks/useSettings";
import { ExplanationSubject } from "../../services/ExplanationSubject";
import { ExplanationObserver } from "../../observers/ExplanationObserver";

const { width, height } = Dimensions.get("window");

const wp = (p: number) => (width * p) / 100;
const hp = (p: number) => (height * p) / 100;
const normalize = (s: number) => Math.round(s * (width / 375));

const playSound = async (sound: Audio.Sound | null) => {
  if (!sound) return;
  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {}
};

const focusForAccessibility = (ref: React.RefObject<any>) => {
  if (Platform.OS === "web") return;
  if (!ref.current) return;
  AccessibilityInfo.setAccessibilityFocus(ref.current);
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
  const [isNextButtonLocked, setIsNextButtonLocked] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<ErrorDetail[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const correctCountRef = useRef(0);
  const wrongCountRef = useRef(0);
  const errorDetailsRef = useRef<ErrorDetail[]>([]);

  const [correctSound, setCorrectSound] = useState<Audio.Sound | null>(null);
  const [wrongSound, setWrongSound] = useState<Audio.Sound | null>(null);
  const [notificationSound, setNotificationSound] =
    useState<Audio.Sound | null>(null);

  const questionRef = useRef<View>(null);
  const buttonRef = useRef<View>(null);

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

  const styles = useMemo(
    () =>
      getStyles(
        theme,
        fontSizeMultiplier,
        isBoldTextEnabled,
        lineHeightMultiplier,
        letterSpacing,
        isDyslexiaFontEnabled
      ),
    [
      theme,
      fontSizeMultiplier,
      isBoldTextEnabled,
      lineHeightMultiplier,
      letterSpacing,
      isDyslexiaFontEnabled,
    ]
  );

  useEffect(() => {
    const load = async () => {
      const [c, w, n] = await Promise.all([
        Audio.Sound.createAsync(require("../../../assets/som/correct.mp3")),
        Audio.Sound.createAsync(require("../../../assets/som/incorrect.mp3")),
        Audio.Sound.createAsync(
          require("../../../assets/som/notification.mp3")
        ),
      ]);
      setCorrectSound(c.sound);
      setWrongSound(w.sound);
      setNotificationSound(n.sound);
    };
    load();
    return () => {
      correctSound?.unloadAsync();
      wrongSound?.unloadAsync();
      notificationSound?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);

      const moduleObj = getQuizByModuleId(Number(moduleId));
      if (!moduleObj) {
        Alert.alert("Erro", "Quiz não encontrado.");
        return navigation.goBack();
      }

      correctCountRef.current = 0;
      wrongCountRef.current = 0;
      errorDetailsRef.current = [];
      setCorrectCount(0);
      setWrongCount(0);
      setErrorDetails([]);

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
  }, [moduleId, user?.userId]);

  // ✅ MELHORADO: Foco e anúncio para TalkBack
  useEffect(() => {
    if (!isLoading && questions[currentQuestionIndex]) {
      // Aguarda um pouco mais para garantir renderização
      setTimeout(() => {
        focusForAccessibility(questionRef);

        // Anúncio explícito para TalkBack
        const announcement = `Pergunta ${currentQuestionIndex + 1} de ${
          questions.length
        }. ${questions[currentQuestionIndex].question}`;

        if (Platform.OS === "android") {
          AccessibilityInfo.announceForAccessibility(announcement);
        }

        speakText?.(announcement);
      }, 500);
    }
  }, [currentQuestionIndex, questions, isLoading]);

  const handleSelect = (idx: number) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(idx);

    // ✅ Anúncio para TalkBack ao selecionar
    if (Platform.OS === "android") {
      AccessibilityInfo.announceForAccessibility(
        `Alternativa ${idx + 1} selecionada: ${
          questions[currentQuestionIndex].options[idx]
        }`
      );
    }

    setTimeout(() => focusForAccessibility(buttonRef), 200);
  };

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((p) => p + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
      setIsNextButtonLocked(true);
      return;
    }

    const timeSpent = stopTimer ? stopTimer() : 0;
    const totalCorrect = correctCountRef.current;
    const totalWrong = wrongCountRef.current;

    const accuracy = Math.round((totalCorrect / questions.length) * 100);

    const moduleObj = getQuizByModuleId(Number(moduleId));
    const coinsEarned = totalCorrect * (moduleObj?.coinsPerCorrect ?? 0);

    navigation.replace("ModuleResult", {
      moduleId,
      correctAnswers: totalCorrect,
      wrongAnswers: totalWrong,
      totalQuestions: questions.length,
      accuracy,
      timeSpent,
      coinsEarned,
      pointsEarned: 12250,
      passed: totalCorrect >= (moduleObj?.passingScore ?? 0),
      progressId: activeProgressId ?? undefined,
      errorDetails: JSON.stringify(errorDetailsRef.current),
    });
  }, [currentQuestionIndex, questions.length]);

  const handleConfirm = useCallback(() => {
    if (selectedAnswer === null) return;

    const q = questions[currentQuestionIndex];
    setIsAnswerChecked(true);
    setIsNextButtonLocked(true);

    const isCorrect = selectedAnswer === q.correctAnswer;

    if (isCorrect) {
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
      playSound(correctSound);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1200);
    } else {
      wrongCountRef.current += 1;
      setWrongCount(wrongCountRef.current);

      const error: ErrorDetail = {
        questionId: q.id,
        questionText: q.question,
        userAnswer: q.options[selectedAnswer],
        expectedAnswer: q.options[q.correctAnswer],
      };

      errorDetailsRef.current.push(error);
      setErrorDetails([...errorDetailsRef.current]);
      playSound(wrongSound);
    }

    setTimeout(() => {
      playSound(notificationSound);
      ExplanationSubject.notify({
        title: isCorrect ? "Correto!" : "Atenção!",
        message:
          q.explanation ||
          (isCorrect ? "Você acertou!" : "Resposta incorreta."),
        type: isCorrect ? "success" : "info",
        onDismiss: () => {
          setIsNextButtonLocked(false);
          setTimeout(handleNext, 200);
        },
      });
    }, 400);
  }, [selectedAnswer, currentQuestionIndex, questions, handleNext]);

  const getOptionStyle = (idx: number): any[] => {
    const baseStyle: any[] = [styles.option];

    if (!isAnswerChecked) {
      if (selectedAnswer === idx) {
        baseStyle.push(styles.optionSelected);
      }
      return baseStyle;
    }

    const correctIdx = current.correctAnswer;

    if (idx === correctIdx) {
      baseStyle.push(styles.optionCorrect);
    } else if (idx === selectedAnswer && selectedAnswer !== correctIdx) {
      baseStyle.push(styles.optionWrong);
    }

    return baseStyle;
  };

  const current = questions[currentQuestionIndex];
  if (isLoading || !current)
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ExplanationObserver />

      <ScrollView
        contentContainerStyle={styles.scroll}
        accessibilityRole="none"
      >
        {/* ✅ CARD DA PERGUNTA COM ACESSIBILIDADE OTIMIZADA */}
        <TouchableOpacity
          ref={questionRef}
          style={styles.card}
          accessible={true}
          accessibilityRole="header"
          accessibilityLabel={`Pergunta ${currentQuestionIndex + 1} de ${
            questions.length
          }: ${current.question}`}
          accessibilityHint="Enunciado da questão"
          importantForAccessibility="yes"
          activeOpacity={1}
          onPress={() => {}}
        >
          {/* ✅ TEXTO COM MELHOR DETECÇÃO PELO TALKBACK */}
          <Text style={styles.questionNumber} accessible={false}>
            Pergunta {currentQuestionIndex + 1} de {questions.length}
          </Text>

          <Text style={styles.question} accessible={false}>
            {current.question}
          </Text>
        </TouchableOpacity>

        {/* ✅ LISTA DE ALTERNATIVAS */}
        <View
          accessible={false}
          accessibilityRole="radiogroup"
          accessibilityLabel="Alternativas de resposta"
        >
          {current.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = isAnswerChecked && idx === current.correctAnswer;
            const isWrong =
              isAnswerChecked && isSelected && idx !== current.correctAnswer;

            let accessibilityLabel = `Alternativa ${idx + 1}: ${opt}`;
            if (isAnswerChecked) {
              if (isCorrect) {
                accessibilityLabel += ". Esta é a resposta correta";
              } else if (isWrong) {
                accessibilityLabel += ". Resposta incorreta selecionada";
              }
            } else if (isSelected) {
              accessibilityLabel += ". Atualmente selecionada";
            }

            return (
              <TouchableOpacity
                key={idx}
                style={getOptionStyle(idx)}
                onPress={() => handleSelect(idx)}
                disabled={isAnswerChecked}
                accessible={true}
                accessibilityRole="radio"
                accessibilityLabel={accessibilityLabel}
                accessibilityState={{
                  selected: isSelected,
                  disabled: isAnswerChecked,
                  checked: isSelected,
                }}
                accessibilityHint={
                  isAnswerChecked
                    ? undefined
                    : "Toque duas vezes para selecionar esta alternativa"
                }
                importantForAccessibility="yes"
              >
                <Text style={styles.optionText} accessible={false}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ✅ RODAPÉ COM BOTÃO */}
      <View style={styles.footer}>
        <TouchableOpacity
          ref={buttonRef}
          style={[
            styles.button,
            ((selectedAnswer === null && !isAnswerChecked) ||
              (isAnswerChecked && isNextButtonLocked)) &&
              styles.buttonDisabled,
          ]}
          disabled={
            (selectedAnswer === null && !isAnswerChecked) ||
            (isAnswerChecked && isNextButtonLocked)
          }
          onPress={isAnswerChecked ? handleNext : handleConfirm}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={
            isAnswerChecked
              ? currentQuestionIndex === questions.length - 1
                ? "Finalizar Quiz"
                : "Próxima Pergunta"
              : "Confirmar Resposta"
          }
          accessibilityHint={
            selectedAnswer === null && !isAnswerChecked
              ? "Selecione uma alternativa primeiro"
              : "Toque duas vezes para continuar"
          }
          accessibilityState={{
            disabled:
              (selectedAnswer === null && !isAnswerChecked) ||
              (isAnswerChecked && isNextButtonLocked),
          }}
          importantForAccessibility="yes"
        >
          <Text style={styles.buttonText} accessible={false}>
            {isAnswerChecked
              ? currentQuestionIndex === questions.length - 1
                ? "Finalizar Quiz"
                : "Próxima Pergunta"
              : "Confirmar Resposta"}
          </Text>
        </TouchableOpacity>
      </View>

      {showConfetti && (
        <ConfettiCannon count={50} origin={{ x: width / 2, y: -20 }} fadeOut />
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
    container: { flex: 1, backgroundColor: theme.background },
    loading: { flex: 1, alignItems: "center", justifyContent: "center" },
    scroll: { padding: wp(4), paddingTop: hp(12) },
    card: {
      backgroundColor: theme.card,
      padding: wp(5),
      borderRadius: 16,
      marginBottom: hp(3),
    },
    questionNumber: {
      color: theme.cardText,
      fontSize: normalize(13) * fontMultiplier,
      fontWeight: isBold ? "bold" : "500",
      marginBottom: hp(1),
      opacity: 0.7,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    question: {
      color: theme.cardText,
      fontSize: normalize(17) * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      lineHeight: normalize(24) * lineHeightMultiplier,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    option: {
      padding: wp(4),
      borderRadius: 12,
      borderWidth: 2,
      borderColor: "#555",
      marginBottom: hp(1.5),
    },
    optionSelected: {
      borderColor: "#2196F3",
      backgroundColor: "rgba(33,150,243,0.2)",
    },
    optionCorrect: {
      borderColor: "#4CAF50",
      backgroundColor: "rgba(76,175,80,0.25)",
    },
    optionWrong: {
      borderColor: "#F44336",
      backgroundColor: "rgba(244,67,54,0.25)",
    },
    optionText: {
      color: theme.cardText,
      fontSize: normalize(15) * fontMultiplier,
      lineHeight: normalize(22) * lineHeightMultiplier,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    footer: { padding: wp(4), borderTopWidth: 1, borderTopColor: "#333" },
    button: {
      backgroundColor: theme.button,
      paddingVertical: hp(2),
      borderRadius: 12,
      alignItems: "center",
    },
    buttonDisabled: { opacity: 0.5 },
    buttonText: {
      color: theme.buttonText,
      fontWeight: "bold",
      fontSize: normalize(16) * fontMultiplier,
      fontFamily: isDyslexia ? "OpenDyslexic-Bold" : undefined,
    },
  });
