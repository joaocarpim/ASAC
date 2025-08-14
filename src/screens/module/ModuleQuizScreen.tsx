import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView, // 👈 Importado para a rolagem
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const quizData = {
  question: "Como são separadas as palavras em Braile?",
  options: [
    "Com um espaço de uma célula em branco.",
    "Com um ponto de exclamação especial.",
    "Não há separação entre as palavras.",
    "Com duas células em branco.",
  ],
};

type OptionButtonProps = {
  text: string;
  isSelected: boolean;
  onPress: () => void;
};

const OptionButton = ({ text, isSelected, onPress }: OptionButtonProps) => (
  <TouchableOpacity style={styles.optionContainer} onPress={onPress}>
    <View style={styles.radioOuter}>
      {isSelected && <View style={styles.radioInner} />}
    </View>
    <Text style={styles.optionText}>{text}</Text>
  </TouchableOpacity>
);

export default function ModuleQuizScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModuleQuiz">) {
  const { moduleId } = route.params;
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />

      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Módulo {moduleId}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <MaterialCommunityIcons
            name="exit-to-app"
            size={30}
            color="#191970"
          />
        </TouchableOpacity>
      </View>

      {/* 👇 ÁREA DE CONTEÚDO COM SCROLL 👇 */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <Text style={styles.questionNumber}>Pergunta 1</Text>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{quizData.question}</Text>
          {quizData.options.map((option, index) => (
            <OptionButton
              key={index}
              text={option}
              isSelected={selectedAnswer === index}
              onPress={() => setSelectedAnswer(index)}
            />
          ))}
        </View>
      </ScrollView>

      {/* RODAPÉ */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            /* Lógica para confirmar resposta */
          }}
        >
          <Text style={styles.buttonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa a tela inteira
    backgroundColor: "#FFC700",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10, // Menos padding para dar espaço ao conteúdo
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#191970",
  },
  // 👇 Novo estilo para a área de Scroll
  scrollArea: {
    flex: 1, // Faz o ScrollView ocupar o espaço entre o header e o footer
  },
  // 👇 Novo estilo para o conteúdo DENTRO do Scroll
  scrollContentContainer: {
    flexGrow: 1, // Garante que o conteúdo possa crescer
    justifyContent: "center", // Centraliza o card verticalmente se o conteúdo for pequeno
    paddingHorizontal: 20,
    paddingBottom: 20, // Espaço no final do scroll
  },
  questionNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#191970",
    marginBottom: 10,
    alignSelf: "flex-start", // Garante que o texto fique à esquerda
  },
  questionCard: {
    backgroundColor: "#191970",
    borderRadius: 15,
    padding: 20,
    width: "100%", // O card ocupa toda a largura do container
  },
  questionText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    lineHeight: 24,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingVertical: 5,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFC700",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFC700",
  },
  optionText: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: "#191970",
  },
  button: {
    backgroundColor: "#191970",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 35,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
