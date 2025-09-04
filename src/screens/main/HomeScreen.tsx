// src/screens/main/HomeScreen.tsx
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { getUserById } from "../../services/progressService";
import { canStartModule } from "../../services/progressService";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const StatCard = ({ icon, value, label }: { icon: IconName; value: string | number; label: string }) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={24} color="#FFC700" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ModuleItem = ({ icon, title, subtitle, onPress }: { icon: IconName; title: string; subtitle: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.moduleItem} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={36} color="#FFC700" style={styles.moduleIcon} />
    <View style={styles.moduleTextContainer}>
      <Text style={styles.moduleTitle}>{title}</Text>
      <Text style={styles.moduleSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.moduleStatus} />
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }: RootStackScreenProps<"Home">) {
  const { user, refreshUserFromDB } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      const u = await getUserById(user.userId);
      setDbUser(u);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    // refresh when coming back
    const unsubscribe = navigation.addListener("focus", () => {
      refreshUserFromDB();
    });
    return unsubscribe;
  }, [navigation]);

  const openModule = async (moduleNumber: number) => {
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }
    const allowed = await canStartModule(user.userId, moduleNumber);
    if (!allowed) {
      Alert.alert("Bloqueado", "Conclua o módulo anterior antes de continuar.");
      return;
    }
    navigation.navigate("ModuleContent", { moduleId: moduleNumber });
  };

  if (!user || loading || !dbUser) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#191970" />
        <Text style={styles.loadingText}>Carregando seus dados...</Text>
      </View>
    );
  }

  const modulesCompleted = dbUser.modulesCompleted || "0/3";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <ScrollView>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Olá, {dbUser.name || user.name}!</Text>
            <Text style={styles.headerSubtitle}>Continue aprendendo com ASAC</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <MaterialCommunityIcons name="cog" size={30} color="#191970" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <StatCard icon="hand-coin" value={dbUser.coins ?? 0} label="Moedas" />
          <StatCard icon="trophy-variant" value={(dbUser.points ?? 0).toLocaleString("pt-BR")} label="Pontos" />
          <StatCard icon="book-open-variant" value={modulesCompleted} label="Módulos" />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Módulos de Aprendizado</Text>
        </View>

        <View style={styles.modulesList}>
          <ModuleItem icon="baby-face-outline" title="Módulo 1" subtitle="Aprendendo o Alfabeto" onPress={() => openModule(1)} />
          <ModuleItem icon="hand-wave" title="Módulo 2" subtitle="Palavras em Braille" onPress={() => openModule(2)} />
          <ModuleItem icon="account-star" title="Módulo 3" subtitle="Formule Frases" onPress={() => openModule(3)} />
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Ranking")}>
            <MaterialCommunityIcons name="trophy" size={28} color="#FFC700" />
            <Text style={styles.actionLabel}>Ranking</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Achievements")}>
            <MaterialCommunityIcons name="medal" size={28} color="#FFC700" />
            <Text style={styles.actionLabel}>Conquistas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Progress")}>
            <MaterialCommunityIcons name="rocket-launch" size={28} color="#FFC700" />
            <Text style={styles.actionLabel}>Progresso</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#191970" },
  headerSubtitle: { fontSize: 14, color: "#191970" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  statCard: {
    backgroundColor: "#191970",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    width: "30%",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 4,
  },
  statLabel: { color: "#FFFFFF", fontSize: 12 },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#191970" },
  modulesList: { paddingHorizontal: 20, marginTop: 10 },
  moduleItem: {
    backgroundColor: "#191970",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  moduleIcon: { marginRight: 15 },
  moduleTextContainer: { flex: 1 },
  moduleTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
  moduleSubtitle: { color: "#FFFFFF", fontSize: 14 },
  moduleStatus: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: "#FFC700",
  },
  actionsContainer: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 10, marginTop: 30, marginBottom: 40 },
  actionButton: { backgroundColor: "#191970", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 10, alignItems: "center", width: "28%" },
  actionLabel: { color: "#FFFFFF", fontSize: 12, fontWeight: "bold", marginTop: 6 },
  loadingText: { color: "#191970", fontSize: 16, marginTop: 10, textAlign: "center" },
});
