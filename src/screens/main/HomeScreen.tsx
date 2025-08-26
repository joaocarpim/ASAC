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
import { signOut } from "@aws-amplify/auth";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";

// O tipo de dados que esperamos do nosso banco de dados (DynamoDB)
type UserData = {
  name: string;
  coins?: number | null;
  points?: number | null;
  modulesCompleted?: string | null;
};

// Tipos para os componentes auxiliares
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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const { user, updateUserData } = useAuthStore();

  console.log("🏠 HomeScreen: user do store:", user);

  // Função para buscar os dados do usuário no banco de dados
  const fetchUserData = async () => {
    if (!user) {
      console.log("❌ HomeScreen: Sem usuário no store");
      setIsLoadingUserData(false);
      return;
    }

    try {
      console.log("🔍 HomeScreen: Buscando dados do usuário:", user.userId);
      const client = generateClient();

      const result = await client.graphql({
        query: getUser,
        variables: { id: user.userId },
      });

      if (result.data.getUser) {
        console.log("✅ HomeScreen: Dados encontrados");
        const dbUserData = result.data.getUser;

        // Atualiza os dados locais
        setUserData({
          name: dbUserData.name || user.name || user.username,
          coins: dbUserData.coins,
          points: dbUserData.points,
          modulesCompleted: dbUserData.modulesCompleted,
        });

        // Atualiza o store global também
        updateUserData({
          name: dbUserData.name || user.name,
          coins: dbUserData.coins || 0,
          points: dbUserData.points || 0,
          modulesCompleted: dbUserData.modulesCompleted || "0/3",
        });
      } else {
        console.log(
          "⚠️ HomeScreen: Usuário não encontrado no DB, usando dados do store"
        );
        // Se não encontrar no DB, usa os dados que já temos no store
        setUserData({
          name: user.name || user.username,
          coins: user.coins || 0,
          points: user.points || 0,
          modulesCompleted: user.modulesCompleted || "0/3",
        });
      }
    } catch (e) {
      console.log("❌ HomeScreen: Erro ao buscar dados:", e);
      // Em caso de erro, usa os dados do store
      if (user) {
        setUserData({
          name: user.name || user.username,
          coins: user.coins || 0,
          points: user.points || 0,
          modulesCompleted: user.modulesCompleted || "0/3",
        });
      }
    } finally {
      setIsLoadingUserData(false);
    }
  };

  // useFocusEffect garante que os dados sejam recarregados sempre que o usuário voltar para esta tela
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 HomeScreen: Recarregando dados...");
      fetchUserData();
    }, [user])
  );

  // Função de logout simplificada
  const handleLogout = async () => {
    try {
      console.log("🚪 HomeScreen: Fazendo logout...");
      await signOut();
      // O Hub no App.tsx cuidará do redirecionamento
    } catch (error) {
      console.log("❌ HomeScreen: Erro no logout:", error);
    }
  };

  // Se não tiver usuário no store, algo está errado
  if (!user) {
    console.log("❌ HomeScreen: Sem usuário - redirecionando...");
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text style={styles.errorText}>Erro: Usuário não encontrado</Text>
      </View>
    );
  }

  // Mostra loading enquanto busca dados adicionais
  if (isLoadingUserData || !userData) {
    console.log("⏳ HomeScreen: Carregando dados do usuário...");
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#191970" />
        <Text style={styles.loadingText}>Carregando seus dados...</Text>
      </View>
    );
  }

  console.log("✅ HomeScreen: Renderizando com dados:", userData);

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
  loadingText: {
    color: "#191970",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  errorText: {
    color: "#191970",
    fontSize: 16,
    textAlign: "center",
  },
});
