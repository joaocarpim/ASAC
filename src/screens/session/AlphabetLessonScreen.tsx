// src/screens/learning/AlphabetLessonScreen.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ConfettiCannon from "react-native-confetti-cannon";
import { Audio } from "expo-av";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme, ContrastMode } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleHeader,
  AccessibleText,
} from "../../components/AccessibleComponents";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { RootStackParamList } from "../../navigation/types";
import { ALL_BRAILLE_CHARS } from "../../navigation/brailleLetters";

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

type AlphabetLessonRouteProp = RouteProp<RootStackParamList, "AlphabetLesson">;

const getDotDescription = (dots: number[]): string => {
  if (!dots || dots.length === 0) return "Nenhum ponto levantado.";
  const sorted = [...dots].sort((a, b) => a - b);
  if (sorted.length === 1) return `Ponto ${sorted[0]} levantado.`;
  const last = sorted.pop();
  return `Pontos ${sorted.join(", ")} e ${last} levantados.`;
};

// Componente da Cela Braille
const BrailleCell = ({
  dots,
  styles,
}: {
  dots: number[];
  styles: ReturnType<typeof createStyles>;
}) => {
  const renderDot = (dotNum: number) => {
    const isActive = dots.includes(dotNum);
    return (
      <View key={dotNum} style={styles.dotContainer}>
        <View
          style={[styles.dot, isActive ? styles.dotActive : styles.dotInactive]}
        >
          {/* Aplica estilo específico para o número se o ponto estiver ativo */}
          <Text style={[styles.dotNumber, isActive && styles.dotNumberActive]}>
            {dotNum}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.brailleCell} accessibilityElementsHidden={true}>
      <View style={styles.brailleColumn}>{[1, 2, 3].map(renderDot)}</View>
      <View style={styles.brailleColumn}>{[4, 5, 6].map(renderDot)}</View>
    </View>
  );
};

const BrailleCard = ({
  item,
  styles,
  translateX,
}: {
  item: BrailleItem;
  styles: ReturnType<typeof createStyles>;
  translateX: Animated.Value;
}) => {
  const accessibilityLabel = `${item.letter}. ${item.description}`;

  return (
    <Animated.View
      style={[
        styles.contentCard,
        {
          transform: [{ translateX }],
        },
      ]}
    >
      <AccessibleView accessibilityText={accessibilityLabel}>
        <View style={styles.cardInner}>
          <AccessibleHeader level={2} style={styles.letter}>
            {item.letter}
          </AccessibleHeader>

          <BrailleCell dots={item.dots} styles={styles} />

          <AccessibleText
            style={styles.descriptionText}
            baseSize={18}
            accessibilityText=""
          >
            {item.description}
          </AccessibleText>
        </View>
      </AccessibleView>
    </Animated.View>
  );
};

const CongratsCard = ({
  item,
  onReturn,
  styles,
  isVisible,
}: {
  item: CongratsItem;
  onReturn: () => void;
  styles: ReturnType<typeof createStyles>;
  isVisible: boolean;
}) => {
  return (
    <AccessibleView
      style={styles.congratsCard}
      accessibilityText={`Parabéns, você completou a ${item.title}! Toque duas vezes para voltar.`}
    >
      {isVisible && (
        <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} fadeOut={true} />
      )}
      <View style={styles.cardInner}>
        <MaterialCommunityIcons name="party-popper" size={80} color="#FFD700" />
        <AccessibleHeader level={1} style={styles.congratsTitle}>
          Parabéns!
        </AccessibleHeader>
        <AccessibleText style={styles.congratsSubtitle} baseSize={18}>
          Você concluiu: {item.title}
        </AccessibleText>
        <TouchableOpacity style={styles.button} onPress={onReturn}>
          <Text style={styles.buttonText}>Voltar às Sessões</Text>
        </TouchableOpacity>
      </View>
    </AccessibleView>
  );
};

type BrailleItem = {
  type: "char";
  id: string;
  letter: string;
  dots: number[];
  description: string;
};
type CongratsItem = { type: "congrats"; id: string; title: string };

export default function AlphabetLessonScreen() {
  const navigation = useNavigation();
  const route = useRoute<AlphabetLessonRouteProp>();
  const { title, characters } = route.params;

  const { theme, contrastMode } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const [happySound, setHappySound] = useState<Audio.Sound | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const translateX = useState(new Animated.Value(0))[0];

  const styles = useMemo(
    () =>
      createStyles(
        theme,
        contrastMode,
        fontSizeMultiplier,
        isBoldTextEnabled,
        lineHeightMultiplier,
        letterSpacing,
        isDyslexiaFontEnabled
      ),
    [
      theme,
      contrastMode,
      fontSizeMultiplier,
      isBoldTextEnabled,
      lineHeightMultiplier,
      letterSpacing,
      isDyslexiaFontEnabled,
    ]
  );

  useEffect(() => {
    let sound: Audio.Sound | null = null;
    const loadSound = async () => {
      try {
        const { sound: loadedSound } = await Audio.Sound.createAsync(
          require("../../../assets/som/happy.mp3")
        );
        sound = loadedSound;
        setHappySound(loadedSound);
      } catch (error) {
        console.warn("Erro ao carregar som 'happy':", error);
      }
    };
    loadSound();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playSound = useCallback(async (sound: Audio.Sound | null) => {
    if (!sound) return;
    try {
      await sound.replayAsync();
    } catch (e) {
      console.warn("Erro ao tocar som:", e);
    }
  }, []);

  useEffect(() => {
    if (isFinished && happySound) {
      playSound(happySound);
    }
  }, [isFinished, happySound, playSound]);

  const sessionCharacters = useMemo((): BrailleItem[] => {
    return characters.map((char: string) => {
      const dots =
        ALL_BRAILLE_CHARS[char as keyof typeof ALL_BRAILLE_CHARS] || [];
      return {
        type: "char",
        id: `char-${char}`,
        letter: char,
        dots: dots,
        description: getDotDescription(dots),
      };
    });
  }, [characters]);

  const handleGoBackToSections = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleNext = useCallback(() => {
    if (isFinished) return;
    Animated.timing(translateX, {
      toValue: -WINDOW_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (currentPageIndex < sessionCharacters.length - 1) {
        setCurrentPageIndex((prev) => prev + 1);
        translateX.setValue(WINDOW_WIDTH);
        Animated.timing(translateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        setIsFinished(true);
        translateX.setValue(0);
      }
    });
  }, [isFinished, currentPageIndex, sessionCharacters.length, translateX]);

  const handlePrevious = useCallback(() => {
    if (isFinished) {
      setIsFinished(false);
      return;
    }
    if (currentPageIndex > 0) {
      Animated.timing(translateX, {
        toValue: WINDOW_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPageIndex((prev) => prev - 1);
        translateX.setValue(-WINDOW_WIDTH);
        Animated.timing(translateX, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      navigation.goBack();
    }
  }, [isFinished, currentPageIndex, navigation, translateX]);

  const panGesture = useMemo(
    () =>
      Platform.OS !== "web"
        ? Gesture.Pan()
            .onUpdate((event) => {
              translateX.setValue(event.translationX);
            })
            .onEnd((event) => {
              const { translationX: tx, translationY: ty, velocityX } = event;
              const isHorizontal = Math.abs(tx) > Math.abs(ty);

              if (!isHorizontal) {
                Animated.spring(translateX, {
                  toValue: 0,
                  useNativeDriver: true,
                }).start();
                return;
              }

              const threshold = WINDOW_WIDTH * 0.25;
              const shouldChangePage =
                Math.abs(tx) > threshold || Math.abs(velocityX) > 500;

              if (shouldChangePage) {
                if (tx < 0) {
                  handleNext();
                } else {
                  handlePrevious();
                }
              } else {
                Animated.spring(translateX, {
                  toValue: 0,
                  useNativeDriver: true,
                }).start();
              }
            })
        : undefined,
    [handleNext, handlePrevious, translateX]
  );

  const currentItem = sessionCharacters[currentPageIndex];
  const totalPages = sessionCharacters.length;
  const pageNumber = currentPageIndex + 1;

  const renderContent = () => (
    <View style={styles.container}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />
      <ScreenHeader title={title} />
      <ScrollView contentContainerStyle={styles.scrollWrapper}>
        {isFinished ? (
          <CongratsCard
            item={{ type: "congrats", id: "congrats-card", title: title }}
            onReturn={handleGoBackToSections}
            styles={styles}
            isVisible={isFinished}
          />
        ) : (
          <>
            <BrailleCard
              item={currentItem}
              styles={styles}
              translateX={translateX}
            />
            <Text style={styles.pageIndicator}>
              {pageNumber} / {totalPages}
            </Text>

            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentPageIndex === 0 && styles.navButtonDisabled,
                ]}
                onPress={handlePrevious}
                disabled={currentPageIndex === 0}
                accessibilityLabel="Voltar para a lição anterior"
              >
                <MaterialCommunityIcons
                  name="chevron-left"
                  size={32}
                  color={currentPageIndex === 0 ? "#999" : theme.cardText}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navButton}
                onPress={handleNext}
                accessibilityLabel={
                  currentPageIndex === totalPages - 1
                    ? "Finalizar sessão"
                    : "Próxima lição"
                }
              >
                <MaterialCommunityIcons
                  name={
                    currentPageIndex === totalPages - 1
                      ? "check-circle"
                      : "chevron-right"
                  }
                  size={32}
                  color={theme.cardText}
                />
              </TouchableOpacity>
            </View>

            {Platform.OS !== "web" && (
              <Text style={styles.gestureHint}>← Arraste para navegar →</Text>
            )}
          </>
        )}
      </ScrollView>
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
  theme: Theme,
  contrastMode: ContrastMode,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) => {
  // ✅ Lógica de Cores da Sela Braille
  let activeDotBg: string;
  let activeDotText: string;

  if (contrastMode === "white_black") {
    // CLARO: Ponto Preto, Número Branco
    activeDotBg = "#000000";
    activeDotText = "#FFFFFF";
  } else if (contrastMode === "sepia") {
    // SÉPIA: Ponto Marrom, Número Branco
    activeDotBg = "#5B4636";
    activeDotText = "#FFFFFF";
  } else if (contrastMode === "blue_yellow") {
    // ✅ AZUL ESCURO: Ponto Amarelo, Número Azul
    activeDotBg = "#FFC700"; // Amarelo
    activeDotText = "#191970"; // Azul Escuro
  } else {
    // Padrão do app (Outros modos)
    activeDotBg = theme.button ?? theme.text;
    activeDotText = theme.buttonText ?? theme.background;
  }

  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollWrapper: {
      paddingHorizontal: WINDOW_WIDTH * 0.05,
      paddingTop: 18,
      paddingBottom: 40,
      alignItems: "center",
      flexGrow: 1,
      justifyContent: "center",
    },
    pageIndicator: {
      marginTop: 18,
      color: theme.text,
      opacity: 0.85,
      fontSize: 13 * fontMultiplier,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    navigationButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      maxWidth: 400,
      marginTop: 24,
      paddingHorizontal: 20,
    },
    navButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.card,
      justifyContent: "center",
      alignItems: "center",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    navButtonDisabled: {
      opacity: 0.4,
      elevation: 0,
    },
    gestureHint: {
      marginTop: 16,
      color: theme.text,
      opacity: 0.5,
      fontSize: 12 * fontMultiplier,
      fontStyle: "italic",
      textAlign: "center",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    contentCard: {
      width: "75%",
      maxWidth: 980,
      minHeight: WINDOW_HEIGHT * 0.6,
      borderRadius: 12,
      backgroundColor: theme.card,
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    congratsCard: {
      width: "85%",
      maxWidth: 500,
      borderRadius: 20,
      backgroundColor: theme.card,
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 40,
      paddingHorizontal: 20,
      alignSelf: "center",
    },
    cardInner: {
      padding: WINDOW_WIDTH * 0.06,
      alignItems: "center",
      width: "100%",
    },
    letter: {
      fontSize: 48 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Bold" : undefined,
    },
    descriptionText: {
      fontSize: 18 * fontMultiplier,
      color: theme.cardText,
      textAlign: "center",
      marginTop: 20,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    brailleCell: {
      width: 140,
      height: 200,
      borderRadius: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 15,
      marginTop: 10,
      borderWidth: 1,
      borderColor: "transparent",
    },
    brailleColumn: {
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100%",
      alignItems: "center",
    },
    dotContainer: {
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    dot: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
    },
    dotInactive: {
      backgroundColor: theme.card,
      borderColor: theme.cardText,
      opacity: 0.2,
    },
    // ✅ Aplicação da cor de fundo dinâmica
    dotActive: {
      backgroundColor: activeDotBg,
      borderColor: "transparent",
    },
    dotNumber: {
      fontSize: 14 * fontMultiplier,
      color: theme.text,
      opacity: 0.7,
      fontWeight: "bold",
    },
    // ✅ Aplicação da cor do texto dinâmica para pontos ativos
    dotNumberActive: {
      color: activeDotText,
      opacity: 1,
    },
    congratsTitle: {
      fontSize: 32 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      textAlign: "center",
      marginTop: 16,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Bold" : undefined,
    },
    congratsSubtitle: {
      fontSize: 18 * fontMultiplier,
      color: theme.cardText,
      textAlign: "center",
      opacity: 0.8,
      marginTop: 8,
      marginBottom: 24,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    button: {
      backgroundColor: theme.button,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 25,
    },
    buttonText: {
      color: theme.buttonText,
      fontSize: 16 * fontMultiplier,
      fontWeight: "bold",
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });
};
