// src/screens/module/AlphabetSectionsScreen.tsx (ARQUIVO NOVO)
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
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

  // Gesto de arrastar para voltar
  const panGesture = Gesture.Pan().onEnd((event) => {
    if (
      event.translationX > 80 &&
      Math.abs(event.translationX) > Math.abs(event.translationY)
    ) {
      navigation.goBack();
    }
  });

  const renderSessionCard = ({
    item: session,
  }: {
    item: (typeof LEARNING_PATH_SESSIONS)[0];
  }) => {
    const accessibilityLabel = `${session.title}. ${session.description}. Toque duas vezes para iniciar a aula.`;

    const handlePress = () => {
      // Navega para a tela de AULA (carrossel)
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
      >
        <MaterialCommunityIcons
          name={session.icon}
          size={40}
          color={theme.text}
        />
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>{session.title}</Text>
          <Text style={styles.cardDescription}>{session.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title="Aprender o Alfabeto" />
        <FlatList
          data={LEARNING_PATH_SESSIONS} // Usa os mesmos dados da Jornada
          renderItem={renderSessionCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </GestureDetector>
  );
}

// Estilos (semelhantes ao LearningPathScreen)
const createStyles = (
  theme: any,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexia: boolean
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    listContainer: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 10 },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    },
    cardTextContainer: { flex: 1, marginLeft: 16 },
    cardTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.cardText,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    cardDescription: {
      fontSize: 14 * fontMultiplier,
      color: theme.cardText,
      opacity: 0.8,
      marginTop: 4,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
  });
