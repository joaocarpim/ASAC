import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";

const { width } = Dimensions.get("window");

export default function ModuleResultsScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModuleResults">) {
  const {
    moduleId,
    correctAnswers,
    //totalQuestions,
    accuracy,
    timeSpent,
    coinsEarned,
    passed,
    errors,
  } = route.params;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getPerformanceMessage = (): string => {
    if (accuracy >= 90)
      return "Excelente! Você dominou completamente este módulo!";
    if (accuracy >= 80)
      return "Muito bom! Você tem um ótimo entendimento do conteúdo!";
    if (accuracy >= 70) return "Bom trabalho! Você passou no módulo!";
    return "Continue estudando! A prática leva à perfeição!";
  };

  const getAccuracyColor = (): string => {
    if (accuracy >= 90) return "#4CAF50"; // Verde Forte
    if (accuracy >= 80) return "#8BC34A"; // Verde Claro
    if (accuracy >= 70) return "#FFC107"; // Amarelo
    return "#F44336"; // Vermelho
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />

      <View style={styles.header}>
        <MaterialCommunityIcons
          name={passed ? "trophy" : "school"}
          size={48}
          color="#191970"
        />
        <Text style={styles.headerTitle}>
          {passed ? "Parabéns!" : "Quase lá!"}
        </Text>
        <Text style={styles.headerSubtitle}>
          Módulo {moduleId} {passed ? "Concluído" : "Não Concluído"}
        </Text>
      </View>

      <ScrollView
        style={styles.contentArea}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainResultCard}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.accuracyText, { color: getAccuracyColor() }]}>
              {accuracy}%
            </Text>
            <Text style={styles.accuracyLabel}>Precisão</Text>
          </View>
          <Text style={styles.performanceMessage}>
            {getPerformanceMessage()}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="check-circle"
              size={32}
              color="#4CAF50"
            />
            <Text style={styles.statNumber}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Acertos</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="close-circle"
              size={32}
              color="#F44336"
            />
            <Text style={styles.statNumber}>{errors}</Text>
            <Text style={styles.statLabel}>Erros</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="clock-time-eight-outline"
              size={32}
              color="#2196F3"
            />
            <Text style={styles.statNumber}>{formatTime(timeSpent)}</Text>
            <Text style={styles.statLabel}>Tempo</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="hand-coin-outline"
              size={32}
              color="#FFC107"
            />
            <Text style={styles.statNumber}>{coinsEarned}</Text>
            <Text style={styles.statLabel}>Moedas</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!passed && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("ModuleContent", { moduleId })}
          >
            <MaterialCommunityIcons
              name="book-open-variant"
              size={20}
              color="#191970"
            />
            <Text style={styles.secondaryButtonText}>Revisar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.primaryButton, !passed && styles.retryButton]}
          onPress={() => {
            if (passed) {
              navigation.navigate("Home");
            } else {
              navigation.navigate("ModuleContent", { moduleId });
            }
          }}
        >
          <Text style={styles.primaryButtonText}>
            {passed ? "Continuar" : "Tentar Novamente"}
          </Text>
          <MaterialCommunityIcons
            name={passed ? "arrow-right-circle" : "refresh"}
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#191970",
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#191970",
    marginTop: 5,
    fontWeight: "600",
  },
  contentArea: { flex: 1, paddingHorizontal: 20 },
  mainResultCard: {
    backgroundColor: "#191970",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 4,
    borderColor: "#191970",
  },
  accuracyText: { fontSize: 32, fontWeight: "bold" },
  accuracyLabel: { fontSize: 14, color: "#666", fontWeight: "600" },
  performanceMessage: {
    color: "#FFFFFF",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#191970",
    borderRadius: 12,
    padding: 20,
    width: (width - 60) / 2,
    marginBottom: 15,
    alignItems: "center",
  },
  statNumber: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: "#191970",
  },
  primaryButton: {
    backgroundColor: "#191970",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  retryButton: { backgroundColor: "#4CAF50", marginLeft: 10 },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#191970",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  secondaryButtonText: {
    color: "#191970",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
});
