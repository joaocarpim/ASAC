import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
import { useSettings } from "../../hooks/useSettings";
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";
import { useAuthStore } from "../../store/authStore";
import { getUserById } from "../../services/progressService";
import { generateClient } from "aws-amplify/api";

export default function ProgressScreen() {
  const navigation = useNavigation();
  const { theme } = useContrast();
  const { user } = useAuthStore();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const [userData, setUserData] = useState<any>(null);
  const [modulesCompleted, setModulesCompleted] = useState<number[]>([]);
  const [progressList, setProgressList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const fetchUserProgress = useCallback(async () => {
    if (!user?.userId) return;

    setLoading(true);
    try {
      const uData = await getUserById(user.userId);
      if (uData) {
        setUserData(uData);
        setModulesCompleted(
          Array.isArray(uData.modulesCompleted) 
            ? uData.modulesCompleted.map((m: any) => Number(m)) 
            : []
        );
      }

      // BUSCAR DADOS DA TABELA PROGRESS - Query corrigida
      const client: any = generateClient();
      const progressQuery = `
        query ListProgresses($filter: ModelProgressFilterInput) {
          listProgresses(filter: $filter) {
            items {
              id
              userId
              moduleNumber
              correctAnswers
              wrongAnswers
              totalQuestions
              completedAt
              errorDetails
            }
          }
        }
      `;

      const result: any = await client.graphql({
        query: progressQuery,
        variables: {
          filter: {
            userId: { eq: user.userId }
          }
        }
      });

      const progressData = result?.data?.listProgresses;

      console.log("📊 Raw progress data:", progressData);

      if (progressData?.items) {
        const normalized = progressData.items.map((p: any) => ({
          ...p,
          moduleNumber: typeof p.moduleNumber === "string" ? parseInt(p.moduleNumber, 10) : (p.moduleNumber || 0),
          correctAnswers: Number(p.correctAnswers ?? 0),
          wrongAnswers: Number(p.wrongAnswers ?? 0),
          totalQuestions: Number(p.totalQuestions ?? 60),
        }));
        
        console.log("📊 Normalized progress:", normalized);
        setProgressList(normalized);
      } else {
        console.warn("⚠️ Nenhum dado de progresso encontrado");
        setProgressList([]);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar progresso:", error);
      setProgressList([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useFocusEffect(
    useCallback(() => {
      fetchUserProgress();
    }, [fetchUserProgress])
  );

  const handleGoBack = () => navigation.goBack();

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleGoBack);

  const renderModuleCard = (moduleNum: number) => {
    const progress = progressList.find((p) => p.moduleNumber === moduleNum);
    
    console.log(`📊 Renderizando Módulo ${moduleNum}:`, progress);
    
    const totalQuestions = progress?.totalQuestions || 60;
    const correctAnswers = progress?.correctAnswers || 0;
    const wrongAnswers = progress?.wrongAnswers || 0;
    const totalAnswered = correctAnswers + wrongAnswers;
    const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;

    console.log(`📊 Módulo ${moduleNum} stats: ${correctAnswers} acertos, ${wrongAnswers} erros, ${accuracy.toFixed(1)}% precisão`);

    return (
      <View key={moduleNum} style={styles.moduleCard}>
        <View style={styles.moduleHeader}>
          <View style={styles.moduleTitleContainer}>
            <MaterialCommunityIcons
              name="book-open-variant"
              size={24}
              color="#4CAF50"
            />
            <Text style={styles.moduleTitle}>Módulo {moduleNum}</Text>
          </View>
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color="#4CAF50"
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={20}
              color="#4CAF50"
            />
            <Text style={styles.statLabel}>Acertos</Text>
            <Text style={styles.statValue}>{correctAnswers}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="close-circle-outline"
              size={20}
              color="#F44336"
            />
            <Text style={styles.statLabel}>Erros</Text>
            <Text style={styles.statValue}>{wrongAnswers}</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <MaterialCommunityIcons name="percent" size={20} color="#2196F3" />
            <Text style={styles.statLabel}>Aproveitamento</Text>
            <Text style={styles.statValue}>{accuracy.toFixed(1)}%</Text>
          </View>
        </View>

        {progress?.completedAt && (
          <Text style={styles.completedDate}>
            Concluído em: {new Date(progress.completedAt).toLocaleDateString('pt-BR')}
          </Text>
        )}

        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            (navigation as any).navigate("IncorrectAnswers", { moduleNumber: moduleNum })
          }
        >
          <Text style={styles.detailsButtonText}>Ver Respostas Erradas</Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color="#2196F3"
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <GestureDetector gesture={flingRight}>
        <View style={styles.page}>
          <StatusBar
            barStyle={theme.statusBarStyle}
            backgroundColor={theme.background}
          />
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} accessibilityLabel="Voltar">
              <MaterialCommunityIcons
                name="arrow-left"
                size={28}
                color={theme.text}
              />
            </TouchableOpacity>
            <AccessibleHeader level={1} style={styles.headerTitle}>
              Meu Progresso
            </AccessibleHeader>
            <View style={styles.headerIconPlaceholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        </View>
      </GestureDetector>
    );
  }

  return (
    <GestureDetector gesture={flingRight}>
      <View style={styles.page}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} accessibilityLabel="Voltar">
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color={theme.text}
            />
          </TouchableOpacity>
          <AccessibleHeader level={1} style={styles.headerTitle}>
            Meu Progresso
          </AccessibleHeader>
          <View style={styles.headerIconPlaceholder} />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          <AccessibleView accessibilityText="Troféu de progresso">
            <Text style={styles.trophyEmoji}>🏆</Text>
          </AccessibleView>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo Geral</Text>
            <Text style={styles.summaryText}>
              Módulos Concluídos: {modulesCompleted.length}
            </Text>
          </View>

          <View style={styles.modulesContainer}>
            <Text style={styles.sectionTitle}>Módulos Concluídos</Text>
            {modulesCompleted.length > 0 ? (
              modulesCompleted.map((moduleNum) => renderModuleCard(Number(moduleNum)))
            ) : (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons
                  name="emoticon-sad-outline"
                  size={50}
                  color={theme.cardText}
                  style={{ opacity: 0.5 }}
                />
                <Text style={styles.emptyTitle}>Nenhum Módulo Concluído</Text>
                <Text style={styles.emptySubtitle}>
                  Complete um módulo para ver seu progresso aqui!
                </Text>
              </View>
            )}
          </View>
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
    page: { flex: 1, backgroundColor: theme.background },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 15,
      paddingHorizontal: 20,
    },
    headerTitle: {
      color: theme.text,
      opacity: 0.8,
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    headerIconPlaceholder: { width: 28 },
    container: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 30,
    },
    trophyEmoji: {
      fontSize: 80,
      marginBottom: 20,
      textAlign: "center",
    },
    summaryCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: "center",
    },
    summaryTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginBottom: 10,
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    summaryText: {
      fontSize: 16 * fontMultiplier,
      color: theme.cardText,
      lineHeight: 16 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    modulesContainer: { marginTop: 10 },
    sectionTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 15,
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    moduleCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 15,
    },
    moduleHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },
    moduleTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    moduleTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginLeft: 10,
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 15,
    },
    statItem: {
      alignItems: "center",
    },
    statDivider: {
      width: 1,
      backgroundColor: theme.cardText,
      opacity: 0.2,
    },
    statLabel: {
      fontSize: 12 * fontMultiplier,
      color: theme.cardText,
      marginTop: 5,
      opacity: 0.7,
      lineHeight: 12 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    statValue: {
      fontSize: 20 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginTop: 5,
      lineHeight: 20 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    completedDate: {
      fontSize: 12 * fontMultiplier,
      color: theme.cardText,
      opacity: 0.6,
      textAlign: "center",
      marginBottom: 10,
      lineHeight: 12 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    detailsButton: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
      padding: 12,
      borderRadius: 8,
    },
    detailsButtonText: {
      fontSize: 14 * fontMultiplier,
      color: "#2196F3",
      marginRight: 5,
      fontWeight: isBold ? "bold" : "600",
      lineHeight: 14 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptyCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 30,
      alignItems: "center",
      marginTop: 20,
    },
    emptyTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginTop: 15,
      marginBottom: 8,
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptySubtitle: {
      fontSize: 14 * fontMultiplier,
      color: theme.cardText,
      textAlign: "center",
      opacity: 0.8,
      lineHeight: 20 * lineHeight,
      fontWeight: isBold ? "bold" : "normal",
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });