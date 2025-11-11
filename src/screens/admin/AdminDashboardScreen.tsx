// src/screens/admin/AdminDashboardScreen.tsx (Com função de apagar)
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

// ✅ 1. IMPORTAÇÕES ADICIONADAS
import { generateClient } from "aws-amplify/api";
// Certifique-se que o caminho para suas mutações está correto
import { deleteUser as deleteUserMutation } from "../../graphql/mutations";

// ✅ Usa o tipo User do authStore
type User = import("../../store/authStore").User & { id: string }; // Pega o 'id' do dynamo

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
type StatCardProps = { icon: IconName; value: string; label: string };
// ✅ 2. PROPS DO USERLISTITEM ATUALIZADAS
type UserListItemProps = {
  item: User;
  onPress: () => void;
  onDelete: () => void; // Prop para apagar
};

const StatCard = ({ icon, value, label }: StatCardProps) => (
  // ... (Componente StatCard não muda) ...
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={28} color="#FFFFFF" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ✅ 3. COMPONENTE USERLISTITEM ATUALIZADO
const UserListItem = ({ item, onPress, onDelete }: UserListItemProps) => {
  const modulesCount = Array.isArray(item.modulesCompleted)
    ? item.modulesCompleted.length
    : 0;

  return (
    // O container principal não é mais clicável
    <View style={styles.userItem}>
      {/* A parte da informação ainda é clicável para navegar */}
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

      {/* Botão de apagar separado */}
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={28}
          color="#FF8A8A" // Uma cor de "perigo"
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

  // ... (Função calculateStats não muda) ...
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

    setStats({
      totalUsers,
      activeUsers,
      averageProgress,
    });
  };

  // ... (Função fetchUsers não muda) ...
  const fetchUsers = async () => {
    if (!loading) setLoading(true);
    try {
      const allUsers = (await getAllUsers()) as User[]; // Força o tipo
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

  // ✅ 4. FUNÇÃO PARA APAGAR O USUÁRIO
  const handleDeleteUser = (userToDelete: User) => {
    Alert.alert(
      "Apagar Assistido",
      `Você tem certeza que quer apagar ${
        userToDelete.name ?? "este usuário"
      }? Esta ação é irreversível e apagará todos os dados de progresso.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            // Reutiliza o loading da tela
            setLoading(true);
            try {
              const client = generateClient();
              // 1. Apaga o usuário do DynamoDB
              await client.graphql({
                query: deleteUserMutation,
                variables: { input: { id: userToDelete.id } },
                authMode: "userPool",
              });

              // 2. Remove o usuário da lista local (UI)
              const updatedUsers = users.filter(
                (u) => u.id !== userToDelete.id
              );
              setUsers(updatedUsers);
              calculateStats(updatedUsers); // Recalcula estatísticas

              Alert.alert(
                "Sucesso",
                `${userToDelete.name ?? "Usuário"} foi apagado do banco de dados.`
              );

              console.log(
                `⚠️ AVISO: Usuário ${userToDelete.id} apagado do DynamoDB. 
                 A conta de autenticação (Cognito) ainda pode existir.`
              );
            } catch (error: any) {
              console.error("❌ Erro ao apagar usuário:", error);
              Alert.alert(
                "Erro",
                `Não foi possível apagar o usuário: ${error.message || error}`
              );
            } finally {
              // Garante que o loading para
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
      {/* ... (Header não muda) ... */}
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

      {/* ... (StatsContainer não muda) ... */}
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

      {/* ... (SearchContainer não muda) ... */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Procurar assistido..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* ... (ListHeader não muda) ... */}
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
          // ✅ 5. ATUALIZAÇÃO DO RENDERITEM
          renderItem={({ item }) => (
            <UserListItem
              item={item}
              onPress={() =>
                navigation.navigate("AdminUserDetail", {
                  userId: item.id,
                  userName: item.name ?? "Usuário",
                })
              }
              // Passa a função de apagar para o componente
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

// ✅ 6. ATUALIZAÇÃO DOS ESTILOS
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

  // ESTILOS DO ITEM DA LISTA MODIFICADOS
  userItem: {
    backgroundColor: "#191970",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between", // Adicionado
  },
  userInfoClickable: {
    // Novo
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Ocupa o espaço
    marginRight: 10, // Dá espaço para o botão de apagar
  },
  userAvatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 15 },
  userInfo: { flex: 1 },
  userName: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  userStats: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  userStatText: { color: "#FFFFFF", fontSize: 12, marginLeft: 4 },
  deleteButton: {
    // Novo
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
