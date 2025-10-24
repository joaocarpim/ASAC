// ModuleContentScreen.tsx - separa o botão "Fazer Questionário" do cartão azul; botão agora fica abaixo do card com espaçamento e sombra própria.
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
  AccessibleButton,
} from "../../components/AccessibleComponents";
import { useAccessibility } from "../../context/AccessibilityProvider";
import { Gesture, GestureDetector, Directions } from "react-native-gesture-handler";
import { useSettings } from "../../hooks/useSettings";
import * as moduleDataModule from "../../data/moduleData";

const { width: WINDOW_WIDTH } = Dimensions.get("window");

function isColorDark(color: ColorValue | undefined): boolean {
  if (!color || typeof color !== "string") return false;
  const hex = color.replace("#", "");
  if (hex.length < 3) return false;
  const toInt = (s: string) => (s.length === 1 ? parseInt(s + s, 16) : parseInt(s, 16));
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
  const [moduleData, setModuleData] = useState<any | null>(null);
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
    const loader = async () => {
      try {
        const mdModule: any = moduleDataModule as any;
        let mod: any = null;

        if (typeof mdModule.getModuleById === "function") {
          mod = mdModule.getModuleById(moduleId);
        } else if (typeof mdModule.getModule === "function") {
          mod = mdModule.getModule(moduleId);
        } else if (typeof mdModule.getQuizByModuleId === "function") {
          const q = mdModule.getQuizByModuleId(parseInt(String(moduleId), 10));
          if (q) {
            const lessons = q.lessons && q.lessons.length > 0
              ? q.lessons
              : (q.quiz ?? q.questions ?? []).map((it: any, idx: number) => ({
                  lessonNumber: idx + 1,
                  title: it.question?.slice?.(0, 60) ?? `Questão ${idx + 1}`,
                  content: it.question ?? "",
                }));
            mod = {
              title: q.title ?? `Módulo ${moduleId}`,
              lessons,
              moduleNumber: q.moduleNumber ?? q.moduleId ?? parseInt(String(moduleId), 10),
            };
          }
        } else if (Array.isArray(mdModule.default)) {
          mod = mdModule.default.find((m: any) => String(m.id) === String(moduleId));
        }

        setModuleData(mod || null);
      } catch (e) {
        console.warn("Erro ao carregar dados do módulo:", e);
        setModuleData(null);
      } finally {
        setIsLoading(false);
      }
    };
    loader();
  }, [moduleId]);

  useEffect(() => {
    if (!isLoading && moduleData && speakText) {
      const lesson = moduleData.lessons?.[currentPageIndex];
      if (lesson) speakText(`Página ${currentPageIndex + 1}: ${lesson.title}. ${lesson.content}`);
    }
  }, [currentPageIndex, moduleData, isLoading, speakText]);

  const handlePrevious = () => {
    if (currentPageIndex > 0) setCurrentPageIndex((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (moduleData && currentPageIndex < (moduleData.lessons?.length ?? 0) - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    } else {
      navigation.navigate("ModuleQuiz", { moduleId });
    }
  };

  const startQuiz = () => {
    navigation.navigate("ModuleQuiz", { moduleId });
  };

  const flingLeft = Gesture.Fling().direction(Directions.LEFT).onEnd(handleNextPage);
  const flingRight = Gesture.Fling().direction(Directions.RIGHT).onEnd(handlePrevious);
  const composedGestures = Gesture.Race(flingLeft, flingRight);

  const currentLesson = moduleData?.lessons?.[currentPageIndex];
  const totalPages = moduleData?.lessons?.length ?? 1;
  const pageNumber = currentPageIndex + 1;
  const mainAccessibilityText = currentLesson
    ? `Página ${pageNumber} de ${totalPages}. ${currentLesson.title}. Conteúdo: ${currentLesson.content}. Deslize para a esquerda para avançar, ou para a direita para voltar.`
    : `Nenhuma lição encontrada para ${moduleData?.title || "este módulo"}. Deslize para a esquerda para ir ao quiz, ou para a direita para voltar.`;

  const statusBarStyle = isColorDark(theme.background) ? "light-content" : "dark-content";

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
        <Text style={styles.errorText}>Módulo não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
      <ScreenHeader title={moduleData.title || "Módulo"} />

      <GestureDetector gesture={composedGestures}>
        <ScrollView contentContainerStyle={styles.scrollWrapper}>
          <AccessibleView style={styles.contentCard} accessibilityText={mainAccessibilityText}>
            <View style={styles.cardInner}>
              {currentLesson ? (
                <>
                  <AccessibleHeader level={2} style={styles.contentTitle}>
                    {currentLesson.lessonNumber}. {currentLesson.title}
                  </AccessibleHeader>
                  <AccessibleText baseSize={16} style={styles.contentBody}>
                    {currentLesson.content}
                  </AccessibleText>
                </>
              ) : (
                <View style={styles.contentCenter}>
                  <Text style={[styles.contentBody, styles.emptyText]}>Nenhuma lição encontrada.</Text>
                </View>
              )}
            </View>
          </AccessibleView>

          {/* Botão separado — fica abaixo do cartão com seu próprio container */}
          <View style={styles.separateQuizContainer}>
            <AccessibleButton
              style={styles.quizButton}
              onPress={startQuiz}
              accessibilityLabel={`Iniciar questionário do Módulo ${moduleData.moduleNumber || ""}`}
              disabled={isLoading}
            >
              <Text style={styles.quizButtonText}>Fazer Questionário</Text>
            </AccessibleButton>
          </View>

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
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background },
    contentContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    // ADICIONEI errorText aqui para corrigir o erro de compilação
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
      borderRadius: 12,
      backgroundColor: (theme as any).card ?? "#fff",
      ...Platform.select({
        ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 10 },
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
    contentCenter: { paddingVertical: 24, alignItems: "center", justifyContent: "center" },
    emptyText: {
      fontSize: 16 * fontMultiplier,
      color: theme.text,
      opacity: 0.85,
    },
    separateQuizContainer: {
      marginTop: 18,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    quizButton: {
      alignSelf: "center",
      minWidth: WINDOW_WIDTH > 600 ? 320 : "85%",
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: (theme as any).button ?? "#191970",
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 12 },
        android: { elevation: 8 },
        web: { boxShadow: "0 8px 20px rgba(0,0,0,0.14)" },
      }),
    },
    quizButtonText: {
      color: (theme as any).buttonText ?? "#FFFFFF",
      fontSize: 16 * fontMultiplier,
      fontWeight: "700",
    },
    pageIndicator: {
      marginTop: 12,
      color: (theme as any).cardText ?? theme.text,
      opacity: 0.85,
      fontSize: 13 * fontMultiplier,
    },
  });