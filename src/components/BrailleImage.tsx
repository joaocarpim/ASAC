// BrailleImage.tsx (Componente reutilizável para buscar e exibir a imagem)
import React, { useState, useEffect } from "react";
import { View, Image, ActivityIndicator, Text, StyleSheet } from "react-native";
import { getUrl } from "aws-amplify/storage";
import { useSettings } from "../hooks/useSettings"; // Importando para usar a escala

const BrailleImage = ({ imageKey }: { imageKey: string }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { imageScale } = useSettings(); // Pegando a escala das configurações

  useEffect(() => {
    const fetchImage = async () => {
      if (!imageKey) {
        setError(true);
        setLoading(false);
        return;
      }
      try {
        // Busca a URL da imagem no Amplify Storage
        const result = await getUrl({
          key: imageKey,
          options: {
            validateObjectExistence: true, // Garante que a imagem existe antes de retornar a URL
            accessLevel: "protected", // ou 'public', dependendo da sua configuração
          },
        });
        setImageUrl(result.url.toString());
        setError(false);
      } catch (err) {
        console.error(
          `Erro ao carregar a imagem com a chave ${imageKey}:`,
          err
        );
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [imageKey]); // Executa sempre que a imageKey mudar

  if (loading) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator color="#000" />
      </View>
    );
  }

  if (error || !imageUrl) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.errorText}>Erro</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      style={[
        styles.image,
        // Aplica a escala da imagem
        imageScale !== 1 ? { transform: [{ scale: imageScale }] } : {},
      ]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    width: "85%",
    height: "85%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  image: {
    width: "85%",
    height: "85%",
  },
  errorText: {
    color: "#555",
  },
});

export default BrailleImage;
