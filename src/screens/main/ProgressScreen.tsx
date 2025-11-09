// src/screens/main/ProgressScreen.tsx
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { generateClient } from "aws-amplify/api";
import { listProgresses } from "../../graphql/queries";
import { useContrast } from "../../hooks/useContrast";
import { AccessibleText } from "../../components/AccessibleComponents";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// ✅ Importando os componentes otimizados
import { StatItem } from "../../components/progress/StatItem";
import { ModuleCard } from "../../components/progress/ModuleCard";

// Componente principal da tela
const ProgressScreenComponent = ({
  navigation,
}: RootStackScreenProps<"Progress">) => {
  const user = useAuthStore((state) => state.user);
  const { theme } = useContrast();
  const [moduleProgress, setModuleProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para o resumo
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(0);

  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  // Habilita o gesto de voltar
  useLayoutEffect(() => {
    navigation.setOptions({
      gestureEnabled: true,
    });
  }, [navigation]);

  const fetchProgressData = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let allProgress: any[] = [];
      let nextToken: string | null = null;
      const client = generateClient();

      console.log("--- INICIANDO BUSCA DE PROGRESSO ---");

      do {
        const queryWithCacheBuster = `
          # CacheBuster: ${Date.now()}-${Math.random()}
          ${listProgresses}
        `;

        const result: any = await client.graphql({
          query: queryWithCacheBuster,
          variables: {
            filter: { userId: { eq: user.userId } },
            limit: 1000,
            nextToken: nextToken,
          },
          authMode: "userPool",
        });

        const items = result?.data?.listProgresses?.items || [];
        allProgress.push(...items);
        nextToken = result?.data?.listProgresses?.nextToken || null;
      } while (nextToken);

      console.log(
        `[LOG] Total de registros encontrados: ${allProgress.length}`
      );

      // ✅✅✅ ESTA É A CORREÇÃO DO BUG ✅✅✅
      //
      // O bug: Estávamos filtrando por `p.completed === true`.
      // A correção: Vamos filtrar por `p.timeSpent > 0`.
      //
      // Por quê? Um registro "zerado" (que queremos ignorar) tem `timeSpent: 0`.
      // Qualquer tentativa real, mesmo uma falha com 20% que não foi marcada
      // como 'completed', terá `timeSpent > 0`. Isso garante que *todas*
      // as tentativas reais sejam consideradas.
      //
      const attemptedProgress = allProgress.filter(
        (p) => p.timeSpent && p.timeSpent > 0
      );

      console.log(
        `[LOG] Registros "tentados" (timeSpent > 0): ${attemptedProgress.length}`
      );
      if (attemptedProgress.length === 0) {
        console.log("[LOG] Nenhum módulo tentado encontrado.");
      }

      const latestByModule: Record<number, any> = {};

      // 2. Fazer o loop APENAS na lista filtrada (attemptedProgress)
      attemptedProgress.forEach((p: any) => {
        const moduleNum = Number(p.moduleNumber ?? 0);
        if (moduleNum === 0) return;

        const timestamp = p?.updatedAt || p?.completedAt || p?.createdAt;
        const currentTime = timestamp ? new Date(timestamp).getTime() : 0;

        if (!latestByModule[moduleNum]) {
          latestByModule[moduleNum] = p;
        } else {
          const existingTimestamp =
            latestByModule[moduleNum]?.updatedAt ||
            latestByModule[moduleNum]?.completedAt ||
            latestByModule[moduleNum]?.createdAt;
          const existingTime = existingTimestamp
            ? new Date(existingTimestamp).getTime()
            : 0;

          if (currentTime > existingTime) {
            latestByModule[moduleNum] = p;
          }
        }
      });
      // ✅✅✅ FIM DA CORREÇÃO ✅✅✅

      const latestProgress = Object.values(latestByModule)
        .map((p: any) => ({
          ...p,
          moduleNumber: Number(p.moduleNumber ?? 0),
          correctAnswers: Number(p.correctAnswers ?? 0),
          wrongAnswers: Number(p.wrongAnswers ?? 0),
          timeSpent: Number(p.timeSpent ?? 0),
          accuracy: Number(p.accuracy ?? 0),
        }))
        .sort((a, b) => a.moduleNumber - b.moduleNumber);

      console.log("--- DADOS FINAIS QUE SERÃO MOSTRADOS NA TELA ---");
      latestProgress.forEach((p) => {
        console.log(
          `  -> Módulo ${p.moduleNumber}: Nota ${p.accuracy}% (ID: ${p.id})`
        );
      });

      setModuleProgress(latestProgress);

      // Otimizado: Usando .reduce()
      const totals = latestProgress.reduce(
        (acc, p) => {
          acc.sumCorrect += p.correctAnswers;
          acc.sumWrong += p.wrongAnswers;
          acc.sumTime += p.timeSpent;
          acc.sumAccuracy += p.accuracy;
          return acc;
        },
        { sumCorrect: 0, sumWrong: 0, sumTime: 0, sumAccuracy: 0 }
      );

      const count = latestProgress.length;
      const avgAccuracy =
        count > 0 ? Math.round(totals.sumAccuracy / count) : 0;

      console.log("--- RESUMO GERAL ---");
      console.log(`   Precisão Média: ${avgAccuracy}%`);

      setTotalCorrect(totals.sumCorrect);
      setTotalWrong(totals.sumWrong);
      setTotalTime(totals.sumTime);
      setAvgAccuracy(avgAccuracy);

      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("❌ Erro ao buscar progresso:", error);
      setModuleProgress([]);
    } finally {
      setLoading(false);
      console.log("--- BUSCA FINALIZADA ---");
    }
  }, [user?.userId, headerFadeAnim]);

  useFocusEffect(
    useCallback(() => {
      console.log("📱 Tela de Progresso focada - Recarregando dados...");
      fetchProgressData();
    }, [fetchProgressData])
  );

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);

    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title="Progresso" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.text} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />
      <ScreenHeader title="Progresso" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View
          style={[
            styles.summaryCard,
            {
              opacity: headerFadeAnim,
              backgroundColor: theme.card,
            },
          ]}
        >
          <AccessibleText
            baseSize={20}
            style={[styles.sectionTitle, { color: theme.text }]}
          >
            📊 Resumo Geral
          </AccessibleText>
          <AccessibleText
            baseSize={12}
            style={[styles.sectionSubtitle, { color: theme.text }]}
          >
            Baseado nas últimas tentativas de cada módulo
          </AccessibleText>

          <View style={styles.statsGrid}>
            <StatItem
              icon="target"
              value={`${avgAccuracy}%`}
              label="Precisão Média"
              color="#FFC107"
              delay={0}
            />
            <StatItem
              icon="check-all"
              value={totalCorrect.toString()}
              label="Total Acertos"
              color="#4CAF50"
              delay={100}
            />
            <StatItem
              icon="close-circle"
              value={totalWrong.toString()}
              label="Total Erros"
              color="#F44336"
              delay={200}
            />
            <StatItem
              icon="clock-time-eight-outline"
              value={formatTime(totalTime)}
              label="Tempo Total"
              color="#2196F3"
              delay={300}
            />
            <StatItem
              icon="book-open-variant"
              value={moduleProgress.length.toString()}
              label="Módulos Feitos"
              color="#9C27B0"
              delay={400}
            />
            <StatItem
              icon="trophy"
              value={(user?.points ?? 0).toLocaleString("pt-BR")}
              label="Pontos"
              color="#FF9800"
              delay={500}
            />
          </View>
        </Animated.View>

        <View style={styles.section}>
          <AccessibleText
            baseSize={20}
            style={[styles.sectionTitleDark, { color: theme.text }]}
          >
            📚 Desempenho por Módulo
          </AccessibleText>
          <AccessibleText
            baseSize={12}
            style={[styles.sectionSubtitleDark, { color: theme.text }]}
          >
            Última tentativa de cada módulo - Arraste para ver mais detalhes
          </AccessibleText>

          {moduleProgress.length > 0 ? (
            moduleProgress.map((p, index) => (
              <ModuleCard
                key={`${p.moduleNumber}-${p.id}`}
                moduleNumber={p.moduleNumber}
                accuracy={p.accuracy}
                correctAnswers={p.correctAnswers}
                wrongAnswers={p.wrongAnswers}
                timeSpent={p.timeSpent}
                updatedAt={p.updatedAt}
                index={index}
                theme={theme}
                onPress={() =>
                  navigation.navigate("IncorrectAnswers", {
                    moduleNumber: p.moduleNumber,
                  })
                }
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="book-outline"
                size={64}
                color={theme.text}
              />
              <AccessibleText
                baseSize={16}
                style={[styles.emptyText, { color: theme.text }]}
              >
                Você ainda não completou nenhum módulo
              </AccessibleText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Envolva o export default com o GestureHandlerRootView
export default function ProgressScreen(
  props: RootStackScreenProps<"Progress">
) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProgressScreenComponent {...props} />
    </GestureHandlerRootView>
  );
}

// Estilos restantes (agora muito menores)
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionSubtitle: {
    marginBottom: 16,
  },
  sectionTitleDark: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionSubtitleDark: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  section: { marginBottom: 20 },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    textAlign: "center",
  },
});
