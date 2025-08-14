import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import ScreenHeader from "../../components/layout/ScreenHeader";

// 👇 DEFINIÇÃO DOS TIPOS 👇
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
      <ScreenHeader title={userName} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Email</Text>
              <Text style={styles.cardValue}>ana@email.com</Text>
            </View>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Senha</Text>
              <Text style={styles.cardValue}>********</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatGridItem icon="hand-coin" value="495" label="Moedas" />
          <StatGridItem icon="trophy-variant" value="36.730" label="Pontos" />
          <StatGridItem icon="book-open-variant" value="3/3" label="Módulos" />
          <StatGridItem icon="target" value="70%" label="Precisão" />
          <StatGridItem icon="check-all" value="13" label="Acertos" />
          <StatGridItem
            icon="clock-time-eight-outline"
            value="7:34"
            label="Tempo"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Módulos</Text>
          <View style={styles.modulesButtons}>
            <TouchableOpacity style={styles.moduleButton}>
              <Text style={styles.moduleButtonText}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moduleButton}>
              <Text style={styles.moduleButtonText}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moduleButton}>
              <Text style={styles.moduleButtonText}>3</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acessíveis</Text>
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
            <Text style={styles.statValue}>13</Text>
            <Text style={styles.statLabel}>Erros</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// Estilos permanecem os mesmos
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
    backgroundColor: "#191970",
    width: "31%",
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleButtonText: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  errorButton: {
    backgroundColor: "#D32F2F",
    borderRadius: 12,
    width: "31%",
    padding: 15,
    alignItems: "center",
  },
});
