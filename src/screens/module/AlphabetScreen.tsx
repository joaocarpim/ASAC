// src/screens/module/AlphabetScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { generateClient } from "aws-amplify/api";
import { listBrailleSymbols } from "../../graphql/queries";
import { getUrl } from "aws-amplify/storage";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { AccessibleView } from "../../components/AccessibleComponents";
import { useNavigation } from "@react-navigation/native";
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";

const screenWidth = Dimensions.get("window").width;

type BrailleSymbol = {
  id: string;
  letter: string;
  description: string;
  imageKey: string;
  imageUrl?: string;
};

const AlphabetItem = ({ item }: { item: BrailleSymbol }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(
    item.imageUrl || null
  );
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      if (!item.imageKey) {
        setImageError(true);
        return;
      }
      try {
        const urlResult = await getUrl({
          key: item.imageKey,
          options: { accessLevel: "protected", validateObjectExistence: true },
        });
        setImageUrl(urlResult.url.toString());
        setImageError(false);
      } catch (e) {
        console.error(`Erro ao carregar imagem ${item.imageKey}:`, e);
        setImageError(true);
      }
    };
    const timeout = setTimeout(fetchImage, 60);
    return () => clearTimeout(timeout);
  }, [item.imageKey]);

  const accessibilityText = `${item.letter}: ${item.description}`;

  return (
    <AccessibleView
      style={styles.itemContainer}
      accessibilityText={accessibilityText}
      accessible={true}
      importantForAccessibility="yes"
    >
      {imageUrl && !imageError ? (
        <Image source={{ uri: imageUrl }} style={styles.brailleImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          {!imageError ? (
            <ActivityIndicator color="#FFC700" />
          ) : (
            <Text style={styles.errorText} selectable={false}>
              Erro Imagem
            </Text>
          )}
        </View>
      )}
      <Text style={styles.descriptionText} selectable={false}>
        {item.letter}: {item.description}
      </Text>
    </AccessibleView>
  );
};

export default function AlphabetScreen() {
  const [alphabet, setAlphabet] = useState<BrailleSymbol[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // ✅ ALTERAÇÃO: A função agora navega para a "Home"
  const handleGoHome = () => {
    navigation.navigate("Home" as never);
  };

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleGoHome); // ✅ ALTERAÇÃO: Usando a nova função

  useEffect(() => {
    const fetchAlphabet = async () => {
      try {
        const client = generateClient();
        const result = await client.graphql({ query: listBrailleSymbols });
        const items = (result.data.listBrailleSymbols.items || []).filter(
          Boolean
        ) as BrailleSymbol[];

        const sorted = items.sort((a, b) => a.letter.localeCompare(b.letter));

        setAlphabet(sorted);
      } catch (e) {
        console.error("Erro ao buscar o alfabeto:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAlphabet();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#191970" />
        <Text style={styles.loadingText}>Carregando símbolos...</Text>
      </View>
    );
  }

  if (alphabet.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.infoText}>Nenhum símbolo encontrado.</Text>
      </View>
    );
  }

  return (
    <GestureDetector gesture={flingRight}>
      <View style={styles.container}>
        <ScreenHeader title="Alfabeto Braille" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator
          decelerationRate="fast"
          snapToInterval={screenWidth * 0.8}
          snapToAlignment="center"
          disableIntervalMomentum
          contentContainerStyle={styles.carouselContent}
          accessibilityLabel="Carrossel de símbolos Braille"
        >
          {alphabet.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              <AlphabetItem item={item} />
            </View>
          ))}
        </ScrollView>

        <View
          accessible={true}
          accessibilityElementsHidden={false}
          importantForAccessibility="yes"
          style={styles.hiddenAccessibilityArea}
        >
          {alphabet.map((item) => (
            <Text
              key={`hidden-${item.id}`}
              accessibilityLabel={`${item.letter}: ${item.description}`}
            />
          ))}
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFC700",
  },
  loadingText: { fontSize: 16, color: "#191970", marginTop: 10 },
  infoText: {
    fontSize: 16,
    color: "#191970",
    textAlign: "center",
    marginTop: 10,
  },
  carouselContent: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  cardWrapper: {
    width: screenWidth * 0.8,
    marginHorizontal: 10,
  },
  itemContainer: {
    backgroundColor: "#191970",
    borderRadius: 14,
    alignItems: "center",
    padding: 15,
  },
  brailleImage: {
    width: 120,
    height: 160,
    resizeMode: "contain",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  imagePlaceholder: {
    width: 120,
    height: 160,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ddd",
  },
  errorText: {
    color: "#555",
    fontSize: 12,
  },
  descriptionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  hiddenAccessibilityArea: {
    height: 0,
    width: 0,
    opacity: 0,
  },
});
