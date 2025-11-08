import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { generateClient } from "aws-amplify/api";
import { listProgresses } from "../../graphql/queries";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type StatItemProps = {
  icon: IconName;
  value: string;
  label: string;
  color?: string;
  delay?: number;
};

const StatItem = ({
  icon,
  value,
  label,
  color = "#FFFFFF",
  delay = 0,
}: StatItemProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.statItem,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={32} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

type ModuleCardProps = {
  moduleNumber: number;
  accuracy: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number;
  onPress: () => void;
  index: number;
};

const ModuleCard = ({
  moduleNumber,
  accuracy,
  correctAnswers,
  wrongAnswers,
  timeSpent,
  onPress,
  index,
}: ModuleCardProps) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const totalQuestions = correctAnswers + wrongAnswers;
  const isPerfect = wrongAnswers === 0 && correctAnswers > 0;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={styles.moduleCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Header do Card */}
        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View style={styles.moduleNumberBadge}>
              <Text style={styles.moduleNumberText}>{moduleNumber}</Text>
            </View>
            <View>
              <Text style={styles.moduleTitle}>Módulo {moduleNumber}</Text>
              <Text style={styles.moduleSubtitle}>
                {totalQuestions} {totalQuestions === 1 ? "questão" : "questões"}
              </Text>
            </View>
          </View>
          {isPerfect && (
            <MaterialCommunityIcons name="crown" size={28} color="#FFD700" />
          )}
        </View>

        {/* Badge de Aproveitamento */}
        <View style={styles.accuracySection}>
          <View
            style={[
              styles.accuracyBadge,
              accuracy >= 90
                ? styles.accuracyExcellent
                : accuracy >= 70
                  ? styles.accuracyGood
                  : styles.accuracyBad,
            ]}
          >
            <MaterialCommunityIcons
              name={
                accuracy >= 90
                  ? "trophy"
                  : accuracy >= 70
                    ? "thumb-up"
                    : "alert"
              }
              size={20}
              color="#FFFFFF"
            />
            <Text style={styles.accuracyText}>{accuracy}%</Text>
          </View>
          <Text style={styles.accuracyLabel}>
            {accuracy >= 90
              ? "Excelente!"
              : accuracy >= 70
                ? "Aprovado"
                : "Pode Melhorar"}
          </Text>
        </View>

        {/* Estatísticas Detalhadas */}
        <View style={styles.moduleStatsGrid}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color="#4CAF50"
            />
            <Text style={styles.statValue}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Acertos</Text>
          </View>

          <View style={styles.statBox}>
            <MaterialCommunityIcons
              name="close-circle"
              size={24}
              color="#F44336"
            />
            <Text style={styles.statValue}>{wrongAnswers}</Text>
            <Text style={styles.statLabel}>Erros</Text>
          </View>

          <View style={styles.statBox}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color="#2196F3"
            />
            <Text style={styles.statValue}>{formatTime(timeSpent)}</Text>
            <Text style={styles.statLabel}>Tempo</Text>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.moduleFooter}>
          <Text style={styles.viewDetailsText}>Ver erros detalhados</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#191970"
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function ProgressScreen({
  navigation,
}: RootStackScreenProps<"Progress">) {
  const user = useAuthStore((state) => state.user);
  const [moduleProgress, setModuleProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(0);

  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  const fetchProgressData = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const client = generateClient();
      const result: any = await client.graphql({
        query: listProgresses,
        variables: {
          filter: {
            userId: { eq: user.userId },
          },
        },
        authMode: "userPool",
      });

      const progressList = result?.data?.listProgresses?.items || [];

      const latestByModule: Record<number, any> = {};

      progressList.forEach((p: any) => {
        const moduleNum = Number(p.moduleNumber ?? 0);
        const completedAt = p.completedAt
          ? new Date(p.completedAt).getTime()
          : 0;

        if (
          !latestByModule[moduleNum] ||
          completedAt >
            new Date(latestByModule[moduleNum].completedAt).getTime()
        ) {
          latestByModule[moduleNum] = p;
        }
      });

      const latestProgress = Object.values(latestByModule)
        .map((p: any) => ({
          ...p,
          moduleNumber: Number(p.moduleNumber ?? 0),
          correctAnswers: Number(p.correctAnswers ?? 0),
          wrongAnswers: Number(p.wrongAnswers ?? 0),
          timeSpent: Number(p.timeSpent ?? 0),
          accuracy: Number(p.accuracy ?? 0),
        }))
        .sort((a, b) => a.moduleNumber - b.moduleNumber);

      setModuleProgress(latestProgress);

      let sumCorrect = 0;
      let sumWrong = 0;
      let sumTime = 0;
      let sumAccuracy = 0;
      let count = 0;

      latestProgress.forEach((p) => {
        sumCorrect += p.correctAnswers;
        sumWrong += p.wrongAnswers;
        sumTime += p.timeSpent;
        sumAccuracy += p.accuracy;
        count++;
      });

      setTotalCorrect(sumCorrect);
      setTotalWrong(sumWrong);
      setTotalTime(sumTime);
      setAvgAccuracy(count > 0 ? Math.round(sumAccuracy / count) : 0);

      // Animar header
      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("❌ Erro ao buscar progresso:", error);
      setModuleProgress([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useFocusEffect(
    useCallback(() => {
      fetchProgressData();
    }, [fetchProgressData])
  );

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
        <ScreenHeader title="Progresso" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#191970" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
      <ScreenHeader title="Progresso" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View
          style={[styles.summaryCard, { opacity: headerFadeAnim }]}
        >
          <Text style={styles.sectionTitle}>📊 Resumo Geral</Text>
          <Text style={styles.sectionSubtitle}>
            Baseado nas últimas tentativas de cada módulo
          </Text>

          <View style={styles.statsGrid}>
            <StatItem
              icon="target"
              value={`${avgAccuracy}%`}
              label="Precisão Média"
              color="#FFC107"
              delay={0}
            />
            <StatItem
              icon="check-all"
              value={totalCorrect.toString()}
              label="Total Acertos"
              color="#4CAF50"
              delay={100}
            />
            <StatItem
              icon="close-circle"
              value={totalWrong.toString()}
              label="Total Erros"
              color="#F44336"
              delay={200}
            />
            <StatItem
              icon="clock-time-eight-outline"
              value={formatTime(totalTime)}
              label="Tempo Total"
              color="#2196F3"
              delay={300}
            />
            <StatItem
              icon="book-open-variant"
              value={moduleProgress.length.toString()}
              label="Módulos Feitos"
              color="#9C27B0"
              delay={400}
            />
            <StatItem
              icon="trophy"
              value={(user?.points ?? 0).toLocaleString("pt-BR")}
              label="Pontos"
              color="#FF9800"
              delay={500}
            />
          </View>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitleDark}>📚 Desempenho por Módulo</Text>
          <Text style={styles.sectionSubtitleDark}>
            Clique para ver os erros detalhados
          </Text>

          {moduleProgress.length > 0 ? (
            moduleProgress.map((p, index) => (
              <ModuleCard
                key={p.id}
                moduleNumber={p.moduleNumber}
                accuracy={p.accuracy}
                correctAnswers={p.correctAnswers}
                wrongAnswers={p.wrongAnswers}
                timeSpent={p.timeSpent}
                index={index}
                onPress={() =>
                  navigation.navigate("IncorrectAnswers", {
                    moduleNumber: p.moduleNumber,
                  })
                }
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="book-outline"
                size={64}
                color="#CCCCCC"
              />
              <Text style={styles.emptyText}>
                Você ainda não completou nenhum módulo
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFEA" },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  summaryCard: {
    backgroundColor: "#191970",
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#CCCCCC",
    marginBottom: 16,
  },
  sectionTitleDark: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#191970",
    marginBottom: 4,
  },
  sectionSubtitleDark: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "31%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 6,
  },
  statLabel: {
    color: "#CCCCCC",
    fontSize: 11,
    textAlign: "center",
    marginTop: 4,
  },

  section: { marginBottom: 20 },
  moduleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  moduleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  moduleNumberBadge: {
    backgroundColor: "#191970",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  moduleNumberText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#191970",
  },
  moduleSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  accuracySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  accuracyBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  accuracyExcellent: {
    backgroundColor: "#4CAF50",
  },
  accuracyGood: {
    backgroundColor: "#FF9800",
  },
  accuracyBad: {
    backgroundColor: "#F44336",
  },
  accuracyText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  accuracyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  moduleStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  statBox: {
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#191970",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  moduleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#191970",
  },

  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },

  // Novos estilos dos cards de módulo
  moduleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  moduleNumberBadge: {
    backgroundColor: "#191970",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  moduleNumberText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  moduleSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  accuracySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  accuracyExcellent: {
    backgroundColor: "#4CAF50",
  },
  accuracyGood: {
    backgroundColor: "#FF9800",
  },
  accuracyBad: {
    backgroundColor: "#F44336",
  },
  accuracyLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  moduleStatsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  statBox: {
    alignItems: "center",
    gap: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#191970",
  },
  moduleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#191970",
  },
});
