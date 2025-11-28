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
import { useSettings } from "../../hooks/useSettings";

import { DEFAULT_MODULES, ModuleContent } from "../../navigation/moduleTypes";

import { useSwipeNavigation } from "../../hooks/useSwipeNavigation";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

// Funções de responsividade
const wp = (percentage: number) => (WINDOW_WIDTH * percentage) / 100;
const hp = (percentage: number) => (WINDOW_HEIGHT * percentage) / 100;
const normalize = (size: number) => {
  const scale = WINDOW_WIDTH / 375;
  return Math.round(size * scale);
};

function isColorDark(color: ColorValue | undefined): boolean {
  if (!color || typeof color !== "string") return false;
  const hex = color.replace("#", "");
  if (hex.length !== 6) return false;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
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

  const { panResponder, gestureWrapper } = useSwipeNavigation({
    onSwipeLeft: () => {
      if (
        moduleData &&
        currentPageIndex < (moduleData.sections?.length ?? 0) - 1
      ) {
        setCurrentPageIndex((prev) => prev + 1);
      } else {
        navigation.navigate("ModulePreQuiz", { moduleId });
      }
    },
    onSwipeRight: () => {
      if (currentPageIndex > 0) {
        setCurrentPageIndex((prev) => prev - 1);
      } else {
        navigation.navigate("Home");
      }
    },
  });

  useEffect(() => {
    const id = parseInt(String(moduleId), 10);
    const content = DEFAULT_MODULES.find((m) => m.moduleId === id);
    setModuleData(content || null);
    setIsLoading(false);
  }, [moduleId]);

  useEffect(() => {
    if (!isLoading && moduleData && speakText) {
      const section = moduleData.sections?.[currentPageIndex];
      if (section) {
        speakText(
          `Página ${currentPageIndex + 1}. ${section.title}. ${section.content}`
        );
      }
    }
  }, [currentPageIndex, moduleData, isLoading]);

  const currentSection = moduleData?.sections?.[currentPageIndex];
  const totalPages = moduleData?.sections?.length ?? 1;

  const statusBarStyle = isColorDark(theme.background)
    ? "light-content"
    : "dark-content";

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={theme.text} size="large" />
      </View>
    );
  }

  if (!moduleData) {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.errorText}>Conteúdo não encontrado.</Text>
      </View>
    );
  }

  const content = (
    <View style={styles.container} {...panResponder}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
      <ScreenHeader title={moduleData.title || "Módulo"} />

      <ScrollView contentContainerStyle={styles.scrollWrapper}>
        <AccessibleView
          style={styles.contentCard}
          accessibilityText={`Página ${currentPageIndex + 1}. ${
            currentSection?.title ?? ""
          }`}
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
              <Text selectable={false} style={styles.emptyText}>
                Nenhum conteúdo.
              </Text>
            )}
          </View>
        </AccessibleView>

        <Text selectable={false} style={styles.pageIndicator}>
          {currentPageIndex + 1} / {totalPages}
        </Text>
      </ScrollView>
    </View>
  );

  if (gestureWrapper && Platform.OS !== "web") {
    const { GestureDetector } = require("react-native-gesture-handler");
    return (
      <GestureDetector gesture={gestureWrapper}>{content}</GestureDetector>
    );
  }

  return content;
}

//
// ========================================================
// 🎨 ESTILOS OTIMIZADOS PARA CONTRASTE E LEITURA
// ========================================================
//
const getStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number,
  isDyslexiaFontEnabled: boolean
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

    contentContainer: {
      padding: wp(5),
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },

    errorText: {
      fontSize: Math.min(normalize(18) * fontMultiplier, wp(6)),
      color: theme.text, // ✅ Usa cor de texto padrão (contrasta com background)
      textAlign: "center",
      userSelect: "none",
    },

    scrollWrapper: {
      paddingHorizontal: wp(5),
      paddingVertical: hp(3),
      alignItems: "center",
    },

    contentCard: {
      width: "100%",
      maxWidth: Math.min(wp(95), 900),
      borderRadius: 20,
      paddingVertical: hp(4),
      backgroundColor: theme.card, // ✅ Fundo do card
      userSelect: "none",

      // Bordas e sombras para separar do fundo
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.08)",

      ...Platform.select({
        web: { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: { elevation: 5 },
      }),
    },

    cardInner: {
      paddingHorizontal: wp(6),
    },

    contentTitle: {
      fontSize: Math.min(normalize(24) * fontMultiplier, wp(7)),
      fontWeight: isBold ? "bold" : "700",
      marginBottom: hp(2),
      color: theme.cardText, // ✅ Garante contraste com theme.card
      textAlign: "left",
      letterSpacing,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Bold" : undefined,
    },

    contentBody: {
      fontSize: Math.min(normalize(18) * fontMultiplier, wp(5)),
      lineHeight: Math.min(
        normalize(28) * fontMultiplier * lineHeightMultiplier,
        wp(8)
      ),
      color: theme.cardText, // ✅ Garante contraste com theme.card
      textAlign: "left",
      userSelect: "none",
      letterSpacing,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },

    emptyText: {
      fontSize: normalize(16),
      color: theme.cardText, // ✅ Garante contraste
      textAlign: "center",
      userSelect: "none",
    },

    pageIndicator: {
      marginTop: hp(3),
      fontSize: Math.min(normalize(16), wp(4.5)),
      // ✅ Usa theme.text pois está FORA do card (sobre theme.background)
      color: theme.text,
      opacity: 0.8,
      fontWeight: "bold",
      userSelect: "none",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });
