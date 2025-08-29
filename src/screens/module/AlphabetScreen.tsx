import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { generateClient } from "aws-amplify/api";
import { listBrailleSymbols } from "../../graphql/queries";
import { getUrl } from "aws-amplify/storage";
import ScreenHeader from "../../components/layout/ScreenHeader";

// Tipo para os dados de um símbolo Braille
type BrailleSymbol = {
  id: string;
  letter: string;
  description: string;
  imageKey: string;
};

// Tipo para as props do componente de item
type AlphabetItemProps = {
  item: BrailleSymbol;
};

// Componente para cada item da lista
const AlphabetItem = ({ item }: AlphabetItemProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      if (!item.imageKey) {
        setImageError(true);
        return;
      }
      try {
        // Lógica de busca de imagem simplificada
        const urlResult = await getUrl({
          key: item.imageKey,
          options: {
            accessLevel: "protected", // Acesso para usuários logados
            validateObjectExistence: true, // Garante que o arquivo existe
          },
        });
        setImageUrl(urlResult.url.toString());
        setImageError(false);
      } catch (e) {
        console.error(`Erro ao buscar imagem "${item.imageKey}" do S3:`, e);
        setImageError(true);
      }
    };

    fetchImage();
  }, [item.imageKey]);

  return (
    <View style={styles.itemContainer}>
      {imageUrl && !imageError ? (
        <Image source={{ uri: imageUrl }} style={styles.brailleImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          {!imageError ? (
            <ActivityIndicator color="#FFC700" />
          ) : (
            <Text style={styles.errorText}>Erro Imagem</Text>
          )}
        </View>
      )}
      <Text style={styles.descriptionText}>
        {item.letter}: {item.description}
      </Text>
    </View>
  );
};

export default function AlphabetScreen() {
  const [alphabet, setAlphabet] = useState<BrailleSymbol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlphabet = async () => {
      try {
        const client = generateClient();
        const result = await client.graphql({ query: listBrailleSymbols });
        const items = result.data.listBrailleSymbols.items.filter(
          Boolean
        ) as BrailleSymbol[];
        const sortedAlphabet = items.sort((a, b) =>
          a.letter.localeCompare(b.letter)
        );
        setAlphabet(sortedAlphabet);
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
        <Text style={styles.loadingText}>Carregando alfabeto...</Text>
      </View>
    );
  }

  if (alphabet.length === 0) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Alfabeto Braille" />
        <View style={styles.loadingContainer}>
          <Text style={styles.pageTitle}>Nenhum material encontrado.</Text>
          <Text style={styles.infoText}>
            Verifique se o conteúdo foi cadastrado no Amplify Studio.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Alfabeto Braille" />
      <FlatList
        data={alphabet}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlphabetItem item={item} />}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFC700",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#191970",
    marginTop: 10,
    textAlign: "center",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#191970",
    textAlign: "center",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: "#191970",
    textAlign: "center",
    marginTop: 10,
  },
  listContainer: { padding: 10 },
  itemContainer: {
    flex: 1,
    margin: 10,
    padding: 15,
    backgroundColor: "#191970",
    borderRadius: 12,
    alignItems: "center",
  },
  brailleImage: {
    width: 100,
    height: 150,
    resizeMode: "contain",
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 100,
    height: 150,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  errorText: { color: "#666", fontSize: 12, textAlign: "center" },
  descriptionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
