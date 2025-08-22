import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import { generateClient } from "aws-amplify/api";
import { getUser } from "../../graphql/queries";
import { fetchAuthSession, signOut } from "@aws-amplify/auth";
import { useFocusEffect } from "@react-navigation/native";

// A linha 'const client = generateClient()' foi REMOVIDA DAQUI.

type User = {
  name: string;
  coins?: number | null;
  points?: number | null;
  modulesCompleted?: string | null;
};
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
type StatCardProps = { icon: IconName; value: string | number; label: string };
type ModuleItemProps = {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
};
type ActionButtonProps = { icon: IconName; label: string; onPress: () => void };

const StatCard = ({ icon, value, label }: StatCardProps) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={24} color="#FFC700" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);
const ModuleItem = ({ icon, title, subtitle, onPress }: ModuleItemProps) => (
  <TouchableOpacity style={styles.moduleItem} onPress={onPress}>
    <MaterialCommunityIcons
      name={icon}
      size={36}
      color="#FFC700"
      style={styles.moduleIcon}
    />
    <View style={styles.moduleTextContainer}>
      <Text style={styles.moduleTitle}>{title}</Text>
      <Text style={styles.moduleSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.moduleStatus} />
  </TouchableOpacity>
);
const ActionButton = ({ icon, label, onPress }: ActionButtonProps) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={40} color="#FFC700" />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function HomeScreen({
  navigation,
}: RootStackScreenProps<"Home">) {
  const [userData, setUserData] = useState<User | null>(null);

  const fetchUserData = async () => {
    try {
      const client = generateClient(); // A linha foi MOVIDA PARA CÁ
      const { tokens } = await fetchAuthSession();
      const userId = tokens?.accessToken.payload.sub;
      if (userId) {
        const result = await client.graphql({
          query: getUser,
          variables: { id: userId },
        });
        setUserData(result.data.getUser ?? null);
      }
    } catch (e) {
      console.log("Erro ao buscar dados do usuário na HomeScreen:", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      console.log("Erro ao fazer logout: ", error);
    }
  };

  if (!userData) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#191970" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <ScrollView>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Olá, {userData.name}!</Text>
            <Text style={styles.headerSubtitle}>
              Continue aprendendo com ASAC
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={30} color="#191970" />
          </TouchableOpacity>
        </View>
        <View style={styles.statsContainer}>
          <StatCard
            icon="hand-coin"
            value={userData.coins ?? 0}
            label="Moedas"
          />
          <StatCard
            icon="trophy-variant"
            value={(userData.points ?? 0).toLocaleString("pt-BR")}
            label="Pontos"
          />
          <StatCard
            icon="book-open-variant"
            value={userData.modulesCompleted ?? "0/3"}
            label="Módulos"
          />
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Módulos de Aprendizado</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <MaterialCommunityIcons name="cog" size={30} color="#191970" />
          </TouchableOpacity>
        </View>
        <View style={styles.modulesList}>
          <ModuleItem
            icon="baby-face-outline"
            title="Módulo 1"
            subtitle="Alfabeto Completo"
            onPress={() =>
              navigation.navigate("ModuleContent", { moduleId: 1 })
            }
          />
          <ModuleItem
            icon="hand-wave"
            title="Módulo 2"
            subtitle="Palavras em Braille"
            onPress={() =>
              navigation.navigate("ModuleContent", { moduleId: 2 })
            }
          />
          <ModuleItem
            icon="account-star"
            title="Módulo 3"
            subtitle="Formule Frases"
            onPress={() =>
              navigation.navigate("ModuleContent", { moduleId: 3 })
            }
          />
        </View>
        <View style={styles.actionsContainer}>
          <ActionButton
            icon="trophy"
            label="Ranking"
            onPress={() => navigation.navigate("Ranking")}
          />
          <ActionButton
            icon="medal"
            label="Conquista"
            onPress={() => navigation.navigate("Achievements")}
          />
          <ActionButton
            icon="rocket-launch"
            label="Progresso"
            onPress={() => navigation.navigate("Progress")}
          />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#191970" },
  modulesList: { paddingHorizontal: 20 },
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
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginTop: 30,
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: "#191970",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    width: "30%",
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
});
