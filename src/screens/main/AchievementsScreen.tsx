// src/screens/main/AchievementsScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
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
import { listProgresses } from "../../graphql/queries";

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
      setLoading(false);
      return;
    }

    setLoading(true);
    const client = generateClient();

    try {
      // 1. Busca progresso bruto (source of truth)
      const progressQueryWithBuster = `
        # CacheBuster: ${Date.now()}
        ${listProgresses}
      `;
      const progressResult: any = await client.graphql({
        query: progressQueryWithBuster,
        variables: { filter: { userId: { eq: user.userId } } },
        authMode: "userPool",
      });

      const rawList = progressResult?.data?.listProgresses?.items || [];

      // 2. Filtra tentativas válidas (com tempo gasto > 0)
      const validAttempts = rawList.filter((p: any) => p && p.timeSpent > 0);

      // 3. Identifica módulos únicos completados
      const uniqueCompletedModules = (
        [
          ...new Set(validAttempts.map((p: any) => Number(p.moduleNumber))),
        ] as number[]
      ).sort((a, b) => a - b);

      setCompletedModulesList(uniqueCompletedModules);
      setProgressoAtual(uniqueCompletedModules.length);

      // 4. Recalcula conquistas baseadas no progresso real
      const calculatedAchievements = uniqueCompletedModules.map((modNum) => ({
        title: `Módulo ${modNum} Concluído`,
        description: `Você concluiu o Módulo ${modNum}!`,
        moduleNumber: modNum,
        createdAt: new Date().toISOString(),
      }));

      setAchievements(calculatedAchievements);

      // 5. Calcula performance (Emblemas)
      const latestProgressByModule = new Map<number, any>();

      validAttempts.forEach((p: any) => {
        const modNum = Number(p.moduleNumber);
        const timestamp = p.updatedAt || p.createdAt;
        const currentTime = new Date(timestamp).getTime();

        const existing = latestProgressByModule.get(modNum);
        if (!existing) {
          latestProgressByModule.set(modNum, p);
        } else {
          const existingTime = new Date(
            existing.updatedAt || existing.createdAt
          ).getTime();
          if (currentTime > existingTime) {
            latestProgressByModule.set(modNum, p);
          }
        }
      });

      const modulePerformance = Array.from(latestProgressByModule.values()).map(
        (p: any) => ({
          moduleNumber: Number(p.moduleNumber),
          accuracy: Number(p.accuracy ?? 0),
        })
      );

      setEmblemsByPerformance(modulePerformance);
    } catch (error) {
      console.error("❌ Erro ao buscar conquistas:", error);
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

      return (
        <View
          key={i}
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
  };

  const renderAchievementCard = (achievement: any, index: number) => {
    // Usando cores do array para fundo
    const bgColor = CARD_COLORS[index % CARD_COLORS.length];

    return (
      <View
        key={index}
        style={[styles.achievementCard, { backgroundColor: bgColor }]}
      >
        <View style={styles.achievementIconContainer}>
          <Text style={styles.achievementEmoji}>
            {ACHIEVEMENT_EMOJIS[index % ACHIEVEMENT_EMOJIS.length]}
          </Text>
        </View>
        <View style={styles.achievementTextContainer}>
          {/* ✅ CORRIGIDO: Texto branco fixo APENAS aqui porque o fundo é colorido */}
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.achievementDate}>{achievement.description}</Text>
        </View>
      </View>
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
            {/* ✅ CORRIGIDO: Cor do texto agora é dinâmica (cardText) */}
            <Text style={[styles.sectionTitle, { color: theme.cardText }]}>
              Módulos Concluídos
            </Text>
            <View style={styles.modulosRow}>{renderModuleIcons()}</View>
            <Text style={[styles.progressText, { color: theme.cardText }]}>
              {progressoAtual} de {modulosTotais} módulos concluídos
            </Text>
          </View>

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
              <View style={styles.emblemsGrid}>
                {emblemsByPerformance.map((e, i) => (
                  <View key={i} style={styles.emblemCard}>
                    <Text style={styles.emblemEmoji}>
                      {
                        MODULE_EMOJIS[
                          (e.moduleNumber - 1) % MODULE_EMOJIS.length
                        ]
                      }
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
                  color={theme.cardText} // ✅ CORRIGIDO
                  style={{ opacity: 0.8 }}
                />
                <Text
                  style={[styles.performanceInfo, { color: theme.cardText }]}
                >
                  Suas pontuações aparecerão aqui após você finalizar um módulo.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.achievementsList}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Suas Conquistas
            </Text>
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
                {/* ✅ CORRIGIDO: Cor do texto dinâmica */}
                <Text style={[styles.emptyTitle, { color: theme.cardText }]}>
                  Sem Conquistas Ainda
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.cardText }]}>
                  Complete os módulos para ganhar emblemas!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );

  if (Platform.OS !== "web" && flingRight) {
    return (
      <GestureDetector gesture={flingRight}>
        <View style={styles.page}>{renderContent()}</View>
      </GestureDetector>
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
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30 },
    seloEmoji: { fontSize: 80, marginBottom: 20, textAlign: "center" },
    achievementsContainer: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)",
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
      opacity: 0.6,
      borderWidth: 2,
      borderColor: theme.cardText, // Usa a cor do texto para a borda
    },
    moduloIconCompleted: { opacity: 1, borderColor: "#4CD964" },
    moduloIconLowAccuracy: { opacity: 1, borderColor: theme.cardText },
    moduloEmoji: { fontSize: 32 },
    progressText: {
      fontSize: 14 * fontMultiplier,
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
      backgroundColor: "#FFD700", // Fundo dourado fixo para emblemas
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
      color: "#191970", // Texto escuro no fundo dourado
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
      color: "#FFFFFF", // Texto branco no card colorido
      marginBottom: 4,
      lineHeight: 16 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    achievementDate: {
      fontSize: 12 * fontMultiplier,
      color: "#FFFFFF", // Texto branco no card colorido
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
