import React, { useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
  PanResponder,
  Text,
  // Removi TouchableOpacity para evitar conflito com o ModuleCard
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../../store/authStore";
import { generateClient } from "aws-amplify/api";
import { listProgresses, getUser } from "../../graphql/queries";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";

import { StatItem } from "../../components/progress/StatItem";
import { ModuleCard } from "../../components/progress/ModuleCard";

type ProgressItem = {
  id: string;
  moduleNumber: number;
  accuracy: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number;
  updatedAt: string;
};

const getThemeColors = (mode: string) => {
  const defaultIcons = {
    avg: "#FFC107",
    correct: "#4CAF50",
    wrong: "#F44336",
    time: "#2196F3",
    modules: "#9C27B0",
    points: "#FF9800",
  };

  switch (mode) {
    case "sepia":
      return {
        text: "#3E2723",
        itemBg: "rgba(62, 39, 35, 0.1)",
        iconColors: defaultIcons,
      };
    case "grayscale":
    case "white_black":
      return {
        text: "#000000",
        itemBg: "rgba(0, 0, 0, 0.1)",
        iconColors: defaultIcons,
      };
    case "blue_yellow":
      return {
        text: "#FFFFFF",
        itemBg: "rgba(255, 255, 255, 0.15)",
        iconColors: {
          avg: "#FFD700",
          correct: "#00FF00",
          wrong: "#FF4444",
          time: "#00FFFF",
          modules: "#FF00FF",
          points: "#FFFF00",
        },
      };
    default:
      return {
        text: "#FFFFFF",
        itemBg: "rgba(255, 255, 255, 0.1)",
        iconColors: defaultIcons,
      };
  }
};

const ProgressScreenComponent = ({
  navigation,
}: RootStackScreenProps<"Progress">) => {
  const user = useAuthStore((state) => state.user);
  const { theme, contrastMode } = useContrast();
  const colors = getThemeColors(contrastMode);

  const [moduleProgress, setModuleProgress] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(0);
  const [userPoints, setUserPoints] = useState(user?.points ?? 0);

  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();
  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const fetchProgressData = useCallback(async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const client = generateClient();
      try {
        const userResult: any = await client.graphql({
          query: getUser,
          variables: { id: user.userId },
          authMode: "userPool",
        });
        if (userResult.data?.getUser)
          setUserPoints(userResult.data.getUser.points ?? 0);
      } catch (e) {}

      let allProgress: any[] = [];
      let nextToken: string | null = null;
      do {
        const result: any = await client.graphql({
          query: listProgresses,
          variables: {
            filter: { userId: { eq: user.userId } },
            limit: 1000,
            nextToken,
          },
          authMode: "userPool",
        });
        allProgress.push(...(result?.data?.listProgresses?.items || []));
        nextToken = result?.data?.listProgresses?.nextToken || null;
      } while (nextToken);

      const attemptedProgress = allProgress.filter((p) => p.timeSpent > 0);
      const latestByModule: Record<number, any> = {};

      attemptedProgress.forEach((p: any) => {
        const m = Number(p.moduleNumber || 0);
        if (m === 0) return;
        const t = new Date(p.updatedAt || p.createdAt).getTime();
        if (
          !latestByModule[m] ||
          t >
            new Date(
              latestByModule[m].updatedAt || latestByModule[m].createdAt
            ).getTime()
        ) {
          latestByModule[m] = p;
        }
      });

      const latestProgress = Object.values(latestByModule)
        .map((p: any) => ({
          id: p.id,
          moduleNumber: Number(p.moduleNumber),
          accuracy: Number(p.accuracy),
          correctAnswers: Number(p.correctAnswers),
          wrongAnswers: Number(p.wrongAnswers),
          timeSpent: Number(p.timeSpent),
          updatedAt: p.updatedAt || p.createdAt,
        }))
        .sort((a, b) => a.moduleNumber - b.moduleNumber);

      setModuleProgress(latestProgress);

      const totals = latestProgress.reduce(
        (acc, p) => ({
          sumCorrect: acc.sumCorrect + p.correctAnswers,
          sumWrong: acc.sumWrong + p.wrongAnswers,
          sumTime: acc.sumTime + p.timeSpent,
          sumAccuracy: acc.sumAccuracy + p.accuracy,
        }),
        { sumCorrect: 0, sumWrong: 0, sumTime: 0, sumAccuracy: 0 }
      );

      setTotalCorrect(totals.sumCorrect);
      setTotalWrong(totals.sumWrong);
      setTotalTime(totals.sumTime);
      setAvgAccuracy(
        latestProgress.length > 0
          ? Math.round(totals.sumAccuracy / latestProgress.length)
          : 0
      );

      Animated.timing(headerFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error(error);
      setModuleProgress([]);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useFocusEffect(
    useCallback(() => {
      fetchProgressData();
    }, [fetchProgressData])
  );

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60),
      sec = Math.round(s % 60);
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const formatTimeAccessible = (s: number) => {
    const h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60),
      sec = Math.round(s % 60);
    let t = "";
    if (h > 0) t += `${h} horas `;
    if (m > 0) t += `${m} minutos `;
    if (sec > 0 || t === "") t += `${sec} segundos`;
    return t;
  };

  const handleGoBack = () => navigation.goBack();
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > Math.abs(g.dy) && g.dx > 20,
      onPanResponderRelease: (_, g) => {
        if (g.dx > 100) handleGoBack();
      },
    })
  ).current;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title="Progresso" onBackPress={handleGoBack} />
        <View
          style={styles.loadingContainer}
          accessible={true}
          accessibilityLabel="Carregando dados."
        >
          <ActivityIndicator size="large" color={theme.text} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.background }]}
      {...panResponder.panHandlers}
    >
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />
      <ScreenHeader title="Progresso" onBackPress={handleGoBack} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View
          style={[
            styles.summaryCard,
            {
              opacity: headerFadeAnim,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.text + "20",
            },
          ]}
        >
          {/* Título Resumo - Agrupado */}
          <View
            accessible={true}
            focusable={true}
            accessibilityRole="header"
            style={{ marginBottom: 16 }}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.text, fontSize: 20 * fontSizeMultiplier },
              ]}
            >
              📊 Resumo Geral
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                {
                  color: colors.text,
                  opacity: 0.8,
                  fontSize: 12 * fontSizeMultiplier,
                },
              ]}
            >
              Baseado nas últimas tentativas
            </Text>
          </View>

          <View style={styles.statsGrid}>
            {[
              {
                icon: "target",
                val: `${avgAccuracy}%`,
                label: "Precisão",
                color: colors.iconColors.avg,
                delay: 0,
                text: `Precisão média: ${avgAccuracy} por cento`,
              },
              {
                icon: "check-all",
                val: totalCorrect,
                label: "Acertos",
                color: colors.iconColors.correct,
                delay: 100,
                text: `Total de acertos: ${totalCorrect}`,
              },
              {
                icon: "close-circle",
                val: totalWrong,
                label: "Erros",
                color: colors.iconColors.wrong,
                delay: 200,
                text: `Total de erros: ${totalWrong}`,
              },
              {
                icon: "clock-time-eight-outline",
                val: formatTime(totalTime),
                label: "Tempo",
                color: colors.iconColors.time,
                delay: 300,
                text: `Tempo total: ${formatTimeAccessible(totalTime)}`,
              },
              {
                icon: "book-open-variant",
                val: moduleProgress.length,
                label: "Módulos",
                color: colors.iconColors.modules,
                delay: 400,
                text: `Módulos concluídos: ${moduleProgress.length}`,
              },
              {
                icon: "trophy",
                val: userPoints.toLocaleString("pt-BR"),
                label: "Pontos",
                color: colors.iconColors.points,
                delay: 500,
                text: `Total de pontos: ${userPoints}`,
              },
            ].map((item, i) => (
              <View
                key={i}
                style={styles.statWrapper}
                // Configuração Acessibilidade para os Boxes
                accessible={true}
                focusable={true}
                accessibilityRole="text"
                accessibilityLabel={item.text}
              >
                <StatItem
                  icon={item.icon as any}
                  value={String(item.val)}
                  label={item.label}
                  iconColor={item.color}
                  textColor={colors.text}
                  backgroundColor={colors.itemBg}
                  delay={item.delay}
                />
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.section}>
          {/* Título Lista - Agrupado */}
          <View
            accessible={true}
            focusable={true}
            accessibilityRole="header"
            style={{ marginBottom: 16 }}
          >
            <Text
              style={[
                styles.sectionTitleDark,
                { color: theme.text, fontSize: 20 * fontSizeMultiplier },
              ]}
            >
              📘 Desempenho
            </Text>
            <Text
              style={[
                styles.sectionSubtitleDark,
                { color: theme.text, fontSize: 12 * fontSizeMultiplier },
              ]}
            >
              Toque para ver detalhes
            </Text>
          </View>

          {moduleProgress.length > 0 ? (
            moduleProgress.map((p, index) => (
              // ✅ CORREÇÃO: Usar View simples aqui. O ModuleCard já é clicável.
              <View
                key={`${p.moduleNumber}-${p.id}`}
                style={{ marginBottom: 12 }}
              >
                <ModuleCard
                  moduleNumber={p.moduleNumber}
                  accuracy={p.accuracy}
                  correctAnswers={p.correctAnswers}
                  wrongAnswers={p.wrongAnswers}
                  timeSpent={p.timeSpent}
                  updatedAt={p.updatedAt}
                  index={index}
                  theme={theme}
                  // Passamos a navegação aqui para o componente filho
                  onPress={() =>
                    navigation.navigate("IncorrectAnswers", {
                      moduleNumber: p.moduleNumber,
                    })
                  }
                />
              </View>
            ))
          ) : (
            <View
              style={styles.emptyContainer}
              accessible={true}
              focusable={true}
              accessibilityLabel="Nenhum módulo completado ainda."
            >
              <MaterialCommunityIcons
                name="book-outline"
                size={64}
                color={theme.text}
              />
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.text, fontSize: 16 * fontSizeMultiplier },
                ]}
              >
                Você ainda não completou nenhum módulo
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default function ProgressScreen(
  props: RootStackScreenProps<"Progress">
) {
  return <ProgressScreenComponent {...props} />;
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
    container: { flex: 1 },
    scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    summaryCard: {
      borderRadius: 16,
      padding: 16,
      marginTop: 20,
      marginBottom: 20,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    sectionTitle: {
      fontWeight: isBold ? "bold" : "700",
      marginBottom: 4,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing,
    },
    sectionSubtitle: {
      marginBottom: 12,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing,
    },
    sectionTitleDark: {
      fontWeight: isBold ? "bold" : "700",
      marginBottom: 4,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing,
    },
    sectionSubtitleDark: {
      marginBottom: 16,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing,
    },

    // ✅ GRID HARMONIOSO
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 8,
    },
    statWrapper: { width: "31%", marginBottom: 10 }, // 3 colunas perfeitas

    section: { marginBottom: 10 },
    emptyContainer: { alignItems: "center", paddingVertical: 40 },
    emptyText: {
      marginTop: 16,
      textAlign: "center",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing,
    },
  });
