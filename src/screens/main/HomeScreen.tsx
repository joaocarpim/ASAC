// src/screens/main/HomeScreen.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";

// Dados de exemplo
const userData = {
  name: "Ana Silva",
  coins: 495,
  points: 36730,
  modulesCompleted: "3/3",
};

// DEFINIÇÃO DE TIPOS PARA OS COMPONENTES AUXILIARES
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type StatCardProps = {
  icon: IconName;
  value: string | number;
  label: string;
};

type ModuleItemProps = {
  icon: IconName;
  title: string;
  subtitle: string;
  onPress: () => void;
};

type ActionButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
};

// Componente reutilizável para os cards de estatísticas com tipos
const StatCard = ({ icon, value, label }: StatCardProps) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={24} color="#FFC700" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Componente reutilizável para os itens de módulo com tipos
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

// Componente reutilizável para os botões de ação inferiores com tipos
const ActionButton = ({ icon, label, onPress }: ActionButtonProps) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={40} color="#FFC700" />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function HomeScreen({
  navigation,
}: RootStackScreenProps<"Home">) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Olá, {userData.name}!</Text>
            <Text style={styles.headerSubtitle}>
              Continue aprendendo com ASAC
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.replace("Login")}>
            <MaterialCommunityIcons name="logout" size={30} color="#191970" />
          </TouchableOpacity>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsContainer}>
          <StatCard icon="hand-coin" value={userData.coins} label="Moedas" />
          <StatCard
            icon="trophy-variant"
            value={userData.points.toLocaleString("pt-BR")}
            label="Pontos"
          />
          <StatCard
            icon="book-open-variant"
            value={userData.modulesCompleted}
            label="Módulos"
          />
        </View>

        {/* Módulos Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Módulos de Aprendizado</Text>
          <TouchableOpacity>
            <MaterialCommunityIcons name="cog" size={30} color="#191970" />
          </TouchableOpacity>
        </View>
        <View style={styles.modulesList}>
          <ModuleItem
            icon="baby-face-outline"
            title="Módulo 1"
            subtitle="Alfabeto Completo"
            onPress={() => {
              /* Navegar para o Módulo 1 */
            }}
          />
          {/* 👇 CORREÇÃO AQUI 👇 */}
          <ModuleItem
            icon="hand-wave"
            title="Módulo 2"
            subtitle="Palavras em Braille"
            onPress={() => {
              /* Navegar para o Módulo 2 */
            }}
          />
          <ModuleItem
            icon="account-star"
            title="Módulo 3"
            subtitle="Formule Frases"
            onPress={() => {
              /* Navegar para o Módulo 3 */
            }}
          />
        </View>

        {/* Bottom Actions */}
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

// Os estilos não precisam de alteração
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC700",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#191970",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#191970",
  },
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
  statLabel: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#191970",
  },
  modulesList: {
    paddingHorizontal: 20,
  },
  moduleItem: {
    backgroundColor: "#191970",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  moduleIcon: {
    marginRight: 15,
  },
  moduleTextContainer: {
    flex: 1,
  },
  moduleTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  moduleSubtitle: {
    color: "#FFFFFF",
    fontSize: 14,
  },
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
