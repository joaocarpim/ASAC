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
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const user = await getUserById(userId);
      setUserData(user);
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
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
    const secs = seconds % 60;
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
    ? userData.modulesCompleted.length
    : 0;

  const totalAnswers =
    (userData.correctAnswers || 0) + (userData.wrongAnswers || 0);
  const precision =
    totalAnswers > 0
      ? Math.round(((userData.correctAnswers || 0) / totalAnswers) * 100)
      : 0;

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

        <View style={styles.statsGrid}>
          <StatGridItem
            icon="hand-coin"
            value={(userData.coins || 0).toString()}
            label="Moedas"
          />
          <StatGridItem
            icon="trophy-variant"
            value={(userData.points || 0).toLocaleString("pt-BR")}
            label="Pontos"
          />
          <StatGridItem
            icon="book-open-variant"
            value={`${modulesCompleted}/3`}
            label="Módulos"
          />
          <StatGridItem
            icon="target"
            value={`${precision}%`}
            label="Precisão"
          />
          <StatGridItem
            icon="check-all"
            value={(userData.correctAnswers || 0).toString()}
            label="Acertos"
          />
          <StatGridItem
            icon="clock-time-eight-outline"
            value={formatTime(userData.timeSpent || 0)}
            label="Tempo"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Módulos</Text>
          <View style={styles.modulesButtons}>
            {[1, 2, 3].map((moduleNum) => {
              const isCompleted = Array.isArray(userData.modulesCompleted)
                ? userData.modulesCompleted.includes(moduleNum)
                : false;
              return (
                <TouchableOpacity
                  key={moduleNum}
                  style={[
                    styles.moduleButton,
                    isCompleted && styles.moduleButtonCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.moduleButtonText,
                      isCompleted && styles.moduleButtonTextCompleted,
                    ]}
                  >
                    {moduleNum}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() =>
              navigation.navigate("AdminIncorrectAnswers", { userId })
            }
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={28}
              color="#FFFFFF"
            />
            <Text style={styles.statValue}>
              {userData.wrongAnswers || 0}
            </Text>
            <Text style={styles.statLabel}>Erros</Text>
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
  cardRow: { flexDirection: "row", justifyContent: "space-between" },
  cardColumn: { flex: 1 },
  cardLabel: { color: "#CCCCCC", fontSize: 14 },
  cardValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    backgroundColor: "#191970",
    borderRadius: 12,
    width: "31%",
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
  },
  moduleButtonCompleted: {
    backgroundColor: "#191970",
  },
  moduleButtonText: { color: "#666666", fontSize: 24, fontWeight: "bold" },
  moduleButtonTextCompleted: { color: "#FFFFFF" },
  errorButton: {
    backgroundColor: "#D32F2F",
    borderRadius: 12,
    width: "31%",
    padding: 15,
    alignItems: "center",
  },
});