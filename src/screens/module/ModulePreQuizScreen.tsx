import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  TextStyle,
  ViewStyle,
  Platform,
  ColorValue
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { canStartModule } from "../../services/progressService";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  GestureDetector,
  Gesture,
  Directions,
} from "react-native-gesture-handler";
import {
  AccessibleView,
  AccessibleHeader,
  AccessibleText,
  // AccessibleButton,
} from "../../components/AccessibleComponents";
import { useSettings } from "../../hooks/useSettings";
import { getQuizByModuleId, ModuleQuiz } from "../../navigation/moduleQuestionTypes";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { useAccessibility } from "../../context/AccessibilityProvider"; // ✅ Importado useAccessibility

const { width } = Dimensions.get("window");
const scaleFactor = width / 375;
const responsiveFontSize = (size: number) => Math.round(size * scaleFactor);

// Função isColorDark
function isColorDark(color: ColorValue | undefined): boolean {
    if (!color || typeof color !== 'string' || !color.startsWith('#')) return false;
    const hex = color.replace('#', '');
    if (hex.length !== 6) return false;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance < 149;
}

// ✅ DEFINIÇÃO COMPLETA E ÚNICA DA FUNÇÃO getStyles (MOVIDA PARA O TOPO)
const getStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
): StyleSheet.NamedStyles<any> => {
  const isHighContrastTheme = theme.background === "#0055A4";
  const textColor = isHighContrastTheme ? "#FFFFFF" : theme.text;

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, justifyContent: "center" },
    centeredContent: { flex: 1, justifyContent: 'center' },
    contentContainer: { padding: 20 },
    title: { fontSize: responsiveFontSize(22) * fontMultiplier, fontWeight: isBold ? "bold" : "bold", color: textColor, marginBottom: 5, textAlign: "center", lineHeight: responsiveFontSize(22) * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
    subtitle: { fontSize: responsiveFontSize(18) * fontMultiplier, fontWeight: isBold ? "bold" : "600", color: textColor, marginBottom: 15, textAlign: "center", lineHeight: responsiveFontSize(18) * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
    infoContainer: { backgroundColor: theme.card, borderRadius: 12, padding: 20, marginBottom: 20, gap: 15 },
    infoText: { fontSize: responsiveFontSize(15) * fontMultiplier, color: theme.cardText, fontWeight: isBold ? "bold" : "normal", lineHeight: responsiveFontSize(15) * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
    tipContainer: { flexDirection: "row", alignItems: "center", marginTop: 5, padding: 12, backgroundColor: theme.background, borderRadius: 8, borderWidth: 1, borderColor: theme.card },
    icon: { marginRight: 12 },
    tipText: { fontSize: responsiveFontSize(14) * fontMultiplier, color: textColor, flex: 1, fontWeight: isBold ? "bold" : "normal", lineHeight: responsiveFontSize(14) * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }, // Adicionado
  });
};


export default function ModulePreQuizScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModulePreQuiz">) {
  const { moduleId } = route.params;
  const { user } = useAuthStore();
  const [checkingPermission, setCheckingPermission] = useState(false);
  const [quizData, setQuizData] = useState<ModuleQuiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);
  const { theme } = useContrast();
  const { speakText } = useAccessibility(); // ✅ Obtém speakText
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  // Cria estilos (agora getStyles está definida acima)
  const styles = getStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  // Efeito para buscar os dados do Quiz
  useEffect(() => {
    setLoadingQuiz(true);
    let numericModuleId = 0;
    try {
        let idStringToParse = '0';
        if (typeof moduleId === 'string') {
            // ✅ CORREÇÃO: Lógica de parse revisada
            const parts = moduleId.split('-');
            idStringToParse = parts.length > 1 ? parts[1] : moduleId;
        }
        const parsedAttempt = parseInt(idStringToParse, 10);
        numericModuleId = isNaN(parsedAttempt) ? 0 : parsedAttempt;

    } catch (e) {
        console.error("Erro ao processar moduleId:", moduleId, e);
        numericModuleId = 0;
    }

    const data = getQuizByModuleId(numericModuleId);

    if (data) {
      setQuizData(data);
    } else {
      console.error(`[PreQuiz] Quiz para módulo ${moduleId} (numérico ${numericModuleId}) não encontrado.`);
      Alert.alert("Erro", "Não foi possível carregar as informações do questionário.", [
          { text: "OK", onPress: () => navigation.goBack() }
      ]);
    }
    setLoadingQuiz(false);
  }, [moduleId, navigation]);


  // Efeito para falar as instruções quando o quiz carregar
  useEffect(() => {
    // ✅ CORREÇÃO: Verifica se não está carregando E se quizData existe
    if (!loadingQuiz && quizData) {
        const accessibilityInstructions = `Tela de instruções do questionário para ${quizData.title}. Questões: ${quizData.questions.length}. Para passar: ${quizData.passingScore} acertos. Moedas por acerto: ${quizData.coinsPerCorrect}. Arraste para a esquerda para começar, ou para a direita para voltar.`;
        speakText(accessibilityInstructions);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingQuiz, quizData]); // Depende do loading e dos dados


  const handleStartQuiz = async () => { /* ... (lógica start quiz) ... */ };
  const handleGoBack = () => navigation.goBack();
  const flingRight = Gesture.Fling().direction(Directions.RIGHT).onEnd(handleGoBack);
  const flingLeft = Gesture.Fling().direction(Directions.LEFT).onEnd(handleStartQuiz);
  const composedGestures = Gesture.Race(flingLeft, flingRight);

  const statusBarStyle = isColorDark(theme.background) ? 'light-content' : 'dark-content';

  // Renderização condicional de Loading
  if (loadingQuiz || !quizData) {
    return (
      <View style={styles.loadingContainer}> {/* Usa loadingContainer */}
        <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
        <ScreenHeader title="Carregando Quiz..." />
        <ActivityIndicator color={theme.text} size="large" />
      </View>
    );
  }

  // Se chegou aqui, quizData existe
  const accessibilityInstructions = `Tela de instruções do questionário para ${quizData.title}. Questões: ${quizData.questions.length}. Para passar: ${quizData.passingScore} acertos. Moedas por acerto: ${quizData.coinsPerCorrect}. Arraste para a esquerda para começar, ou para a direita para voltar.`;

  return (
    <GestureDetector gesture={composedGestures}>
      <AccessibleView style={styles.container} accessibilityText={accessibilityInstructions} >
        <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
        <ScreenHeader title={quizData.title || "Questionário"} />
        <View style={styles.centeredContent}>
          <View style={styles.contentContainer}>
             <AccessibleHeader level={1} style={styles.title}> Você concluiu o conteúdo! </AccessibleHeader>
             <AccessibleHeader level={2} style={styles.subtitle}> Sobre o Questionário </AccessibleHeader>
             <AccessibleView style={styles.infoContainer} accessibilityText="Informações sobre o questionário." >
                <AccessibleText baseSize={15} style={styles.infoText} accessibilityLabel={`Questões: ${quizData.questions.length}.`}> 📝 Questões: {quizData.questions.length} </AccessibleText>
                <AccessibleText baseSize={15} style={styles.infoText} accessibilityLabel={`Para passar: ${quizData.passingScore} acertos.`}> ✅ Para passar: {quizData.passingScore} acertos </AccessibleText>
                <AccessibleText baseSize={15} style={styles.infoText} accessibilityLabel={`Moedas por acerto: ${quizData.coinsPerCorrect}.`}> 🪙 Moedas por acerto: {quizData.coinsPerCorrect} </AccessibleText>
                <AccessibleText baseSize={15} style={styles.infoText} accessibilityLabel={`Pontuação Total Possível: ${quizData.totalCoins}.`}> 🏆 Pontuação Total: {quizData.totalCoins} </AccessibleText>
                <AccessibleText baseSize={15} style={styles.infoText} accessibilityLabel="Tentativas: Ilimitadas."> 🔄 Tentativas: Ilimitadas </AccessibleText>
                <AccessibleText baseSize={15} style={styles.infoText} accessibilityLabel="Feedback: Áudio e visual."> 🔊 Feedback: Áudio e visual </AccessibleText>
             </AccessibleView>
             <AccessibleView style={styles.tipContainer} accessibilityText="Dica: Leia todo o conteúdo com atenção antes de iniciar o questionário." >
                <Text style={[styles.icon, { fontSize: responsiveFontSize(18) }]}>💡</Text>
                <Text style={styles.tipText}> Dica: Leia todo o conteúdo com atenção antes de iniciar o questionário. </Text>
             </AccessibleView>
             {checkingPermission && (
                <AccessibleView accessibilityText="Verificando permissão. Por favor, aguarde.">
                  <ActivityIndicator style={{ marginTop: 20 }} size="large" color={theme.text} />
                </AccessibleView>
             )}
          </View>
        </View>
      </AccessibleView>
    </GestureDetector>
  );
}

// ✅ DEFINIÇÃO COMPLETA E ÚNICA DA FUNÇÃO getStyles (NO FINAL DO ARQUIVO)
/* Cole aqui a definição completa da função getStyles */