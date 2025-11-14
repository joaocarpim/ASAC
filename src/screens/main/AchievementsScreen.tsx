import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Platform,
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
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";
import { useAuthStore } from "../../store/authStore";
import { generateClient } from "aws-amplify/api";
import { listProgresses, getUser } from "../../graphql/queries";

const MODULE_EMOJIS = ["🎓", "🏆", "⭐"];
const ACHIEVEMENT_EMOJIS = ["🥉", "🥈", "🥇", "🏆", "💎"];
const CARD_COLORS = ["#CD7F32", "#C0C0C0", "#DAA520", "#4CAF50", "#8A2BE2"];

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
  const [emblemsByPerformance, setEmblemsByPerformance] = useState<
    { moduleNumber: number; accuracy: number }[]
  >([]);
  const modulosTotais = 3;

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const fetchAchievements = useCallback(async () => {
    if (!user?.userId) {
      console.warn("⚠️ Nenhum userId disponível");
      setLoading(false);
      return;
    }

    setLoading(true);
    const client = generateClient();

    try {
      console.log("🏆 Buscando conquistas do usuário:", user.userId);

      console.log("👤 Buscando dados frescos do usuário...");
      const userQueryWithBuster = `
        # CacheBuster: ${Date.now()}-${Math.random()}
        ${getUser}
      `;
      const userResult: any = await client.graphql({
        query: userQueryWithBuster,
        variables: { id: user.userId },
        authMode: "userPool",
      });

      const dbUser = userResult.data?.getUser;
      console.log("👤 Dados frescos do usuário:", dbUser);

      if (dbUser) {
        const completedModules = Array.isArray(dbUser.modulesCompleted)
          ? [...new Set(dbUser.modulesCompleted)]
              .filter(Boolean)
              .map((m: any) => Number(m))
          : [];

        console.log("📚 Módulos completados (frescos):", completedModules);
        setProgressoAtual(completedModules.length);
        setCompletedModulesList(completedModules);

        const dbAchievements = dbUser.achievements?.items || [];
        const newAchievements: any[] = [];
        for (let moduleNum of completedModules) {
          const exists = dbAchievements.some(
            (a: any) => a.moduleNumber === moduleNum
          );
          if (!exists) {
            newAchievements.push({
              title: `Módulo ${moduleNum} Concluído`,
              description: `Você concluiu o Módulo ${moduleNum}!`,
              moduleNumber: moduleNum,
              createdAt: new Date().toISOString(),
            });
          }
        }
        const allAchievements = [...dbAchievements, ...newAchievements];
        console.log("🎖️ Conquistas totais (frescas):", allAchievements);
        setAchievements(allAchievements);
      }

      console.log("📊 Buscando dados de progresso para emblemas...");
      const progressQueryWithBuster = `
        # CacheBuster: ${Date.now()}-${Math.random()}
        ${listProgresses}
      `;
      const result: any = await client.graphql({
        query: progressQueryWithBuster,
        variables: { filter: { userId: { eq: user.userId } } },
        authMode: "userPool",
      });

      const rawList = result?.data?.listProgresses?.items || [];
      console.log("📊 Raw progress data:", rawList);

      const latestProgressByModule = new Map<number, any>();

      (Array.isArray(rawList) ? rawList : []).forEach((p: any) => {
        if (!p) return;
        const moduleNumber = parseInt(p.moduleNumber, 10);

        if (isNaN(moduleNumber) || !(p.timeSpent > 0)) {
          return;
        }

        const timestamp = p?.updatedAt || p?.completedAt || p?.createdAt;
        const currentTime = timestamp ? new Date(timestamp).getTime() : 0;

        const existing = latestProgressByModule.get(moduleNumber);

        if (!existing) {
          latestProgressByModule.set(moduleNumber, p);
        } else {
          const existingTimestamp =
            existing.updatedAt || existing.completedAt || existing.createdAt;
          const existingTime = existingTimestamp
            ? new Date(existingTimestamp).getTime()
            : 0;

          if (currentTime > existingTime) {
            latestProgressByModule.set(moduleNumber, p);
          }
        }
      });

      const latestProgressRecords = Array.from(latestProgressByModule.values());
      console.log("🏆 Últimos progressos:", latestProgressRecords);

      const modulePerformance: { moduleNumber: number; accuracy: number }[] =
        [];

      for (const p of latestProgressRecords) {
        const acc = Number(p.accuracy ?? 0);
        const modNum = Number(p.moduleNumber);

        console.log(`📊 Módulo ${modNum}: Última precisão registrada: ${acc}%`);

        modulePerformance.push({
          moduleNumber: modNum,
          accuracy: acc,
        });
      }

      setEmblemsByPerformance(modulePerformance);
      console.log("🏆 Emblemas/Últimas Pontuações:", modulePerformance);
    } catch (error) {
      console.error("❌ Erro ao buscar conquistas:", error);
      setEmblemsByPerformance([]);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useFocusEffect(
    useCallback(() => {
      fetchAchievements();
    }, [fetchAchievements])
  );

  const handleGoBack = () => navigation.goBack();

  // ✅ Só criar gesture em plataformas mobile
  const flingRight =
    Platform.OS !== "web"
      ? Gesture.Fling().direction(Directions.RIGHT).onEnd(handleGoBack)
      : undefined;

  const renderModuleIcons = () => {
    return Array.from({ length: modulosTotais }, (_, i) => {
      const moduleNum = i + 1;
      const isCompleted = completedModulesList.includes(moduleNum);
      const progressData = emblemsByPerformance.find(
        (p) => p.moduleNumber === moduleNum
      );
      const accuracy = progressData ? progressData.accuracy : 0;
      const hasHighAccuracy = accuracy >= 70;

      const scaleAnim = new Animated.Value(1);
      if (isCompleted && hasHighAccuracy) {
        Animated.sequence([
          Animated.spring(scaleAnim, { toValue: 1.3, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        ]).start();
      }

      return (
        <Animated.View
          key={i}
          style={[
            styles.moduloIconContainer,
            isCompleted && hasHighAccuracy && styles.moduloIconCompleted,
            isCompleted && !hasHighAccuracy && styles.moduloIconLowAccuracy,
            { transform: [{ scale: scaleAnim }] },
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
        </Animated.View>
      );
    });
  };

  const renderAchievementCard = (achievement: any, index: number) => {
    const scaleAnim = new Animated.Value(0.8);
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
    const bgColor = CARD_COLORS[index % CARD_COLORS.length];

    return (
      <Animated.View
        key={index}
        style={[
          styles.achievementCard,
          { backgroundColor: bgColor, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.achievementIconContainer}>
          <Text style={styles.achievementEmoji}>
            {ACHIEVEMENT_EMOJIS[index % ACHIEVEMENT_EMOJIS.length]}
          </Text>
        </View>
        <View style={styles.achievementTextContainer}>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDate}>
            {new Date(achievement.createdAt).toLocaleDateString("pt-BR")}
          </Text>
        </View>
      </Animated.View>
    );
  };

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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={styles.loadingText}>Carregando conquistas...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          <AccessibleView accessibilityText="Medalha de conquistas">
            <Text style={styles.seloEmoji}>🎖️</Text>
          </AccessibleView>

          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>Módulos Concluídos</Text>
            <View style={styles.modulosRow}>{renderModuleIcons()}</View>
            <Text style={styles.progressText}>
              {progressoAtual} de {modulosTotais} módulos concluídos
            </Text>
          </View>

          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>🌟 Últimas Pontuações</Text>
            <Text style={styles.performanceSubtitle}>
              (Última pontuação registrada em cada módulo)
            </Text>

            {emblemsByPerformance.length > 0 ? (
              <View style={styles.emblemsGrid}>
                {emblemsByPerformance.map((e, i) => (
                  <View key={i} style={styles.emblemCard}>
                    <Text style={styles.emblemEmoji}>
                      {MODULE_EMOJIS[e.moduleNumber - 1]}
                    </Text>
                    <Text style={styles.emblemAccuracy}>{e.accuracy}%</Text>
                    <Text style={styles.emblemModule}>
                      Módulo {e.moduleNumber}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyPerformance}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={36}
                  color="#FFFFFF"
                  style={{ opacity: 0.8 }}
                />
                <Text style={styles.performanceInfo}>
                  Suas pontuações aparecerão aqui após você finalizar um módulo.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.achievementsList}>
            <Text style={styles.sectionTitle}>Suas Conquistas</Text>
            {achievements.length > 0 ? (
              achievements.map((achievement, index) =>
                renderAchievementCard(achievement, index)
              )
            ) : (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons
                  name="emoticon-sad-outline"
                  size={50}
                  color={theme.cardText}
                  style={{ opacity: 0.5 }}
                />
                <Text style={styles.emptyTitle}>Sem Conquistas Ainda</Text>
                <Text style={styles.emptySubtitle}>
                  Complete os módulos para ganhar emblemas!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );

  // ✅ Envolver com GestureDetector apenas em mobile
  if (Platform.OS !== "web" && flingRight) {
    return (
      <GestureDetector gesture={flingRight}>{renderContent()}</GestureDetector>
    );
  }

  // ✅ Em web, retornar diretamente sem GestureDetector
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
    container: { flex: 1 },
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
      color: theme.cardText,
      marginBottom: 10,
      textAlign: "center",
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    performanceSubtitle: {
      fontSize: 12 * fontMultiplier,
      color: theme.cardText,
      opacity: 0.7,
      textAlign: "center",
      marginBottom: 15,
      lineHeight: 12 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    modulosRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
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
      opacity: 0.4,
      borderWidth: 2,
      borderColor: theme.cardText,
    },
    moduloIconCompleted: { opacity: 1, borderColor: "#4CD964" },
    moduloIconLowAccuracy: { opacity: 1, borderColor: theme.cardText },
    moduloEmoji: { fontSize: 32 },
    progressText: {
      fontSize: 14 * fontMultiplier,
      color: theme.cardText,
      fontWeight: isBold ? "bold" : "normal",
      lineHeight: 14 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emblemsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      width: "100%",
    },
    emblemCard: {
      backgroundColor: "#FFD700",
      margin: 6,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      minWidth: 80,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    emblemEmoji: { fontSize: 40 },
    emblemAccuracy: {
      color: "#191970",
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 5,
    },
    emblemModule: { color: "#191970", fontSize: 12, marginTop: 2 },
    achievementsList: { marginTop: 10 },
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
      lineHeight: 16 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    achievementDate: {
      fontSize: 12 * fontMultiplier,
      color: "#FFFFFF",
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
    },
    emptyTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginTop: 15,
      marginBottom: 8,
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptySubtitle: {
      fontSize: 14 * fontMultiplier,
      color: theme.cardText,
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
      color: "#FFFFFF",
      textAlign: "center",
      maxWidth: 280,
      fontSize: 13 * fontMultiplier,
      lineHeight: 18 * lineHeight,
      opacity: 0.9,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });
