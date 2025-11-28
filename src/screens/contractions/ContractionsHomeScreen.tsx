// src/screens/contractions/ContractionsHomeScreen.tsx

import React, { useState, useCallback, useMemo } from "react";
import {
  StyleSheet,
  Platform,
  StatusBar,
  View,
  Modal,
  TouchableOpacity,
  Text,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import {
  AccessibleText,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";

// ✅ 1. Importar Gesture Handler
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ContractionsHome"
>;

const LESSON_COMPLETED_KEY = "contractions_lesson_completed";

export default function ContractionsHomeScreen({ navigation }: ScreenProps) {
  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled,
    lineHeightMultiplier,
    letterSpacing,
  } = useSettings();

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled,
    lineHeightMultiplier,
    letterSpacing
  );

  const [isChallengeUnlocked, setIsChallengeUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showLockModal, setShowLockModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const checkLessonStatus = async () => {
        try {
          setIsLoading(true);
          const status = await AsyncStorage.getItem(LESSON_COMPLETED_KEY);
          setIsChallengeUnlocked(status === "true");
        } catch (e) {
          console.error("Failed to fetch lesson status", e);
          setIsChallengeUnlocked(false);
        } finally {
          setIsLoading(false);
        }
      };
      checkLessonStatus();
    }, [])
  );

  const handleChallengePress = () => {
    if (isChallengeUnlocked) {
      navigation.navigate("ContractionsRoullete");
    } else {
      setShowLockModal(true);
    }
  };

  // ✅ 2. Configurar Gesto de Voltar (Swipe Right)
  const panGesture = useMemo(
    () =>
      Platform.OS !== "web"
        ? Gesture.Pan()
            .activeOffsetX([-20, 20]) // Reduz sensibilidade vertical
            .onEnd((event) => {
              // Se arrastar mais de 60px para a direita, volta para Home
              if (event.translationX > 60) {
                navigation.navigate("Home");
              }
            })
        : Gesture.Pan(), // Gesto vazio para web
    [navigation]
  );

  const renderContent = () => (
    <View style={styles.container}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />

      <MaterialCommunityIcons
        name="school-outline"
        size={100 * fontSizeMultiplier}
        color={theme.text}
      />
      <AccessibleHeader style={styles.title}>
        Contrações (Grau 2)
      </AccessibleHeader>
      <AccessibleText style={styles.description} baseSize={18}>
        Aprenda a ler e escrever de forma fluente com as abreviações do Braille
        Grau 2.
      </AccessibleText>

      {/* Botão de Aprender */}
      <AccessibleButton
        style={styles.button}
        onPress={() => navigation.navigate("ContractionsLesson")}
        accessibilityText="Aprender o Conteúdo. Toque para iniciar a lição."
      >
        <MaterialCommunityIcons
          name="book-open-page-variant-outline"
          size={24 * fontSizeMultiplier}
          color={theme.buttonText}
        />
        <AccessibleText style={styles.buttonText} baseSize={20}>
          Aprender Conteúdo
        </AccessibleText>
      </AccessibleButton>

      {/* Botão de Desafio */}
      <AccessibleButton
        style={[
          styles.button,
          styles.challengeButton,
          !isChallengeUnlocked && styles.buttonDisabled,
        ]}
        onPress={handleChallengePress}
        accessibilityText={`Desafio de Escrita. ${
          isChallengeUnlocked
            ? "Toque para jogar."
            : "Bloqueado. Toque para saber como desbloquear."
        }`}
      >
        {!isChallengeUnlocked && (
          <MaterialCommunityIcons
            name="lock-outline"
            size={24 * fontSizeMultiplier}
            color={theme.buttonText}
          />
        )}
        <AccessibleText style={styles.buttonText} baseSize={20}>
          Desafio de Escrita
        </AccessibleText>
      </AccessibleButton>

      {/* Modal de Bloqueio */}
      <Modal
        visible={showLockModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLockModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons
              name="lock-alert"
              size={60}
              color={theme.text}
              style={{ marginBottom: 15 }}
            />
            <AccessibleHeader level={2} style={styles.modalTitle}>
              Acesso Bloqueado
            </AccessibleHeader>

            <AccessibleText style={styles.modalText} baseSize={16}>
              Para acessar o Desafio de Escrita, você precisa primeiro concluir
              a lição{" "}
              <Text style={{ fontWeight: "bold" }}>"Aprender Conteúdo"</Text>{" "}
              até o final.
            </AccessibleText>

            <AccessibleButton
              style={styles.modalButton}
              onPress={() => setShowLockModal(false)}
              accessibilityText="Fechar aviso"
            >
              <AccessibleText style={styles.modalButtonText} baseSize={18}>
                Entendi
              </AccessibleText>
            </AccessibleButton>
          </View>
        </View>
      </Modal>
    </View>
  );

  // ✅ 3. Aplicar GestureDetector (Exceto Web se preferir)
  if (Platform.OS !== "web") {
    return (
      <GestureDetector gesture={panGesture}>{renderContent()}</GestureDetector>
    );
  }

  return renderContent();
}

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexiaFontEnabled: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
      padding: 30,
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    title: {
      fontSize: 28 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      marginVertical: 20,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
    },
    description: {
      fontSize: 18 * fontMultiplier,
      color: theme.text,
      opacity: 0.9,
      textAlign: "center",
      marginBottom: 30,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.button ?? "#191970",
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 30,
      elevation: 3,
      width: "100%",
      marginBottom: 20,
    },
    buttonText: {
      color: theme.buttonText ?? "#FFFFFF",
      fontSize: 20 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      marginLeft: 10,
    },
    challengeButton: {
      backgroundColor: "#006400",
    },
    buttonDisabled: {
      backgroundColor: theme.card,
      opacity: 0.7,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.card,
      width: "100%",
      maxWidth: 400,
      padding: 25,
      borderRadius: 20,
      alignItems: "center",
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      borderWidth: 2,
      borderColor: theme.text + "20",
    },
    modalTitle: {
      fontSize: 24 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginBottom: 15,
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    modalText: {
      fontSize: 18 * fontMultiplier,
      color: theme.cardText,
      textAlign: "center",
      marginBottom: 25,
      lineHeight: 24 * fontMultiplier * lineHeightMultiplier,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    modalButton: {
      backgroundColor: theme.button,
      paddingVertical: 12,
      paddingHorizontal: 40,
      borderRadius: 25,
      width: "100%",
      alignItems: "center",
    },
    modalButtonText: {
      color: theme.buttonText,
      fontWeight: "bold",
      fontSize: 18 * fontMultiplier,
    },
  });
