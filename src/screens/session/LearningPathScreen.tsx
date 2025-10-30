// src/screens/session/LearningPathScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LEARNING_PATH_SESSIONS } from "../../navigation/learningPathData";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings"; // ✅ Importar useSettings
import { RootStackParamList } from "../../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const MOCK_USER_PROGRESS = [
  { sessionId: "session-1", accuracy: 0.95 },
  { sessionId: "session-2", accuracy: 0.7 },
];

type NavigationProps = NativeStackNavigationProp<
  RootStackParamList,
  "LearningPath"
>;

export default function LearningPathScreen() {
  const { theme } = useContrast();
  // ✅ Integrar configurações de acessibilidade
  const { fontSizeMultiplier, isBoldTextEnabled, isDyslexiaFontEnabled } =
    useSettings();
  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled
  );
  const navigation = useNavigation<NavigationProps>();

  const [userProgress] = useState(MOCK_USER_PROGRESS);

  const panGesture = Gesture.Pan().onEnd((event) => {
    if (
      event.translationX > 80 &&
      Math.abs(event.translationX) > Math.abs(event.translationY)
    ) {
      navigation.navigate("Home");
    }
  });

  const renderSessionCard = ({
    item: session,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const isLocked = false;
    const progress = userProgress.find((p) => p.sessionId === session.id);
    const accuracyText = progress
      ? `${(progress.accuracy * 100).toFixed(0)}% de acerto`
      : "Não iniciado";

    // ✅ Criar label de acessibilidade completo para o TalkBack
    const accessibilityLabel = `${session.title}. ${session.description}. Status: ${accuracyText}. ${isLocked ? "Sessão bloqueada." : "Toque duas vezes para iniciar."}`;

    const handlePress = () => {
      if (isLocked) {
        Alert.alert(
          "Sessão Bloqueada",
          "Você precisa de 80% de acerto na sessão anterior para desbloquear esta."
        );
      } else {
        navigation.navigate("BraillePractice", {
          title: session.title,
          characters: session.characters,
        });
      }
    };

    return (
      <TouchableOpacity
        style={[styles.card, isLocked && styles.cardLocked]}
        onPress={handlePress}
        activeOpacity={isLocked ? 1 : 0.7}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
      >
        <MaterialCommunityIcons
          name={session.icon}
          size={40}
          color={isLocked ? "#888" : theme.text}
        />
        <View style={styles.cardTextContainer}>
          <Text style={[styles.cardTitle, isLocked && styles.textLocked]}>
            {session.title}
          </Text>
          <Text style={[styles.cardDescription, isLocked && styles.textLocked]}>
            {session.description}
          </Text>
          <Text style={[styles.cardProgress, isLocked && styles.textLocked]}>
            {accuracyText}
          </Text>
        </View>
        {isLocked && (
          <MaterialCommunityIcons
            name="lock"
            size={30}
            color="#888"
            style={styles.lockIcon}
            accessibilityElementsHidden={true}
          />
        )}
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
        <Text style={styles.headerTitle} accessibilityRole="header">
          Jornada do Aprendiz
        </Text>
        <FlatList
          data={LEARNING_PATH_SESSIONS}
          renderItem={renderSessionCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </GestureDetector>
  );
}

// ✅ Estilos agora recebem as configurações de acessibilidade
const createStyles = (
  theme: any,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexia: boolean
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    headerTitle: {
      fontSize: 28 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      padding: 20,
      paddingTop: 40,
      textAlign: "center",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
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
    cardLocked: { backgroundColor: "#e0e0e0", elevation: 0 },
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
    cardProgress: {
      fontSize: 12 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      color: theme.button ?? "#007bff",
      marginTop: 8,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    textLocked: { color: "#888" },
    lockIcon: {
      position: "absolute",
      right: 20,
      top: "50%",
      transform: [{ translateY: -15 }],
    },
  });
