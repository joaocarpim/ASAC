// src/screens/main/RankingScreen.tsx

import React, { useState, useCallback } from "react";
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
  TouchableOpacity,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
// Substituímos AccessibleButton por TouchableOpacity nativo para controle total das props de foco
import { useSettings } from "../../hooks/useSettings";
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";
import { getAllUsers } from "../../services/progressService";

// --- Tipos e Helpers ---
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

const getDynamicTextColor = (mode: string) => {
  switch (mode) {
    case "sepia":
      return "#3E2723";
    case "grayscale":
      return "#2D2D2D";
    case "white_black":
      return "#000000";
    default:
      return "#FFFFFF";
  }
};

const getDynamicBorderColor = (mode: string) => {
  switch (mode) {
    case "sepia":
      return "#3E2723";
    case "grayscale":
    case "white_black":
      return "#000000";
    default:
      return "#FFFFFF40";
  }
};

// --- COMPONENTES INTERNOS (Refatorados para Boxes) ---

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

  // Texto completo para o leitor de tela
  const label = `${rank}º lugar: ${data.name}. Nível ${data.level || 0}. ${
    data.points
  } pontos.`;

  return (
    <View
      style={[styles.podiumItem, { height, borderColor }]}
      // --- ACESSIBILIDADE BOX ---
      accessible={true}
      focusable={true} // Permite TAB no Android
      importantForAccessibility="yes"
      accessibilityRole="text" // Trata como um bloco de texto informativo
      accessibilityLabel={label}
    >
      {/* Esconde os filhos para leitura única */}
      <View
        importantForAccessibility="no-hide-descendants"
        style={{ alignItems: "center", width: "100%" }}
      >
        <Text style={styles.podiumMedal}>
          {medals[rank as keyof typeof medals]}
        </Text>

        <Image
          source={data.avatar}
          style={[styles.podiumAvatar, { borderColor: textColor }]}
        />

        {data.level && (
          <View
            style={[styles.podiumLevelBadge, { backgroundColor: textColor }]}
          >
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

        <Text style={[styles.podiumName, { color: textColor }]}>
          {data.name}
        </Text>

        <View style={styles.podiumStats}>
          <MaterialCommunityIcons
            name="trophy-variant"
            color="#FFD700"
            size={12}
          />
          <Text style={[styles.podiumStatsText, { color: textColor }]}>
            {data.points.toLocaleString("pt-BR")}
          </Text>
        </View>

        <View
          style={[styles.podiumBase, { backgroundColor: textColor + "20" }]}
        >
          <Text style={[styles.podiumRank, { color: textColor }]}>{rank}º</Text>
        </View>
      </View>
    </View>
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
  const label = `Posição ${rank}: ${data.name}. ${data.points} pontos, ${data.coins} moedas.`;

  return (
    <View
      style={[styles.listItem, { borderColor }]}
      // --- ACESSIBILIDADE BOX ---
      accessible={true}
      focusable={true} // Permite TAB no Android
      importantForAccessibility="yes"
      accessibilityRole="button" // Indica que é um item interativo (se fosse clicável) ou item de lista
      accessibilityLabel={label}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}
        importantForAccessibility="no-hide-descendants"
      >
        <View style={[styles.rankBadge, { backgroundColor: textColor + "15" }]}>
          <Text style={[styles.rankNumber, { color: textColor }]}>{rank}</Text>
        </View>

        <Image
          source={data.avatar}
          style={[styles.avatar, { borderColor: textColor }]}
        />

        <View style={styles.playerInfo}>
          <View style={styles.playerHeader}>
            <Text
              style={[styles.playerName, { color: textColor }]}
              numberOfLines={1}
            >
              {data.name}
            </Text>
            {data.level && (
              <View style={[styles.levelBadge, { backgroundColor: textColor }]}>
                <Text
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
              <Text style={[styles.statText, { color: textColor }]}>
                {data.points.toLocaleString("pt-BR")}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="hand-coin"
                color={textColor}
                size={14}
              />
              <Text style={[styles.statText, { color: textColor }]}>
                {data.coins}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

// --- TELA PRINCIPAL ---

export default function RankingScreen() {
  const navigation = useNavigation();
  const { theme, contrastMode } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

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

  const handleGoBack = () => navigation.goBack();

  const flingRight =
    Platform.OS !== "web"
      ? Gesture.Fling()
          .direction(Directions.RIGHT)
          .onEnd(() => navigation.navigate("Home" as never))
      : undefined;

  const renderContent = () => (
    <SafeAreaView style={styles.pageContainer}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />

      {/* HEADER - BLOCO 1 E 2 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          // ACESSIBILIDADE
          accessible={true}
          focusable={true}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          accessibilityHint="Retorna para a tela anterior"
          style={{ padding: 10, margin: -10 }} // Aumenta área de toque
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={28}
            color={theme.text}
          />
        </TouchableOpacity>

        <View
          // ACESSIBILIDADE TÍTULO
          accessible={true}
          focusable={true}
          importantForAccessibility="yes"
          accessibilityRole="header"
          accessibilityLabel="Título: Classificação Geral"
        >
          <Text style={styles.headerTitle} importantForAccessibility="no">
            Classificação Geral
          </Text>
        </View>

        <View
          style={styles.headerIconPlaceholder}
          importantForAccessibility="no"
        />
      </View>

      {loading ? (
        <View
          style={styles.loadingContainer}
          accessible={true}
          focusable={true}
          accessibilityLabel="Carregando classificação, aguarde."
        >
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : rankingData.length > 0 ? (
        <>
          {/* BOX 3: ESTATÍSTICAS DO TOPO */}
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              {/* ITEM: JOGADORES */}
              <View
                style={styles.statBox}
                accessible={true}
                focusable={true}
                importantForAccessibility="yes"
                accessibilityRole="text"
                accessibilityLabel={`Total de jogadores: ${rankingData.length}`}
              >
                <View
                  importantForAccessibility="no-hide-descendants"
                  style={{ alignItems: "center" }}
                >
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
              </View>

              {/* ITEM: RECORDE */}
              <View
                style={styles.statBox}
                accessible={true}
                focusable={true}
                importantForAccessibility="yes"
                accessibilityRole="text"
                accessibilityLabel={`Recorde atual: ${
                  rankingData[0]?.points || 0
                } pontos`}
              >
                <View
                  importantForAccessibility="no-hide-descendants"
                  style={{ alignItems: "center" }}
                >
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
              </View>

              {/* ITEM: MÉDIA */}
              <View
                style={styles.statBox}
                accessible={true}
                focusable={true}
                importantForAccessibility="yes"
                accessibilityRole="text"
                accessibilityLabel={`Média da turma: ${Math.round(
                  rankingData.reduce((sum, u) => sum + u.points, 0) /
                    rankingData.length
                )} pontos`}
              >
                <View
                  importantForAccessibility="no-hide-descendants"
                  style={{ alignItems: "center" }}
                >
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
          </View>

          {/* BOX 4: TÍTULO TOP 3 */}
          {rankingData.length >= 3 && (
            <View style={styles.podiumSection}>
              <View
                accessible={true}
                focusable={true}
                importantForAccessibility="yes"
                accessibilityRole="header"
                accessibilityLabel="Seção: Top 3 Jogadores"
                style={{ marginBottom: 8 }}
              >
                <Text
                  style={styles.sectionTitle}
                  importantForAccessibility="no"
                >
                  🏆 Top 3
                </Text>
              </View>

              {/* BOX 5, 6, 7: PODIUM ITEMS */}
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

          {/* BOX 8: TÍTULO LISTA COMPLETA */}
          <View style={styles.listSection}>
            <View
              accessible={true}
              focusable={true}
              importantForAccessibility="yes"
              accessibilityRole="header"
              accessibilityLabel="Seção: Classificação Completa"
              style={{ marginBottom: 8 }}
            >
              <Text style={styles.sectionTitle} importantForAccessibility="no">
                📊 Classificação Completa
              </Text>
            </View>

            {/* BOX 9+: ITENS DA LISTA */}
            <ScrollView
              style={styles.carouselContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
              // O container do Scroll não deve roubar foco, apenas os itens
              importantForAccessibility="no"
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
        <View
          style={styles.emptyContainer}
          accessible={true}
          focusable={true}
          importantForAccessibility="yes"
          accessibilityLabel="Lista vazia. Nenhum usuário no ranking ainda."
        >
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
      paddingVertical: 4,
    },
    statValue: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      marginTop: 6,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    statLabel: {
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
    },
    podiumAvatar: {
      width: 45,
      height: 45,
      borderRadius: 25,
      marginBottom: 4,
      borderWidth: 3,
    },
    podiumMedal: {
      fontSize: 22,
      marginBottom: 2,
    },
    podiumLevelBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
      marginBottom: 4,
    },
    podiumLevelText: {
      fontSize: 9 * fontMultiplier,
      fontWeight: "bold",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    podiumName: {
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
      fontSize: 10 * fontMultiplier,
      fontWeight: "600",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    podiumBase: {
      borderRadius: 8,
      paddingVertical: 4,
      paddingHorizontal: 12,
      marginTop: 2,
    },
    podiumRank: {
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
    },
    rankBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
    rankNumber: {
      fontSize: 16 * fontMultiplier,
      fontWeight: "bold",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      borderWidth: 2,
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
      fontSize: 15 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      flex: 1,
      lineHeight: 15 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    levelBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    levelText: {
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
    statText: {
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
