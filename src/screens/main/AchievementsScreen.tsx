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
import { getUserById } from "../../services/progressService";
import { generateClient } from "aws-amplify/api";

const MODULE_EMOJIS = ["🎓", "🏆", "⭐"];
const ACHIEVEMENT_EMOJIS = ["🏅", "🥇", "🥈", "🥉", "🎖️"];
const CARD_COLORS = ["#FFD700", "#FF8C00", "#8A2BE2", "#00CED1", "#FF69B4"];

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
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emblemsByPerformance, setEmblemsByPerformance] = useState<{
    moduleNumber: number;
    accuracy: number;
  }[]>([]);
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
    if (!user?.userId) return;

    setLoading(true);
    try {
      const dbUser = await getUserById(user.userId);
      if (dbUser) {
        const completedModules = Array.isArray(dbUser.modulesCompleted)
          ? dbUser.modulesCompleted.filter(Boolean)
          : [];

        setProgressoAtual(completedModules.length);

        const newAchievements: any[] = [];
        for (let moduleNum of completedModules) {
          const exists = dbUser.achievements?.items?.some(
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

        setAchievements([...(dbUser.achievements?.items || []), ...newAchievements]);
      }

      // BUSCAR PROGRESSO PARA CALCULAR EMBLEMAS - Query corrigida
      const client = generateClient();
      const progressQuery = `
        query ListProgresses($filter: ModelProgressFilterInput) {
          listProgresses(filter: $filter) {
            items {
              moduleNumber
              correctAnswers
              wrongAnswers
            }
          }
        }
      `;
      
      const result: any = await client.graphql({
        query: progressQuery,
        variables: { 
          filter: { 
            userId: { eq: user.userId } 
          } 
        },
      });

      const rawList = result?.data?.listProgresses?.items || [];
      
      console.log("📊 Raw progress data:", rawList);
      
      const normalized = (Array.isArray(rawList) ? rawList : []).map((p: any) => ({
        moduleNumber: typeof p.moduleNumber === "string" ? parseInt(p.moduleNumber, 10) : (p.moduleNumber || 0),
        correct: Number(p.correctAnswers ?? 0),
        wrong: Number(p.wrongAnswers ?? 0),
      }));

      console.log("📊 Normalized progress:", normalized);

      // CALCULAR EMBLEMAS - SÓ MOSTRAR SE TIVER 70%+ DE APROVEITAMENTO
      const modulePerformance: { moduleNumber: number; accuracy: number }[] = [];

      for (let i = 1; i <= modulosTotais; i++) {
        const p = normalized.find((x) => x.moduleNumber === i);
        
        if (!p) {
          console.log(`⚠️ Módulo ${i}: Sem dados de progresso`);
          continue;
        }
        
        const correct = p.correct;
        const wrong = p.wrong;
        const total = correct + wrong;
        
        console.log(`📊 Módulo ${i}: ${correct} acertos, ${wrong} erros, ${total} total`);
        
        if (total === 0) {
          console.log(`⚠️ Módulo ${i}: Total de respostas é zero`);
          continue;
        }
        
        const acc = Math.round((correct / total) * 100);
        
        console.log(`📊 Módulo ${i}: Precisão calculada: ${acc}%`);

        // SÓ ADICIONAR SE TIVER 70% OU MAIS
        if (acc >= 70) {
          modulePerformance.push({ moduleNumber: i, accuracy: acc });
          console.log(`✅ Módulo ${i}: Emblema desbloqueado com ${acc}%`);
        } else {
          console.log(`❌ Módulo ${i}: ${acc}% não é suficiente para emblema (precisa 70%+)`);
        }
      }

      setEmblemsByPerformance(modulePerformance);
      console.log("🏆 Emblemas finais desbloqueados:", modulePerformance);
    } catch (error) {
      console.error("❌ Erro ao buscar conquistas:", error);
      setEmblemsByPerformance([]);
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

  const flingRight = Gesture.Fling().direction(Directions.RIGHT).onEnd(handleGoBack);

  const renderModuleIcons = () => {
    return Array.from({ length: modulosTotais }, (_, i) => {
      const isCompleted = i + 1 <= progressoAtual;
      const scaleAnim = new Animated.Value(1);
      if (isCompleted) {
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
            isCompleted && styles.moduloIconCompleted,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {isCompleted ? (
            <Text style={styles.moduloEmoji}>{MODULE_EMOJIS[i]}</Text>
          ) : (
            <MaterialCommunityIcons name="lock" size={28} color={theme.text} />
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

  if (loading) {
    return (
      <GestureDetector gesture={flingRight}>
        <View style={styles.page}>
          <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} accessibilityLabel="Voltar">
              <MaterialCommunityIcons name="arrow-left" size={28} color={theme.text} />
            </TouchableOpacity>
            <AccessibleHeader level={1} style={styles.headerTitle}>
              Minhas Conquistas
            </AccessibleHeader>
            <View style={styles.headerIconPlaceholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        </View>
      </GestureDetector>
    );
  }

  return (
    <GestureDetector gesture={flingRight}>
      <View style={styles.page}>
        <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} accessibilityLabel="Voltar">
            <MaterialCommunityIcons name="arrow-left" size={28} color={theme.text} />
          </TouchableOpacity>
          <AccessibleHeader level={1} style={styles.headerTitle}>
            Minhas Conquistas
          </AccessibleHeader>
          <View style={styles.headerIconPlaceholder} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
            <Text style={styles.sectionTitle}>🌟 Emblemas de Alto Desempenho</Text>
            <Text style={styles.performanceSubtitle}>
              (Módulos com 70% ou mais de aproveitamento)
            </Text>
            {emblemsByPerformance.length > 0 ? (
              <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap" }}>
                {emblemsByPerformance.map((e, i) => (
                  <View key={i} style={styles.emblemCard}>
                    <Text style={styles.emblemEmoji}>
                      {MODULE_EMOJIS[e.moduleNumber - 1]}
                    </Text>
                    <Text style={styles.emblemAccuracy}>{e.accuracy}%</Text>
                    <Text style={styles.emblemModule}>Módulo {e.moduleNumber}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyPerformance}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={36}
                  color={theme.cardText}
                  style={{ opacity: 0.6 }}
                />
                <Text style={styles.performanceInfo}>
                  Emblemas serão desbloqueados quando você tiver 70% ou mais de aproveitamento em um módulo.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.achievementsList}>
            <Text style={styles.sectionTitle}>Suas Conquistas</Text>
            {achievements.length > 0
              ? achievements.map((achievement, index) => renderAchievementCard(achievement, index))
              : (
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
      </View>
    </GestureDetector>
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
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    modulosRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 15 },
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
    moduloEmoji: { fontSize: 32 },
    progressText: {
      fontSize: 14 * fontMultiplier,
      color: theme.cardText,
      fontWeight: isBold ? "bold" : "normal",
      lineHeight: 14 * fontMultiplier * lineHeight,
      letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emblemCard: {
      backgroundColor: "#FFF5E1",
      margin: 6,
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      minWidth: 80,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    emblemEmoji: { fontSize: 40 },
    emblemAccuracy: {
      color: "#191970",
      fontSize: 16,
      fontWeight: "bold",
      marginTop: 5,
    },
    emblemModule: {
      color: "#191970",
      fontSize: 12,
      marginTop: 2,
    },
    achievementsList: { marginTop: 10 },
    achievementCard: { borderRadius: 16, padding: 15, flexDirection: "row", alignItems: "center", marginBottom: 12 },
    achievementIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", marginRight: 15 },
    achievementEmoji: { fontSize: 32 },
    achievementTextContainer: { flex: 1 },
    achievementTitle: { fontSize: 16 * fontMultiplier, fontWeight: "bold", color: theme.cardText, marginBottom: 4, lineHeight: 16 * fontMultiplier * lineHeight, letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
    achievementDate: { fontSize: 12 * fontMultiplier, color: theme.cardText, opacity: 0.7, lineHeight: 12 * fontMultiplier * lineHeight, letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
    emptyCard: { backgroundColor: theme.card, borderRadius: 16, padding: 30, alignItems: "center", marginTop: 20 },
    emptyTitle: { fontSize: 18 * fontMultiplier, fontWeight: "bold", color: theme.cardText, marginTop: 15, marginBottom: 8, lineHeight: 18 * fontMultiplier * lineHeight, letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
    emptySubtitle: { fontSize: 14 * fontMultiplier, color: theme.cardText, textAlign: "center", opacity: 0.8, lineHeight: 20 * lineHeight, fontWeight: isBold ? "bold" : "normal", letterSpacing, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
    emptyPerformance: { alignItems: "center", paddingVertical: 12 },
    performanceInfo: { marginTop: 10, color: theme.cardText, textAlign: "center", maxWidth: 280, fontSize: 14 * fontMultiplier, lineHeight: 20 * lineHeight, fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined },
  });