// src/screens/module/ModuleContentScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  ColorValue,
  Platform,
  Dimensions,
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import ScreenHeader from "../../components/layout/ScreenHeader";
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
import { useSettings } from "../../hooks/useSettings";
import { DEFAULT_MODULES, ModuleContent } from "../../navigation/moduleTypes";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

function isColorDark(color: ColorValue | undefined): boolean {
  if (!color || typeof color !== "string") return false;
  // Simplificado para lidar com cores de tema
  const hex = color.replace("#", "");
  if (hex.length < 3) return false;

  // Lógica de luminância (mantida)
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    return false; // Formato inválido
  }

  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 149;
}

export default function ModuleContentScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModuleContent">) {
  const { moduleId } = route.params;
  const [moduleData, setModuleData] = useState<ModuleContent | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { theme } = useContrast();
  const { speakText } = useAccessibility();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const styles = getStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  useEffect(() => {
    setIsLoading(true);
    const loadModuleContent = () => {
      const numericModuleId = parseInt(String(moduleId), 10);
      const content = DEFAULT_MODULES.find(
        (m: ModuleContent) => m.moduleId === numericModuleId
      );
      setModuleData(content || null);
      setIsLoading(false);
    };
    loadModuleContent();
  }, [moduleId]);

  useEffect(() => {
    if (!isLoading && moduleData && speakText) {
      const section = moduleData.sections?.[currentPageIndex];
      if (section)
        speakText(
          `Página ${currentPageIndex + 1}: ${section.title}. ${section.content}`
        );
    }
  }, [currentPageIndex, moduleData, isLoading, speakText]);

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    } else {
      navigation.navigate("Home");
    }
  };

  const handleNextPage = () => {
    if (
      moduleData &&
      currentPageIndex < (moduleData.sections?.length ?? 0) - 1
    ) {
      setCurrentPageIndex((prev) => prev + 1);
    } else {
      navigation.navigate("ModulePreQuiz", { moduleId });
    }
  };

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(handleNextPage);
  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handlePrevious);
  const composedGestures = Gesture.Race(flingLeft, flingRight);

  const currentSection = moduleData?.sections?.[currentPageIndex];
  const totalPages = moduleData?.sections?.length ?? 1;
  const pageNumber = currentPageIndex + 1;
  const mainAccessibilityText = currentSection
    ? `Página ${pageNumber} de ${totalPages}. ${currentSection.title}. Conteúdo: ${currentSection.content}. Deslize para a esquerda para avançar, ou para a direita para voltar.`
    : `Nenhuma lição encontrada para ${moduleData?.title || "este módulo"}.`;

  const statusBarStyle = isColorDark(theme.background)
    ? "light-content"
    : "dark-content";

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={(theme as any).cardText ?? "#000"} />
      </View>
    );
  }

  if (!moduleData) {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.errorText}>Conteúdo do módulo não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
      <ScreenHeader title={moduleData.title || "Módulo"} />

      <GestureDetector gesture={composedGestures}>
        <ScrollView contentContainerStyle={styles.scrollWrapper}>
          <AccessibleView
            style={styles.contentCard}
            accessibilityText={mainAccessibilityText}
          >
            <View style={styles.cardInner}>
              {currentSection ? (
                <>
                  <AccessibleHeader level={2} style={styles.contentTitle}>
                    {currentSection.order}. {currentSection.title}
                  </AccessibleHeader>
                  <AccessibleText baseSize={16} style={styles.contentBody}>
                    {currentSection.content}
                  </AccessibleText>
                </>
              ) : (
                <View style={styles.contentCenter}>
                  <Text style={[styles.contentBody, styles.emptyText]}>
                    Nenhuma seção encontrada.
                  </Text>
                </View>
              )}
            </View>
          </AccessibleView>

          <Text style={styles.pageIndicator}>
            {pageNumber} / {totalPages}
          </Text>
        </ScrollView>
      </GestureDetector>
    </View>
  );
}

const getStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number,
  isDyslexiaFontEnabled: boolean
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    contentContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    errorText: {
      fontSize: 18 * fontMultiplier,
      textAlign: "center",
      color: (theme as any).cardText ?? theme.text,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    scrollWrapper: {
      paddingHorizontal: WINDOW_WIDTH * 0.05, // ✅ Responsivo
      paddingTop: 18,
      paddingBottom: 40,
      alignItems: "center",
      flexGrow: 1, // ✅ Garante que o ScrollView se expanda
      justifyContent: "center", // ✅ Centraliza o card verticalmente se o conteúdo for pequeno
    },
    contentCard: {
      width: "100%",
      maxWidth: 980,
      minHeight: WINDOW_HEIGHT * 0.5, // ✅ Responsivo à altura
      borderRadius: 12,
      backgroundColor: (theme as any).card ?? "#fff",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
        },
        android: { elevation: 6 },
        web: { boxShadow: "0 8px 20px rgba(0,0,0,0.12)" },
      }),
      justifyContent: "center", // ✅ Centraliza o texto verticalmente
    },
    cardInner: {
      padding: WINDOW_WIDTH * 0.06, // ✅ Padding responsivo
    },
    contentTitle: {
      fontSize: 20 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      marginBottom: 12,
      color: (theme as any).cardText ?? theme.text,
      textAlign: "left",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    contentBody: {
      fontSize: 16 * fontMultiplier,
      lineHeight: Math.round(22 * lineHeightMultiplier * fontMultiplier), // ✅ Aplicado fontMultiplier
      color: (theme as any).cardText ?? theme.text,
      textAlign: "left",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    contentCenter: {
      paddingVertical: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      fontSize: 16 * fontMultiplier,
      color: theme.text,
      opacity: 0.85,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    pageIndicator: {
      marginTop: 18,
      color: (theme as any).cardText ?? theme.text,
      opacity: 0.85,
      fontSize: 13 * fontMultiplier,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });
