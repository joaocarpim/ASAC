import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import {
  ensureModuleProgress,
  registerCorrect,
  registerWrong,
  finishModule,
  ensureUserExistsInDB,
} from "../../services/progressService";

type Question = {
  id: string;
  order: number;
  question: string;
  options: string[];
  correctAnswer: number | string;
};

type Quiz = {
  moduleId: string;
  questions: Question[];
  coinsPerCorrect?: number;
  passingScore?: number;
};

// MOCK: DEFAULT_QUIZZES substituindo import inexistente
const DEFAULT_QUIZZES: Quiz[] = [];

type OptionButtonProps = {
  text: string;
  isSelected: boolean;
  onPress: () => void;
  isCorrect: boolean;
  isWrong: boolean;
};

const OptionButton = ({ text, isSelected, onPress, isCorrect, isWrong }: OptionButtonProps) => (
  <TouchableOpacity
    style={[
      styles.optionContainer,
      isSelected && styles.optionSelected,
      isCorrect && styles.optionCorrect,
      isWrong && styles.optionWrong,
    ]}
    onPress={onPress}
    disabled={isCorrect || isWrong}
  >
    <View style={styles.radioOuter}>{isSelected && <View style={styles.radioInner} />}</View>
    <Text style={styles.optionText}>{text}</Text>
  </TouchableOpacity>
);

export default function ModuleQuizScreen({ route, navigation }: RootStackScreenProps<"ModuleQuiz">) {
  const { moduleId } = route.params;
  const [quizData, setQuizData] = useState<Quiz | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [progressObj, setProgressObj] = useState<any>(null);
  const startTs = useRef<number | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
const currentQuiz = DEFAULT_QUIZZES.find((q) => String(q.moduleId) === String(moduleId));
    if (currentQuiz) {
      setQuizData(currentQuiz);
      setQuestions(currentQuiz.questions.sort((a, b) => Number(a.order) - Number(b.order)));
    }
  }, [moduleId]);

  useEffect(() => {
    (async () => {
      if (!user || !quizData) return;
      await ensureUserExistsInDB(user.userId, user.name || user.username, user.email);
      const prog = await ensureModuleProgress(user.userId, `module-${moduleId}`, moduleId);
      setProgressObj(prog);
      startTs.current = Date.now();
    })();
  }, [user, quizData, moduleId]);

  const handleSelectAnswer = (index: number) => {
    if (!isAnswerChecked) setSelectedAnswer(index);
  };

  const handleConfirmAnswer = async () => {
    if (selectedAnswer === null || !questions[currentQuestionIndex] || !progressObj || !user) return;
    const currentQuestion = questions[currentQuestionIndex];
    if (selectedAnswer === Number(currentQuestion.correctAnswer)) {
      setScore((s) => s + 1);
      await registerCorrect(user.userId, progressObj.id);
    } else {
      await registerWrong(user.userId, progressObj.id, {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        userAnswer: String(selectedAnswer),
        expectedAnswer: String(currentQuestion.correctAnswer),
      });
    }
    setIsAnswerChecked(true);
  };

  const handleNextQuestion = async () => {
    setIsAnswerChecked(false);
    setSelectedAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      return;
    }
    setQuizFinished(true);
    const durationSec = startTs.current ? Math.round((Date.now() - startTs.current) / 1000) : 0;
    try {
      if (!user || !progressObj) throw new Error("User/progress missing");
      const achievementTitle = `Conquista do Módulo ${moduleId}`;
      await finishModule(user.userId, progressObj.id, moduleId, durationSec, `module-${moduleId}`, achievementTitle);

      const coinsEarned = (quizData?.coinsPerCorrect || 15) * score;
      const passed = score >= (quizData?.passingScore || 7);
      const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

      navigation.replace("ModuleResults", {
        moduleId,
        correctAnswers: score,
        totalQuestions: questions.length,
        accuracy,
        timeSpent: durationSec,
        coinsEarned,
        passed,
        errors: questions.length - score,
        score,
        pointsEarned: 12250,
      });
    } catch (e) {
      console.error("Erro ao finalizar quiz:", e);
      Alert.alert("Erro", "Não foi possível salvar o progresso. Conecte-se e tente novamente.");
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#191970" />
      </View>
    );
  }

  if (quizFinished) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Finalizando...</Text>
        <ActivityIndicator size="large" color="#191970" />
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Módulo {moduleId}</Text>
        <Text style={styles.questionCounter}>
          {currentQuestionIndex + 1} / {questions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
          {currentQuestion.options.map((option: string, index: number) => {
            const isCorrect = isAnswerChecked && index === Number(currentQuestion.correctAnswer);
            const isWrong = isAnswerChecked && selectedAnswer === index && index !== Number(currentQuestion.correctAnswer);
            return (
              <OptionButton
                key={index}
                text={option}
                isSelected={selectedAnswer === index}
                onPress={() => handleSelectAnswer(index)}
                isCorrect={isCorrect}
                isWrong={isWrong}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, selectedAnswer === null && { backgroundColor: "#BDBDBD" }]}
          onPress={isAnswerChecked ? handleNextQuestion : handleConfirmAnswer}
          disabled={selectedAnswer === null}
        >
          <Text style={styles.buttonText}>
            {isAnswerChecked
              ? currentQuestionIndex === questions.length - 1
                ? "Ver Resultado"
                : "Próxima Pergunta"
              : "Confirmar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFC700" },
  header: { paddingTop: 40, paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: "#191970" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#191970", textAlign: "center" },
  questionCounter: { fontSize: 16, fontWeight: "600", color: "#191970", textAlign: "center", marginTop: 5 },
  scrollContentContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
  questionCard: { backgroundColor: "#191970", borderRadius: 15, padding: 20, width: "100%" },
  questionText: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold", marginBottom: 25, lineHeight: 28, textAlign: "center" },
  optionContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15, paddingVertical: 10, paddingHorizontal: 15, borderWidth: 2, borderColor: "#FFC700", borderRadius: 10 },
  optionSelected: { backgroundColor: "#3D3D8D" },
  optionCorrect: { backgroundColor: "#2E7D32", borderColor: "#66BB6A" },
  optionWrong: { backgroundColor: "#D32F2F", borderColor: "#EF5350" },
  radioOuter: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#FFC700", justifyContent: "center", alignItems: "center", marginRight: 15 },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#FFC700" },
  optionText: { color: "#FFFFFF", fontSize: 16, flex: 1, lineHeight: 22 },
  footer: { padding: 20, borderTopWidth: 2, borderTopColor: "#191970" },
  button: { backgroundColor: "#191970", borderRadius: 12, paddingVertical: 15, alignItems: "center" },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
