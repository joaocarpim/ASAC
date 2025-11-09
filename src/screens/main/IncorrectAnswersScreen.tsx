// src/screens/main/IncorrectAnswersScreen.tsx (CORRIGIDO)
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  ColorValue,
  Animated,
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
import progressService from "../../services/progressService"; // Corrigido para import default
import { RootStackParamList } from "../../navigation/types";
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";

type IncorrectAnswer = {
  id: string;
  moduleNumber?: number;
  questionNumber: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
};

type IncorrectAnswerCardProps = {
  item: IncorrectAnswer;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
  index: number;
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

const IncorrectAnswerCard = ({
  item,
  styles,
  theme,
  index,
}: IncorrectAnswerCardProps) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animação de entrada
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulso sutil no badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [slideAnim, fadeAnim, index, pulseAnim]); // Adicionadas dependências

  const questionNum = item.questionNumber.toString().split("-").pop() || "?";

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View style={styles.card}>
        {/* Header com gradiente visual */}
        <View style={styles.cardHeader}>
          <Animated.View
            style={[
              styles.questionNumberBadge,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={styles.questionNumber}>{questionNum}</Text>
          </Animated.View>
          <View style={styles.errorIndicator}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={24}
              color="#F44336"
            />
          </View>
        </View>

        {/* Corpo do card */}
        <View style={styles.cardBody}>
          <View style={styles.questionSection}>
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={20}
              color={theme.text} // Ajustado para theme.text
              style={styles.sectionIcon}
            />
            <Text style={styles.questionText}>{item.questionText}</Text>
          </View>

          {/* Divisor */}
          <View style={styles.divider} />

          {/* Respostas */}
          <View style={styles.answersContainer}>
            {/* Resposta errada */}
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

            {/* Resposta correta */}
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
    </Animated.View>
  );
};

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

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const statusBarStyle = isColorDark(theme.background)
    ? "light-content"
    : "dark-content";

  // Animações do header
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerScaleAnim = useRef(new Animated.Value(0.9)).current;

  const fetchIncorrectAnswers = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Corrigido para usar a importação default
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
          questionNumber: err.questionId ?? `${idx + 1}`,
          questionText:
            err.questionText ?? err.question ?? "Pergunta não disponível",
          userAnswer:
            err.userAnswer ?? err.answer ?? err.selected ?? "Não respondida",
          correctAnswer: err.expectedAnswer ?? err.correctAnswer ?? "N/A",
        }));

        setIncorrectAnswers(aggregatedErrors);

        // Animar header após carregar dados
        Animated.parallel([
          Animated.timing(headerFadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(headerScaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        setIncorrectAnswers([]);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar erros:", error);
      setIncorrectAnswers([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userId, moduleNumber, headerFadeAnim, headerScaleAnim]); // Adicionadas dependências

  useFocusEffect(
    useCallback(() => {
      fetchIncorrectAnswers();
    }, [fetchIncorrectAnswers])
  );

  const handleGoBack = () => navigation.goBack();
  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleGoBack);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title={`Módulo ${moduleNumber} - Erros`} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.text} />
        </View>
      </View>
    );
  }

  return (
    <GestureDetector gesture={flingRight}>
      <View style={styles.container}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title={`Módulo ${moduleNumber} - Erros`} />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Header com estatísticas */}
          <Animated.View
            style={[
              styles.statsCard,
              {
                opacity: headerFadeAnim,
                transform: [{ scale: headerScaleAnim }],
              },
            ]}
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
          </Animated.View>

          {/* Lista de erros */}
          {incorrectAnswers.length > 0 ? (
            <View style={styles.errorsSection}>
              {incorrectAnswers.map((item, index) => (
                <IncorrectAnswerCard
                  key={item.id}
                  item={item}
                  styles={styles}
                  theme={theme}
                  index={index}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="trophy" size={80} color="#FFD700" />
              <Text style={styles.emptyText}>Excelente trabalho!</Text>
              <Text style={styles.emptySubtext}>
                Continue assim e conquiste ainda mais pontos! 🚀
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </GestureDetector>
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

    // Stats Card
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

    // Errors Section
    errorsSection: {
      marginBottom: 20,
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
      // ✅ CORREÇÃO AQUI
      backgroundColor: theme.background, // Trocado de "#FFEBEE" para theme.background
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
      color: "#FFFFFF", // Mantido como branco para contrastar com o badge vermelho
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
      // ✅ CORREÇÃO AQUI
      backgroundColor: theme.background, // Trocado de "#FFEBEE" para theme.background
      borderColor: "#F44336",
    },
    correctAnswerBox: {
      // ✅ CORREÇÃO AQUI
      backgroundColor: theme.background, // Trocado de "#E8F5E9" para theme.background
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
      color: theme.text, // Corrigido para theme.text para garantir visibilidade
      opacity: 0.7,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    userAnswer: {
      fontSize: 15 * fontMultiplier,
      color: "#C62828", // Mantido como cor semântica de erro
      fontWeight: "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    correctAnswer: {
      fontSize: 15 * fontMultiplier,
      color: "#2E7D32", // Mantido como cor semântica de acerto
      fontWeight: "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },

    // Empty State
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
