// ModuleContentScreen.tsx - Com gesto de voltar para a Home
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
// Certifique-se de que o caminho para seus tipos esteja correto
import { DEFAULT_MODULES, ModuleContent } from "../../navigation/moduleTypes";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

function isColorDark(color: ColorValue | undefined): boolean {
  if (!color || typeof color !== "string") return false;
  const hex = color.replace("#", "");
  if (hex.length < 3) return false;
  const toInt = (s: string) =>
    s.length === 1 ? parseInt(s + s, 16) : parseInt(s, 16);
  const r = toInt(hex.substring(0, 2));
  const g = toInt(hex.substring(2, 4));
  const b = toInt(hex.substring(4, 6));
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

  // 👇👇👇 AQUI ESTÁ A ÚNICA ALTERAÇÃO 👇👇👇
  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      // Se não for a primeira página, apenas volta uma página
      setCurrentPageIndex((prev) => prev - 1);
    } else {
      // Se for a primeira página (index 0), navega para a Home
      navigation.navigate("Home");
    }
  };
  // 👆👆👆 FIM DA ALTERAÇÃO 👆👆👆

  const handleNextPage = () => {
    if (
      moduleData &&
      currentPageIndex < (moduleData.sections?.length ?? 0) - 1
    ) {
      setCurrentPageIndex((prev) => prev + 1);
    } else {
      // Navega para a tela de pré-questionário ao finalizar o conteúdo
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

          {/* O botão foi removido daqui */}

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
  isDyslexiaFont: boolean
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
    },
    scrollWrapper: {
      paddingHorizontal: Math.min(24, WINDOW_WIDTH * 0.04),
      paddingTop: 18,
      paddingBottom: 40,
      alignItems: "center",
    },
    contentCard: {
      width: "100%",
      maxWidth: 980,
      minHeight: WINDOW_WIDTH > 600 ? 400 : 300,
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
    },
    cardInner: {
      padding: 22,
    },
    contentTitle: {
      fontSize: 20 * fontMultiplier,
      fontWeight: isBold ? "700" : "700",
      marginBottom: 12,
      color: (theme as any).cardText ?? theme.text,
      textAlign: "left",
    },
    contentBody: {
      fontSize: 16 * fontMultiplier,
      lineHeight: Math.round(22 * lineHeightMultiplier),
      color: (theme as any).cardText ?? theme.text,
      textAlign: "left",
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
    },
    pageIndicator: {
      marginTop: 18,
      color: (theme as any).cardText ?? theme.text,
      opacity: 0.85,
      fontSize: 13 * fontMultiplier,
    },
  });
