// src/screens/admin/AdminIncorrectAnswersScreen.tsx (Corrigido - Última Tentativa)
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  ColorValue,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { useFocusEffect } from "@react-navigation/native";
import { generateClient } from "aws-amplify/api";
import { listProgresses } from "../../graphql/queries";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import { useSettings } from "../../hooks/useSettings";

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
};

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

const IncorrectAnswerCard = ({ item, styles }: IncorrectAnswerCardProps) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.questionNumber}>
        {item.questionNumber.toString().split("-").pop() || "?"}
      </Text>
      <Text style={styles.questionText}>
        {item.moduleNumber ? `(Mód ${item.moduleNumber}) ` : ""}
        {item.questionText}
      </Text>
    </View>
    <View style={styles.answerContainer}>
      <Text style={styles.label}>Resposta do usuário:</Text>
      <Text style={styles.userAnswer}>{item.userAnswer}</Text>
      <Text style={styles.label}>Resposta correta:</Text>
      <Text style={styles.correctAnswer}>{item.correctAnswer}</Text>
    </View>
  </View>
);

export default function AdminIncorrectAnswersScreen({
  route,
}: RootStackScreenProps<"AdminIncorrectAnswers">) {
  const { userId, moduleNumber } = route.params;
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

  const fetchIncorrectAnswers = useCallback(async () => {
    setLoading(true);
    try {
      const client = generateClient();

      // Busca todos os progressos para este módulo
      const result: any = await client.graphql({
        query: listProgresses,
        variables: {
          filter: {
            userId: { eq: userId },
            moduleNumber: { eq: moduleNumber },
          },
        },
        authMode: "userPool",
      });

      const rawProgressList = result?.data?.listProgresses?.items || [];

      // ✅ FILTRAGEM: Ordenar por data (mais recente primeiro) e pegar apenas o primeiro
      const sortedProgress = rawProgressList.sort((a: any, b: any) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA; // Decrescente
      });

      // Pega apenas a tentativa mais recente
      const latestProgress =
        sortedProgress.length > 0 ? [sortedProgress[0]] : [];

      console.log(
        `📊 Admin Errors: Filtrado para a última tentativa (de ${rawProgressList.length} para ${latestProgress.length})`
      );

      const aggregatedErrors: IncorrectAnswer[] = [];

      latestProgress.forEach((progress: any) => {
        const errorData = progress.errorDetails;

        if (!errorData) return;

        let errors: any[] = [];
        if (typeof errorData === "string") {
          if (errorData.trim() === "" || errorData === "[]") return;
          try {
            const parsed = JSON.parse(errorData);
            errors = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            console.warn(`  ⚠️ errorDetails não é JSON válido:`, e);
            return;
          }
        } else if (Array.isArray(errorData)) {
          errors = errorData;
        } else if (typeof errorData === "object" && errorData !== null) {
          errors = [errorData];
        }

        errors = errors.filter((err) => err && typeof err === "object");

        errors.forEach((err: any, idx: number) => {
          aggregatedErrors.push({
            id: `${progress.id}-${idx}`,
            moduleNumber,
            questionNumber: err.questionId ?? `${idx + 1}`,
            questionText:
              err.questionText ?? err.question ?? "Pergunta não disponível",
            userAnswer:
              err.userAnswer ?? err.answer ?? err.selected ?? "Não respondida",
            correctAnswer:
              err.expectedAnswer ?? err.correctAnswer ?? err.expected ?? "N/A",
          });
        });
      });

      // Ordena pelos números das questões
      aggregatedErrors.sort((a, b) => {
        const numA = parseInt(
          a.questionNumber.toString().split("-").pop() || "0"
        );
        const numB = parseInt(
          b.questionNumber.toString().split("-").pop() || "0"
        );
        return numA - numB;
      });

      setIncorrectAnswers(aggregatedErrors);
    } catch (error) {
      console.error("❌ Erro ao buscar erros:", error);
      setIncorrectAnswers([]);
    } finally {
      setLoading(false);
    }
  }, [userId, moduleNumber]);

  useFocusEffect(
    useCallback(() => {
      fetchIncorrectAnswers();
    }, [fetchIncorrectAnswers])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
      <ScreenHeader title={`Erros - Módulo ${moduleNumber}`} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.listHeader}>
          <MaterialCommunityIcons
            name="close-circle-outline"
            size={20}
            color="#D32F2F"
          />
          <Text style={styles.listTitle}>
            Respostas incorretas ({incorrectAnswers.length} erros)
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        ) : incorrectAnswers.length > 0 ? (
          incorrectAnswers.map((item) => (
            <IncorrectAnswerCard key={item.id} item={item} styles={styles} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="check-circle"
              size={64}
              color="#4CAF50"
            />
            <Text style={styles.emptyText}>Nenhum erro encontrado</Text>
            <Text style={styles.emptySubtext}>
              O usuário não errou questões na última tentativa deste módulo.
            </Text>
          </View>
        )}
      </ScrollView>
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
    listHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      marginTop: 10,
    },
    listTitle: {
      fontSize: 16 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      marginLeft: 8,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyContainer: { alignItems: "center", paddingVertical: 40 },
    emptyText: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 16,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptySubtext: {
      fontSize: 14 * fontMultiplier,
      color: theme.text,
      opacity: 0.7,
      marginTop: 8,
      textAlign: "center",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      marginBottom: 10,
      overflow: "hidden",
    },
    cardHeader: { padding: 15, flexDirection: "row", alignItems: "center" },
    questionNumber: {
      fontSize: 22 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginRight: 10,
      borderWidth: 2,
      borderColor: theme.cardText,
      borderRadius: 20,
      width: 40,
      height: 40,
      textAlign: "center",
      lineHeight: 36,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    questionText: {
      color: theme.cardText,
      fontSize: 16 * fontMultiplier,
      flex: 1,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 16 * fontMultiplier * lineHeight,
    },
    answerContainer: {
      backgroundColor: theme.background,
      padding: 15,
    },
    label: {
      fontSize: 12 * fontMultiplier,
      color: theme.text,
      opacity: 0.7,
      fontWeight: "bold",
      marginTop: 8,
      marginBottom: 4,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    userAnswer: {
      color: "#D32F2F",
      fontSize: 14 * fontMultiplier,
      fontWeight: "500",
      marginBottom: 8,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    correctAnswer: {
      color: "#4CAF50",
      fontSize: 14 * fontMultiplier,
      fontWeight: "500",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });
