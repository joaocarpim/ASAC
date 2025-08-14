import React, { useState } from "react";
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
type IncorrectAnswer = {
  id: string;
  questionNumber: number;
  question: string;
  userAnswer: string;
};

type IncorrectAnswerCardProps = {
  item: IncorrectAnswer;
};

const incorrectAnswersData: IncorrectAnswer[] = [
  {
    id: "1",
    questionNumber: 4,
    question: "Como são separadas as palavras em Braile?",
    userAnswer: "Separadas por uma célula cheia",
  },
  {
    id: "2",
    questionNumber: 7,
    question: "Em que direção lemos palavras em Braile?",
    userAnswer: "Direita para a esquerda",
  },
  {
    id: "3",
    questionNumber: 8,
    question: "Como devemos usar as mãos para ler Braile?",
    userAnswer: "Apenas a mão direita",
  },
];

const IncorrectAnswerCard = ({ item }: IncorrectAnswerCardProps) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.questionNumber}>{item.questionNumber}</Text>
      <Text style={styles.questionText}>{item.question}</Text>
    </View>
    <View style={styles.answerContainer}>
      <Text style={styles.userAnswer}>{item.userAnswer}</Text>
    </View>
  </View>
);


export default function AdminIncorrectAnswersScreen({
  
}: RootStackScreenProps<"AdminIncorrectAnswers">) {
  const [selectedModule, setSelectedModule] = useState(1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
      <ScreenHeader title="Erros" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.sectionTitle}>Módulos</Text>
        <View style={styles.modulesButtons}>
          {[1, 2, 3].map((moduleNum) => (
            <TouchableOpacity
              key={moduleNum}
              style={[
                styles.moduleButton,
                selectedModule === moduleNum && styles.moduleButtonSelected,
              ]}
              onPress={() => setSelectedModule(moduleNum)}
            >
              <Text
                style={[
                  styles.moduleButtonText,
                  selectedModule === moduleNum &&
                    styles.moduleButtonTextSelected,
                ]}
              >
                {moduleNum}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.listHeader}>
          <MaterialCommunityIcons
            name="close-circle-outline"
            size={20}
            color="#D32F2F"
          />
          <Text style={styles.listTitle}>Respostas Incorretas</Text>
        </View>

        {incorrectAnswersData.map((item) => (
          <IncorrectAnswerCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}
// Estilos permanecem os mesmos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFEA" },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#191970",
    marginBottom: 10,
  },
  modulesButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  moduleButton: {
    backgroundColor: "#191970",
    width: "31%",
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleButtonSelected: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#191970",
  },
  moduleButtonText: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
  moduleButtonTextSelected: { color: "#191970" },
  listHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#191970",
    marginLeft: 8,
  },
  card: {
    backgroundColor: "#191970",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  cardHeader: { padding: 15, flexDirection: "row", alignItems: "center" },
  questionNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 20,
    width: 40,
    height: 40,
    textAlign: "center",
    textAlignVertical: "center",
  },
  questionText: { color: "#FFFFFF", fontSize: 16, flex: 1 },
  answerContainer: { backgroundColor: "#E3F2FD", padding: 15 },
  userAnswer: { color: "#191970", fontSize: 16, fontWeight: "500" },
});
