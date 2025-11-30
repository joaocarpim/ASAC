// src/screens/main/AchievementsScreen.tsx - OTIMIZADO
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
import { useSettings } from "../../hooks/useSettings";
import { useAuthStore } from "../../store/authStore";
import { generateClient } from "aws-amplify/api";
import { listProgresses } from "../../graphql/queries";

const MODULE_EMOJIS = ["🎓", "🏆", "⭐"];
const ACHIEVEMENT_EMOJIS = ["🥉", "🥈", "🥇", "🏆", "💎"];
const CARD_COLORS = ["#CD7F32", "#C0C0C0", "#DAA520", "#4CAF50", "#8A2BE2"];

// ✅ Cache simples em memória
let progressCache: any = null;
let cacheTime = 0;
const CACHE_DURATION = 10000; // 10 segundos

export default function AchievementsScreen() {
  const navigation = useNavigation();
  const { theme } = useContrast();
  const { user } = useAuthStore();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const [progressoAtual, setProgressoAtual] = useState(0);
  const [completedModulesList, setCompletedModulesList] = useState<number[]>(
    []
  );
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emblemsByPerformance, setEmblemsByPerformance] = useState<
    { moduleNumber: number; accuracy: number }[]
  >([]);
  const modulosTotais = 3;

  // ✅ OTIMIZAÇÃO 1: Memoizar estilos
  const styles = useMemo(
    () =>
      createStyles(
        theme,
        fontSizeMultiplier,
        isBoldTextEnabled,
        lineHeightMultiplier,
        letterSpacing,
        isDyslexiaFontEnabled
      ),
    [
      theme,
      fontSizeMultiplier,
      isBoldTextEnabled,
      lineHeightMultiplier,
      letterSpacing,
      isDyslexiaFontEnabled,
    ]
  );

  const fetchAchievements = useCallback(
    async (isRefresh = false) => {
      if (!user?.userId) {
        setLoading(false);
        return;
      }

      // ✅ OTIMIZAÇÃO 2: Usar cache se ainda válido
      const now = Date.now();
      if (!isRefresh && progressCache && now - cacheTime < CACHE_DURATION) {
        console.log("📦 Usando cache...");
        processProgressData(progressCache);
        setLoading(false);
        return;
      }

      if (!isRefresh) setLoading(true);

      try {
        const client = generateClient();

        // ✅ OTIMIZAÇÃO 3: Query mais simples, sem cache buster desnecessário
        const progressResult: any = await client.graphql({
          query: listProgresses,
          variables: {
            filter: { userId: { eq: user.userId } },
            limit: 100, // Limitar resultados
          },
          authMode: "userPool",
        });

        const rawList = progressResult?.data?.listProgresses?.items || [];

        // ✅ Salvar no cache
        progressCache = rawList;
        cacheTime = now;

        processProgressData(rawList);
      } catch (error) {
        console.error("❌ Erro ao buscar conquistas:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.userId]
  );

  // ✅ OTIMIZAÇÃO 4: Separar processamento de dados
  const processProgressData = useCallback(
    (rawList: any[]) => {
      const validAttempts = rawList.filter(
        (p: any) => p && p.moduleNumber && p.userId === user?.userId
      );

      const uniqueCompletedModules = (
        [
          ...new Set(validAttempts.map((p: any) => Number(p.moduleNumber))),
        ] as number[]
      ).sort((a, b) => a - b);

      setCompletedModulesList(uniqueCompletedModules);
      setProgressoAtual(uniqueCompletedModules.length);

      const calculatedAchievements = uniqueCompletedModules.map((modNum) => ({
        id: `achievement-${modNum}`, // ✅ Adicionar ID único
        title: `Módulo ${modNum} Concluído`,
        description: `Você concluiu o Módulo ${modNum}!`,
        moduleNumber: modNum,
      }));

      setAchievements(calculatedAchievements);

      // ✅ OTIMIZAÇÃO 5: Processamento mais eficiente
      const latestByModule = validAttempts.reduce((acc, p) => {
        const modNum = Number(p.moduleNumber);
        if (
          !acc[modNum] ||
          new Date(p.updatedAt || p.createdAt) >
            new Date(acc[modNum].updatedAt || acc[modNum].createdAt)
        ) {
          acc[modNum] = p;
        }
        return acc;
      }, {} as Record<number, any>);

      const modulePerformance = Object.values(latestByModule).map((p: any) => ({
        moduleNumber: Number(p.moduleNumber),
        accuracy: Number(p.accuracy ?? 0),
      }));

      setEmblemsByPerformance(modulePerformance);
    },
    [user?.userId]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    progressCache = null; // ✅ Limpar cache no refresh manual
    fetchAchievements(true);
  }, [fetchAchievements]);

  useFocusEffect(
    useCallback(() => {
      fetchAchievements();
    }, [fetchAchievements])
  );

  const handleGoBack = () => navigation.goBack();

  // ✅ OTIMIZAÇÃO 6: Renderizar ícones de forma eficiente
  const renderModuleIcons = useMemo(() => {
    return Array.from({ length: modulosTotais }, (_, i) => {
      const moduleNum = i + 1;
      const isCompleted = completedModulesList.includes(moduleNum);
      const progressData = emblemsByPerformance.find(
        (p) => p.moduleNumber === moduleNum
      );
      const accuracy = progressData?.accuracy ?? 0;
      const hasHighAccuracy = accuracy >= 70;

      return (
        <View
          key={moduleNum}
          style={[
            styles.moduloIconContainer,
            isCompleted && hasHighAccuracy && styles.moduloIconCompleted,
            isCompleted && !hasHighAccuracy && styles.moduloIconLowAccuracy,
          ]}
        >
          {!isCompleted ? (
            <MaterialCommunityIcons name="lock" size={28} color={theme.text} />
          ) : hasHighAccuracy ? (
            <Text style={styles.moduloEmoji}>{MODULE_EMOJIS[i]}</Text>
          ) : (
            <MaterialCommunityIcons
              name="check"
              size={28}
              color={theme.cardText}
            />
          )}
        </View>
      );
    });
  }, [completedModulesList, emblemsByPerformance, styles, theme]);

  // ✅ OTIMIZAÇÃO 7: Usar FlatList em vez de map
  const renderAchievementCard = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const bgColor = CARD_COLORS[index % CARD_COLORS.length];

      return (
        <View style={[styles.achievementCard, { backgroundColor: bgColor }]}>
          <View style={styles.achievementIconContainer}>
            <Text style={styles.achievementEmoji}>
              {ACHIEVEMENT_EMOJIS[index % ACHIEVEMENT_EMOJIS.length]}
            </Text>
          </View>
          <View style={styles.achievementTextContainer}>
            <Text style={styles.achievementTitle}>{item.title}</Text>
            <Text style={styles.achievementDate}>{item.description}</Text>
          </View>
        </View>
      );
    },
    [styles]
  );

  const renderPerformanceCard = useCallback(
    ({
      item,
      index,
    }: {
      item: { moduleNumber: number; accuracy: number };
      index: number;
    }) => (
      <View style={styles.emblemCard}>
        <Text style={styles.emblemEmoji}>
          {MODULE_EMOJIS[(item.moduleNumber - 1) % MODULE_EMOJIS.length]}
        </Text>
        <Text style={styles.emblemAccuracy}>{item.accuracy}%</Text>
        <Text style={styles.emblemModule}>Módulo {item.moduleNumber}</Text>
      </View>
    ),
    [styles]
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.page}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />

      {/* Header fixo */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} accessibilityLabel="Voltar">
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color={theme.text}
          />
        </TouchableOpacity>
        <AccessibleHeader level={1} style={styles.headerTitle}>
          Minhas Conquistas
        </AccessibleHeader>
        <View style={styles.headerIconPlaceholder} />
      </View>

      {/* ✅ OTIMIZAÇÃO 8: FlatList com ListHeaderComponent */}
      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        renderItem={renderAchievementCard}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.text}
            colors={[theme.button || "#000"]}
          />
        }
        ListHeaderComponent={
          <>
            <AccessibleView accessibilityText="Medalha de conquistas">
              <Text style={styles.seloEmoji}>🎖️</Text>
            </AccessibleView>

            {/* Módulos */}
            <View style={styles.achievementsContainer}>
              <Text style={[styles.sectionTitle, { color: theme.cardText }]}>
                Módulos Concluídos
              </Text>
              <View style={styles.modulosRow}>{renderModuleIcons}</View>
              <Text style={[styles.progressText, { color: theme.cardText }]}>
                {progressoAtual} de {modulosTotais} módulos concluídos
              </Text>
            </View>

            {/* Performance */}
            <View style={styles.achievementsContainer}>
              <Text style={[styles.sectionTitle, { color: theme.cardText }]}>
                🌟 Últimas Pontuações
              </Text>
              <Text
                style={[styles.performanceSubtitle, { color: theme.cardText }]}
              >
                (Última pontuação registrada em cada módulo)
              </Text>

              {emblemsByPerformance.length > 0 ? (
                <FlatList
                  data={emblemsByPerformance}
                  keyExtractor={(item) => `perf-${item.moduleNumber}`}
                  renderItem={renderPerformanceCard}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.emblemsGrid}
                />
              ) : (
                <View style={styles.emptyPerformance}>
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={36}
                    color={theme.cardText}
                    style={{ opacity: 0.8 }}
                  />
                  <Text
                    style={[styles.performanceInfo, { color: theme.cardText }]}
                  >
                    Suas pontuações aparecerão aqui após você finalizar um
                    módulo.
                  </Text>
                </View>
              )}
            </View>

            <Text
              style={[
                styles.sectionTitle,
                { color: theme.text, marginTop: 10 },
              ]}
            >
              Suas Conquistas
            </Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons
              name="emoticon-sad-outline"
              size={50}
              color={theme.cardText}
              style={{ opacity: 0.5 }}
            />
            <Text style={[styles.emptyTitle, { color: theme.cardText }]}>
              Sem Conquistas Ainda
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.cardText }]}>
              Complete os módulos para ganhar emblemas!
            </Text>
          </View>
        }
        // ✅ OTIMIZAÇÃO 9: Performance props
        removeClippedSubviews={Platform.OS === "android"}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={5}
      />
    </View>
  );
}

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.background },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 10,
      color: theme.text,
      fontSize: 14 * fontMultiplier,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 15,
      paddingHorizontal: 20,
    },
    headerTitle: {
      color: theme.text,
      opacity: 0.8,
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    headerIconPlaceholder: { width: 28 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 },
    seloEmoji: { fontSize: 80, marginBottom: 20, textAlign: "center" },
    achievementsContainer: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    performanceSubtitle: {
      fontSize: 12 * fontMultiplier,
      opacity: 0.8,
      textAlign: "center",
      marginBottom: 15,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    modulosRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 15,
    },
    moduloIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 8,
      opacity: 0.6,
      borderWidth: 2,
      borderColor: theme.cardText,
    },
    moduloIconCompleted: { opacity: 1, borderColor: "#4CD964" },
    moduloIconLowAccuracy: { opacity: 1, borderColor: theme.cardText },
    moduloEmoji: { fontSize: 32 },
    progressText: {
      fontSize: 14 * fontMultiplier,
      fontWeight: isBold ? "bold" : "normal",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emblemsGrid: { paddingHorizontal: 6 },
    emblemCard: {
      backgroundColor: "#FFD700",
      marginHorizontal: 6,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      minWidth: 80,
    },
    emblemEmoji: { fontSize: 40 },
    emblemAccuracy: {
      color: "#191970",
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 5,
    },
    emblemModule: { color: "#191970", fontSize: 12, marginTop: 2 },
    achievementCard: {
      borderRadius: 16,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    achievementIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#FFF",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },
    achievementEmoji: { fontSize: 32 },
    achievementTextContainer: { flex: 1 },
    achievementTitle: {
      fontSize: 16 * fontMultiplier,
      fontWeight: "bold",
      color: "#FFFFFF",
      marginBottom: 4,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    achievementDate: {
      fontSize: 12 * fontMultiplier,
      color: "#FFFFFF",
      opacity: 0.9,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptyCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 30,
      alignItems: "center",
      marginTop: 20,
    },
    emptyTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      marginTop: 15,
      marginBottom: 8,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptySubtitle: {
      fontSize: 14 * fontMultiplier,
      textAlign: "center",
      opacity: 0.8,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptyPerformance: {
      alignItems: "center",
      paddingVertical: 12,
      width: "100%",
    },
    performanceInfo: {
      marginTop: 10,
      textAlign: "center",
      maxWidth: 280,
      fontSize: 13 * fontMultiplier,
      opacity: 0.9,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });
