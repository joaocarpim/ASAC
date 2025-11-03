import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { useFocusEffect } from "@react-navigation/native";
import { getUserById } from "../../services/progressService";
import { generateClient } from "aws-amplify/api";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
type StatGridItemProps = {
  icon: IconName;
  value: string;
  label: string;
};

const StatGridItem = ({ icon, value, label }: StatGridItemProps) => (
  <View style={styles.statItem}>
    <MaterialCommunityIcons name={icon} size={28} color="#FFFFFF" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function AdminUserDetailScreen({
  route,
  navigation,
}: RootStackScreenProps<"AdminUserDetail">) {
  const { userId, userName } = route.params;
  const [userData, setUserData] = useState<any>(null);
  const [moduleProgress, setModuleProgress] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await getUserById(userId);
      setUserData(user);

      // Buscar progresso por módulo - Query corrigida
      const client = generateClient();
      const progressQuery = `
        query ListProgresses($filter: ModelProgressFilterInput) {
          listProgresses(filter: $filter) {
            items {
              id
              moduleNumber
              accuracy
              correctAnswers
              wrongAnswers
              timeSpent
              completed
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
      
      console.log("📊 Admin Detail - Progresso encontrado:", progressList);
      
      // Normalizar os dados com conversão adequada
      const normalized = progressList.map((p: any) => ({
        ...p,
        moduleNumber: typeof p.moduleNumber === "string" ? parseInt(p.moduleNumber, 10) : (p.moduleNumber || 0),
        correctAnswers: Number(p.correctAnswers ?? 0),
        wrongAnswers: Number(p.wrongAnswers ?? 0),
        timeSpent: Number(p.timeSpent ?? 0),
        accuracy: Number(p.accuracy ?? 0),
      }));
      
      console.log("📊 Admin Detail - Progresso normalizado:", normalized);
      setModuleProgress(normalized);

      // Selecionar o primeiro módulo com dados ou módulo 1
      if (normalized.length > 0) {
        setSelectedModule(normalized[0].moduleNumber);
      } else {
        setSelectedModule(1);
      }
    } catch (error) {
      console.error("❌ Erro ao buscar dados do usuário:", error);
      setModuleProgress([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
        <ScreenHeader title={userName} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#191970" />
        </View>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
        <ScreenHeader title={userName} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#191970", fontSize: 16 }}>
            Usuário não encontrado
          </Text>
        </View>
      </View>
    );
  }

  const modulesCompleted = Array.isArray(userData.modulesCompleted)
    ? userData.modulesCompleted
    : [];

  // Dados do módulo selecionado
  const selectedModuleData = moduleProgress.find(
    (m) => m.moduleNumber === selectedModule
  );

  console.log(`📊 Dados do módulo ${selectedModule}:`, selectedModuleData);

  const moduleCorrect = selectedModuleData?.correctAnswers || 0;
  const moduleWrong = selectedModuleData?.wrongAnswers || 0;
  const moduleTime = selectedModuleData?.timeSpent || 0;
  const moduleTotalAnswers = moduleCorrect + moduleWrong;
  const modulePrecision =
    moduleTotalAnswers > 0
      ? Math.round((moduleCorrect / moduleTotalAnswers) * 100)
      : 0;

  console.log(`📊 Estatísticas Módulo ${selectedModule}: ${moduleCorrect} acertos, ${moduleWrong} erros, ${modulePrecision}% precisão`);

  // Dados gerais do usuário (ACUMULADOS de todos os módulos)
  const totalCorrect = moduleProgress.reduce((sum, m) => sum + (m.correctAnswers || 0), 0);
  const totalWrong = moduleProgress.reduce((sum, m) => sum + (m.wrongAnswers || 0), 0);
  const totalTime = moduleProgress.reduce((sum, m) => sum + (m.timeSpent || 0), 0);
  const totalAnswers = totalCorrect + totalWrong;
  const totalPrecision =
    totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

  console.log(`📊 Estatísticas Totais: ${totalCorrect} acertos, ${totalWrong} erros, ${totalPrecision}% precisão`);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
      <ScreenHeader title={userName} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Email</Text>
              <Text style={styles.cardValue}>{userData.email || "N/A"}</Text>
            </View>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Role</Text>
              <Text style={styles.cardValue}>{userData.role || "user"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecionar Módulo</Text>
          <View style={styles.modulesButtons}>
            {[1, 2, 3].map((moduleNum) => {
              const isCompleted = modulesCompleted.includes(moduleNum);
              const isSelected = selectedModule === moduleNum;
              return (
                <TouchableOpacity
                  key={moduleNum}
                  style={[
                    styles.moduleButton,
                    isSelected && styles.moduleButtonSelected,
                  ]}
                  onPress={() => setSelectedModule(moduleNum)}
                >
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={20}
                        color="#4CD964"
                      />
                    </View>
                  )}
                  <Text
                    style={[
                      styles.moduleButtonText,
                      isSelected && styles.moduleButtonTextSelected,
                    ]}
                  >
                    {moduleNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatGridItem
            icon="target"
            value={`${modulePrecision}%`}
            label="Precisão"
          />
          <StatGridItem
            icon="check-all"
            value={moduleCorrect.toString()}
            label="Acertos"
          />
          <StatGridItem
            icon="close-circle"
            value={moduleWrong.toString()}
            label="Erros"
          />
          <StatGridItem
            icon="clock-time-eight-outline"
            value={formatTime(moduleTime)}
            label="Tempo"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Estatísticas Gerais (Todos os Módulos)</Text>
          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Total Acertos</Text>
              <Text style={styles.cardValue}>{totalCorrect}</Text>
            </View>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Total Erros</Text>
              <Text style={styles.cardValue}>{totalWrong}</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Tempo Total</Text>
              <Text style={styles.cardValue}>{formatTime(totalTime)}</Text>
            </View>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Precisão Total</Text>
              <Text style={styles.cardValue}>{totalPrecision}%</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Moedas</Text>
              <Text style={styles.cardValue}>{userData.coins || 0}</Text>
            </View>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Pontos</Text>
              <Text style={styles.cardValue}>
                {(userData.points || 0).toLocaleString("pt-BR")}
              </Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Módulos Concluídos</Text>
              <Text style={styles.cardValue}>{modulesCompleted.length}/3</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() =>
              navigation.navigate("AdminIncorrectAnswers", { userId })
            }
          >
            <MaterialCommunityIcons
              name="alert-circle"
              size={28}
              color="#FFFFFF"
            />
            <Text style={styles.statValue}>Ver Erros</Text>
            <Text style={styles.statLabel}>Detalhes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFEA" },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: "#191970",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  cardColumn: { flex: 1 },
  cardLabel: { color: "#CCCCCC", fontSize: 14, marginBottom: 4 },
  cardValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cardSectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    backgroundColor: "#191970",
    borderRadius: 12,
    width: "48%",
    padding: 15,
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 4,
  },
  statLabel: { color: "#FFFFFF", fontSize: 12 },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#191970",
    marginBottom: 10,
  },
  modulesButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  moduleButton: {
    backgroundColor: "#CCCCCC",
    width: "31%",
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  moduleButtonSelected: {
    backgroundColor: "#191970",
    borderWidth: 3,
    borderColor: "#FFC700",
  },
  moduleButtonText: {
    color: "#666666",
    fontSize: 24,
    fontWeight: "bold",
  },
  moduleButtonTextSelected: {
    color: "#FFFFFF",
  },
  completedBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 2,
  },
  errorButton: {
    backgroundColor: "#D32F2F",
    borderRadius: 12,
    width: "100%",
    padding: 15,
    alignItems: "center",
  },
});