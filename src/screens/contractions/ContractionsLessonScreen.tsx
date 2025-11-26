// src/screens/contractions/ContractionsLessonScreen.tsx

import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ConfettiCannon from "react-native-confetti-cannon";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleHeader,
  AccessibleText,
  AccessibleButton,
} from "../../components/AccessibleComponents";
import ScreenHeader from "../../components/layout/ScreenHeader";
import {
  CONTRACTION_LIST,
  Contraction,
} from "../../navigation/contractionsData";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");
const LESSON_COMPLETED_KEY = "contractions_lesson_completed";

// Funções de responsividade
const wp = (percentage: number) => (WINDOW_WIDTH * percentage) / 100;
const hp = (percentage: number) => (WINDOW_HEIGHT * percentage) / 100;
const normalize = (size: number) => {
  const scale = WINDOW_WIDTH / 375;
  return Math.round(size * scale);
};

const getDotDescription = (dots: number[]): string => {
  if (!dots || dots.length === 0) return "Nenhum ponto levantado.";
  const sorted = [...dots].sort((a, b) => a - b);
  if (sorted.length === 1) return `Ponto ${sorted[0]} levantado.`;
  const last = sorted.pop();
  return `Pontos ${sorted.join(", ")} e ${last} levantados.`;
};

const getBrailleColors = (
  themeCard: string,
  themeText: string,
  contrastMode: string
) => {
  if (contrastMode === "blue_yellow") {
    return {
      cell: "#191970",
      dotActive: "#FFD700",
      dotBorder: "#FFD700",
      dotInactive: "rgba(255, 215, 0, 0.2)",
      textColor: "#FFFFFF",
    };
  }
  if (contrastMode === "sepia") {
    return {
      cell: "#FFFFFF",
      dotActive: "#3E2723",
      dotBorder: "#3E2723",
      dotInactive: "rgba(62, 39, 35, 0.1)",
      textColor: "#3E2723",
    };
  }
  if (contrastMode === "grayscale" || contrastMode === "white_black") {
    return {
      cell: "#FFFFFF",
      dotActive: "#000000",
      dotBorder: "#000000",
      dotInactive: "rgba(0, 0, 0, 0.1)",
      textColor: "#000000",
    };
  }
  return {
    cell: "#000000",
    dotActive: "#FFFFFF",
    dotBorder: "#FFFFFF",
    dotInactive: "rgba(255, 255, 255, 0.2)",
    textColor: "#FFFFFF",
  };
};

const BrailleCell = ({
  dots,
  styles,
  colors,
}: {
  dots: number[];
  styles: any;
  colors: any;
}) => {
  const dotOrder = [1, 4, 2, 5, 3, 6];
  return (
    <View
      style={[
        styles.brailleCell,
        {
          backgroundColor: colors.cell,
          borderColor: colors.dotBorder,
        },
      ]}
      importantForAccessibility="no-hide-descendants"
    >
      {dotOrder.map((dotNum) => {
        const isActive = dots.includes(dotNum);
        return (
          <View key={dotNum} style={styles.dotContainer}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isActive
                    ? colors.dotActive
                    : colors.dotInactive,
                  borderColor: colors.dotBorder,
                  borderWidth: 3,
                },
              ]}
            >
              <Text
                style={[
                  styles.dotNumber,
                  { color: isActive ? colors.cell : colors.dotBorder },
                ]}
                selectable={false}
              >
                {dotNum}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const BrailleCard = ({
  item,
  styles,
  colors,
}: {
  item: Contraction;
  styles: any;
  colors: any;
}) => {
  const hasBraille = item.dots && item.dots.length > 0;
  const accessibilityLabel = `${item.word}. ${
    hasBraille ? getDotDescription(item.dots) : ""
  } ${item.description}`;

  return (
    <AccessibleView
      style={styles.contentCard}
      accessibilityText={accessibilityLabel}
      accessibilityHint="Arraste para o lado para mudar de carta"
    >
      <View style={styles.cardInner}>
        <AccessibleHeader
          level={2}
          style={[styles.cardTitleText, { color: colors.textColor }]}
        >
          {item.word}
        </AccessibleHeader>

        {/* Layout vertical: Braille em cima, texto embaixo */}
        <View style={styles.cardBody}>
          {hasBraille && (
            <View style={styles.brailleCellContainer}>
              <BrailleCell dots={item.dots} styles={styles} colors={colors} />
            </View>
          )}

          <View style={styles.descriptionContainer}>
            <AccessibleText
              style={[styles.descriptionText, { color: colors.textColor }]}
              baseSize={18}
            >
              {item.description}
            </AccessibleText>
          </View>
        </View>
      </View>
    </AccessibleView>
  );
};

const CongratsCard = ({
  title,
  onReturn,
  styles,
  isVisible,
  colors,
}: {
  title: string;
  onReturn: () => void;
  styles: any;
  isVisible: boolean;
  colors: any;
}) => {
  return (
    <View
      style={styles.contentCard}
      accessible={true}
      accessibilityLabel={`Parabéns! Você completou a lição ${title}.`}
    >
      {isVisible && (
        <ConfettiCannon
          count={200}
          origin={{ x: WINDOW_WIDTH / 2, y: 0 }}
          fadeOut={true}
        />
      )}
      <View style={styles.cardInner}>
        <MaterialCommunityIcons
          name="party-popper"
          size={normalize(80)}
          color={colors.textColor}
          style={{ marginBottom: hp(2) }}
        />
        <AccessibleHeader
          level={1}
          style={[styles.congratsTitle, { color: colors.textColor }]}
        >
          Parabéns!
        </AccessibleHeader>
        <AccessibleText
          style={[styles.congratsSubtitle, { color: colors.textColor }]}
          baseSize={18}
        >
          Você concluiu todas as abreviações!
        </AccessibleText>

        <AccessibleButton
          style={[styles.button, { backgroundColor: colors.textColor }]}
          onPress={onReturn}
          accessibilityText="Botão Concluir e voltar"
        >
          <Text
            style={[styles.buttonText, { color: colors.cell }]}
            selectable={false}
          >
            Concluir
          </Text>
        </AccessibleButton>
      </View>
    </View>
  );
};

export default function ContractionsLessonScreen() {
  const navigation = useNavigation();
  const lessonTitle = "Abreviações em Braille";

  const lessonData = useMemo(() => {
    const introItem: Contraction = {
      word: "Introdução",
      dots: [],
      description:
        "Na estenografia Braille (Grau 2), usamos uma única letra para representar uma palavra inteira comum. Isso torna a leitura muito mais rápida.",
      type: "Palavra",
    };
    return [introItem, ...CONTRACTION_LIST];
  }, []);

  const { theme, contrastMode } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const brailleColors = useMemo(
    () => getBrailleColors(theme.card, theme.text, contrastMode),
    [theme.card, theme.text, contrastMode]
  );

  const [happySound, setHappySound] = useState<Audio.Sound | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../../assets/som/happy.mp3")
        );
        setHappySound(sound);
      } catch (error) {
        console.warn("Erro ao carregar som 'happy':", error);
      }
    };
    loadSound();
    return () => {
      happySound?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (isFinished) {
      happySound?.replayAsync();
      saveLessonCompletion();
    }
  }, [isFinished, happySound]);

  const saveLessonCompletion = async () => {
    try {
      await AsyncStorage.setItem(LESSON_COMPLETED_KEY, "true");
      console.log("✅ Lição de contrações salva como concluída!");
    } catch (error) {
      console.error("❌ Erro ao salvar conclusão da lição:", error);
    }
  };

  const handleGoBack = () => navigation.goBack();

  const handleNext = () => {
    if (isFinished) return;
    if (currentPageIndex < lessonData.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (isFinished) {
      setIsFinished(false);
      return;
    }
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.translationX < -50) {
        handleNext();
      } else if (e.translationX > 50) {
        handlePrevious();
      }
    });

  const currentItem = lessonData[currentPageIndex];
  const totalPages = lessonData.length;
  const pageNumber = currentPageIndex + 1;

  return (
    <GestureDetector gesture={panGesture}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title={lessonTitle} />

        <ScrollView
          contentContainerStyle={styles.scrollWrapper}
          showsVerticalScrollIndicator={false}
        >
          {isFinished ? (
            <CongratsCard
              title={lessonTitle}
              onReturn={handleGoBack}
              styles={styles}
              isVisible={isFinished}
              colors={brailleColors}
            />
          ) : (
            <BrailleCard
              item={currentItem}
              styles={styles}
              colors={brailleColors}
            />
          )}

          {!isFinished && (
            <View style={styles.footer}>
              <Text
                style={[styles.pageIndicator, { color: theme.text }]}
                selectable={false}
              >
                {pageNumber} / {totalPages}
              </Text>
              <Text
                style={[styles.hintText, { color: theme.text }]}
                selectable={false}
              >
                Arraste para navegar
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GestureDetector>
  );
}

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollWrapper: {
      paddingHorizontal: wp(5),
      paddingTop: hp(2),
      paddingBottom: hp(4),
      alignItems: "center",
      flexGrow: 1,
      justifyContent: "center",
    },

    contentCard: {
      width: "100%",
      maxWidth: Math.min(wp(95), 600),
      minHeight: hp(55),
      borderRadius: 20,
      backgroundColor: theme.card,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: hp(2),
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.05)",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
        },
        android: { elevation: 8 },
      }),
    },

    cardInner: {
      padding: wp(6),
      alignItems: "center",
      width: "100%",
      flex: 1,
      justifyContent: "center",
    },

    cardTitleText: {
      fontSize: Math.min(normalize(32) * fontMultiplier, wp(9)),
      fontWeight: "bold",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Bold" : undefined,
      marginBottom: hp(3),
      textAlign: "center",
      letterSpacing: letterSpacing,
    },

    // Layout vertical: célula em cima, texto embaixo
    cardBody: {
      width: "100%",
      alignItems: "center",
    },

    brailleCellContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginBottom: hp(3),
    },

    brailleCell: {
      width: wp(35),
      height: wp(52),
      maxWidth: 140,
      maxHeight: 210,
      borderRadius: 15,
      flexDirection: "column",
      flexWrap: "wrap",
      alignContent: "center",
      justifyContent: "space-around",
      paddingVertical: hp(1.2),
      paddingHorizontal: wp(1),
      borderWidth: 4,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3,
        },
        android: { elevation: 4 },
      }),
    },

    dotContainer: {
      width: "50%",
      height: "33%",
      justifyContent: "center",
      alignItems: "center",
    },

    dot: {
      width: wp(10),
      height: wp(10),
      maxWidth: 40,
      maxHeight: 40,
      borderRadius: wp(5),
      justifyContent: "center",
      alignItems: "center",
    },

    dotNumber: {
      display: "none",
    },

    // Container do texto de descrição com margens laterais
    descriptionContainer: {
      width: "100%",
      paddingHorizontal: wp(4),
    },

    descriptionText: {
      fontSize: Math.min(normalize(18) * fontMultiplier, wp(5)),
      textAlign: "center",
      lineHeight: Math.min(
        normalize(26) * fontMultiplier * lineHeightMultiplier,
        wp(7)
      ),
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing: letterSpacing,
    },

    congratsTitle: {
      fontSize: Math.min(normalize(36) * fontMultiplier, wp(10)),
      fontWeight: "bold",
      textAlign: "center",
      marginTop: hp(1),
      marginBottom: hp(1),
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Bold" : undefined,
    },

    congratsSubtitle: {
      fontSize: Math.min(normalize(20) * fontMultiplier, wp(5.5)),
      textAlign: "center",
      opacity: 0.9,
      marginBottom: hp(3),
      paddingHorizontal: wp(4),
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },

    button: {
      paddingVertical: hp(2),
      paddingHorizontal: wp(10),
      borderRadius: 30,
      minWidth: wp(40),
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: { elevation: 4 },
      }),
    },

    buttonText: {
      fontSize: Math.min(normalize(18) * fontMultiplier, wp(5)),
      fontWeight: "bold",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },

    footer: {
      alignItems: "center",
      marginTop: hp(2),
    },

    pageIndicator: {
      opacity: 0.8,
      fontSize: Math.min(normalize(16) * fontMultiplier, wp(4.5)),
      fontWeight: "bold",
      marginBottom: hp(0.5),
    },

    hintText: {
      opacity: 0.6,
      fontSize: Math.min(normalize(12) * fontMultiplier, wp(3.5)),
      fontStyle: "italic",
    },
  });
