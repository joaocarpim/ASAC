import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LEARNING_PATH_SESSIONS } from "../../navigation/learningPathData";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
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

  const panGesture =
    Platform.OS !== "web"
      ? Gesture.Pan().onEnd((event) => {
          if (
            event.translationX > 80 &&
            Math.abs(event.translationX) > Math.abs(event.translationY)
          ) {
            navigation.navigate("Home");
          }
        })
      : undefined;

  const renderSessionCard = ({ item: session }: { item: any }) => {
    const isLocked = false;
    const progress = userProgress.find((p) => p.sessionId === session.id);

    const accuracyText = progress
      ? `${(progress.accuracy * 100).toFixed(0)}%`
      : "Não iniciado";

    // Texto que o TalkBack vai ler para o BLOCO INTEIRO
    const accuracyAccessibilityText = progress
      ? `${(progress.accuracy * 100).toFixed(0)}% de acerto`
      : "Não iniciado";

    const accessibilityLabel = `${session.title}. ${
      session.description
    }. Status: ${accuracyAccessibilityText}. ${
      isLocked ? "Sessão bloqueada." : "Toque duas vezes para iniciar."
    }`;

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
        // --- BLINDAGEM DE BOX/DIV ---
        accessible={true}
        focusable={true} // Força detecção via Tab/Teclado
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        // -----------------------------
      >
        {/* ESCONDE OS FILHOS PARA NÃO PICOTAR A LEITURA */}
        <View
          style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden={true}
        >
          <MaterialCommunityIcons
            name={session.icon}
            size={32}
            color={isLocked ? "#888" : theme.cardText}
          />
          <View style={styles.cardTextContainer}>
            <Text style={[styles.cardTitle, isLocked && styles.textLocked]}>
              {session.title}
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
            />
          )}
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

      {/* HEADER COMO BLOCO ÚNICO */}
      <View
        style={styles.headerContainer}
        accessible={true}
        focusable={true}
        accessibilityRole="header"
        accessibilityLabel="Título: Jornada do Aprendiz"
      >
        <Text
          style={styles.headerTitle}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden={true}
        >
          Jornada do Aprendiz
        </Text>
      </View>

      <FlatList
        data={LEARNING_PATH_SESSIONS}
        renderItem={renderSessionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );

  if (Platform.OS !== "web" && panGesture) {
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
    headerContainer: {
      width: "100%",
      alignItems: "center",
      paddingVertical: 20,
    },
    headerTitle: {
      fontSize: 28 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      textAlign: "center",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
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
    cardLocked: { backgroundColor: "#e0e0e0", elevation: 0 },
    cardTextContainer: { flex: 1, marginLeft: 12 },
    cardTitle: {
      fontSize: 17 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.cardText,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    cardProgress: {
      fontSize: 12 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      color: theme.button ?? "#007bff",
      marginTop: 4,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    textLocked: { color: "#888" },
    lockIcon: {
      marginLeft: 10,
    },
  });
