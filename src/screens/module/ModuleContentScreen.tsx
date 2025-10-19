// src/screens/module/ModuleContentScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { DEFAULT_MODULES, ModuleContent } from "../../navigation/moduleTypes";
import { useAuthStore } from "../../store/authStore";
import { canStartModule } from "../../services/progressService";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleHeader,
  AccessibleText,
} from "../../components/AccessibleComponents";
import { useAccessibility } from "../../context/AccessibilityProvider";
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";
// 👇 1. IMPORTAR O useSettings 👇
import { useSettings } from "../../hooks/useSettings";

const getStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    header: {
      paddingTop: 40,
      paddingHorizontal: 20,
      paddingBottom: 10,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 22 * fontMultiplier,
      fontWeight: isBold ? "bold" : "bold",
      color: theme.text,
      textAlign: "center",
      lineHeight: 22 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    pageIndicator: {
      fontSize: 14 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      marginTop: 5,
      lineHeight: 14 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    contentArea: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
    },
    contentCard: {
      backgroundColor: theme.card,
      borderRadius: 15,
      padding: 25,
      flex: 1,
      maxHeight: "90%",
      justifyContent: "center",
    },
    contentTitle: {
      color: theme.cardText,
      fontSize: 20 * fontMultiplier,
      fontWeight: isBold ? "bold" : "bold",
      marginBottom: 15,
      textAlign: "center",
      lineHeight: 20 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    contentBody: {
      color: theme.cardText,
      fontSize: 18 * fontMultiplier,
      lineHeight: 24 * lineHeight,
      textAlign: "left",
      fontWeight: isBold ? "bold" : "normal",
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });

export default function ModuleContentScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModuleContent">) {
  const { moduleId } = route.params;
  const [moduleData, setModuleData] = useState<ModuleContent | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const { user } = useAuthStore();
  const { theme } = useContrast();
  const { speakText } = useAccessibility();

  // 👇 2. OBTER OS VALORES DAS CONFIGURAÇÕES 👇
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  // 👇 3. PASSAR OS VALORES PARA A CRIAÇÃO DE ESTILOS 👇
  const styles = getStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  useEffect(() => {
    const currentModule = DEFAULT_MODULES.find((m) => m.moduleId === moduleId);
    setModuleData(currentModule);
  }, [moduleId]);

  useEffect(() => {
    if (moduleData) {
      const pageNumber = currentPage + 1;
      const totalPages = moduleData.sections.length;
      const title = moduleData.sections[currentPage].title;
      const announcement = `Página ${pageNumber} de ${totalPages}. ${title}. Deslize para a esquerda para avançar, ou para a direita para voltar.`;
      speakText(announcement);
    }
  }, [currentPage, moduleData, speakText]);

  const handleNextPage = async () => {
    if (!moduleData || isLoadingNext) return;
    if (currentPage < moduleData.sections.length - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
      return;
    }
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }
    setIsLoadingNext(true);
    try {
      const allowed = await canStartModule(user.userId, moduleId);
      if (allowed) {
        navigation.navigate("ModulePreQuiz", { moduleId });
      } else {
        Alert.alert(
          "Módulo Bloqueado",
          "Você precisa concluir o módulo anterior para iniciar este quiz."
        );
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        "Ocorreu um problema ao tentar iniciar o quiz. Tente novamente."
      );
    } finally {
      setIsLoadingNext(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    } else {
      navigation.navigate("Home");
    }
  };

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(handleNextPage);
  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handlePreviousPage);

  if (!moduleData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  const currentSection = moduleData.sections[currentPage];

  return (
    <View style={styles.container}>
      <AccessibleView
        style={styles.header}
        accessibilityText={`${moduleData.title}. Página ${currentPage + 1} de ${moduleData.sections.length}`}
      >
        <Text style={styles.headerTitle}>{moduleData.title}</Text>
        <Text style={styles.pageIndicator}>
          {currentPage + 1} / {moduleData.sections.length}
        </Text>
      </AccessibleView>

      <GestureDetector gesture={Gesture.Exclusive(flingLeft, flingRight)}>
        <View style={styles.contentArea}>
          <View key={currentPage} style={styles.contentCard}>
            <AccessibleHeader
              level={2}
              style={styles.contentTitle}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {currentSection.title}
            </AccessibleHeader>

            <ScrollView>
              <AccessibleText
                baseSize={18}
                style={styles.contentBody}
                adjustsFontSizeToFit
                numberOfLines={15}
              >
                {currentSection.content}
              </AccessibleText>
            </ScrollView>
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}
