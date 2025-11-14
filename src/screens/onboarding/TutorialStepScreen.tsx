import React, { useState, useMemo } from "react"; // Adicionado useMemo
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const logo = require("../../assets/images/logo.png");

export default function TutorialScreen({
  navigation,
}: RootStackScreenProps<"Tutorial">) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // Usar índice (0, 1, 2)
  const [isLoading, setIsLoading] = useState(false);

  // 1. Centralizamos todo o conteúdo dos passos em um array de objetos
  const tutorialData = useMemo(
    () => [
      {
        title: "Acesse os Módulos",
        description: "Explore conteúdos sobre Braille\nde forma interativa",
        content: null, // Passo 1 não tem conteúdo extra
      },
      {
        title: "Ganhe Moedas",
        description: "Complete questionários e acumule pontos",
        // Conteúdo extra do passo 2
        content: (
          <View style={styles.progressCard}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreNumber}>7/10</Text>
              <Text style={styles.scoreLabel}>para desbloquear</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: "70%" }]} />
              </View>
              <Text style={styles.progressPercentage}>70%</Text>
            </View>
          </View>
        ),
      },
      {
        title: "Ganhe Selos",
        description: "Conquiste selos e veja seu progresso",
        // Conteúdo extra do passo 3
        content: (
          <View style={styles.achievementsContainer}>
            <View style={styles.achievementCard}>
              <MaterialCommunityIcons name="trophy" size={32} color="#FFD700" />
              <Text style={styles.achievementTitle}>Ranking</Text>
            </View>
            <View style={styles.achievementCard}>
              <MaterialCommunityIcons name="seal" size={32} color="#FF6B6B" />
              <Text style={styles.achievementTitle}>Selos</Text>
            </View>
            <View style={styles.achievementCard}>
              <MaterialCommunityIcons
                name="chart-line"
                size={32}
                color="#4ECDC4"
              />
              <Text style={styles.achievementTitle}>Evolução</Text>
            </View>
          </View>
        ),
      },
    ],
    []
  );

  const totalSteps = tutorialData.length;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const currentStepData = tutorialData[currentStepIndex]; // Dados do passo atual

  const handleNavigate = () => {
    if (isLoading) return;
    setIsLoading(true);

    if (isLastStep) {
      // Última tela, vai para Login
      navigation.navigate("Login");
    } else {
      // Avança para próximo step
      setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
        setIsLoading(false);
      }, 300);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#191970" />

      {/* 2. Indicadores de progresso gerados dinamicamente */}
      <View style={styles.progressContainer}>
        {tutorialData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              currentStepIndex === index && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      {/* 3. Conteúdo principal renderizado a partir do array */}
      <View style={styles.content}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.title}>{currentStepData.title}</Text>
        <Text style={styles.description}>{currentStepData.description}</Text>
        {currentStepData.content /* Renderiza o conteúdo extra (se houver) */}
      </View>

      {/* 4. Seção inferior atualizada para usar as variáveis */}
      <View style={styles.bottomSection}>
        <Text style={styles.stepText}>
          Passo {currentStepIndex + 1} de {totalSteps}
        </Text>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleNavigate}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {isLastStep ? "Começar" : "Avançar"}
          </Text>
          <MaterialCommunityIcons
            name={isLastStep ? "rocket-launch" : "chevron-right"}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.skipText}>
            {isLastStep ? "Ir para o login" : "Pular tutorial"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Os estilos permanecem exatamente os mesmos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191970",
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 10,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressDotActive: {
    width: 24,
    backgroundColor: "#FFA500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFA500",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.85)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#28a745",
  },
  scoreLabel: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  progressBarContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#28a745",
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#28a745",
    minWidth: 42,
  },
  achievementsContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  achievementCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    width: 90,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#191970",
    marginTop: 8,
    textAlign: "center",
  },
  bottomSection: {
    backgroundColor: "#FFC700",
    paddingVertical: 30,
    paddingHorizontal: 30,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: "center",
  },
  stepText: {
    fontSize: 13,
    color: "#191970",
    fontWeight: "600",
    opacity: 0.7,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#191970",
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: "100%",
    maxWidth: 400,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  skipButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  skipText: {
    color: "#191970",
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.7,
  },
});
