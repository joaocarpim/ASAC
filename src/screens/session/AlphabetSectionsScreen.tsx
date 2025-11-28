import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LEARNING_PATH_SESSIONS } from "../../navigation/learningPathAlphabet";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { RootStackParamList } from "../../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import ScreenHeader from "../../components/layout/ScreenHeader";

type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

export default function AlphabetSectionsScreen() {
  const { theme } = useContrast();
  const { fontSizeMultiplier, isBoldTextEnabled, isDyslexiaFontEnabled } =
    useSettings();
  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled
  );
  const navigation = useNavigation<NavigationProps>();

  // Configuração do gesto de arrastar para voltar
  const panGesture = useMemo(
    () =>
      Platform.OS !== "web"
        ? Gesture.Pan()
            .activeOffsetX([-20, 20]) // Reduz sensibilidade vertical
            .onEnd((event) => {
              // Se arrastar mais de 60px para a direita, volta
              if (event.translationX > 60) {
                navigation.goBack();
              }
            })
        : Gesture.Pan(), // Gesto vazio para web
    [navigation]
  );

  const renderSessionCard = ({
    item: session,
  }: {
    item: (typeof LEARNING_PATH_SESSIONS)[0];
  }) => {
    const accessibilityLabel = `${session.title}. ${session.description}. Toque duas vezes para iniciar a aula.`;

    const handlePress = () => {
      navigation.navigate("AlphabetLesson", {
        title: session.title,
        characters: session.characters,
      });
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons
          name={session.icon}
          size={32}
          // ✅ CORREÇÃO: Usar cardText para garantir contraste dentro do card
          color={theme.cardText}
          importantForAccessibility="no"
        />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{session.title}</Text>
          {/* Opcional: Adicionar descrição visualmente se desejar */}
          {/* <Text style={styles.cardDescription}>{session.description}</Text> */}
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => (
    <View style={styles.container}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />
      {/* Header com botão de voltar padrão */}
      <ScreenHeader
        title="Aprender o Alfabeto"
        onBackPress={() => navigation.goBack()}
      />

      <FlatList
        data={LEARNING_PATH_SESSIONS}
        renderItem={renderSessionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );

  // Aplica o gesto apenas se não for web
  if (Platform.OS !== "web") {
    return (
      <GestureDetector gesture={panGesture}>{renderContent()}</GestureDetector>
    );
  }

  return renderContent();
}

const createStyles = (
  theme: any,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexia: boolean
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    listContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      paddingTop: 10,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    },
    cardTextContainer: { flex: 1, marginLeft: 12 },
    cardTitle: {
      fontSize: 17 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.cardText,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    cardDescription: {
      fontSize: 13 * fontMultiplier,
      color: theme.cardText,
      opacity: 0.8,
      marginTop: 2,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
  });
