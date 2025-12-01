// src/screens/main/AchievementsScreen.tsx
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
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";

const MODULE_EMOJIS = ["🎓", "🏆", "⭐"];
const ACHIEVEMENT_EMOJIS = ["🥉", "🥈", "🥇", "🏆", "💎"];
const FALLBACK_COLORS = ["#CD7F32", "#C0C0C0", "#DAA520", "#4CAF50", "#8A2BE2"];

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
  const [attemptedModulesList, setAttemptedModulesList] = useState<number[]>(
    []
  );
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [emblemsByPerformance, setEmblemsByPerformance] = useState<
    { moduleNumber: number; accuracy: number; passed: boolean }[]
  >([]);
  const modulosTotais = 3;

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

  const fetchAchievements = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    if (!refreshing) setLoading(true);

    try {
      const client = generateClient();
      const progressResult: any = await client.graphql({
        query: listProgresses,
        variables: {
          filter: { userId: { eq: user.userId } },
          limit: 1000,
        },
        authMode: "userPool",
      });

      const rawList = progressResult?.data?.listProgresses?.items || [];
      processProgressData(rawList);
    } catch (error) {
      console.error("❌ Erro ao buscar conquistas:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.userId, refreshing]);

  const processProgressData = useCallback(
    (rawList: any[]) => {
      const validAttempts = rawList.filter(
        (p: any) => p && p.moduleNumber && p.userId === user?.userId
      );

      const sortedAttempts = validAttempts.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        return dateB - dateA;
      });

      const latestByModule: Record<number, any> = {};
      sortedAttempts.forEach((p) => {
        const modNum = Number(p.moduleNumber);
        if (!latestByModule[modNum]) {
          latestByModule[modNum] = p;
        }
      });

      const latestAttempts = Object.values(latestByModule);

      const uniqueCompletedModules = (
        [
          ...new Set(
            latestAttempts
              .filter((p: any) => {
                const acc = Number(p.accuracy || 0);
                return acc >= 70;
              })
              .map((p: any) => Number(p.moduleNumber))
          ),
        ] as number[]
      ).sort((a, b) => a - b);

      const uniqueAttemptedModules = (
        [
          ...new Set(latestAttempts.map((p: any) => Number(p.moduleNumber))),
        ] as number[]
      ).sort((a, b) => a - b);

      setCompletedModulesList(uniqueCompletedModules);
      setAttemptedModulesList(uniqueAttemptedModules);
      setProgressoAtual(uniqueCompletedModules.length);

      const calculatedAchievements = uniqueAttemptedModules.map((modNum) => {
        const isPassed = uniqueCompletedModules.includes(modNum);
        const lastAttempt = latestByModule[modNum];
        const accuracy = Math.round(Number(lastAttempt?.accuracy || 0));

        return {
          id: `achievement-${modNum}`,
          title: isPassed
            ? `Módulo ${modNum} Concluído`
            : `Módulo ${modNum} Tentado`,
          description: isPassed
            ? `Você concluiu o Módulo ${modNum} com ${accuracy}% de acerto!`
            : `Última tentativa: ${accuracy}%. Continue praticando!`,
          moduleNumber: modNum,
          passed: isPassed,
          accuracy: accuracy,
        };
      });

      setAchievements(calculatedAchievements);

      const modulePerformance = latestAttempts.map((p: any) => {
        const acc = Number(p.accuracy ?? 0);
        const passed = acc >= 70;

        return {
          moduleNumber: Number(p.moduleNumber),
          accuracy: acc,
          passed: passed,
        };
      });

      setEmblemsByPerformance(modulePerformance);
    },
    [user?.userId]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAchievements();
  }, [fetchAchievements]);

  useFocusEffect(
    useCallback(() => {
      fetchAchievements();
    }, [fetchAchievements])
  );

  const handleGoBack = () => navigation.goBack();

  const flingRight =
    Platform.OS !== "web"
      ? Gesture.Fling().direction(Directions.RIGHT).onEnd(handleGoBack)
      : undefined;

  // ---------------------------------------------------------
  // 1. ÍCONES DOS MÓDULOS (TOPO) - Adaptado para Tema
  // ---------------------------------------------------------
  const renderModuleIcons = useMemo(() => {
    return Array.from({ length: modulosTotais }, (_, i) => {
      const moduleNum = i + 1;
      const isCompleted = completedModulesList.includes(moduleNum);
      const isAttempted = attemptedModulesList.includes(moduleNum);

      // CORRIGIDO: Usando theme.text no lugar de theme.border
      let borderColor = theme.text;
      let iconColor = theme.text;

      if (isCompleted) {
        borderColor = theme.text;
      } else if (isAttempted) {
        borderColor = theme.cardText;
        iconColor = theme.cardText;
      }

      return (
        <View
          key={moduleNum}
          style={[
            styles.moduloIconContainer,
            { borderColor: borderColor },
            isCompleted && styles.moduloIconCompleted,
            isAttempted && !isCompleted && styles.moduloIconAttempted,
          ]}
        >
          {!isAttempted ? (
            <MaterialCommunityIcons name="lock" size={28} color={theme.text} />
          ) : isCompleted ? (
            <Text style={styles.moduloEmoji}>{MODULE_EMOJIS[i]}</Text>
          ) : (
            <MaterialCommunityIcons
              name="check-circle"
              size={32}
              color={theme.text}
            />
          )}
        </View>
      );
    });
  }, [completedModulesList, attemptedModulesList, styles, theme]);

  // ---------------------------------------------------------
  // 2. LISTA DE CONQUISTAS - Adaptado para Tema
  // ---------------------------------------------------------
  const renderAchievementCard = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      // CORRIGIDO: Usando theme.text no lugar de theme.border
      const accentColor = item.passed
        ? FALLBACK_COLORS[index % FALLBACK_COLORS.length]
        : theme.text;

      return (
        <View
          style={[
            styles.achievementCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.text, // CORRIGIDO
              borderLeftWidth: 6,
              borderLeftColor: accentColor,
            },
          ]}
        >
          <View
            style={[
              styles.achievementIconContainer,
              // CORRIGIDO: Usando theme.text na borda
              { backgroundColor: theme.background, borderColor: theme.text },
            ]}
          >
            <Text style={styles.achievementEmoji}>
              {item.passed
                ? ACHIEVEMENT_EMOJIS[index % ACHIEVEMENT_EMOJIS.length]
                : "🔄"}
            </Text>
          </View>
          <View style={styles.achievementTextContainer}>
            <Text style={[styles.achievementTitle, { color: theme.cardText }]}>
              {item.title}
            </Text>
            <Text style={[styles.achievementDate, { color: theme.cardText }]}>
              {item.description}
            </Text>
          </View>
        </View>
      );
    },
    [styles, theme]
  );

  // ---------------------------------------------------------
  // 3. BOXES DE PORCENTAGEM (PERFORMANCE) - Adaptado para Tema
  // ---------------------------------------------------------
  const renderPerformanceCard = useCallback(
    ({
      item,
    }: {
      item: { moduleNumber: number; accuracy: number; passed: boolean };
    }) => (
      <View
        style={[
          styles.emblemCard,
          {
            backgroundColor: theme.card,
            // CORRIGIDO: Usando theme.text no lugar de theme.border
            borderColor: theme.text,
            borderWidth: 2,
          },
        ]}
      >
        <Text style={styles.emblemEmoji}>
          {MODULE_EMOJIS[(item.moduleNumber - 1) % MODULE_EMOJIS.length]}
        </Text>
        <Text style={[styles.emblemAccuracy, { color: theme.cardText }]}>
          {Math.round(item.accuracy)}%
        </Text>
        <Text style={[styles.emblemModule, { color: theme.cardText }]}>
          Módulo {item.moduleNumber}
        </Text>
        {!item.passed && (
          <View
            style={[
              styles.notPassedBadge,
              { borderColor: theme.text, backgroundColor: "transparent" },
            ]}
          >
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={12}
              color={theme.text}
            />
            <Text style={[styles.emblemStatus, { color: theme.text }]}>
              Não aprovado
            </Text>
          </View>
        )}
      </View>
    ),
    [styles, theme]
  );

  const renderContent = () => (
    <View style={styles.page}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />
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

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
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

              <View style={styles.achievementsContainer}>
                <Text style={[styles.sectionTitle, { color: theme.cardText }]}>
                  Módulos Concluídos
                </Text>
                <View style={styles.modulosRow}>{renderModuleIcons}</View>
                <Text style={[styles.progressText, { color: theme.cardText }]}>
                  {progressoAtual} de {modulosTotais} módulos concluídos
                </Text>

                {/* CORRIGIDO: Border top color usando theme.text */}
                <View
                  style={[
                    styles.legendContainer,
                    { borderTopColor: theme.text },
                  ]}
                >
                  <View style={styles.legendItem}>
                    <MaterialCommunityIcons
                      name="lock"
                      size={16}
                      color={theme.cardText}
                    />
                    <Text
                      style={[styles.legendText, { color: theme.cardText }]}
                    >
                      Bloqueado
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={16}
                      color={theme.cardText}
                    />
                    <Text
                      style={[styles.legendText, { color: theme.cardText }]}
                    >
                      Tentado
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <Text style={{ fontSize: 16 }}>🏆</Text>
                    <Text
                      style={[styles.legendText, { color: theme.cardText }]}
                    >
                      Concluído
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.achievementsContainer}>
                <Text style={[styles.sectionTitle, { color: theme.cardText }]}>
                  🌟 Última Pontuação
                </Text>
                <Text
                  style={[
                    styles.performanceSubtitle,
                    { color: theme.cardText },
                  ]}
                >
                  (Sua última tentativa em cada módulo)
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
                      style={[
                        styles.performanceInfo,
                        { color: theme.cardText },
                      ]}
                    >
                      Suas pontuações aparecerão aqui após tentar algum módulo.
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.text,
                    marginTop: 10,
                    marginBottom: 10,
                    alignSelf: "center",
                  },
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
        />
      )}
    </View>
  );

  if (Platform.OS !== "web" && flingRight) {
    return (
      <GestureDetector gesture={flingRight}>{renderContent()}</GestureDetector>
    );
  }
  return renderContent();
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
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing,
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
      borderWidth: 1,
      borderColor: theme.text, // CORRIGIDO
    },
    sectionTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      marginBottom: 10,
      textAlign: "center",
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    performanceSubtitle: {
      fontSize: 12 * fontMultiplier,
      opacity: 0.8,
      textAlign: "center",
      marginBottom: 15,
      lineHeight: 12 * fontMultiplier * lineHeight,
      letterSpacing,
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
      borderWidth: 2,
    },
    moduloIconCompleted: { opacity: 1 },
    moduloIconAttempted: { opacity: 1 },
    moduloEmoji: { fontSize: 32 },
    progressText: {
      fontSize: 14 * fontMultiplier,
      fontWeight: isBold ? "bold" : "normal",
      lineHeight: 14 * fontMultiplier * lineHeight,
      letterSpacing,
      marginBottom: 15,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    legendContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
      paddingTop: 10,
      borderTopWidth: 1,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    legendText: {
      fontSize: 11 * fontMultiplier,
      opacity: 1,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emblemsGrid: { paddingHorizontal: 6 },
    emblemCard: {
      marginHorizontal: 6,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      minWidth: 100,
    },
    emblemEmoji: { fontSize: 40 },
    emblemAccuracy: {
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 5,
    },
    emblemModule: { fontSize: 12, marginTop: 2 },
    notPassedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderWidth: 1,
      borderRadius: 10,
    },
    emblemStatus: {
      fontSize: 9,
      fontWeight: "bold",
    },
    achievementCard: {
      borderRadius: 16,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
    },
    achievementIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 1,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },
    achievementEmoji: { fontSize: 32 },
    achievementTextContainer: { flex: 1 },
    achievementTitle: {
      fontSize: 16 * fontMultiplier,
      fontWeight: "bold",
      marginBottom: 4,
      lineHeight: 16 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    achievementDate: {
      fontSize: 12 * fontMultiplier,
      opacity: 0.9,
      lineHeight: 12 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptyCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 30,
      alignItems: "center",
      marginTop: 20,
      borderWidth: 1,
      borderColor: theme.text, // CORRIGIDO
    },
    emptyTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      marginTop: 15,
      marginBottom: 8,
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptySubtitle: {
      fontSize: 14 * fontMultiplier,
      textAlign: "center",
      opacity: 0.8,
      lineHeight: 20 * lineHeight,
      fontWeight: isBold ? "bold" : "normal",
      letterSpacing,
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
      lineHeight: 18 * lineHeight,
      opacity: 0.9,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });
