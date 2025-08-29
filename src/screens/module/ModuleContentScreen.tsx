import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import { DEFAULT_MODULES, ModuleContent } from "../../navigation/moduleTypes"; // Corrigido: Importando do arquivo correto

export default function ModuleContentScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModuleContent">) {
  const { moduleId } = route.params;
  const [moduleData, setModuleData] = useState<ModuleContent | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const currentModule = DEFAULT_MODULES.find(
      (module) => module.moduleId === moduleId
    );
    setModuleData(currentModule);
  }, [moduleId]);

  const handleNextPage = () => {
    if (moduleData && currentPage < moduleData.sections.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Quando chega na última página, navega para o pré-quiz
      navigation.navigate("ModulePreQuiz", { moduleId });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else {
      // Se estiver na primeira página, volta para a Home
      navigation.navigate("Home");
    }
  };

  if (!moduleData) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#191970" />
      </View>
    );
  }

  const currentSection = moduleData.sections[currentPage];
  const isLastPage = currentPage === moduleData.sections.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{moduleData.title}</Text>
        <Text style={styles.pageIndicator}>
          {currentPage + 1} / {moduleData.sections.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentArea}>
        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>{currentSection.title}</Text>
          <Text style={styles.contentBody}>{currentSection.content}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handlePreviousPage}>
          <MaterialCommunityIcons
            name="arrow-left-circle"
            size={24}
            color="#FFFFFF"
          />
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNextPage}>
          <Text style={styles.buttonText}>
            {isLastPage ? "Iniciar Quiz" : "Avançar"}
          </Text>
          <MaterialCommunityIcons
            name={isLastPage ? "clipboard-text-outline" : "arrow-right-circle"}
            size={24}
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
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#191970",
    textAlign: "center",
  },
  pageIndicator: {
    fontSize: 14,
    fontWeight: "600",
    color: "#191970",
    marginTop: 5,
  },
  contentArea: { flexGrow: 1, justifyContent: "center", padding: 20 },
  contentCard: { backgroundColor: "#191970", borderRadius: 15, padding: 25 },
  contentTitle: {
    color: "#FFC700",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  contentBody: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 26,
    textAlign: "left",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: "#191970",
  },
  button: {
    backgroundColor: "#191970",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 8,
  },
});
