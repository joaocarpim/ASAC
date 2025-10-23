import React, { useState, useEffect, useRef, useCallback } from "react";
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
  TextStyle,
  ViewStyle,
  Platform,
  ColorValue,
  AccessibilityState
} from "react-native";
import { Audio } from "expo-av";
import ConfettiCannon from "react-native-confetti-cannon";
import { RootStackScreenProps } from "../../navigation/types"; // Garanta que moduleId seja string aqui
import { useAuthStore } from "../../store/authStore";
import { useProgressStore } from "../../store/progressStore";
import {
  ensureModuleProgress,
  registerCorrect,
  registerWrong,
  finishModule,
  ErrorDetail, // ✅ Importado (CONFIRME O EXPORT EM progressService.ts)
} from "../../services/progressService";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView, // ✅ Certifique-se que AccessibleViewProps requer accessibilityText
  AccessibleButton,
  AccessibleHeader,
  AccessibleText
} from "../../components/AccessibleComponents";
import { useAccessibility } from "../../context/AccessibilityProvider";
import {
  ModuleQuiz as ModuleQuizType,
  QuizQuestion,
  getQuizByModuleId, // Usaremos a função para buscar os dados estáticos por enquanto
} from "../../navigation/moduleQuestionTypes";
import { useSettings } from "../../hooks/useSettings";
// import ScreenHeader from "../../components/layout/ScreenHeader"; // Header já está no JSX

const { width } = Dimensions.get("window");

// --- Tipos e Interfaces ---
interface OptionButtonProps {
  text: string;
  isSelected: boolean;
  onPress: () => void;
  isCorrect: boolean;
  isWrong: boolean;
  isAnswerChecked: boolean;
  containerStyle: ViewStyle;
  selectedStyle: ViewStyle;
  correctStyle: ViewStyle;
  wrongStyle: ViewStyle;
  radioOuterStyle: ViewStyle;
  radioInnerStyle: ViewStyle;
  textStyle: TextStyle;
};

// --- Subcomponentes ---
const OptionButton: React.FC<OptionButtonProps> = ({
  text, isSelected, onPress, isCorrect, isWrong, isAnswerChecked,
  containerStyle, selectedStyle, correctStyle, wrongStyle,
  radioOuterStyle, radioInnerStyle, textStyle
}) => {
  let accessibilityState: AccessibilityState = {};
  if (isSelected) accessibilityState.selected = true;
  if (isAnswerChecked) accessibilityState.checked = isSelected;

  let accessibilityLabel = `Opção: ${text}.`;
  if (isAnswerChecked) {
      if (isCorrect && isSelected) accessibilityLabel += " Resposta Correta.";
      else if (isWrong && isSelected) accessibilityLabel += " Resposta Incorreta.";
  }
  const accessibilityHint = isAnswerChecked ? "" : "Toque para selecionar esta opção.";

  return (
    <AccessibleButton
      style={[ containerStyle, isSelected && selectedStyle, isCorrect && correctStyle, isWrong && wrongStyle ]}
      onPress={onPress}
      disabled={isAnswerChecked}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="radio"
      accessibilityState={accessibilityState}
    >
      <View style={radioOuterStyle}>{isSelected && <View style={radioInnerStyle} />}</View>
      <Text style={textStyle}>{text}</Text>
    </AccessibleButton>
  );
};

// Função isColorDark (simplificada)
function isColorDark(color: ColorValue | undefined): boolean {
    if (typeof color === 'string' && color.startsWith('#')) {
        const hex = color.replace('#', '');
        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            return (r * 0.299 + g * 0.587 + b * 0.114) < 149;
        }
        if (hex.length === 6) {
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return (r * 0.299 + g * 0.587 + b * 0.114) < 149;
        }
    }
    return false;
}


// ---------- COMPONENTE PRINCIPAL ----------
export default function ModuleQuizScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModuleQuiz">) {
  const { moduleId } = route.params;
  const [quizData, setQuizData] = useState<ModuleQuizType | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState<ErrorDetail[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Cria os estilos APÓS obter theme e settings
  const styles = getStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const correctSound = useRef<Audio.Sound | null>(null);
  const wrongSound = useRef<Audio.Sound | null>(null);

  // Carrega sons
  useEffect(() => {
    let isMounted = true;
    const loadSounds = async () => { /* ... (lógica loadSounds como antes) ... */ };
    loadSounds();
    return () => {
      isMounted = false;
      correctSound.current?.unloadAsync();
      wrongSound.current?.unloadAsync();
    };
  }, []);

  // Busca dados do Quiz e garante progresso no DB
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    const initializeQuiz = async () => {
        const currentQuiz = getQuizByModuleId(parseInt(moduleId, 10)); // Assume moduleId pode ser convertido para number
        if (currentQuiz) {
            if (!isMounted) return;
            setQuizData(currentQuiz);
            setQuestions(currentQuiz.questions.sort((a, b) => a.order - b.order));
            if (user?.userId) {
                try {
                    const progress = await ensureModuleProgress(user.userId, moduleId, currentQuiz.moduleId);
                    if (progress && isMounted) {
                        setActive(progress.id);
                        startTimer();
                        console.log(`[Quiz] Progresso ID ativo: ${progress.id}`);
                    } else if (isMounted) { Alert.alert("Erro", "Não foi possível iniciar."); navigation.goBack(); }
                } catch (error) { console.error("[Quiz] Erro ensureProgress:", error); if (isMounted) { Alert.alert("Erro", "Falha ao iniciar progresso."); navigation.goBack(); } }
            } else { console.warn("[Quiz] Usuário não logado."); /* Lidar com isso? */ }
        } else { console.error(`[Quiz] Quiz ${moduleId} não encontrado.`); if (isMounted) { Alert.alert("Erro", "Quiz não encontrado."); navigation.goBack(); } }
        if (isMounted) setIsLoading(false);
    };
    initializeQuiz();
    return () => { isMounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, navigation, user?.userId, setActive, startTimer]);


  // Fala a pergunta atual
  useEffect(() => {
    if (!isLoading && questions.length > 0 && currentQuestionIndex < questions.length && speakText) {
      const q = questions[currentQuestionIndex];
      const textToSpeak = `Pergunta ${currentQuestionIndex + 1}: ${q.question}. Alternativas: ${q.options.join(", ")}.`;
      const timer = setTimeout(() => { if (speakText) speakText(textToSpeak); }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, questions, isLoading, speakText]);


  // Seleciona resposta
  const handleSelectAnswer = (index: number) => { if (!isAnswerChecked) setSelectedAnswer(index); };

  // Confirma resposta
  const handleConfirmAnswer = useCallback(async () => {
    if (selectedAnswer === null || !activeProgressId || !user?.userId || isSubmitting || isLoading) return;
    setIsSubmitting(true);
    const current = questions[currentQuestionIndex];
    setIsAnswerChecked(true);

    if (selectedAnswer === current.correctAnswer) {
      setCorrectCount(prev => prev + 1);
      try { await correctSound.current?.replayAsync(); } catch {}
      Vibration.vibrate(80);
      setShowConfetti(true);
      if (speakText) speakText("Resposta correta! Parabéns!");
      setTimeout(() => setShowConfetti(false), 3000);
      try { await registerCorrect(user.userId, activeProgressId); } catch (e) { console.error("Err reg acerto:", e); }
    } else {
      try { await wrongSound.current?.replayAsync(); } catch {}
      Vibration.vibrate([0, 100, 50, 100]);
      if (speakText) speakText("Resposta incorreta. A explicação será mostrada.");
      const errorDetail: ErrorDetail = {
          questionId: current.id, // ID da questão adicionado aqui
          questionText: current.question,
          userAnswer: current.options[selectedAnswer],
          expectedAnswer: current.options[current.correctAnswer]
      };
      setErrorDetails(prev => [...prev, errorDetail]);
      try { await registerWrong(activeProgressId, errorDetail); } catch (e) { console.error("Err reg erro:", e); }
    }
    setIsSubmitting(false);
  }, [selectedAnswer, activeProgressId, user?.userId, isSubmitting, isLoading, questions, currentQuestionIndex, speakText, correctSound, wrongSound]);

  // Próxima pergunta/Resultados
  const handleNextQuestion = useCallback(async () => {
      if (isSubmitting) return;
      if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setIsAnswerChecked(false);
      } else {
          setIsSubmitting(true);
          if (!user?.userId || !activeProgressId || !quizData) { /* ... erro ... */ setIsSubmitting(false); return; }
          const duration = stopTimer();
          const passed = correctCount >= quizData.passingScore;
          const accuracy = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
          const coinsEarned = correctCount * quizData.coinsPerCorrect;
          const pointsEarned = questions.reduce((total, q, index) => total + (index < correctCount ? (q.points || 10) : 0), 0);
          try {
              await finishModule(user.userId, activeProgressId, quizData.moduleId, duration, `Concluiu o Módulo ${quizData.moduleId}`);

              // ✅ CORREÇÃO 1: Remove a propriedade 'errors'
              navigation.replace("ModuleResult", {
                  moduleId: moduleId, // ID string original
                  correctAnswers: correctCount,
                  totalQuestions: questions.length,
                  accuracy: accuracy,
                  timeSpent: duration,
                  coinsEarned: coinsEarned,
                  pointsEarned: pointsEarned,
                  passed: passed,
                  // errors: errorDetails.length // <-- REMOVIDO
              });
          } catch (error) { console.error("[Quiz] Erro ao finalizar:", error); Alert.alert("Erro", "Não foi possível salvar o resultado."); setIsSubmitting(false); }
      }
  }, [
      isSubmitting, currentQuestionIndex, questions, user, activeProgressId,
      quizData, stopTimer, correctCount, navigation, moduleId, speakText, errorDetails // Adicionado errorDetails
  ]);


  if (isLoading || !quizData || questions.length === 0) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.text} />
              <Text style={{color: theme.text, marginTop: 10}}>Carregando Quiz...</Text>
          </View>
      );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const mainButtonText = isAnswerChecked
    ? (currentQuestionIndex === questions.length - 1 ? "Ver Resultado" : "Próxima")
    : "Confirmar";
  const canPressButton = selectedAnswer !== null || isAnswerChecked;
  const statusBarStyle = isColorDark(theme.background) ? 'light-content' : 'dark-content';

  return (
    <View style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
      <AccessibleView
        style={styles.header}
        accessibilityLabel={`${quizData.title}. Pergunta ${currentQuestionIndex + 1} de ${questions.length}.`}
        accessibilityText={`${quizData.title}. Pergunta ${currentQuestionIndex + 1} de ${questions.length}.`}
      >
         <Text style={styles.headerTitle}>{quizData.title}</Text>
         <Text style={styles.questionCounter}>{currentQuestionIndex + 1} / {questions.length}</Text>
       </AccessibleView>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <AccessibleView
          style={styles.questionCard}
          accessibilityLabel={`Pergunta ${currentQuestionIndex + 1}: ${currentQuestion.question}.`}
          accessibilityText={`Pergunta ${currentQuestionIndex + 1}: ${currentQuestion.question}.`}
        >
          <AccessibleHeader level={2} style={styles.questionText}>
            {currentQuestion.question}
          </AccessibleHeader>

          {currentQuestion.options.map((option, index) => {
           const isCorrect = isAnswerChecked && index === currentQuestion.correctAnswer;
           const isWrong = isAnswerChecked && selectedAnswer === index && index !== currentQuestion.correctAnswer;
           return (
             <OptionButton
               key={index}
               text={option}
               isSelected={selectedAnswer === index}
               onPress={() => handleSelectAnswer(index)}
               isCorrect={isCorrect}
               isWrong={isWrong}
               isAnswerChecked={isAnswerChecked}
               containerStyle={styles.optionContainer}
               selectedStyle={styles.optionSelected}
               correctStyle={styles.optionCorrect}
               wrongStyle={styles.optionWrong}
               radioOuterStyle={styles.radioOuter}
               radioInnerStyle={styles.radioInner}
               textStyle={styles.optionText}
             />
           );
         })}
        </AccessibleView>

        {isAnswerChecked && selectedAnswer !== currentQuestion.correctAnswer && currentQuestion.explanation && (
             <AccessibleView
               style={styles.explanationBox}
               accessibilityLabel={`Explicação: ${currentQuestion.explanation}`}
               accessibilityText={`Explicação: ${currentQuestion.explanation}`}
             >
               <Text style={styles.explanationText}>💡 {currentQuestion.explanation}</Text>
             </AccessibleView>
        )}

      </ScrollView>

       {/* Botão de Ação */}
       <View style={styles.footer}>
         <AccessibleButton
           style={[ styles.button, (!canPressButton || isSubmitting) && styles.disabledButton ]}
           onPress={isAnswerChecked ? handleNextQuestion : handleConfirmAnswer}
           disabled={!canPressButton || isSubmitting}
           accessibilityLabel={`Botão ${mainButtonText}. ${ (!canPressButton || isSubmitting) ? "Desabilitado." : "" }`}
         >
           {isSubmitting
               ? <ActivityIndicator color={theme.buttonText ?? '#FFFFFF'} size="small"/>
               : <Text style={styles.buttonText}>{mainButtonText}</Text>
           }
         </AccessibleButton>
       </View>

      {showConfetti && (
          <View style={styles.confettiContainer} pointerEvents="none">
             <ConfettiCannon count={200} origin={{ x: width / 2, y: -20 }} explosionSpeed={350} fallSpeed={3000} fadeOut />
          </View>
      )}
    </View>
  );
}

// --- ESTILOS --- (DEFINIÇÃO COMPLETA COM FALLBACKS CORRIGIDOS)
const getStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
): StyleSheet.NamedStyles<any> =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    confettiContainer: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background },
    header: { paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0) + 10, paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: theme.card ?? '#EEE' },
    headerTitle: { fontSize: 18 * fontMultiplier, fontWeight: isBold ? "bold" : "700", color: theme.text, textAlign: "center", lineHeight: 18 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
    questionCounter: { fontSize: 14 * fontMultiplier, fontWeight: isBold ? "bold" : "600", color: theme.text, textAlign: "center", marginTop: 2, lineHeight: 14 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
    scrollContentContainer: { flexGrow: 1, justifyContent: "space-between", padding: 15 },
    questionCard: { backgroundColor: theme.card, borderRadius: 12, padding: 15, marginBottom: 15 },
    questionText: { color: theme.cardText, fontSize: 17 * fontMultiplier, fontWeight: isBold ? "bold" : "600", marginBottom: 15, textAlign: "center", lineHeight: 17 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
    optionContainer: { flexDirection: "row", alignItems: "center", marginBottom: 8, paddingVertical: 12, paddingHorizontal: 12, borderWidth: 1.5,
        // ✅ CORREÇÃO 2: Fallback APLICADO
        borderColor: theme.cardText ?? theme.text ?? 'rgba(128,128,128,0.5)',
        borderRadius: 8
    },
    optionSelected: { backgroundColor: theme.button ?? '#191970', borderColor: theme.buttonText ?? '#FFFFFF' },
    optionCorrect: { backgroundColor: "#2E7D32", borderColor: "#66BB6A" },
    optionWrong: { backgroundColor: "#D32F2F", borderColor: "#EF5350" },
    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.cardText, justifyContent: "center", alignItems: "center", marginRight: 10 },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.cardText },
    optionText: { color: theme.cardText, fontSize: 15 * fontMultiplier, fontWeight: isBold ? "bold" : "normal", flex: 1, lineHeight: 15 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
    explanationBox: { marginTop: 10, padding: 10,
        // ✅ CORREÇÃO 3: Fallback APLICADO
        backgroundColor: theme.card ?? theme.background ?? '#F5F5F5',
        borderRadius: 8
    },
    explanationText: {
        // ✅ CORREÇÃO 4: Fallback APLICADO
        color: theme.cardText ?? theme.text ?? '#333333',
        fontSize: 14 * fontMultiplier, fontStyle: 'italic', lineHeight: 14 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined
    },
    footer: { paddingHorizontal: 15, paddingBottom: Platform.OS === 'ios' ? 30 : 20, paddingTop: 10 },
    button: { backgroundColor: theme.button ?? '#191970', borderRadius: 10, paddingVertical: 15, alignItems: "center", minHeight: 50, justifyContent: 'center' },
    buttonText: { color: theme.buttonText ?? '#FFFFFF', fontSize: 16 * fontMultiplier, fontWeight: isBold ? "bold" : "700", lineHeight: 16 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
    disabledButton: {
        // ✅ CORREÇÃO 5: Fallback APLICADO
        backgroundColor: '#BDBDBD', // Cor cinza padrão
    },
  });