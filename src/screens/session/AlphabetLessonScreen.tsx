// src/screens/module/AlphabetLessonScreen.tsx (ATUALIZADO)
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  // FlatList, // ❌ Não precisamos mais da FlatList
  Dimensions,
  StatusBar,
  TouchableOpacity,
  ScrollView, // ✅ Usamos ScrollView para o conteúdo
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Gesture,
  GestureDetector,
  Directions,
  GestureHandlerRootView, // Importado para envolver tudo
} from "react-native-gesture-handler";
import ConfettiCannon from "react-native-confetti-cannon";
import { Audio } from "expo-av";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleHeader,
  AccessibleText,
} from "../../components/AccessibleComponents";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { RootStackParamList } from "../../navigation/types";
import { ALL_BRAILLE_CHARS } from "../../navigation/brailleLetters";

const screenWidth = Dimensions.get("window").width;
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get("window");

type AlphabetLessonRouteProp = RouteProp<RootStackParamList, "AlphabetLesson">;

const getDotDescription = (dots: number[]): string => {
  if (!dots || dots.length === 0) return "Nenhum ponto levantado.";
  const sorted = [...dots].sort((a, b) => a - b);
  if (sorted.length === 1) return `Ponto ${sorted[0]} levantado.`;
  const last = sorted.pop();
  return `Pontos ${sorted.join(", ")} e ${last} levantados.`;
};

// --- COMPONENTES INTERNOS DA TELA ---

const BrailleCell = ({
  dots,
  styles,
}: {
  dots: number[];
  styles: ReturnType<typeof createStyles>;
}) => {
  const dotOrder = [1, 4, 2, 5, 3, 6];
  return (
    <View style={styles.brailleCell} accessibilityElementsHidden={true}>
      {dotOrder.map((dotNum) => {
        const isActive = dots.includes(dotNum);
        return (
          <View key={dotNum} style={styles.dotContainer}>
            <View
              style={[
                styles.dot,
                isActive ? styles.dotActive : styles.dotInactive,
              ]}
            >
              <Text style={styles.dotNumber}>{dotNum}</Text>
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
}: {
  item: BrailleItem;
  styles: ReturnType<typeof createStyles>;
}) => {
  const accessibilityLabel = `${item.letter}. ${item.description}`;
  return (
    // Usamos AccessibleView aqui como o contêiner do card
    <AccessibleView
      style={styles.contentCard}
      accessibilityText={accessibilityLabel}
    >
      <View style={styles.cardInner}>
        <AccessibleHeader level={2} style={styles.letter}>
          {item.letter}
        </AccessibleHeader>
        <BrailleCell dots={item.dots} styles={styles} />
        <AccessibleText
          style={styles.descriptionText}
          baseSize={18}
          accessibilityText="" // Oculta, pois o contêiner já fala
        >
          {item.description}
        </AccessibleText>
      </View>
    </AccessibleView>
  );
};

const CongratsCard = ({
  item,
  onReturn,
  styles,
  isVisible, // isVisible controla o confete
}: {
  item: CongratsItem;
  onReturn: () => void;
  styles: ReturnType<typeof createStyles>;
  isVisible: boolean;
}) => {
  return (
    <AccessibleView
      style={styles.contentCard} // Reutiliza o estilo de card
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

// --- TIPOS DE DADOS ---
type BrailleItem = {
  type: "char";
  id: string;
  letter: string;
  dots: number[];
  description: string;
};
type CongratsItem = { type: "congrats"; id: string; title: string };
// (Não precisamos mais do LearningItem, pois o "parabéns" é um estado)

// --- COMPONENTE PRINCIPAL ---
export default function AlphabetLessonScreen() {
  const navigation = useNavigation();
  const route = useRoute<AlphabetLessonRouteProp>();
  const { title, characters } = route.params;

  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const [happySound, setHappySound] = useState<Audio.Sound | null>(null);

  // ✅ LÓGICA DE ESTADO (igual ao ModuleContentScreen)
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false); // Estado para controlar a tela de parabéns

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  // Carrega o som
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

  const playSound = useCallback(async (sound: Audio.Sound | null) => {
    if (!sound) return;
    try {
      await sound.replayAsync();
    } catch (e) {
      console.warn("Erro ao tocar som:", e);
    }
  }, []);

  // ✅ Efeito que toca o som QUANDO 'isFinished' vira true
  useEffect(() => {
    if (isFinished) {
      playSound(happySound);
    }
  }, [isFinished, happySound, playSound]);

  // ✅ Dados agora são SÓ os caracteres
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

  // ✅ Funções de navegação de página
  const handleGoBackToSections = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    if (isFinished) return; // Já está na tela final
    if (currentPageIndex < sessionCharacters.length - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    } else {
      // Chegou ao fim
      setIsFinished(true);
    }
  };

  const handlePrevious = () => {
    if (isFinished) {
      setIsFinished(false); // Sai da tela de parabéns e volta pro último item
      return;
    }
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    } else {
      handleGoBackToSections(); // No primeiro card, deslizar para a direita volta
    }
  };

  // ✅ Gestos
  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(handleNext);
  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handlePrevious);
  const composedGestures = Gesture.Race(flingLeft, flingRight);

  const currentItem = sessionCharacters[currentPageIndex];
  const totalPages = sessionCharacters.length;
  const pageNumber = currentPageIndex + 1;

  return (
    // ✅ Precisa do GestureHandlerRootView aqui por causa do GestureDetector
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGestures}>
        <View style={styles.container}>
          <StatusBar
            barStyle={theme.statusBarStyle}
            backgroundColor={theme.background}
          />
          <ScreenHeader title={title} />

          {/* ✅ Lógica de renderização igual ao ModuleContentScreen */}
          <ScrollView contentContainerStyle={styles.scrollWrapper}>
            {isFinished ? (
              <CongratsCard
                item={{ type: "congrats", id: "congrats-card", title: title }}
                onReturn={handleGoBackToSections}
                styles={styles}
                isVisible={isFinished}
              />
            ) : (
              <BrailleCard item={currentItem} styles={styles} />
            )}

            {!isFinished && (
              <Text style={styles.pageIndicator}>
                {pageNumber} / {totalPages}
              </Text>
            )}
          </ScrollView>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

// --- ESTILOS ---
// ✅ Estilos mesclados do AlphabetScreen e ModuleContentScreen
const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },

    // Estilos do Wrapper (do ModuleContentScreen)
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

    // Container do Card (Adaptado)
    cardContainer: {
      width: "100%", // Ocupa a largura do scrollWrapper
      alignItems: "center",
    },
    contentCard: {
      // Estilo base para ambos os cards
      width: "100%",
      maxWidth: 980,
      minHeight: WINDOW_HEIGHT * 0.6, // Altura mínima
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
    cardInner: {
      padding: WINDOW_WIDTH * 0.06,
      alignItems: "center",
      width: "100%",
    },

    // Card de Caractere
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

    // Cela Braille (Seus estilos de aumento)
    brailleCell: {
      width: 160,
      height: 240,
      borderRadius: 20,
      flexDirection: "column",
      flexWrap: "wrap",
      alignContent: "center",
      justifyContent: "space-around",
      paddingVertical: 15,
      paddingHorizontal: 10,
      marginTop: 20,
      borderWidth: 1,
      borderColor: "transparent",
    },
    dotContainer: {
      width: "50%",
      height: "33%",
      justifyContent: "center",
      alignItems: "center",
    },
    dot: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
    },
    dotInactive: {
      backgroundColor: theme.card,
      borderColor: theme.cardText,
      opacity: 0.2,
    },
    dotActive: {
      backgroundColor: theme.button,
      borderColor: theme.buttonText,
    },
    dotNumber: {
      fontSize: 14 * fontMultiplier,
      color: theme.cardText,
      opacity: 0.5,
      fontWeight: "bold",
    },

    // Card de Parabéns
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
