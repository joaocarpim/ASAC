// src/screens/module/AlphabetScreen.tsx
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
  FlatList,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Gesture,
  GestureDetector,
  Directions,
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

// Importa os dados da sua Jornada e dos caracteres Braille
import { LEARNING_PATH_SESSIONS } from "../../navigation/learningPathData";
import { ALL_BRAILLE_CHARS } from "../../navigation/brailleLetters";

const screenWidth = Dimensions.get("window").width;

/**
 * Cria dinamicamente a descrição dos pontos (ex: "Pontos 1, 3 e 5 levantados.")
 */
const getDotDescription = (dots: number[]): string => {
  if (!dots || dots.length === 0) return "Nenhum ponto levantado.";

  const sorted = [...dots].sort((a, b) => a - b);

  if (sorted.length === 1) {
    return `Ponto ${sorted[0]} levantado.`;
  }

  const last = sorted.pop();
  return `Pontos ${sorted.join(", ")} e ${last} levantados.`;
};

// --- COMPONENTES INTERNOS DA TELA ---

/**
 * Renderiza a cela Braille visualmente
 */
const BrailleCell = ({
  dots,
  styles,
}: {
  dots: number[];
  styles: ReturnType<typeof createStyles>;
}) => {
  // Ordem para renderizar em 2 colunas: 1, 4, 2, 5, 3, 6
  const dotOrder = [1, 4, 2, 5, 3, 6];

  return (
    // ✅ 1. CORREÇÃO: 'accessibilityHidden' trocado por 'accessibilityElementsHidden'
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

/**
 * O card que mostra um único caractere Braille
 */
const BrailleCard = ({
  item,
  styles,
  theme,
}: {
  item: BrailleItem;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}) => {
  const accessibilityLabel = `${item.letter}. ${item.description}`;
  return (
    <AccessibleView
      style={styles.cardContainer}
      accessibilityText={accessibilityLabel}
    >
      <View style={styles.cardContent}>
        {/* ✅ 2. CORREÇÃO: removida a prop 'accessibilityText' que não existe no AccessibleHeader */}
        <AccessibleHeader level={2} style={styles.letter}>
          {item.letter}
        </AccessibleHeader>
        <BrailleCell dots={item.dots} styles={styles} />
        <AccessibleText
          style={styles.descriptionText}
          baseSize={18}
          accessibilityText="" // Oculta este texto, pois o label principal já o contém
        >
          {item.description}
        </AccessibleText>
      </View>
    </AccessibleView>
  );
};

/**
 * O card de "Parabéns" que aparece no final de cada sessão
 */
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
      style={styles.cardContainer}
      accessibilityText={`Parabéns, você completou a ${item.title}! Toque duas vezes para voltar.`}
    >
      {/* O confete só renderiza se o card estiver visível */}
      {isVisible && (
        <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} fadeOut={true} />
      )}
      <View style={styles.cardContent}>
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

type CongratsItem = {
  type: "congrats";
  id: string;
  title: string;
};

type LearningItem = BrailleItem | CongratsItem;

// --- COMPONENTE PRINCIPAL ---

export default function AlphabetScreen() {
  const navigation = useNavigation();
  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const [happySound, setHappySound] = useState<Audio.Sound | null>(null);
  const [visibleCongratsId, setVisibleCongratsId] = useState<string | null>(
    null
  );

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  // Carrega o som de "happy"
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

  // Cria o array de dados para o FlatList, com os cards de parabéns no final de cada sessão
  const allLearningData = useMemo(() => {
    const data: LearningItem[] = [];
    LEARNING_PATH_SESSIONS.forEach((session) => {
      // Adiciona todos os caracteres da sessão
      session.characters.forEach((char) => {
        const dots =
          ALL_BRAILLE_CHARS[char as keyof typeof ALL_BRAILLE_CHARS] || [];
        data.push({
          type: "char",
          id: `${session.id}-${char}`,
          letter: char,
          dots: dots,
          description: getDotDescription(dots),
        });
      });
      // Adiciona o card de parabéns da sessão
      data.push({
        type: "congrats",
        id: session.id,
        title: session.title,
      });
    });
    return data;
  }, []);

  // Navega para a tela de "Jornada" (LearningPathScreen)
  const handleGoToSessions = () => {
    navigation.navigate("LearningPath" as never);
  };

  // Gesto de arrastar para voltar
  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleGoToSessions);

  // Configuração para saber qual item está visível
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current;

  // Callback que é chamado quando um item fica visível
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        const visibleItem = viewableItems[0].item;
        // Se o item visível for um card de "parabéns"
        if (visibleItem.type === "congrats") {
          // Toca o som e ativa o confete
          if (visibleCongratsId !== visibleItem.id) {
            playSound(happySound);
            setVisibleCongratsId(visibleItem.id);
          }
        } else {
          setVisibleCongratsId(null);
        }
      }
    }
  ).current;

  // Renderiza o item do FlatList (Card de Caractere ou Card de Parabéns)
  const renderItem = ({ item }: { item: LearningItem }) => {
    if (item.type === "congrats") {
      return (
        <CongratsCard
          item={item}
          onReturn={handleGoToSessions}
          styles={styles}
          isVisible={visibleCongratsId === item.id}
        />
      );
    }
    return <BrailleCard item={item} styles={styles} theme={theme} />;
  };

  return (
    <GestureDetector gesture={flingRight}>
      <View style={styles.container}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <ScreenHeader title="Alfabeto Braille" />

        <FlatList
          data={allLearningData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={screenWidth}
          snapToAlignment="center"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={styles.carouselContent}
        />
      </View>
    </GestureDetector>
  );
}

// --- ESTILOS ---

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
    carouselContent: {
      alignItems: "center",
    },
    // Estilo base para os cards
    cardContainer: {
      width: screenWidth,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    cardContent: {
      width: "90%",
      height: "90%",
      maxHeight: 600,
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },

    // Estilos do Card de Caractere
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

    // Estilos da Cela Braille (inspirado no BraillePracticeScreen)
    brailleCell: {
      width: 140, // Largura fixa para a cela
      height: 210, // Altura fixa para a cela (proporção 3:2)
      backgroundColor: theme.background, // Fundo da cela
      borderRadius: 20,
      flexDirection: "column",
      flexWrap: "wrap",
      alignContent: "center",
      justifyContent: "space-around",
      paddingVertical: 15, // Espaçamento vertical
      paddingHorizontal: 10, // Espaçamento horizontal
      marginTop: 20,
      borderWidth: 1,
      // ✅ 3. CORREÇÃO: Trocado 'theme.border' por 'theme.card' (ou outra cor do tema)
      borderColor: theme.card,
    },
    dotContainer: {
      width: "50%",
      height: "33%",
      justifyContent: "center",
      alignItems: "center",
    },
    dot: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
    },
    dotInactive: {
      backgroundColor: theme.background,
      // ✅ 4. CORREÇÃO: Trocado 'theme.border' por 'theme.card'
      borderColor: theme.card,
    },
    dotActive: {
      backgroundColor: theme.button, // Cor de destaque
      borderColor: theme.buttonText, // Borda mais escura
    },
    dotNumber: {
      fontSize: 14 * fontMultiplier,
      color: theme.text,
      opacity: 0.3,
      fontWeight: "bold",
    },

    // Estilos do Card de Parabéns
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
