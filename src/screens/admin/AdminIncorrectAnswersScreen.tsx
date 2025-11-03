import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { useFocusEffect } from "@react-navigation/native";
import { generateClient } from "aws-amplify/api";

type IncorrectAnswer = {
  id: string;
  moduleNumber?: number;
  questionNumber: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
};

type IncorrectAnswerCardProps = {
  item: IncorrectAnswer;
};

const IncorrectAnswerCard = ({ item }: IncorrectAnswerCardProps) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.questionNumber}>{item.questionNumber}</Text>
      <Text style={styles.questionText}>
        {item.moduleNumber ? `(Mód ${item.moduleNumber}) ` : ""}
        {item.questionText}
      </Text>
    </View>
    <View style={styles.answerContainer}>
      <Text style={styles.label}>Sua resposta:</Text>
      <Text style={styles.userAnswer}>{item.userAnswer}</Text>
      <Text style={styles.label}>Resposta correta:</Text>
      <Text style={styles.correctAnswer}>{item.correctAnswer}</Text>
    </View>
  </View>
);

export default function AdminIncorrectAnswersScreen({
  route,
}: RootStackScreenProps<"AdminIncorrectAnswers">) {
  const { userId } = route.params;
  const [incorrectAnswers, setIncorrectAnswers] = useState<IncorrectAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncorrectAnswers = useCallback(async () => {
    setLoading(true);
    try {
      const client = generateClient();

      // Query corrigida para buscar progresso
      const progressQuery = `
        query ListProgresses($filter: ModelProgressFilterInput) {
          listProgresses(filter: $filter) {
            items {
              id
              moduleNumber
              errorDetails
              wrongAnswers
            }
          }
        }
      `;

      const result: any = await client.graphql({
        query: progressQuery,
        variables: { 
          filter: { 
            userId: { eq: userId } 
          } 
        },
      });

      const progressList = result?.data?.listProgresses?.items || [];

      console.log("📊 Admin Errors: Raw progress list:", progressList);

      const aggregatedErrors: IncorrectAnswer[] = [];

      // Processar TODOS os erros de TODOS os módulos
      progressList.forEach((progress: any) => {
        const moduleNumber =
          typeof progress.moduleNumber === "string" 
            ? parseInt(progress.moduleNumber, 10) 
            : progress.moduleNumber;
        
        const errorData = progress.errorDetails;
        
        console.log(`🔍 Processando Módulo ${moduleNumber}:`);
        console.log("  errorDetails type:", typeof errorData);
        console.log("  errorDetails value:", errorData);

        if (!errorData) {
          console.log(`  ⚠️ Módulo ${moduleNumber}: Sem errorDetails`);
          return;
        }

        let errors: any[] = [];

        // Converter errorDetails para array de erros
        if (typeof errorData === "string") {
          try {
            const parsed = JSON.parse(errorData);
            console.log("  📄 Parsed JSON:", parsed);
            errors = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            console.warn("  ⚠️ errorDetails não é JSON válido:", e);
            return;
          }
        } else if (Array.isArray(errorData)) {
          errors = errorData;
        } else if (typeof errorData === "object" && errorData !== null) {
          errors = [errorData];
        }

        console.log(`  ✅ Módulo ${moduleNumber}: ${errors.length} erros encontrados`);

        // ADICIONAR TODOS OS ERROS
        errors.forEach((err: any, idx: number) => {
          aggregatedErrors.push({
            id: `${progress.id}-${idx}`,
            moduleNumber,
            questionNumber: err.questionNumber ?? idx + 1,
            questionText: err.questionText ?? err.question ?? "Pergunta não disponível",
            userAnswer: err.userAnswer ?? err.answer ?? err.selected ?? "Não respondida",
            correctAnswer: err.expectedAnswer ?? err.correctAnswer ?? "N/A",
          });
        });
      });

      // Ordenar por módulo e número da pergunta
      aggregatedErrors.sort((a, b) => {
        const ma = a.moduleNumber ?? 0;
        const mb = b.moduleNumber ?? 0;
        if (ma !== mb) return ma - mb;
        return a.questionNumber - b.questionNumber;
      });

      console.log(`🎯 Total de erros agregados: ${aggregatedErrors.length}`);
      setIncorrectAnswers(aggregatedErrors);
    } catch (error) {
      console.error("❌ Erro ao buscar erros:", error);
      setIncorrectAnswers([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchIncorrectAnswers();
    }, [fetchIncorrectAnswers])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
      <ScreenHeader title="Erros do Usuário" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Erros encontrados</Text>

        <View style={styles.listHeader}>
          <MaterialCommunityIcons
            name="close-circle-outline"
            size={20}
            color="#D32F2F"
          />
          <Text style={styles.listTitle}>
            Todas as respostas incorretas ({incorrectAnswers.length} erros)
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#191970" />
          </View>
        ) : incorrectAnswers.length > 0 ? (
          incorrectAnswers.map((item) => (
            <IncorrectAnswerCard key={item.id} item={item} />
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
              O usuário não errou questões ou ainda não fez módulos.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFEA" },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#191970",
    marginBottom: 10,
    marginTop: 10,
  },
  listHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  listTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#191970",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#191970",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#191970",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  cardHeader: { padding: 15, flexDirection: "row", alignItems: "center" },
  questionNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    textAlign: "center",
    lineHeight: 36,
  },
  questionText: { color: "#FFFFFF", fontSize: 16, flex: 1 },
  answerContainer: { backgroundColor: "#F5F5F5", padding: 15 },
  label: {
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  userAnswer: {
    color: "#D32F2F",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  correctAnswer: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "500",
  },
});