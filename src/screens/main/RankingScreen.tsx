// src/screens/module/RankingScreen.tsx

import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  SafeAreaView,
  ImageSourcePropType,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
import { useSettings } from "../../hooks/useSettings";
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";
import { getAllUsers } from "../../services/progressService";

type RankingItemData = {
  id: string;
  name: string;
  coins: number;
  points: number;
  modules: string;
  avatar: ImageSourcePropType;
  level?: number;
  streak?: number;
};

// ✅ FUNÇÃO PARA DEFINIR COR DO TEXTO BASEADO NO TEMA
const getDynamicTextColor = (mode: string) => {
  switch (mode) {
    case "sepia":
      return "#3E2723"; // Marrom
    case "grayscale":
      return "#2D2D2D"; // Cinza Escuro
    case "white_black":
      return "#000000"; // Preto
    default:
      return "#FFFFFF"; // Branco (Padrão para Azul, Dark, etc)
  }
};

// ✅ FUNÇÃO PARA DEFINIR COR DA BORDA/ELEMENTOS
const getDynamicBorderColor = (mode: string) => {
  switch (mode) {
    case "sepia":
      return "#3E2723";
    case "grayscale":
    case "white_black":
      return "#000000";
    default:
      return "#FFFFFF40"; // Translúcido Branco
  }
};

const PodiumItem = ({
  data,
  rank,
  styles,
  textColor,
  borderColor,
}: {
  data: RankingItemData;
  rank: number;
  styles: any;
  textColor: string;
  borderColor: string;
}) => {
  const podiumHeights = { 1: 190, 2: 160, 3: 140 };
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
  const height = podiumHeights[rank as keyof typeof podiumHeights];

  const accessibilityText = `${rank}º lugar: ${data.name}, Nível ${
    data.level
  }. ${data.points.toLocaleString("pt-BR")} pontos.`;

  return (
    <AccessibleView accessibilityText={accessibilityText}>
      <View style={[styles.podiumItem, { height, borderColor }]}>
        <Text selectable={false} style={styles.podiumMedal}>
          {medals[rank as keyof typeof medals]}
        </Text>

        <Image
          source={data.avatar}
          style={[styles.podiumAvatar, { borderColor: textColor }]}
        />

        {/* Sessão de Nível */}
        {data.level && (
          <View
            style={[styles.podiumLevelBadge, { backgroundColor: textColor }]}
          >
            {/* Texto do nível inverte a cor (cor do card) */}
            <Text
              style={[
                styles.podiumLevelText,
                { color: styles.podiumItem.backgroundColor },
              ]}
            >
              NÍVEL {data.level}
            </Text>
          </View>
        )}

        <Text
          selectable={false}
          style={[styles.podiumName, { color: textColor }]}
        >
          {data.name}
        </Text>

        <View style={styles.podiumStats}>
          <MaterialCommunityIcons
            name="trophy-variant"
            color="#FFD700"
            size={12}
          />
          <Text
            selectable={false}
            style={[styles.podiumStatsText, { color: textColor }]}
          >
            {data.points.toLocaleString("pt-BR")}
          </Text>
        </View>

        <View
          style={[styles.podiumBase, { backgroundColor: textColor + "20" }]}
        >
          <Text
            selectable={false}
            style={[styles.podiumRank, { color: textColor }]}
          >
            {rank}º
          </Text>
        </View>
      </View>
    </AccessibleView>
  );
};

const RankingListItem = ({
  data,
  rank,
  styles,
  textColor,
  borderColor,
}: {
  data: RankingItemData;
  rank: number;
  styles: any;
  textColor: string;
  borderColor: string;
}) => {
  const accessibilityText = `Posição ${rank}º: ${data.name}. Status: ${
    data.coins
  } moedas, ${data.points.toLocaleString("pt-BR")} pontos, ${
    data.modules
  } módulos concluídos${data.level ? `, nível ${data.level}` : ""}${
    data.streak ? `, sequência de ${data.streak} dias` : ""
  }.`;

  return (
    <AccessibleView accessibilityText={accessibilityText}>
      <View style={[styles.listItem, { borderColor }]}>
        <View style={[styles.rankBadge, { backgroundColor: textColor + "15" }]}>
          <Text
            selectable={false}
            style={[styles.rankNumber, { color: textColor }]}
          >
            {rank}
          </Text>
        </View>
        <Image
          source={data.avatar}
          style={[styles.avatar, { borderColor: textColor }]}
        />
        <View style={styles.playerInfo}>
          <View style={styles.playerHeader}>
            <Text
              selectable={false}
              style={[styles.playerName, { color: textColor }]}
              numberOfLines={1}
            >
              {data.name}
            </Text>
            {data.level && (
              <View style={[styles.levelBadge, { backgroundColor: textColor }]}>
                <Text
                  selectable={false}
                  style={[
                    styles.levelText,
                    { color: styles.listItem.backgroundColor },
                  ]}
                >
                  Nv {data.level}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.playerStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="trophy-variant"
                color="#FFD700"
                size={14}
              />
              <Text
                selectable={false}
                style={[styles.statText, { color: textColor }]}
              >
                {data.points.toLocaleString("pt-BR")}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="hand-coin"
                color={textColor}
                size={14}
              />
              <Text
                selectable={false}
                style={[styles.statText, { color: textColor }]}
              >
                {data.coins}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="book-open-variant"
                color={textColor}
                size={14}
              />
              <Text
                selectable={false}
                style={[styles.statText, { color: textColor }]}
              >
                {data.modules}
              </Text>
            </View>

            {(data.streak || 0) > 0 && (
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="fire" color="#FF6B35" size={14} />
                <Text
                  selectable={false}
                  style={[styles.statText, { color: textColor }]}
                >
                  {data.streak}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </AccessibleView>
  );
};

export default function RankingScreen() {
  const navigation = useNavigation();
  const { theme, contrastMode } = useContrast(); // ✅ Pegamos o modo aqui
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  // ✅ Calculamos as cores dinâmicas
  const dynamicTextColor = getDynamicTextColor(contrastMode);
  const dynamicBorderColor = getDynamicBorderColor(contrastMode);

  const [rankingData, setRankingData] = useState<RankingItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    try {
      const users = await getAllUsers();

      // ✅ FILTRO ADICIONADO: Remove Renata do ranking
      const filteredUsers = (users || []).filter(
        (u: any) => u.email !== "docente.asac@gmail.com"
      );

      if (!filteredUsers || filteredUsers.length === 0) {
        setRankingData([]);
        return;
      }

      const ranked = filteredUsers
        .map((user: any) => {
          const modulesCompleted = Array.isArray(user.modulesCompleted)
            ? user.modulesCompleted.filter(Boolean).length
            : 0;

          const level = Math.floor((Number(user.points) || 0) / 1000) + 1;

          return {
            id: user.id,
            name: user.name || "Usuário",
            coins: Number(user.coins) || 0,
            points: Number(user.points) || 0,
            modules: `${modulesCompleted}/3`,
            avatar: require("../../assets/images/avatar1.png"),
            level,
            streak: Number(user.streak) || 0,
          };
        })
        .sort((a: RankingItemData, b: RankingItemData) => b.points - a.points);

      setRankingData(ranked);
    } catch (error) {
      console.error("❌ Erro ao buscar ranking:", error);
      setRankingData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRanking();
    }, [fetchRanking])
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  const flingRight =
    Platform.OS !== "web"
      ? Gesture.Fling()
          .direction(Directions.RIGHT)
          .onEnd(() => {
            navigation.navigate("Home" as never);
          })
      : undefined;

  const renderContent = () => (
    <SafeAreaView style={styles.pageContainer}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />
      <View style={styles.header}>
        <AccessibleButton
          onPress={handleGoBack}
          accessibilityText="Voltar para a tela anterior"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color={theme.text}
          />
        </AccessibleButton>
        <AccessibleHeader level={1} style={styles.headerTitle}>
          Classificação Geral
        </AccessibleHeader>
        <View style={styles.headerIconPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={styles.loadingText}>Carregando ranking...</Text>
        </View>
      ) : rankingData.length > 0 ? (
        <>
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={24}
                  color="#7C3AED"
                />
                <Text style={[styles.statValue, { color: dynamicTextColor }]}>
                  {rankingData.length}
                </Text>
                <Text style={[styles.statLabel, { color: dynamicTextColor }]}>
                  Jogadores
                </Text>
              </View>
              <View style={styles.statBox}>
                <MaterialCommunityIcons
                  name="trophy"
                  size={24}
                  color="#FFD700"
                />
                <Text style={[styles.statValue, { color: dynamicTextColor }]}>
                  {rankingData[0]?.points.toLocaleString("pt-BR") || "0"}
                </Text>
                <Text style={[styles.statLabel, { color: dynamicTextColor }]}>
                  Recorde
                </Text>
              </View>
              <View style={styles.statBox}>
                <MaterialCommunityIcons
                  name="chart-line"
                  size={24}
                  color="#4CAF50"
                />
                <Text style={[styles.statValue, { color: dynamicTextColor }]}>
                  {Math.round(
                    rankingData.reduce((sum, u) => sum + u.points, 0) /
                      rankingData.length
                  ).toLocaleString("pt-BR")}
                </Text>
                <Text style={[styles.statLabel, { color: dynamicTextColor }]}>
                  Média
                </Text>
              </View>
            </View>
          </View>

          {rankingData.length >= 3 && (
            <View style={styles.podiumSection}>
              <Text style={styles.sectionTitle}>🏆 Top 3</Text>
              <View style={styles.podiumContainer}>
                <View style={styles.podiumWrapper}>
                  {rankingData[1] && (
                    <PodiumItem
                      data={rankingData[1]}
                      rank={2}
                      styles={styles}
                      textColor={dynamicTextColor}
                      borderColor={dynamicBorderColor}
                    />
                  )}
                </View>
                <View style={styles.podiumWrapper}>
                  {rankingData[0] && (
                    <PodiumItem
                      data={rankingData[0]}
                      rank={1}
                      styles={styles}
                      textColor={dynamicTextColor}
                      borderColor={dynamicBorderColor}
                    />
                  )}
                </View>
                <View style={styles.podiumWrapper}>
                  {rankingData[2] && (
                    <PodiumItem
                      data={rankingData[2]}
                      rank={3}
                      styles={styles}
                      textColor={dynamicTextColor}
                      borderColor={dynamicBorderColor}
                    />
                  )}
                </View>
              </View>
            </View>
          )}

          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>📊 Classificação Completa</Text>
            <ScrollView
              style={styles.carouselContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
            >
              {rankingData.map((item, index) => (
                <View key={item.id} style={styles.carouselItem}>
                  <RankingListItem
                    data={item}
                    rank={index + 1}
                    styles={styles}
                    textColor={dynamicTextColor}
                    borderColor={dynamicBorderColor}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="account-group"
            size={60}
            color={theme.text}
            style={{ opacity: 0.3 }}
          />
          <Text style={styles.emptyText}>Nenhum usuário no ranking ainda</Text>
        </View>
      )}
    </SafeAreaView>
  );

  if (Platform.OS !== "web" && flingRight) {
    return (
      <GestureDetector gesture={flingRight}>
        <View style={styles.pageContainer}>{renderContent()}</View>
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
    pageContainer: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 15,
      paddingHorizontal: 20,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.card,
    },
    headerTitle: {
      color: theme.text,
      opacity: 0.9,
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    headerIconPlaceholder: { width: 28 },
    statsCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 12,
      marginHorizontal: 20,
      marginTop: 10,
      marginBottom: 6,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-around",
    },
    statBox: {
      alignItems: "center",
      flex: 1,
    },
    statValue: {
      // Cor dinâmica aplicada via style inline
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      marginTop: 6,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    statLabel: {
      // Cor dinâmica aplicada via style inline
      fontSize: 11 * fontMultiplier,
      opacity: 0.7,
      marginTop: 2,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    podiumSection: {
      paddingHorizontal: 20,
      marginVertical: 8,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 16 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      marginBottom: 8,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    podiumContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "flex-end",
      gap: 8,
      paddingVertical: 8,
    },
    podiumWrapper: {
      flex: 1,
      alignItems: "center",
    },
    podiumItem: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 10,
      alignItems: "center",
      justifyContent: "flex-end",
      width: "100%",
      borderWidth: 2,
      // Border color dinâmica via style inline
    },
    podiumAvatar: {
      width: 45,
      height: 45,
      borderRadius: 25,
      marginBottom: 4,
      borderWidth: 3,
      // Border color dinâmica via style inline
    },
    podiumMedal: {
      fontSize: 22,
      marginBottom: 2,
    },
    podiumLevelBadge: {
      // Bg color dinâmica via style inline
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginBottom: 4,
    },
    podiumLevelText: {
      // Color dinâmica via style inline
      fontSize: 9 * fontMultiplier,
      fontWeight: "bold",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    podiumName: {
      // Color dinâmica via style inline
      fontSize: 12 * fontMultiplier,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 4,
      paddingHorizontal: 2,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    podiumStats: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 6,
    },
    podiumStatsText: {
      // Color dinâmica via style inline
      fontSize: 10 * fontMultiplier,
      fontWeight: "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    podiumBase: {
      // Bg color dinâmica via style inline
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 12,
      marginTop: 2,
    },
    podiumRank: {
      // Color dinâmica via style inline
      fontSize: 13 * fontMultiplier,
      fontWeight: "bold",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    listSection: {
      flex: 1,
      paddingHorizontal: 20,
      marginTop: 4,
    },
    carouselContainer: {
      flex: 1,
    },
    carouselContent: {
      gap: 10,
      paddingBottom: 20,
    },
    carouselItem: { width: "100%" },
    listItem: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      // Border color dinâmica via style inline
    },
    rankBadge: {
      // Bg color dinâmica via style inline
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    rankNumber: {
      // Color dinâmica via style inline
      fontSize: 16 * fontMultiplier,
      fontWeight: "bold",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
      // Border color dinâmica via style inline
    },
    playerInfo: {
      flex: 1,
    },
    playerHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    playerName: {
      // Color dinâmica via style inline
      fontSize: 15 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      flex: 1,
      lineHeight: 15 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    levelBadge: {
      // Bg color dinâmica via style inline
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    levelText: {
      // Color dinâmica via style inline
      fontSize: 10 * fontMultiplier,
      fontWeight: "bold",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    playerStats: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flexWrap: "wrap",
    },
    statItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    statIcon: {
      // Color dinâmica via style inline
      opacity: 0.7,
    },
    statText: {
      // Color dinâmica via style inline
      fontSize: 12 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      lineHeight: 12 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyText: {
      color: theme.text,
      fontSize: 16 * fontMultiplier,
      marginTop: 15,
      opacity: 0.6,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      color: theme.text,
      marginTop: 10,
      fontSize: 14 * fontMultiplier,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });
