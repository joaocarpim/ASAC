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

const medalImg = require("../../assets/images/medal.png");
const moleCharacterImg = require("../../assets/images/logo.png");

export default function AchievementsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ScreenHeader title="Minhas Conquistas" />
        <Image source={medalImg} style={styles.mainImage} />

        <View style={styles.card}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Sem Conquistas</Text>
            <Text style={styles.cardSubtitle}>
              Continue Aprendendo!{"\n"}Para obter seu selo
            </Text>
          </View>
          <Image source={moleCharacterImg} style={styles.cardImage} />
        </View>

        <Text style={styles.infoText}>
          Complete todos os módulos para ser o "Mestre do Braile"
        </Text>

        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Progresso Atual:</Text>
          <View style={styles.progressIcons}>
            <View style={[styles.progressCircle, styles.completed]}>
              <Text style={styles.progressCircleText}>1</Text>
            </View>
            <View style={styles.progressCircle}>
              <MaterialCommunityIcons name="lock" size={24} color="#191970" />
            </View>
            <View style={styles.progressCircle}>
              <MaterialCommunityIcons name="lock" size={24} color="#191970" />
            </View>
          </View>
          <Text style={styles.progressSubtitle}>1 de 3 módulos concluídos</Text>
        </View>

        <TouchableOpacity style={styles.bottomButton}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  scrollContainer: { alignItems: "center", padding: 20 },
  mainImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginVertical: 20,
  },
  card: {
    backgroundColor: "#191970",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  cardTextContainer: { flex: 1 },
  cardTitle: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold" },
  cardSubtitle: { color: "#FFFFFF", fontSize: 14, marginTop: 5 },
  cardImage: { width: 80, height: 80, resizeMode: "contain" },
  infoText: {
    color: "#191970",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 30,
  },
  progressSection: { alignItems: "center", width: "100%" },
  progressTitle: { color: "#191970", fontSize: 18, fontWeight: "bold" },
  progressIcons: { flexDirection: "row", marginVertical: 15 },
  progressCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: "#191970",
  },
  completed: { backgroundColor: "#191970" },
  progressCircleText: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  progressSubtitle: { color: "#191970", fontSize: 14 },
  bottomButton: {
    backgroundColor: "#191970",
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
  },
  bottomButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
