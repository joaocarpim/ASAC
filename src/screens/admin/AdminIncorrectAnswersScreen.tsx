// src/screens/admin/AdminIncorrectAnswersScreen.tsx
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
  RefreshControl,
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
import progressService from "../../services/progressService";
import { RootStackParamList } from "../../navigation/types";

// Tipo para os dados
type IncorrectAnswer = {
  id: string;
  moduleNumber?: number;
  questionNumber: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
};

type AdminIncorrectAnswersRouteProp = RouteProp<
  RootStackParamList,
  "AdminIncorrectAnswers"
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

// Paleta de cores customizada
const CUSTOM_COLORS = {
  background: "#FFFFFF",
  cardBackground: "#1E3A8A", // Azul escuro
  cardText: "#FFFFFF",
  primaryText: "#1E3A8A", // Azul escuro
  secondaryText: "#64748B", // Cinza azulado

  // Badges e indicadores
  errorBadge: "#DC2626", // Vermelho para erros
  successBadge: "#16A34A", // Verde para sucesso

  // Boxes de respostas
  wrongAnswerBg: "#FEF2F2", // Vermelho muito claro
  wrongAnswerBorder: "#DC2626",
  wrongAnswerText: "#991B1B",

  correctAnswerBg: "#F0FDF4", // Verde muito claro
  correctAnswerBorder: "#16A34A",
  correctAnswerText: "#166534",

  // Elementos interativos
  iconColor: "#FFFFFF",
  divider: "#E2E8F0",
};

// ✅ OTIMIZAÇÃO 1: Card Memoizado
const IncorrectAnswerCard = React.memo<{
  item: IncorrectAnswer;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}>(({ item, styles, theme }) => {
  const questionNum = item.questionNumber.toString().split("-").pop() || "?";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.questionNumberBadge}>
          <Text style={styles.questionNumber}>{questionNum}</Text>
        </View>
        <View style={styles.errorIndicator}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={24}
            color={CUSTOM_COLORS.errorBadge}
          />
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.questionSection}>
          <MaterialCommunityIcons
            name="help-circle-outline"
            size={20}
            color={CUSTOM_COLORS.iconColor}
            style={styles.sectionIcon}
          />
          <Text style={styles.questionText}>{item.questionText}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.answersContainer}>
          {/* Box de Resposta do Aluno */}
          <View style={[styles.answerBox, styles.wrongAnswerBox]}>
            <View style={styles.answerHeader}>
              <MaterialCommunityIcons
                name="account-alert"
                size={20}
                color={CUSTOM_COLORS.wrongAnswerBorder}
              />
              <Text style={styles.answerLabel}>Resposta do Aluno</Text>
            </View>
            <Text style={styles.userAnswer}>{item.userAnswer}</Text>
          </View>

          {/* Box de Resposta Correta */}
          <View style={[styles.answerBox, styles.correctAnswerBox]}>
            <View style={styles.answerHeader}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={CUSTOM_COLORS.correctAnswerBorder}
              />
              <Text style={styles.answerLabel}>Resposta Correta</Text>
            </View>
            <Text style={styles.correctAnswer}>{item.correctAnswer}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

export default function AdminIncorrectAnswersScreen({
  route,
}: {
  route: AdminIncorrectAnswersRouteProp;
  navigation: NavigationProp<RootStackParamList>;
}) {
  const navigation = useNavigation();

  const params = route.params as {
    userId: string;
    moduleNumber: number;
    userName?: string;
  };
  const { moduleNumber, userId, userName } = params;

  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  // ✅ OTIMIZAÇÃO 2: Memoizar estilos
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

  const statusBarStyle = "dark-content"; // Sempre dark para fundo branco

  const fetchIncorrectAnswers = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    if (!refreshing) setLoading(true);

    try {
      const progress = await progressService.getModuleProgressByUser(
        userId,
        moduleNumber
      );

      if (progress && progress.errorDetails) {
        const errors = (
          Array.isArray(progress.errorDetails) ? progress.errorDetails : []
        ) as any[];

        // ✅ OTIMIZAÇÃO 3: Processamento eficiente
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
      console.error("❌ Erro ao buscar erros do aluno:", error);
      setIncorrectAnswers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, moduleNumber, refreshing]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIncorrectAnswers();
  }, [fetchIncorrectAnswers]);

  useFocusEffect(
    useCallback(() => {
      fetchIncorrectAnswers();
    }, [fetchIncorrectAnswers])
  );

  const handleGoBack = () => navigation.goBack();

  // ✅ OTIMIZAÇÃO 4: RenderCard Memoizado
  const renderCard = useCallback(
    ({ item }: { item: IncorrectAnswer }) => (
      <IncorrectAnswerCard item={item} styles={styles} theme={theme} />
    ),
    [styles, theme]
  );

  // ✅ OTIMIZAÇÃO 5: Header Memoizado
  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.statsCard}>
        <View style={styles.statsIconContainer}>
          {incorrectAnswers.length === 0 ? (
            <MaterialCommunityIcons
              name="check-circle"
              size={64}
              color={CUSTOM_COLORS.successBadge}
            />
          ) : (
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={64}
              color={CUSTOM_COLORS.errorBadge}
            />
          )}
        </View>
        <Text style={styles.statsTitle}>
          {incorrectAnswers.length}{" "}
          {incorrectAnswers.length === 1 ? "Erro" : "Erros"}
        </Text>
        <Text style={styles.statsSubtitle}>
          {incorrectAnswers.length === 0
            ? `O aluno ${userName || "selecionado"} acertou tudo!`
            : `Erros cometidos por ${userName || "aluno"}`}
        </Text>
      </View>
    ),
    [incorrectAnswers.length, styles, userName]
  );

  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="trophy" size={80} color="#FFD700" />
        <Text style={styles.emptyText}>Sem erros registrados!</Text>
        <Text style={styles.emptySubtext}>
          O desempenho neste módulo foi perfeito.
        </Text>
      </View>
    ),
    [styles]
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={CUSTOM_COLORS.background}
        />
        <ScreenHeader title={`Mód. ${moduleNumber} - Detalhes`} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CUSTOM_COLORS.primaryText} />
          <Text style={styles.loadingText}>
            Carregando respostas do aluno...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={CUSTOM_COLORS.background}
      />
      <ScreenHeader title={`Mód. ${moduleNumber} - Detalhes`} />

      <FlatList
        data={incorrectAnswers}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[CUSTOM_COLORS.cardBackground]}
            tintColor={CUSTOM_COLORS.primaryText}
          />
        }
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
    container: {
      flex: 1,
      backgroundColor: CUSTOM_COLORS.background,
    },
    scrollContainer: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      color: CUSTOM_COLORS.primaryText,
      marginTop: 10,
      fontSize: 16 * fontMultiplier,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    statsCard: {
      backgroundColor: CUSTOM_COLORS.cardBackground,
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
      color: CUSTOM_COLORS.cardText,
      marginTop: 8,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    statsSubtitle: {
      fontSize: 14 * fontMultiplier,
      color: CUSTOM_COLORS.cardText,
      opacity: 0.9,
      marginTop: 8,
      textAlign: "center",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    card: {
      backgroundColor: CUSTOM_COLORS.cardBackground,
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
      backgroundColor: CUSTOM_COLORS.background,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    questionNumberBadge: {
      backgroundColor: CUSTOM_COLORS.cardBackground,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      borderWidth: 2,
      borderColor: CUSTOM_COLORS.primaryText,
    },
    questionNumber: {
      color: CUSTOM_COLORS.cardText,
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
      color: CUSTOM_COLORS.cardText,
      fontWeight: "600",
      lineHeight: 16 * fontMultiplier * lineHeight,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    divider: {
      height: 1,
      backgroundColor: CUSTOM_COLORS.divider,
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
      backgroundColor: CUSTOM_COLORS.wrongAnswerBg,
      borderColor: CUSTOM_COLORS.wrongAnswerBorder,
    },
    correctAnswerBox: {
      backgroundColor: CUSTOM_COLORS.correctAnswerBg,
      borderColor: CUSTOM_COLORS.correctAnswerBorder,
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
      color: CUSTOM_COLORS.primaryText,
      opacity: 0.7,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    userAnswer: {
      fontSize: 15 * fontMultiplier,
      color: CUSTOM_COLORS.wrongAnswerText,
      fontWeight: "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    correctAnswer: {
      fontSize: 15 * fontMultiplier,
      color: CUSTOM_COLORS.correctAnswerText,
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
      color: CUSTOM_COLORS.primaryText,
      marginTop: 16,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptySubtext: {
      fontSize: 16 * fontMultiplier,
      color: CUSTOM_COLORS.secondaryText,
      marginTop: 8,
      textAlign: "center",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });
