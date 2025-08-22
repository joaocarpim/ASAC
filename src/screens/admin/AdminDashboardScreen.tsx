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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import { signOut } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { listUsers } from "../../graphql/queries";
import { useFocusEffect } from "@react-navigation/native";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
type User = {
  id: string;
  name: string;
  coins?: number | null;
  points?: number | null;
  modulesCompleted?: string | null;
  avatar?: ImageSourcePropType;
};
type StatCardProps = { icon: IconName; value: string; label: string };
type UserListItemProps = { item: User; onPress: () => void };

const StatCard = ({ icon, value, label }: StatCardProps) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={28} color="#FFFFFF" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);
const UserListItem = ({ item, onPress }: UserListItemProps) => (
  <TouchableOpacity style={styles.userItem} onPress={onPress}>
    <Image
      source={require("../../assets/images/avatar1.png")}
      style={styles.userAvatar}
    />
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{item.name}</Text>
      <View style={styles.userStats}>
        <MaterialCommunityIcons name="hand-coin" color="#FFC700" size={14} />
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
        <Text style={styles.userStatText}>
          {item.modulesCompleted ?? "0/3"}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function AdminDashboardScreen({
  navigation,
}: RootStackScreenProps<"AdminDashboard">) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    if (!loading) setLoading(true);
    try {
      const client = generateClient(); // Criado aqui dentro
      const result = await client.graphql({ query: listUsers });
      const validUsers = result.data.listUsers.items.filter(
        (user) => user
      ) as User[];
      setUsers(validUsers);
    } catch (e) {
      console.log("Erro ao buscar usuários", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
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

  return (
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
            <Text style={styles.headerSubtitle}>
              Gestão completa do Molingo
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={30} color="#191970" />
        </TouchableOpacity>
      </View>
      <View style={styles.statsContainer}>
        <StatCard
          icon="account-group"
          value={users.length.toString()}
          label="Usuários"
        />
        <StatCard icon="trophy-award" value="2" label="Mestres" />
        <StatCard icon="chart-donut" value="72%" label="Progresso Médio" />
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
          data={users.filter((user) =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <UserListItem
              item={item}
              onPress={() =>
                navigation.navigate("AdminUserDetail", {
                  userId: item.id,
                  userName: item.name,
                })
              }
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
  },
  userAvatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 15 },
  userInfo: { flex: 1 },
  userName: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  userStats: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  userStatText: { color: "#FFFFFF", fontSize: 12, marginLeft: 4 },
});
