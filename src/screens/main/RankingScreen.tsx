import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  StatusBar,
  ImageSourcePropType,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenHeader from "../../components/layout/ScreenHeader";

const trophyImg = require("../../assets/images/trophy.png");

// ITEM DO RANKING
type RankingItem = {
  id: string;
  name: string;
  coins: number;
  points: number;
  modules: string;
  avatar: ImageSourcePropType;
};

// COMPONENTE DA LISTA
type RankingListItemProps = {
  data: RankingItem;
  rank: number;
};

// Dados de exemplo com o tipo aplicado
const rankingData: RankingItem[] = [
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
];

// TIPO NO COMPONENTE
const RankingListItem = ({ data, rank }: RankingListItemProps) => (
  <View style={[styles.listItem, rank <= 3 && styles.topThree]}>
    <Text style={styles.rankNumber}>{rank}º</Text>
    <View style={styles.playerInfo}>
      <Text style={styles.playerName}>{data.name}</Text>
      <View style={styles.playerStats}>
        <MaterialCommunityIcons name="hand-coin" color="#FFC700" size={16} />
        <Text style={styles.statText}>{data.coins}</Text>
        <MaterialCommunityIcons
          name="trophy-variant"
          color="#FFC700"
          size={16}
          style={{ marginLeft: 8 }}
        />
        <Text style={styles.statText}>
          {data.points.toLocaleString("pt-BR")}
        </Text>
        <MaterialCommunityIcons
          name="book-open-variant"
          color="#FFC700"
          size={16}
          style={{ marginLeft: 8 }}
        />
        <Text style={styles.statText}>{data.modules}</Text>
      </View>
    </View>
    <Image source={data.avatar} style={styles.avatar} />
  </View>
);

export default function RankingScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ScreenHeader
          title="Ranking Geral"
          rightIcon="share-variant"
          onRightIconPress={() => {}}
        />
        <Image
          source={trophyImg}
          style={styles.mainImage}
          accessible
          accessibilityLabel="Troféu dourado grande"
        />
        <View style={styles.listContainer}>
          {rankingData.map((item, index) => (
            <RankingListItem key={item.id} data={item} rank={index + 1} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Os styles permanecem os mesmos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  scrollContainer: { alignItems: "center", paddingBottom: 30 },
  mainImage: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    marginVertical: 10,
  },
  listContainer: {
    backgroundColor: "#191970",
    borderRadius: 20,
    padding: 15,
    width: "90%",
  },
  listItem: {
    backgroundColor: "#3D3D8D",
    borderRadius: 15,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  topThree: { backgroundColor: "#FFA500" },
  rankNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginRight: 10,
  },
  playerInfo: { flex: 1 },
  playerName: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  playerStats: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  statText: { color: "#FFFFFF", fontSize: 12, marginLeft: 3 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, marginLeft: 10 },
});
