import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  SafeAreaView,
  ImageSourcePropType,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
import { useSettings } from "../../hooks/useSettings";
// 👇 1. IMPORTAR OS COMPONENTES DE GESTO 👇
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";

// --- DADOS E TIPOS ---
type RankingItemData = {
  id: string;
  name: string;
  coins: number;
  points: number;
  modules: string;
  avatar: ImageSourcePropType;
};
const rankingData: RankingItemData[] = [
  {
    id: "1",
    name: "Ana Silva Nogueira",
    coins: 495,
    points: 36730,
    modules: "3/3",
    avatar: require("../../assets/images/avatar1.png"),
  },
  {
    id: "2",
    name: "Cláudio Silvano Filho",
    coins: 470,
    points: 33200,
    modules: "2/3",
    avatar: require("../../assets/images/avatar2.png"),
  },
  {
    id: "3",
    name: "Anderson Pereira Silva",
    coins: 357,
    points: 17700,
    modules: "2/3",
    avatar: require("../../assets/images/avatar3.png"),
  },
  {
    id: "4",
    name: "Laura Andrade Neto",
    coins: 320,
    points: 15500,
    modules: "1/3",
    avatar: require("../../assets/images/avatar4.png"),
  },
  {
    id: "5",
    name: "Marcos Pereira",
    coins: 310,
    points: 14800,
    modules: "1/3",
    avatar: require("../../assets/images/avatar1.png"),
  },
  {
    id: "6",
    name: "Juliana Costa",
    coins: 290,
    points: 13500,
    modules: "1/3",
    avatar: require("../../assets/images/avatar2.png"),
  },
];

// --- ITEM INDIVIDUAL ---
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

// --- TELA PRINCIPAL ---
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

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  // 👇 2. DEFINIR A FUNÇÃO E O GESTO 👇
  const handleGoBack = () => {
    navigation.goBack();
  };

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleGoBack);

  return (
    // 👇 3. ENVOLVER A TELA COM O DETECTOR DE GESTOS 👇
    <GestureDetector gesture={flingRight}>
      <SafeAreaView style={styles.pageContainer}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <View style={styles.header}>
          <AccessibleButton
            onPress={handleGoBack} // Reutilizando a função
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
          <ScrollView
            style={styles.carouselContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            {rankingData.map((item, index) => (
              <View key={item.id} style={styles.carouselItem}>
                <RankingListItem data={item} rank={index + 1} styles={styles} />
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </GestureDetector>
  );
}

// --- ESTILOS ---
// A função createStyles permanece exatamente a mesma
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
  });
