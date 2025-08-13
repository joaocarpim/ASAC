import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenHeader from "../../components/layout/ScreenHeader";

const rocketImg = require("../../assets/images/rocket.png");
const moleCharacterImg = require("../../assets/images/logo.png");

// DEFINIÇÃO DE TIPOS
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type StatCardProps = {
  icon: IconName;
  value: string;
  label: string;
};

// 👇 APLICAÇÃO DO TIPO
const StatCard = ({ icon, value, label }: StatCardProps) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={28} color="#FFC700" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ScreenHeader title="Meu Progresso" />
        <Image
          source={rocketImg}
          style={styles.mainImage}
          accessible
          accessibilityLabel="Foguete decolando"
        />

        <View style={styles.statsContainer}>
          <StatCard icon="target" value="70%" label="Precisão" />
          <StatCard icon="check-all" value="43" label="Acertos" />
          <StatCard
            icon="clock-time-eight-outline"
            value="7:34"
            label="Tempo"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Meu progresso</Text>
            <Text style={styles.cardSubtitle}>
              Acompanhe seu{"\n"}desenvolvimento no{"\n"}Molingo
            </Text>
          </View>
          <Image source={moleCharacterImg} style={styles.cardImage} />
        </View>

        <View style={styles.modulesSection}>
          <Text style={styles.modulesTitle}>Módulos</Text>
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

        <TouchableOpacity
          style={styles.bottomButton}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="book-open-variant"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.bottomButtonText}>Continue Aprendendo</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// Os styles permanecem os mesmos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  scrollContainer: { alignItems: "center", padding: 20 },
  mainImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginVertical: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#191970",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    width: "31%",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 4,
  },
  statLabel: { color: "#FFFFFF", fontSize: 14 },
  card: {
    backgroundColor: "#191970",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 30,
  },
  cardTextContainer: { flex: 1 },
  cardTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold" },
  cardSubtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
  },
  cardImage: { width: 100, height: 100, resizeMode: "contain" },
  modulesSection: { width: "100%", alignItems: "flex-start", marginBottom: 30 },
  modulesTitle: {
    color: "#191970",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modulesButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  moduleButton: {
    backgroundColor: "#191970",
    width: "31%",
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleButtonText: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  bottomButton: {
    backgroundColor: "#191970",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  bottomButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
