// src/screens/admin/AdminDashboardScreen.tsx
// === VERSÃO FINAL, 100% CORRIGIDA E COMPATÍVEL ===

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
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { getAllUsers } from "../../services/progressService";
import { ConfirmModal } from "../../components/modal/ConfirmModal";
import { useModalStore } from "../../store/useModalStore";
import { deleteUserService } from "../../services/DeleteUserService";

type User = import("../../store/authStore").User & {
  id: string;
  email: string;
};

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const StatCard = ({
  icon,
  value,
  label,
}: {
  icon: IconName;
  value: string;
  label: string;
}) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={28} color="#FFFFFF" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const UserListItem = ({
  item,
  onPress,
  onDelete,
}: {
  item: User;
  onPress: () => void;
  onDelete: () => void;
}) => {
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

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // ============================================================
  // STATS
  // ============================================================
  const calculateStats = useCallback((userList: User[]) => {
    const totalUsers = userList.length;

    const activeUsers = userList.filter((u) => {
      const hasModules =
        Array.isArray(u.modulesCompleted) && u.modulesCompleted.length > 0;
      const hasPoints = (u.points ?? 0) > 0;
      return hasModules || hasPoints;
    }).length;

    const totalModulesCompleted = userList.reduce((sum, u) => {
      return (
        sum +
        (Array.isArray(u.modulesCompleted) ? u.modulesCompleted.length : 0)
      );
    }, 0);

    const averageProgress =
      totalUsers > 0
        ? Math.round((totalModulesCompleted / (totalUsers * 3)) * 100)
        : 0;

    setStats({ totalUsers, activeUsers, averageProgress });
  }, []);

  // ============================================================
  // BUSCA USUÁRIOS
  // ============================================================
  const fetchUsers = useCallback(async () => {
    setLoading(true);

    try {
      const allUsers = (await getAllUsers()) as User[];

      const assistidos = allUsers.filter((u) => !u.isAdmin);

      setUsers(assistidos);
      calculateStats(assistidos);
    } catch (err: any) {
      console.error("❌ erro carregando users:", err);
      useModalStore
        .getState()
        .showModal("Erro", "Não foi possível carregar os usuários.", false);
    }

    setLoading(false);
  }, [calculateStats]);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const handleLogout = () => useAuthStore.getState().signOut();

  // ============================================================
  // MOSTRAR MODAL DE CONFIRMAÇÃO
  // ============================================================
  const showDeleteConfirmation = (user: User) => {
    setUserToDelete(user);
    setConfirmModalVisible(true);
  };

  // ============================================================
  // CONFIRMAR DELEÇÃO — CHAMA deleteUserService
  // ============================================================
  const confirmDeleteUser = useCallback(async () => {
    if (!userToDelete) return;

    setConfirmModalVisible(false);
    setLoading(true);

    try {
      const result = await deleteUserService.deleteUserCompletely(
        userToDelete.id,
        userToDelete.email
      );

      // Atualizar lista
      const updated = users.filter((u) => u.id !== userToDelete.id);
      setUsers(updated);
      calculateStats(updated);

      useModalStore
        .getState()
        .showModal(
          "Usuário Removido",
          `Operação concluída:\n\n• Progressos: ${
            result.deletedProgresses
          }\n• Conquistas: ${result.deletedAchievements}\n• Cognito: ${
            result.cognitoDeleted ? "OK" : "Falhou"
          }\n• DynamoDB: ${result.dbDeleted ? "OK" : "Falhou"}`,
          true
        );
    } catch (err: any) {
      useModalStore
        .getState()
        .showModal(
          "Erro",
          `Erro ao apagar o usuário:\n\n${err.message}`,
          false
        );
    }

    setLoading(false);
    setUserToDelete(null);
  }, [userToDelete, users, calculateStats]);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons
            name="account-cog"
            size={32}
            color="#191970"
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerTitle}>Painel Administrativo</Text>
            <Text style={styles.headerSubtitle}>Gestão completa</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={30} color="#191970" />
        </TouchableOpacity>
      </View>

      {/* STATS */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="account-group"
          value={stats.totalUsers.toString()}
          label="Total"
        />
        <StatCard
          icon="account-check"
          value={stats.activeUsers.toString()}
          label="Ativos"
        />
        <StatCard
          icon="chart-line"
          value={`${stats.averageProgress}%`}
          label="Progresso"
        />
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Procurar assistido..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* LIST HEADER */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Assistidos ({users.length})</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AdminRegisterUser")}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* LISTA */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#191970" />
        </View>
      ) : (
        <FlatList
          data={users.filter((u) =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          keyExtractor={(u) => u.id}
          renderItem={({ item }) => (
            <UserListItem
              item={item}
              onPress={() =>
                navigation.navigate("AdminUserDetail", {
                  userId: item.id,
                  userName: item.name ?? "Usuário",
                })
              }
              onDelete={() => showDeleteConfirmation(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <ConfirmModal
        visible={confirmModalVisible}
        title="Apagar Usuário"
        message={`Tem certeza que deseja apagar ${userToDelete?.name}? Esta ação é irreversível.`}
        onConfirm={confirmDeleteUser}
        onCancel={() => setConfirmModalVisible(false)}
      />
    </View>
  );
}

// ============================================================
// STYLES
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFEA" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },

  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#191970" },
  headerSubtitle: { color: "#666", fontSize: 14, marginTop: 2 },

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
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 6,
  },
  statLabel: { color: "#FFF", fontSize: 12 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 20,
  },

  searchInput: { flex: 1, marginLeft: 10, paddingVertical: 12, fontSize: 16 },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  listTitle: { fontSize: 18, fontWeight: "bold", color: "#191970" },

  addButton: {
    backgroundColor: "#191970",
    borderRadius: 8,
    padding: 8,
  },

  userItem: {
    backgroundColor: "#191970",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  userInfoClickable: { flexDirection: "row", alignItems: "center", flex: 1 },

  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#FFC700",
  },

  userInfo: { flex: 1 },

  userName: { color: "#FFF", fontSize: 16, fontWeight: "bold" },

  userStats: { flexDirection: "row", alignItems: "center", marginTop: 4 },

  userStatText: { color: "#FFF", fontSize: 13, marginLeft: 4 },

  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 138, 138, 0.15)",
  },

  listContent: { paddingHorizontal: 20 },

  loadingContainer: { flex: 1, justifyContent: "center", paddingTop: 40 },
});
