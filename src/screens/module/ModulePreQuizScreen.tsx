// src/screens/module/ModulePreQuizScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { DEFAULT_MODULES } from "../../navigation/moduleTypes";
import { useAuthStore } from "../../store/authStore";
import { canStartModule } from "../../services/progressService";

export default function ModulePreQuizScreen({ route, navigation }: RootStackScreenProps<"ModulePreQuiz">) {
  const { moduleId } = route.params;
  const [moduleData, setModuleData] = useState<any>(null);
  const { user } = useAuthStore();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const m = DEFAULT_MODULES.find((mm) => mm.moduleId === moduleId);
    setModuleData(m);
  }, [moduleId]);

  const handleStartQuiz = async () => {
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }
    setChecking(true);
    const allowed = await canStartModule(user.userId, moduleId);
    setChecking(false);
    if (!allowed) {
      Alert.alert("Bloqueado", "Você precisa concluir o módulo anterior primeiro.");
      return;
    }
    navigation.navigate("ModuleQuiz", { moduleId });
  };

  if (!moduleData) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#191970" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <View style={{ padding: 20 }}>
        <Text style={styles.title}>{moduleData.title}</Text>
        <Text style={styles.desc}>{moduleData.description}</Text>
        <Text style={styles.info}>Este quiz tem {moduleData.sections.length ? moduleData.sections.length : "N/A"} páginas de conteúdo como base.</Text>

        <TouchableOpacity style={styles.startBtn} onPress={handleStartQuiz} disabled={checking}>
          <Text style={styles.startText}>{checking ? "Verificando..." : "Iniciar Quiz"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", color: "#191970", marginBottom: 10 },
  desc: { color: "#191970", fontSize: 16, marginBottom: 16 },
  info: { color: "#191970", marginBottom: 20 },
  startBtn: { backgroundColor: "#191970", padding: 16, borderRadius: 12, alignItems: "center" },
  startText: { color: "#fff", fontWeight: "bold" },
});
