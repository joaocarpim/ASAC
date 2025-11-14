// src/screens/admin/AdminDashboardScreen.tsx (Com logs de depuração)
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ImageSourcePropType,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { getAllUsers } from "../../services/progressService";

import { generateClient } from "aws-amplify/api";
import {
  deleteUser as deleteUserMutation,
  adminDeleteCognitoUser,
  deleteProgress,
  deleteAchievement,
} from "../../graphql/mutations";
import { listProgresses, listAchievements } from "../../graphql/queries";

type User = import("../../store/authStore").User & {
  id: string;
  email: string;
};

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
type StatCardProps = { icon: IconName; value: string; label: string };
type UserListItemProps = {
  item: User;
  onPress: () => void;
  onDelete: () => void;
};

// ... (Componentes StatCard e UserListItem não mudam)
const StatCard = ({ icon, value, label }: StatCardProps) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={28} color="#FFFFFF" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);
const UserListItem = ({ item, onPress, onDelete }: UserListItemProps) => {
  const modulesCount = Array.isArray(item.modulesCompleted)
    ? item.modulesCompleted.length
    : 0;
  return (
    <View style={styles.userItem}>
      <TouchableOpacity onPress={onPress} style={styles.userInfoClickable}>
        <Image
          source={require("../../assets/images/avatar1.png")}
          style={styles.userAvatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={styles.userStats}>
            <MaterialCommunityIcons
              name="hand-coin"
              color="#FFC700"
              size={14}
            />
            <Text style={styles.userStatText}>{item.coins ?? 0}</Text>
            <MaterialCommunityIcons
              name="trophy-variant"
              color="#FFC700"
              size={14}
              style={{ marginLeft: 8 }}
            />
            <Text style={styles.userStatText}>
              {(item.points ?? 0).toLocaleString("pt-BR")}
            </Text>
            <MaterialCommunityIcons
              name="book-open-variant"
              color="#FFC700"
              size={14}
              style={{ marginLeft: 8 }}
            />
            <Text style={styles.userStatText}>{modulesCount}/3</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={28}
          color="#FF8A8A"
        />
      </TouchableOpacity>
    </View>
  );
};

export default function AdminDashboardScreen({
  navigation,
}: RootStackScreenProps<"AdminDashboard">) {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    averageProgress: 0,
  });

  // ... (funções calculateStats, fetchUsers, useFocusEffect, handleLogout não mudam)
  const calculateStats = (userList: User[]) => {
    const totalUsers = userList.length;
    const activeUsers = userList.filter(
      (u: User) => (u.currentModule ?? 0) > 1 || (u.points ?? 0) > 0
    ).length;
    const totalModulesCompleted = userList.reduce((sum, user) => {
      const modules = Array.isArray(user.modulesCompleted)
        ? user.modulesCompleted.length
        : 0;
      return sum + modules;
    }, 0);
    const averageProgress =
      totalUsers > 0
        ? Math.round((totalModulesCompleted / (totalUsers * 3)) * 100)
        : 0;
    setStats({ totalUsers, activeUsers, averageProgress });
  };
  const fetchUsers = async () => {
    if (!loading) setLoading(true);
    try {
      const allUsers = (await getAllUsers()) as User[];
      const assistidos = allUsers.filter((u: User) => !u.isAdmin);
      setUsers(assistidos);
      calculateStats(assistidos);
    } catch (error: any) {
      console.error("Erro final ao buscar usuários:", error);
      Alert.alert(
        "Erro",
        "Não foi possível buscar os usuários. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchUsers();
      } else {
        console.warn("AdminDashboard montado sem usuário no store.");
        setLoading(false);
      }
    }, [user])
  );
  const handleLogout = async () => {
    useAuthStore.getState().signOut();
  };

  // ✅ FUNÇÃO DE APAGAR ATUALIZADA COM LOGS
  const handleDeleteUser = (userToDelete: User) => {
    console.log(
      `🔴 [DELETE_USER] P0: Botão de lixeira clicado para ${userToDelete.name}`
    );

    if (!userToDelete.email) {
      console.error(`🔴 [DELETE_USER] P1: FALHA. Usuário não tem email.`);
      Alert.alert(
        "Erro",
        "Não foi possível apagar o usuário pois ele não tem um email registrado no banco de dados."
      );
      return;
    }

    console.log(
      `🟡 [DELETE_USER] P1: Validação de email OK. Mostrando modal...`
    );

    Alert.alert(
      "Apagar Usuário (Cognito e DB)",
      `Você tem CERTEZA que quer apagar ${
        userToDelete.name ?? "este usuário"
      } (${userToDelete.email})? Esta ação é IRREVERSÍVEL e apagará a conta do Cognito e TODOS os dados de progresso e conquistas do DynamoDB.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () =>
            console.log("🟡 [DELETE_USER] P2: Ação cancelada pelo usuário."),
        },
        {
          text: "Apagar Permanentemente",
          style: "destructive",
          onPress: async () => {
            console.log(
              `🟡 [DELETE_USER] P2: Usuário confirmou. Iniciando exclusão...`
            );
            setLoading(true);
            try {
              const client = generateClient();

              // ETAPA 1
              console.log(
                `🟡 [DELETE_USER] P3: Buscando progresso de ${userToDelete.id}`
              );
              const progressResult: any = await client.graphql({
                query: listProgresses,
                variables: { filter: { userId: { eq: userToDelete.id } } },
                authMode: "userPool",
              });
              const progressItems = progressResult.data.listProgresses.items;
              console.log(
                `🟢 [DELETE_USER] P3: Encontrado(s) ${progressItems.length} registro(s) de progresso.`
              );

              // ETAPA 2
              console.log(
                `🟡 [DELETE_USER] P4: Buscando conquistas de ${userToDelete.id}`
              );
              const achievementsResult: any = await client.graphql({
                query: listAchievements,
                variables: { filter: { userId: { eq: userToDelete.id } } },
                authMode: "userPool",
              });
              const achievementItems =
                achievementsResult.data.listAchievements.items;
              console.log(
                `🟢 [DELETE_USER] P4: Encontrada(s) ${achievementItems.length} conquista(s).`
              );

              // ETAPA 3 & 4
              const progressDeletions = progressItems.map((p: any) =>
                client.graphql({
                  query: deleteProgress,
                  variables: { input: { id: p.id } },
                  authMode: "userPool",
                })
              );
              const achievementDeletions = achievementItems.map((a: any) =>
                client.graphql({
                  query: deleteAchievement,
                  variables: { input: { id: a.id } },
                  authMode: "userPool",
                })
              );

              if (
                progressDeletions.length > 0 ||
                achievementDeletions.length > 0
              ) {
                console.log(
                  `🟡 [DELETE_USER] P5: Apagando ${progressDeletions.length} progressos e ${achievementDeletions.length} conquistas...`
                );
                await Promise.all([
                  ...progressDeletions,
                  ...achievementDeletions,
                ]);
                console.log("🟢 [DELETE_USER] P5: Dependências apagadas.");
              } else {
                console.log(
                  "🟢 [DELETE_USER] P5: Nenhuma dependência (progresso/conquista) para apagar."
                );
              }

              // ETAPA 5
              console.log(
                `🟡 [DELETE_USER] P6: Apagando do Cognito: ${userToDelete.email}`
              );
              const cognitoResult: any = await client.graphql({
                query: adminDeleteCognitoUser,
                variables: { username: userToDelete.email },
                authMode: "userPool",
              });

              if (cognitoResult.errors) {
                throw new Error(
                  cognitoResult.errors[0].message ||
                    "Falha ao apagar do Cognito"
                );
              }
              console.log(
                `🟢 [DELETE_USER] P6: Usuário ${userToDelete.email} apagado do Cognito.`
              );

              // ETAPA 6
              console.log(
                `🟡 [DELETE_USER] P7: Apagando do DynamoDB: ${userToDelete.id}`
              );
              await client.graphql({
                query: deleteUserMutation,
                variables: { input: { id: userToDelete.id } },
                authMode: "userPool",
              });
              console.log(
                `🟢 [DELETE_USER] P7: Usuário ${userToDelete.id} apagado do DynamoDB.`
              );

              // ETAPA 7
              console.log(`🟡 [DELETE_USER] P8: Atualizando UI...`);
              const updatedUsers = users.filter(
                (u) => u.id !== userToDelete.id
              );
              setUsers(updatedUsers);
              calculateStats(updatedUsers);

              Alert.alert(
                "Sucesso",
                `${userToDelete.name ?? "Usuário"} foi apagado permanentemente.`
              );
            } catch (error: any) {
              // ✅ LOG DE ERRO MELHORADO
              console.error("🔴🔴🔴 [DELETE_USER] ERRO FATAL:", error);
              Alert.alert(
                "Erro na Exclusão",
                `Não foi possível apagar o usuário: ${error.message || error}`
              );
            } finally {
              console.log(
                "🟡 [DELETE_USER] P9: Finalizando, setLoading(false)."
              );
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    // ... (Seu JSX de retorno permanece exatamente o mesmo)
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons
            name="account-cog"
            size={32}
            color="#191970"
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerTitle}>Painel Administrativo</Text>
            <Text style={styles.headerSubtitle}>Gestão completa da ASAC</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={30} color="#191970" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          icon="account-group"
          value={stats.totalUsers.toString()}
          label="Assistidos"
        />
        <StatCard
          icon="account-check"
          value={stats.activeUsers.toString()}
          label="Ativos"
        />
        <StatCard
          icon="chart-donut"
          value={`${stats.averageProgress}%`}
          label="Progresso Médio"
        />
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Procurar assistido..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Lista de assistidos</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AdminRegisterUser")}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#191970" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={users.filter((user: User) =>
            (user.name ?? "").toLowerCase().includes(searchQuery.toLowerCase())
          )}
          keyExtractor={(item: User) => item.id}
          renderItem={({ item }) => (
            <UserListItem
              item={item}
              onPress={() =>
                navigation.navigate("AdminUserDetail", {
                  userId: item.id,
                  userName: item.name ?? "Usuário",
                })
              }
              onDelete={() => handleDeleteUser(item)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          onRefresh={fetchUsers}
          refreshing={loading}
        />
      )}
    </View>
  );
}

// ... (Seus estilos permanecem os mesmos)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFEA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#191970" },
  headerSubtitle: { color: "#666" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#191970",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    width: "31%",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 4,
  },
  statLabel: { color: "#FFFFFF", fontSize: 12 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 10, paddingVertical: 12, fontSize: 16 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  listTitle: { fontSize: 18, fontWeight: "bold", color: "#191970" },
  addButton: { backgroundColor: "#191970", borderRadius: 8, padding: 8 },
  userItem: {
    backgroundColor: "#191970",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  userInfoClickable: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  userAvatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 15 },
  userInfo: { flex: 1 },
  userName: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  userStats: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  userStatText: { color: "#FFFFFF", fontSize: 12, marginLeft: 4 },
  deleteButton: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
