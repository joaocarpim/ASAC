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

// 👇 DEFINIÇÃO DE TIPOS PARA O COMPONENTE AUXILIAR
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];
type InfoRowProps = {
  icon: IconName;
  label: string;
  value: string;
};

// 👇 APLICAÇÃO DOS TIPOS
const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons
      name={icon}
      size={24}
      color="#FFC700"
      style={styles.infoIcon}
    />
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

export default function ModulePreQuizScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModulePreQuiz">) {
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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.pageTitle}>Você concluiu todo o conteúdo!!</Text>

        <View style={styles.contentCard}>
          <Text style={styles.contentTitle}>Sobre o Questionário</Text>
          <InfoRow icon="file-question-outline" label="Questões" value="10" />
          <InfoRow
            icon="check-decagram-outline"
            label="Para passar"
            value="7 acertos"
          />
          <InfoRow
            icon="hand-coin-outline"
            label="Moedas por acerto"
            value="15"
          />
          <InfoRow icon="trophy-outline" label="Pontuação" value="12.250" />
          <InfoRow icon="infinity" label="Tentativas" value="Ilimitadas" />
          <InfoRow icon="volume-high" label="Feedback" value="Áudio e visual" />

          <View style={styles.tipBox}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={24}
              color="#191970"
            />
            <View style={styles.tipTextBox}>
              <Text style={styles.tipTitle}>Dica:</Text>
              <Text style={styles.tipBody}>
                Leia todo o conteúdo com atenção antes de iniciar o
                questionário.
              </Text>
            </View>
          </View>

          <Text style={styles.footerText}>
            Você pode voltar a esta página a qualquer momento para revisar o
            material.
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
          onPress={() => navigation.navigate("ModuleQuiz", { moduleId })}
        >
          <Text style={styles.buttonText}>Iniciar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Os styles permanecem os mesmos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#191970" },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  pageTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#191970",
    textAlign: "center",
    marginBottom: 15,
  },
  contentCard: { backgroundColor: "#191970", borderRadius: 15, padding: 20 },
  contentTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  infoIcon: { marginRight: 10, width: 24 },
  infoLabel: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  infoValue: { color: "#FFFFFF", fontSize: 16, marginLeft: 5 },
  tipBox: {
    backgroundColor: "#FFC700",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  tipTextBox: { marginLeft: 10, flex: 1 },
  tipTitle: { color: "#191970", fontSize: 16, fontWeight: "bold" },
  tipBody: { color: "#191970", fontSize: 14, marginTop: 2 },
  footerText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
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
    paddingHorizontal: 40,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
