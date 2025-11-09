// src/screens/admin/AdminUserDetailScreen.tsx (Corrigido)
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { useFocusEffect } from "@react-navigation/native";
import {
  getUserById,
  getModuleProgressByUser,
} from "../../services/progressService";
import { generateClient } from "aws-amplify/api";
import { listProgresses as listProgressesQuery } from "../../graphql/queries";

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
  const [selectedModule, setSelectedModule] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // ✅ Estados para os totais (Declarados APENAS AQUI)
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [totalPrecision, setTotalPrecision] = useState(0);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Busca os dados estáticos do usuário
      const user = await getUserById(userId);
      console.log("📊 Usuário completo:", user);
      setUserData(user);

      // 2. Busca TODOS os registros de progresso
      const client = generateClient();
      let allProgress: any[] = [];
      let nextToken: string | null = null;

      do {
        const result: any = await client.graphql({
          query: listProgressesQuery,
          variables: {
            filter: { userId: { eq: userId } },
            limit: 1000,
            nextToken: nextToken,
          },
          authMode: "userPool",
        });
        const items = result?.data?.listProgresses?.items || [];
        allProgress.push(...items);
        nextToken = result?.data?.listProgresses?.nextToken || null;
      } while (nextToken);

      console.log(
        "📊 Admin Detail - Progresso RAW (Todas as Tentativas):",
        allProgress.length
      );

      const attemptedProgress = allProgress.filter(
        (p) => (p.timeSpent ?? 0) > 0
      );

      // 4. Encontra a tentativa MAIS RECENTE de cada módulo
      const latestByModule: Record<number, any> = {};
      attemptedProgress.forEach((p: any) => {
        const moduleNum = Number(p.moduleNumber ?? 0);
        if (moduleNum === 0) return;
        const timestamp = p?.updatedAt || p?.createdAt || 0;
        const currentTime = new Date(timestamp).getTime();
        if (
          !latestByModule[moduleNum] ||
          currentTime >
            new Date(latestByModule[moduleNum].updatedAt || 0).getTime()
        ) {
          latestByModule[moduleNum] = p;
        }
      });

      const latestProgress = Object.values(latestByModule).map((p: any) => ({
        ...p,
        moduleNumber: Number(p.moduleNumber ?? 0),
        correctAnswers: Number(p.correctAnswers ?? 0),
        wrongAnswers: Number(p.wrongAnswers ?? 0),
        timeSpent: Number(p.timeSpent ?? 0),
        accuracy: Number(p.accuracy ?? 0),
      }));

      console.log(
        "📊 Admin Detail - Progresso (Últimas Tentativas):",
        latestProgress
      );
      setModuleProgress(latestProgress);

      // 5. Calcula os totais GERAIS com base nessas últimas tentativas
      const totals = latestProgress.reduce(
        (acc, p) => {
          acc.sumCorrect += p.correctAnswers;
          acc.sumWrong += p.wrongAnswers;
          acc.sumTime += p.timeSpent;
          acc.sumAccuracy += p.accuracy;
          return acc;
        },
        { sumCorrect: 0, sumWrong: 0, sumTime: 0, sumAccuracy: 0 }
      );

      const count = latestProgress.length;
      const avgAccuracy =
        count > 0 ? Math.round(totals.sumAccuracy / count) : 0;

      // 6. Define os estados para o "Resumo Geral"
      setTotalCorrect(totals.sumCorrect);
      setTotalWrong(totals.sumWrong);
      setTotalTime(totals.sumTime);
      setTotalPrecision(avgAccuracy);

      console.log("📊 Estatísticas Gerais (Calculadas):", {
        totalCorrect: totals.sumCorrect,
        totalWrong: totals.sumWrong,
        totalTime: totals.sumTime,
        avgAccuracy,
      });

      setSelectedModule(1);
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

  const handleResetPassword = () => {
    Alert.alert(
      "Redefinir Senha",
      `Isso enviará um email de redefinição de senha para ${userData.email}. Você tem certeza?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, redefinir",
          onPress: () =>
            console.log("Lógica de redefinir senha ainda não implementada"),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
        <ScreenHeader title={userName} />
        <View style={styles.loadingContainer}>
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
        <View style={styles.loadingContainer}>
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

  const selectedModuleData = moduleProgress.find(
    (m) => m.moduleNumber === selectedModule
  );

  const moduleCorrect = selectedModuleData?.correctAnswers ?? 0;
  const moduleWrong = selectedModuleData?.wrongAnswers ?? 0;
  const moduleTime = selectedModuleData?.timeSpent ?? 0;
  const modulePrecision = selectedModuleData?.accuracy ?? 0;

  // ======================================================
  // ✅ CORREÇÃO: As 4 linhas abaixo foram REMOVIDAS
  // não precisamos redeclará-las, pois elas já existem como 'useState'
  // ======================================================
  // const totalCorrect = ... (REMOVIDO)
  // const totalWrong = ... (REMOVIDO)
  // const totalTime = ... (REMOVIDO)
  // const totalPrecision = ... (REMOVIDO)

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
      <ScreenHeader title={userName} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={[styles.cardColumn, { flex: 2 }]}>
              <Text style={styles.cardLabel}>Nome</Text>
              <Text style={styles.cardValue}>{userData.name || "N/A"}</Text>
            </View>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Role</Text>
              <Text style={styles.cardValue}>{userData.role || "user"}</Text>
            </View>
          </View>
          <View style={[styles.cardRow, { marginBottom: 0 }]}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Email</Text>
              <Text
                style={styles.cardValue}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {userData.email || "N/A"}
              </Text>
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
          <Text style={styles.cardSectionTitle}>
            Estatísticas Gerais (Baseado na última tentativa)
          </Text>
          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Total Acertos</Text>
              {/* ✅ CORREÇÃO: Usa a variável de estado */}
              <Text style={styles.cardValue}>{totalCorrect}</Text>
            </View>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Total Erros</Text>
              {/* ✅ CORREÇÃO: Usa a variável de estado */}
              <Text style={styles.cardValue}>{totalWrong}</Text>
            </View>
          </View>
          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Tempo Total</Text>
              {/* ✅ CORREÇÃO: Usa a variável de estado */}
              <Text style={styles.cardValue}>{formatTime(totalTime)}</Text>
            </View>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Precisão Média</Text>
              {/* ✅ CORREÇÃO: Usa a variável de estado */}
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
          <View style={[styles.cardRow, { marginBottom: 0 }]}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Módulos Concluídos</Text>
              <Text style={styles.cardValue}>{modulesCompleted.length}/3</Text>
            </View>
            <View style={styles.cardColumn}></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() =>
              navigation.navigate("AdminIncorrectAnswers", {
                userId,
                moduleNumber: selectedModule,
              })
            }
          >
            <MaterialCommunityIcons
              name="alert-circle"
              size={28}
              color="#FFFFFF"
            />
            <Text style={styles.statValue}>
              Ver Erros (Módulo {selectedModule})
            </Text>
            <Text style={styles.statLabel}>Detalhes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.passwordButton}
            onPress={handleResetPassword}
          >
            <MaterialCommunityIcons
              name="lock-reset"
              size={28}
              color="#FFFFFF"
            />
            <Text style={styles.statValue}>Redefinir Senha</Text>
            <Text style={styles.statLabel}>Enviar email de redefinição</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ... Estilos (não mudam) ...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFEA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  cardColumn: { flex: 1, paddingRight: 10 },
  cardLabel: { color: "#CCCCCC", fontSize: 14, marginBottom: 4 },
  cardValue: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
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
  modulesButtons: { flexDirection: "row", justifyContent: "space-between" },
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
  moduleButtonText: { color: "#666666", fontSize: 24, fontWeight: "bold" },
  moduleButtonTextSelected: { color: "#FFFFFF" },
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
  passwordButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    width: "100%",
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
});
