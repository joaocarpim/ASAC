// src/screens/main/IncorrectAnswersScreen.tsx

import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  ColorValue,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useNavigation,
  useFocusEffect,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { useSettings } from "../../hooks/useSettings";
import { useAuthStore } from "../../store/authStore";
import progressService from "../../services/progressService";
import { RootStackParamList } from "../../navigation/types";

type IncorrectAnswer = {
  id: string;
  moduleNumber?: number;
  questionNumber: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
};

type IncorrectAnswersRouteProp = RouteProp<
  RootStackParamList,
  "IncorrectAnswers"
>;

function isColorDark(color: ColorValue | undefined): boolean {
  if (!color || typeof color !== "string" || !color.startsWith("#"))
    return false;
  const hex = color.replace("#", "");
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 149;
}

// ✅ OTIMIZAÇÃO: Card Unificado para Acessibilidade
const IncorrectAnswerCard = React.memo<{
  item: IncorrectAnswer;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}>(({ item, styles, theme }) => {
  const questionNum = item.questionNumber.toString().split("-").pop() || "?";

  // 1. Montamos o texto completo que o leitor deve falar de uma vez só
  const accessibilityFullText = `
    Questão ${questionNum}. 
    ${item.questionText}. 
    Sua resposta incorreta foi: ${item.userAnswer}. 
    A resposta correta seria: ${item.correctAnswer}.
  `
    .replace(/\s+/g, " ")
    .trim(); // Remove espaços extras e quebras de linha

  return (
    <View
      style={styles.card}
      // 2. Define que este componente inteiro é UM único elemento focável
      accessible={true}
      // 3. Permite navegação via Teclado/Tab (Android/Web)
      focusable={true}
      // 4. Define o texto exato que será lido
      accessibilityLabel={accessibilityFullText}
      // 5. Dica opcional para o usuário saber que é um item de lista
      accessibilityHint="Toque duas vezes para ouvir detalhes se necessário"
    >
      {/* NOTA: Como o pai tem accessible={true} e accessibilityLabel definido,
         o React Native automaticamente ignora os elementos de texto internos 
         para fins de leitura, focando apenas no container pai.
         Não precisamos colocar accessible={false} nos filhos, o comportamento é padrão.
      */}

      <View style={styles.cardHeader}>
        <View style={styles.questionNumberBadge}>
          <Text style={styles.questionNumber}>{questionNum}</Text>
        </View>
        <View style={styles.errorIndicator}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={24}
            color="#F44336"
          />
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.questionSection}>
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={20}
            color={theme.text}
            style={styles.sectionIcon}
          />
          <Text style={styles.questionText}>{item.questionText}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.answersContainer}>
          <View style={[styles.answerBox, styles.wrongAnswerBox]}>
            <View style={styles.answerHeader}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="#F44336"
              />
              <Text style={styles.answerLabel}>Sua resposta</Text>
            </View>
            <Text style={styles.userAnswer}>{item.userAnswer}</Text>
          </View>

          <View style={[styles.answerBox, styles.correctAnswerBox]}>
            <View style={styles.answerHeader}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="#4CAF50"
              />
              <Text style={styles.answerLabel}>Resposta correta</Text>
            </View>
            <Text style={styles.correctAnswer}>{item.correctAnswer}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

export default function IncorrectAnswersScreen({
  route,
}: {
  route: IncorrectAnswersRouteProp;
  navigation: NavigationProp<RootStackParamList>;
}) {
  const navigation = useNavigation();
  const { moduleNumber } = route.params;
  const { user } = useAuthStore();
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const styles = useMemo(
    () =>
      createStyles(
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

  const statusBarStyle = isColorDark(theme.background)
    ? "light-content"
    : "dark-content";

  const fetchIncorrectAnswers = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    try {
      const progress = await progressService.getModuleProgressByUser(
        user.userId,
        moduleNumber
      );

      if (progress && progress.errorDetails) {
        const errors = (
          Array.isArray(progress.errorDetails) ? progress.errorDetails : []
        ) as any[];

        const aggregatedErrors = errors.map((err: any, idx: number) => ({
          id: `${progress.id}-${idx}`,
          moduleNumber: moduleNumber,
          questionNumber: err.questionId ?? err.question_id ?? `${idx + 1}`,
          questionText:
            err.questionText ??
            err.question ??
            err.text ??
            "Pergunta não disponível",
          userAnswer:
            err.userAnswer ??
            err.answer ??
            err.selected ??
            err.user_answer ??
            "Não respondida",
          correctAnswer:
            err.expectedAnswer ??
            err.correctAnswer ??
            err.correct_answer ??
            err.expected ??
            "N/A",
        }));

        setIncorrectAnswers(aggregatedErrors);
      } else {
        setIncorrectAnswers([]);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar erros:", error);
      setIncorrectAnswers([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userId, moduleNumber]);

  useFocusEffect(
    useCallback(() => {
      fetchIncorrectAnswers();
    }, [fetchIncorrectAnswers])
  );

  const renderCard = useCallback(
    ({ item }: { item: IncorrectAnswer }) => (
      <IncorrectAnswerCard item={item} styles={styles} theme={theme} />
    ),
    [styles, theme]
  );

  const ListHeaderComponent = useMemo(
    () => (
      <View
        style={styles.statsCard}
        accessible={true}
        focusable={true}
        accessibilityRole="header"
        // Leitura unificada do cabeçalho também
        accessibilityLabel={`Resumo: ${incorrectAnswers.length} ${
          incorrectAnswers.length === 1
            ? "Erro encontrado"
            : "Erros encontrados"
        }. ${
          incorrectAnswers.length === 0
            ? "Parabéns, você acertou tudo."
            : "Revise os detalhes abaixo."
        }`}
      >
        <View style={styles.statsIconContainer}>
          {incorrectAnswers.length === 0 ? (
            <MaterialCommunityIcons
              name="check-circle"
              size={64}
              color="#4CAF50"
            />
          ) : (
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={64}
              color="#F44336"
            />
          )}
        </View>
        <Text style={styles.statsTitle}>
          {incorrectAnswers.length}{" "}
          {incorrectAnswers.length === 1 ? "Erro" : "Erros"}
        </Text>
        <Text style={styles.statsSubtitle}>
          {incorrectAnswers.length === 0
            ? "🎉 Perfeito! Você acertou todas as questões!"
            : "Revise suas respostas incorretas abaixo"}
        </Text>
      </View>
    ),
    [incorrectAnswers.length, styles]
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View
        style={styles.emptyContainer}
        accessible={true}
        focusable={true}
        accessibilityLabel="Lista vazia. Excelente trabalho! Continue assim."
      >
        <MaterialCommunityIcons name="trophy" size={80} color="#FFD700" />
        <Text style={styles.emptyText}>Excelente trabalho!</Text>
        <Text style={styles.emptySubtext}>
          Continue assim e conquiste ainda mais pontos! 🚀
        </Text>
      </View>
    ),
    [styles]
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title={`Módulo ${moduleNumber} - Erros`} />
        <View
          style={styles.loadingContainer}
          accessible={true}
          focusable={true}
          accessibilityLabel="Carregando informações, por favor aguarde."
        >
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={{ color: theme.text, marginTop: 10 }}>
            Carregando...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
      <ScreenHeader title={`Módulo ${moduleNumber} - Erros`} />

      <FlatList
        data={incorrectAnswers}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.scrollContainer}
        removeClippedSubviews={Platform.OS === "android"}
        maxToRenderPerBatch={3}
        updateCellsBatchingPeriod={50}
        windowSize={5}
        initialNumToRender={3}
      />
    </View>
  );
}

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    statsCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      marginTop: 20,
      marginBottom: 20,
      alignItems: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    statsIconContainer: {
      marginBottom: 12,
    },
    statsTitle: {
      fontSize: 28 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginTop: 8,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    statsSubtitle: {
      fontSize: 14 * fontMultiplier,
      color: theme.cardText,
      opacity: 0.7,
      marginTop: 8,
      textAlign: "center",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      marginBottom: 16,
      overflow: "hidden",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 5,
    },
    cardHeader: {
      backgroundColor: theme.background,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    questionNumberBadge: {
      backgroundColor: "#F44336",
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
    },
    questionNumber: {
      color: "#FFFFFF",
      fontSize: 20 * fontMultiplier,
      fontWeight: "bold",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    errorIndicator: {
      padding: 4,
    },
    cardBody: {
      padding: 16,
    },
    questionSection: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    sectionIcon: {
      marginTop: 2,
    },
    questionText: {
      flex: 1,
      fontSize: 16 * fontMultiplier,
      color: theme.cardText,
      fontWeight: "600",
      lineHeight: 16 * fontMultiplier * lineHeight,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    divider: {
      height: 1,
      backgroundColor: theme.cardText,
      opacity: 0.1,
      marginVertical: 16,
    },
    answersContainer: {
      gap: 12,
    },
    answerBox: {
      borderRadius: 12,
      padding: 12,
      borderWidth: 2,
    },
    wrongAnswerBox: {
      backgroundColor: theme.background,
      borderColor: "#F44336",
    },
    correctAnswerBox: {
      backgroundColor: theme.background,
      borderColor: "#4CAF50",
    },
    answerHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 6,
    },
    answerLabel: {
      fontSize: 12 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      opacity: 0.7,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    userAnswer: {
      fontSize: 15 * fontMultiplier,
      color: "#C62828",
      fontWeight: "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    correctAnswer: {
      fontSize: 15 * fontMultiplier,
      color: "#2E7D32",
      fontWeight: "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 24 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 16,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptySubtext: {
      fontSize: 16 * fontMultiplier,
      color: theme.text,
      opacity: 0.7,
      marginTop: 8,
      textAlign: "center",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });
