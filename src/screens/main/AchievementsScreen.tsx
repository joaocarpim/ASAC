// src/screens/main/ProgressScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { useAuthStore } from "../../store/authStore";
import { generateClient } from "aws-amplify/api";

type ProgressItem = {
  id: string;
  moduleId: string;
  moduleNumber: number;
  correct?: number;
  wrong?: number;
  accuracy?: number;
  durationSec?: number;
  finished?: boolean;
};

export default function ProgressScreen() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      try {
        const client = generateClient();
        const QUERY = /* GraphQL */ `
          query ListProgress($filter: ModelModuleProgressFilterInput) {
            listModuleProgresses(filter: $filter) {
              items { id moduleId moduleNumber correct wrong accuracy durationSec finished }
            }
          }
        `;
        const res: any = await client.graphql({ query: QUERY, variables: { filter: { userId: { eq: user.userId } } } });
        const list = res.data?.listModuleProgresses?.items || [];
        setItems(list.sort((a: any, b: any) => a.moduleNumber - b.moduleNumber));
      } catch (e) {
        console.error("Erro ProgressScreen:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user || loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#191970" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Progresso</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Módulo {item.moduleNumber}</Text>
            <Text>Acertos: {item.correct ?? 0}</Text>
            <Text>Erros: {item.wrong ?? 0}</Text>
            <Text>Precisão: {item.accuracy ? (item.accuracy * 100).toFixed(1) + "%" : "0%"}</Text>
            <Text>Tempo: {item.durationSec ?? 0}s</Text>
            <Text>Concluído: {item.finished ? "Sim" : "Não"}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20 }}>Nenhum progresso encontrado.</Text>}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFC700" },
  title: { fontSize: 22, fontWeight: "bold", color: "#191970", padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 12, marginHorizontal: 8 },
  cardTitle: { fontWeight: "700", marginBottom: 6 },
});
