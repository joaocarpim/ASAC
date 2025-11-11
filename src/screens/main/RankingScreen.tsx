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
};

const RankingListItem = ({
  data,
  rank,
  styles,
}: {
  data: RankingItemData;
  rank: number;
  styles: any;
}) => {
  const accessibilityText = `Posição ${rank}º: ${
    data.name
  }. Status: ${data.coins} moedas, ${data.points.toLocaleString(
    "pt-BR"
  )} pontos e ${data.modules} módulos concluídos.`;
  return (
    <AccessibleView accessibilityText={accessibilityText}>
      <View style={styles.listItem}>
        <Text selectable={false} style={styles.rankNumber}>
          {rank}º
        </Text>
        <View style={styles.playerInfo}>
          <Text selectable={false} style={styles.playerName} numberOfLines={2}>
            {data.name}
          </Text>
          <View style={styles.playerStats}>
            <MaterialCommunityIcons
              name="hand-coin"
              color={styles.statIcon.color}
              size={14}
            />
            <Text selectable={false} style={styles.statText}>
              {data.coins}
            </Text>
            <MaterialCommunityIcons
              name="trophy-variant"
              color={styles.statIcon.color}
              size={14}
              style={{ marginLeft: 8 }}
            />
            <Text selectable={false} style={styles.statText}>
              {data.points.toLocaleString("pt-BR")}
            </Text>
            <MaterialCommunityIcons
              name="book-open-variant"
              color={styles.statIcon.color}
              size={14}
              style={{ marginLeft: 8 }}
            />
            <Text selectable={false} style={styles.statText}>
              {data.modules}
            </Text>
          </View>
        </View>
        <Image source={data.avatar} style={styles.avatar} />
      </View>
    </AccessibleView>
  );
};

export default function RankingScreen() {
  const navigation = useNavigation();
  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

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
      console.log("📊 Buscando ranking de usuários...");
      const users = await getAllUsers();
      console.log("👥 Usuários encontrados:", users);

      if (!users || users.length === 0) {
        console.warn("⚠️ Nenhum usuário encontrado no ranking");
        setRankingData([]);
        return;
      }

      const ranked = users
        .map((user: any) => {
          const modulesCompleted = Array.isArray(user.modulesCompleted)
            ? user.modulesCompleted.filter(Boolean).length
            : 0;

          console.log(
            `👤 ${user.name}: ${user.points} pontos, ${user.coins} moedas, ${modulesCompleted} módulos`
          );

          return {
            id: user.id,
            name: user.name || "Usuário",
            coins: Number(user.coins) || 0,
            points: Number(user.points) || 0,
            modules: `${modulesCompleted}/3`,
            avatar: require("../../assets/images/avatar1.png"),
          };
        })
        .sort((a: RankingItemData, b: RankingItemData) => b.points - a.points);

      console.log("🏆 Ranking ordenado:", ranked);
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

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleGoBack);

  if (loading) {
    return (
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
              color={styles.headerTitle.color}
            />
          </AccessibleButton>
          <AccessibleHeader level={1} style={styles.headerTitle}>
            Classificação Geral
          </AccessibleHeader>
          <View style={styles.headerIconPlaceholder} />
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={{ color: theme.text, marginTop: 10 }}>
            Carregando ranking...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureDetector gesture={flingRight}>
      {/* ✅ CORREÇÃO: <SafeAreaView> envolvida por uma <View> para o gesture handler */}
      <View style={{ flex: 1 }}>
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
                color={styles.headerTitle.color}
              />
            </AccessibleButton>
            <AccessibleHeader level={1} style={styles.headerTitle}>
              Classificação Geral
            </AccessibleHeader>
            <View style={styles.headerIconPlaceholder} />
          </View>
          <View style={styles.topSection}>
            <AccessibleView accessibilityText="Troféu, representando o topo da classificação">
              <Text selectable={false} style={styles.mainEmoji}>
                🏆
              </Text>
            </AccessibleView>

            {rankingData.length > 0 ? (
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
                    />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={60}
                  color={theme.text}
                  style={{ opacity: 0.3 }}
                />
                <Text style={styles.emptyText}>
                  Nenhum usuário no ranking ainda
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
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
    pageContainer: { flex: 1, backgroundColor: theme.background },
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
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    headerIconPlaceholder: { width: 28 },
    topSection: {
      flex: 1,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.card,
      paddingBottom: 4,
    },
    mainEmoji: { fontSize: 100, textAlign: "center", marginVertical: 8 },
    carouselContainer: { maxHeight: 330 },
    carouselContent: { gap: 8, paddingBottom: 16 },
    carouselItem: { width: "100%" },
    listItem: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    rankNumber: {
      color: theme.cardText,
      fontSize: 22 * fontMultiplier,
      fontWeight: "bold",
      marginRight: 12,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    playerInfo: { flex: 1 },
    playerName: {
      color: theme.cardText,
      fontSize: 15 * fontMultiplier,
      fontWeight: isBold ? "bold" : "bold",
      marginBottom: 6,
      lineHeight: 15 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    playerStats: { flexDirection: "row", alignItems: "center" },
    statIcon: { color: theme.cardText, opacity: 0.7 },
    statText: {
      color: theme.cardText,
      fontSize: 12 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      marginLeft: 4,
      lineHeight: 12 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginLeft: 10,
      borderWidth: 2,
      borderColor: theme.background,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyText: {
      color: theme.text,
      fontSize: 16 * fontMultiplier,
      marginTop: 15,
      opacity: 0.6,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });
