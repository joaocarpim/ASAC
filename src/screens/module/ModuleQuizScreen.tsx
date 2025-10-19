// src/screens/quiz/ModuleQuizScreen.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Vibration,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import ConfettiCannon from "react-native-confetti-cannon";
import { RootStackScreenProps } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import {
  ensureModuleProgress,
  ensureUserExistsInDB,
} from "../../services/progressService";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
import { useAccessibility } from "../../context/AccessibilityProvider";
import {
  ModuleQuiz,
  QuizQuestion,
  DEFAULT_MODULE_QUIZZES,
} from "../../navigation/moduleQuestionTypes";
// 🔹 1. Importar o hook de configurações
import { useSettings } from "../../hooks/useSettings";

// ---------- COMPONENTE DE OPÇÃO (sem alterações) ----------
type OptionButtonProps = {
  text: string;
  isSelected: boolean;
  onPress: () => void;
  isCorrect: boolean;
  isWrong: boolean;
  styles: any;
  isAnswerChecked: boolean;
};

const OptionButton = ({
  text,
  isSelected,
  onPress,
  isCorrect,
  isWrong,
  styles,
  isAnswerChecked,
}: OptionButtonProps) => {
  let accessibilityText = `Opção: ${text}.`;
  if (isCorrect) accessibilityText += " Resposta correta.";
  else if (isWrong) accessibilityText += " Resposta incorreta.";
  else if (isSelected && !isAnswerChecked) accessibilityText += " Selecionado.";

  return (
    <AccessibleButton
      style={[
        styles.optionContainer,
        isSelected && styles.optionSelected,
        isCorrect && styles.optionCorrect,
        isWrong && styles.optionWrong,
      ]}
      onPress={onPress}
      disabled={isCorrect || isWrong}
      accessibilityText={accessibilityText}
    >
      <View style={styles.radioOuter}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.optionText}>{text}</Text>
    </AccessibleButton>
  );
};

const { width } = Dimensions.get("window");

// ---------- ESTILOS (ATUALIZADOS) ----------
// 🔹 3. Atualizar a função de estilos para receber as configurações
const getStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
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
      pointerEvents: "none",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: 20,
      paddingHorizontal: 10,
      paddingBottom: 5,
      borderBottomWidth: 1,
      borderBottomColor: theme.card,
    },
    // Aplicando estilos de acessibilidade
    headerTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      textAlign: "center",
      lineHeight: 18 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    // Aplicando estilos de acessibilidade
    questionCounter: {
      fontSize: 14 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      textAlign: "center",
      marginTop: 2,
      lineHeight: 14 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    scrollContentContainer: {
      flexGrow: 1,
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    questionCard: {
      backgroundColor: theme.card,
      borderRadius: 10,
      padding: 10,
      width: "100%",
      marginBottom: 10,
    },
    // Aplicando estilos de acessibilidade
    questionText: {
      color: theme.cardText,
      fontSize: 16 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      marginBottom: 10,
      textAlign: "center",
      lineHeight: 16 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    optionContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderWidth: 1.5,
      borderColor: "rgba(255,255,255,0.1)",
      borderRadius: 8,
    },
    optionSelected: {
      backgroundColor: theme.button,
      borderColor: theme.buttonText,
    },
    optionCorrect: { backgroundColor: "#2E7D32", borderColor: "#66BB6A" },
    optionWrong: { backgroundColor: "#D32F2F", borderColor: "#EF5350" },
    radioOuter: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      borderColor: theme.cardText,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
    },
    radioInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.cardText,
    },
    // Aplicando estilos de acessibilidade
    optionText: {
      color: theme.cardText,
      fontSize: 14 * fontMultiplier,
      fontWeight: isBold ? "bold" : "normal",
      flex: 1,
      lineHeight: 14 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    footer: { paddingHorizontal: 10, paddingVertical: 90 },
    button: {
      backgroundColor: theme.button,
      borderRadius: 10,
      paddingVertical: 15,
      marginTop: -100,
      alignItems: "center",
    },
    // Aplicando estilos de acessibilidade
    buttonText: {
      color: theme.buttonText,
      fontSize: 14 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      lineHeight: 14 * fontMultiplier * lineHeightMultiplier,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    disabledButton: { backgroundColor: "#BDBDBD" },
  });

// ---------- COMPONENTE PRINCIPAL ----------
export default function ModuleQuizScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModuleQuiz">) {
  const { moduleId } = route.params;
  const [quizData, setQuizData] = useState<ModuleQuiz | undefined>(undefined);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { user } = useAuthStore();
  const { theme } = useContrast();
  const { speakText } = useAccessibility();

  // 🔹 2. Obter as configurações de acessibilidade
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  // Passar as configurações para a função de estilos
  const styles = getStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const startTs = useRef<number | null>(null);
  const correctSound = useRef<Audio.Sound | null>(null);
  const wrongSound = useRef<Audio.Sound | null>(null);

  // ... (O restante do código do componente permanece o mesmo)
  useEffect(() => {
    const loadSounds = async () => {
      try {
        correctSound.current = new Audio.Sound();
        wrongSound.current = new Audio.Sound();
        await correctSound.current.loadAsync({
          uri: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg",
        });
        await wrongSound.current.loadAsync({
          uri: "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
        });
      } catch (e) {
        console.warn("Erro ao carregar sons:", e);
      }
    };
    loadSounds();
    return () => {
      correctSound.current?.unloadAsync();
      wrongSound.current?.unloadAsync();
    };
  }, []);

  const handleSelectAnswer = (index: number) => {
    if (!isAnswerChecked) setSelectedAnswer(index);
  };

  const handleConfirmAnswer = async () => {
    if (selectedAnswer === null) return;
    const current = questions[currentQuestionIndex];
    setIsAnswerChecked(true);

    if (selectedAnswer === current.correctAnswer) {
      try {
        await correctSound.current?.replayAsync();
      } catch {
        correctSound.current = new Audio.Sound();
        await correctSound.current.loadAsync({
          uri: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg",
        });
        await correctSound.current.playAsync();
      }
      Vibration.vibrate(80);
      setShowConfetti(true);
      speakText("Resposta correta! Parabéns!");
      setTimeout(() => setShowConfetti(false), 3000); // Aumentei o tempo para os confetes cairem
    } else {
      await wrongSound.current?.replayAsync();
      Vibration.vibrate([0, 100, 50, 100]);
      speakText("Resposta incorreta. Tente novamente.");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setQuizFinished(true);
      speakText("Quiz finalizado. Parabéns!");
    }
  };

  useEffect(() => {
    const currentQuiz = DEFAULT_MODULE_QUIZZES.find(
      (q) => q.moduleId === moduleId
    );
    if (currentQuiz) {
      setQuizData(currentQuiz);
      setQuestions(currentQuiz.questions.sort((a, b) => a.order - b.order));
    } else {
      Alert.alert("Erro", `Quiz para o módulo ${moduleId} não encontrado.`);
      navigation.goBack();
    }
  }, [moduleId, navigation]);

  useEffect(() => {
    if (questions.length > 0) {
      const q = questions[currentQuestionIndex];
      const textToSpeak = `Pergunta ${currentQuestionIndex + 1}: ${
        q.question
      }. Alternativas: ${q.options.join(", ")}.`;
      speakText(textToSpeak);
    }
  }, [currentQuestionIndex, questions]);

  useEffect(() => {
    (async () => {
      if (!user || !quizData) return;
      await ensureUserExistsInDB(user.userId);
      await ensureModuleProgress(user.userId, String(moduleId), moduleId);
      startTs.current = Date.now();
    })();
  }, [user, quizData, moduleId]);

  if (!quizData || questions.length === 0)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );

  const currentQuestion = questions[currentQuestionIndex];
  const mainButtonText = isAnswerChecked
    ? currentQuestionIndex === questions.length - 1
      ? "Ver Resultado"
      : "Próxima"
    : "Confirmar";

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <AccessibleView
          style={styles.header}
          accessibilityText={`${quizData.title}. Pergunta ${
            currentQuestionIndex + 1
          } de ${questions.length}.`}
        >
          <Text style={styles.headerTitle}>{quizData.title}</Text>
          <Text style={styles.questionCounter}>
            {currentQuestionIndex + 1} / {questions.length}
          </Text>
        </AccessibleView>

        <AccessibleView
          style={styles.questionCard}
          accessibilityText={`Pergunta ${
            currentQuestionIndex + 1
          }: ${currentQuestion.question}. Alternativas: ${currentQuestion.options
            .map((opt, i) => `Opção ${i + 1}: ${opt}`)
            .join(". ")}.`}
        >
          <AccessibleHeader level={2} style={styles.questionText}>
            {currentQuestion.question}
          </AccessibleHeader>

          {currentQuestion.options.map((option, index) => {
            const isCorrect =
              isAnswerChecked && index === currentQuestion.correctAnswer;
            const isWrong =
              isAnswerChecked &&
              selectedAnswer === index &&
              index !== currentQuestion.correctAnswer;

            return (
              <OptionButton
                key={index}
                text={option}
                isSelected={selectedAnswer === index}
                onPress={() => handleSelectAnswer(index)}
                isCorrect={isCorrect}
                isWrong={isWrong}
                styles={styles}
                isAnswerChecked={isAnswerChecked}
              />
            );
          })}
        </AccessibleView>

        <View style={styles.footer}>
          <AccessibleButton
            style={[
              styles.button,
              selectedAnswer === null && styles.disabledButton,
            ]}
            onPress={isAnswerChecked ? handleNextQuestion : handleConfirmAnswer}
            disabled={selectedAnswer === null}
            accessibilityText={`Botão ${mainButtonText}. ${
              selectedAnswer === null
                ? "Desabilitado, selecione uma opção para continuar."
                : ""
            }`}
          >
            <Text style={styles.buttonText}>{mainButtonText}</Text>
          </AccessibleButton>
        </View>
      </ScrollView>

      {showConfetti && (
        <View style={styles.confettiContainer}>
          <ConfettiCannon
            count={300}
            origin={{ x: width / 2, y: -20 }}
            explosionSpeed={450}
            fallSpeed={3500}
            fadeOut
          />
        </View>
      )}
    </View>
  );
}
