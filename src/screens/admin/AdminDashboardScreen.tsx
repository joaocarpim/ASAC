// src/screens/admin/AdminDashboardScreen.tsx
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
import { signOut, fetchAuthSession } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { listUsers } from "../../graphql/queries";
import { useFocusEffect } from "@react-navigation/native";
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import awsconfig from "../../aws-exports";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
type User = {
  id: string;
  userId?: string;
  name: string;
  coins?: number | null;
  points?: number | null;
  modulesCompleted?: (number | null)[] | null;
  currentModule?: number | null;
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

const UserListItem = ({ item, onPress }: UserListItemProps) => {
  const modulesCount = Array.isArray(item.modulesCompleted)
    ? item.modulesCompleted.filter((m) => m !== null).length
    : 0;

  return (
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
          <Text style={styles.userStatText}>{modulesCount}/3</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function AdminDashboardScreen({
  navigation,
}: RootStackScreenProps<"AdminDashboard">) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    averageProgress: 0,
  });

  const calculateStats = (userList: User[]) => {
    const totalUsers = userList.length;
    const activeUsers = userList.filter((user) => (user.currentModule ?? 0) > 0)
      .length;
    const totalModulesCompleted = userList.reduce((sum, user) => {
      const modules = Array.isArray(user.modulesCompleted)
        ? user.modulesCompleted.filter((m) => m !== null).length
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

  function convertCognitoUserToApp(userFromCognito: any): User {
    const attrs = userFromCognito.Attributes || [];
    const attrMap: Record<string, string> = {};
    for (const a of attrs) {
      if (a?.Name) attrMap[a.Name] = a.Value ?? "";
    }

    const name =
      attrMap["name"] ||
      attrMap["given_name"] ||
      attrMap["email"] ||
      userFromCognito.Username ||
      "Usuário";

    let modulesCompleted: (number | null)[] | null = null;
    try {
      const mm = attrMap["custom:modulesCompleted"];
      if (mm) {
        const parsed = JSON.parse(mm);
        if (Array.isArray(parsed)) modulesCompleted = parsed;
      }
    } catch {}

    return {
      id: userFromCognito.Username,
      userId: userFromCognito.Username,
      name,
      coins: Number(attrMap["custom:coins"] ?? 0),
      points: Number(attrMap["custom:points"] ?? 0),
      modulesCompleted,
      currentModule: Number(attrMap["custom:currentModule"] ?? 0),
    };
  }

  const fetchUsersFromCognito = async (): Promise<User[]> => {
    try {
      const session: any = await fetchAuthSession();
      const { accessKeyId, secretAccessKey, sessionToken } =
        session.credentials!;

      const client = new CognitoIdentityProviderClient({
        region: awsconfig.aws_cognito_region,
        credentials: { accessKeyId, secretAccessKey, sessionToken },
      });

      const cmd = new ListUsersCommand({
        UserPoolId: awsconfig.aws_user_pools_id,
        Limit: 60,
      });

      const resp = await client.send(cmd);
      const items = resp.Users ?? [];
      return items.map((u) => convertCognitoUserToApp(u));
    } catch (err) {
      console.warn("fetchUsersFromCognito falhou:", err);
      throw err;
    }
  };

  const fetchUsersFromGraphQL = async (): Promise<User[]> => {
    const client = generateClient();
    const result: any = await client.graphql({ query: listUsers });
   const items = result?.data?.listUsers?.items ?? [];
    return items.map((u: any) => ({
      id: u.id,
      userId: u.id,
      name: u.name ?? "Usuário",
      coins: u.coins ?? 0,
      points: u.points ?? 0,
      modulesCompleted: u.modulesCompleted ?? [],
      currentModule: u.currentModule ?? 0,
    }));
  };

  const fetchUsers = async () => {
    if (!loading) setLoading(true);
    try {
      try {
        const cognitoUsers = await fetchUsersFromCognito();
        setUsers(cognitoUsers);
        calculateStats(cognitoUsers);
        return;
      } catch {}

      const graphqlUsers = await fetchUsersFromGraphQL();
      setUsers(graphqlUsers);
      calculateStats(graphqlUsers);
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
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <MaterialCommunityIcons name="account-cog" size={32} color="#191970" />
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
        <StatCard icon="account-group" value={stats.totalUsers.toString()} label="Assistidos" />
        <StatCard icon="account-check" value={stats.activeUsers.toString()} label="Ativos" />
        <StatCard icon="chart-donut" value={`${stats.averageProgress}%`} label="Progresso Médio" />
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color="#888" />
        <TextInput style={styles.searchInput} placeholder="Procurar assistido..." value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Lista de assistidos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AdminRegisterUser")}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#191970" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()))}
          keyExtractor={(item) => item.userId ?? item.id}
          renderItem={({ item }) => (
            <UserListItem
              item={item}
              onPress={() =>
                navigation.navigate("AdminUserDetail", {
                  userId: item.userId ?? item.id,
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
