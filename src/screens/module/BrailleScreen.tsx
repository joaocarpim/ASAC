import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
// ✅ 1. IMPORTAR COMPONENTES DE GESTO
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

const alphabetItems = [
  {
    source: require("../../../assets/images/a.png"),
    alt: "Letra A em Braille. Ponto 1.",
    letter: "A",
  },
  {
    source: require("../../../assets/images/b.png"),
    alt: "Letra B em Braille. Pontos 1 e 2.",
    letter: "B",
  },
  {
    source: require("../../../assets/images/c.png"),
    alt: "Letra C em Braille. Pontos 1 e 4.",
    letter: "C",
  },
];

const punctuationItems = [
  {
    source: require("../../../assets/images/1.png"),
    alt: "Número 1 em Braille.",
    letter: "1",
  },
  {
    source: require("../../../assets/images/interrogacao.png"),
    alt: "Ponto de interrogação em Braille.",
    letter: "?",
  },
  {
    source: require("../../../assets/images/virgula.png"),
    alt: "Vírgula em Braille.",
    letter: ",",
  },
];

type BrailleScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Braille"
>;

const BrailleScreen: React.FC<BrailleScreenProps> = ({ navigation }) => {
  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
    imageScale,
  } = useSettings();

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const alphabetListRef = useRef<FlatList<any>>(null);
  const punctuationListRef = useRef<FlatList<any>>(null);
  const [alphabetIndex, setAlphabetIndex] = useState(0);
  const [punctuationIndex, setPunctuationIndex] = useState(0);

  // ✅ 2. CRIAR A FUNÇÃO E O GESTO PARA IR PARA A HOME
  const handleGoHome = () => {
    navigation.navigate("Home");
  };

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleGoHome);

  const handleScroll = (
    ref: React.RefObject<FlatList<any> | null>,
    index: number,
    setIndex: React.Dispatch<React.SetStateAction<number>>,
    direction: "prev" | "next",
    dataLength: number
  ) => {
    let newIndex = direction === "next" ? index + 1 : index - 1;
    if (newIndex >= 0 && newIndex < dataLength) {
      ref.current?.scrollToIndex({ index: newIndex, animated: true });
      setIndex(newIndex);
    }
  };

  const viewabilityConfig = { itemVisiblePercentThreshold: 51 };

  const onViewableAlphabetItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setAlphabetIndex(viewableItems[0].index);
  }).current;

  const onViewablePunctuationItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0)
      setPunctuationIndex(viewableItems[0].index);
  }).current;

  const renderBrailleImage = (item: any) => (
    <AccessibleView
      style={styles.card}
      accessibilityText={item.alt}
      type="imagem"
      priority={7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={item.source}
          style={[
            styles.cardImage,
            imageScale !== 1 ? { transform: [{ scale: imageScale }] } : {},
          ]}
          resizeMode="contain"
        />
      </View>
    </AccessibleView>
  );

  return (
    // ✅ 3. ENVOLVER A TELA COM O DETECTOR DE GESTOS
    <GestureDetector gesture={flingRight}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />

        <AccessibleView
          style={styles.container}
          accessibilityText="Tela de Aprendizado de Braille. Deslize para a direita para voltar para a tela inicial."
        >
          {/* O CABEÇALHO FOI REMOVIDO PARA TIRAR O BOTÃO DE SETA "<" */}
          <View style={styles.headerPlaceholder} />

          <View style={styles.mainContent}>
            <AccessibleHeader level={2} style={styles.sectionTitle}>
              Alfabeto
            </AccessibleHeader>

            <View style={styles.carouselContainer}>
              <TouchableOpacity
                style={[
                  styles.arrowButton,
                  alphabetIndex === 0 && styles.disabledArrow,
                ]}
                disabled={alphabetIndex === 0}
                onPress={() =>
                  handleScroll(
                    alphabetListRef,
                    alphabetIndex,
                    setAlphabetIndex,
                    "prev",
                    alphabetItems.length
                  )
                }
                accessibilityLabel="Item anterior do alfabeto"
              >
                <Text style={styles.arrowText}>{"<"}</Text>
              </TouchableOpacity>

              <FlatList
                ref={alphabetListRef}
                data={alphabetItems}
                keyExtractor={(_, index) => `alpha-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                style={styles.flatList}
                contentContainerStyle={styles.flatListContent}
                onViewableItemsChanged={onViewableAlphabetItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item }) => renderBrailleImage(item)}
                getItemLayout={(_, index) => ({
                  length: width * 0.6,
                  offset: width * 0.6 * index,
                  index,
                })}
              />

              <TouchableOpacity
                style={[
                  styles.arrowButton,
                  alphabetIndex === alphabetItems.length - 1 &&
                    styles.disabledArrow,
                ]}
                disabled={alphabetIndex === alphabetItems.length - 1}
                onPress={() =>
                  handleScroll(
                    alphabetListRef,
                    alphabetIndex,
                    setAlphabetIndex,
                    "next",
                    alphabetItems.length
                  )
                }
                accessibilityLabel="Próximo item do alfabeto"
              >
                <Text style={styles.arrowText}>{">"}</Text>
              </TouchableOpacity>
            </View>

            <AccessibleHeader level={2} style={styles.sectionTitle}>
              Números e Pontuação
            </AccessibleHeader>

            <View style={styles.carouselContainer}>
              <TouchableOpacity
                style={[
                  styles.arrowButton,
                  punctuationIndex === 0 && styles.disabledArrow,
                ]}
                disabled={punctuationIndex === 0}
                onPress={() =>
                  handleScroll(
                    punctuationListRef,
                    punctuationIndex,
                    setPunctuationIndex,
                    "prev",
                    punctuationItems.length
                  )
                }
                accessibilityLabel="Item anterior de números e pontuação"
              >
                <Text style={styles.arrowText}>{"<"}</Text>
              </TouchableOpacity>

              <FlatList
                ref={punctuationListRef}
                data={punctuationItems}
                keyExtractor={(_, index) => `punc-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                style={styles.flatList}
                contentContainerStyle={styles.flatListContent}
                onViewableItemsChanged={onViewablePunctuationItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item }) => renderBrailleImage(item)}
                getItemLayout={(_, index) => ({
                  length: width * 0.6,
                  offset: width * 0.6 * index,
                  index,
                })}
              />

              <TouchableOpacity
                style={[
                  styles.arrowButton,
                  punctuationIndex === punctuationItems.length - 1 &&
                    styles.disabledArrow,
                ]}
                disabled={punctuationIndex === punctuationItems.length - 1}
                onPress={() =>
                  handleScroll(
                    punctuationListRef,
                    punctuationIndex,
                    setPunctuationIndex,
                    "next",
                    punctuationItems.length
                  )
                }
                accessibilityLabel="Próximo item de números e pontuação"
              >
                <Text style={styles.arrowText}>{">"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ✅ 4. BOTÃO "VOLTAR" INFERIOR FOI REMOVIDO DAQUI */}
        </AccessibleView>
      </SafeAreaView>
    </GestureDetector>
  );
};

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      // ✅ 5. ESTILO DO CONTAINER AJUSTADO
      justifyContent: "flex-start",
      paddingBottom: 15,
    },
    // ✅ CABEÇALHO REMOVIDO E SUBSTITUÍDO POR UM ESPAÇO VAZIO
    headerPlaceholder: {
      height: 50,
    },
    mainContent: {},
    sectionTitle: {
      fontSize: 20 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 5,
      marginTop: 5,
      lineHeight: 22 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
    },
    carouselContainer: {
      flexDirection: "row",
      alignItems: "center",
      height: 180,
      marginBottom: 10,
    },
    flatList: {
      flex: 1,
    },
    flatListContent: {
      alignItems: "center",
    },
    arrowButton: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      minWidth: 50,
      alignItems: "center",
    },
    arrowText: {
      fontSize: 64 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
    },
    disabledArrow: {
      opacity: 0.2,
    },
    card: {
      width: width * 0.6,
      height: 160,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
      borderRadius: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      marginHorizontal: 5,
    },
    imageContainer: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    cardImage: {
      width: "85%",
      height: "85%",
    },
    // ✅ ESTILOS DO BOTÃO E DO CABEÇALHO ANTIGO FORAM REMOVIDOS
  });

export default BrailleScreen;