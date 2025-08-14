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

export default function ModuleContentScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModuleContent">) {
  const { moduleId } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
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

      <Text style={styles.pageTitle}>
        Aprenda a formar palavras combinando letras em Braile
      </Text>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>
            Formação de Palavras em Braile
          </Text>
          <Text style={styles.contentBody}>
            Agora que você conhece as letras do alfabeto, vamos aprender a
            formar palavras completas!
          </Text>

          <Text style={styles.contentTitle}>Como ler palavras</Text>
          <Text style={styles.contentBody}>
            Palavras em Braile são formadas pela sequência de células
            representando cada letra, da esquerda para a direita.
          </Text>

          <Text style={styles.contentTitle}>Espaçamento</Text>
          <Text style={styles.contentBody}>
            <Text style={styles.bold}>- "Entre letras":</Text> As células ficam
            próximas umas das outras.
          </Text>
          <Text style={styles.contentBody}>
            <Text style={styles.bold}>- "Entre palavras":</Text> Deixa-se um
            espaço maior (uma célula vazia).
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("ModulePreQuiz", { moduleId })}
        >
          <Text style={styles.buttonText}>Avançar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#191970" },
  pageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#191970",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  contentCard: { backgroundColor: "#191970", borderRadius: 15, padding: 20 },
  contentTitle: {
    color: "#FFC700",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
  },
  contentBody: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 5,
  },
  bold: { fontWeight: "bold" },
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
    paddingHorizontal: 40,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
