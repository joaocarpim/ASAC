// src/screens/contractions/ContractionsLessonScreen.tsx (CORRIGIDO)

import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
  ViewToken,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleText,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
import {
  CONTRACTION_LIST,
  Contraction,
} from "../../navigation/contractionsData";

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ContractionsLesson"
>;

const LESSON_COMPLETED_KEY = "contractions_lesson_completed";
const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

// --- Card de Introdução ---
const IntroCard = ({
  styles,
  fontMultiplier,
}: {
  styles: ReturnType<typeof createStyles>;
  fontMultiplier: number;
}) => (
  <View style={styles.cardScrollView}>
    <View style={styles.card}>
      <ScrollView contentContainerStyle={styles.cardContentContainer}>
        <MaterialCommunityIcons
          name="lightbulb-on-outline"
          size={45 * fontMultiplier}
          color={styles.iconColor.color}
          style={styles.headerIcon}
        />
        <AccessibleHeader style={styles.cardWord}>
          Braille Grau 2
        </AccessibleHeader>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <MaterialCommunityIcons
            name="speedometer"
            size={22 * fontMultiplier}
            color={styles.iconColor.color}
          />
          <View style={styles.infoTextContainer}>
            <AccessibleText style={styles.infoTitle} baseSize={16}>
              Leitura 2x mais rápida
            </AccessibleText>
            <AccessibleText style={styles.infoDescription} baseSize={14}>
              O Grau 2 usa contrações para reduzir o tamanho dos textos em até
              50%.
            </AccessibleText>
          </View>
        </View>

        <View style={styles.infoSection}>
          <MaterialCommunityIcons
            name="book-open-variant"
            size={22 * fontMultiplier}
            color={styles.iconColor.color}
          />
          <View style={styles.infoTextContainer}>
            <AccessibleText style={styles.infoTitle} baseSize={16}>
              Usado em livros
            </AccessibleText>
            <AccessibleText style={styles.infoDescription} baseSize={14}>
              A maioria dos materiais em Braille utiliza o Grau 2.
            </AccessibleText>
          </View>
        </View>

        <View style={styles.infoSection}>
          <MaterialCommunityIcons
            name="hand-pointing-right"
            size={22 * fontMultiplier}
            color={styles.iconColor.color}
          />
          <View style={styles.infoTextContainer}>
            <AccessibleText style={styles.infoTitle} baseSize={16}>
              Arraste para navegar
            </AccessibleText>
            <AccessibleText style={styles.infoDescription} baseSize={14}>
              Deslize o dedo para explorar as contrações mais importantes.
            </AccessibleText>
          </View>
        </View>
      </ScrollView>
    </View>
  </View>
);

// --- Card de Contração ---
const ContractionCard = ({
  item,
  styles,
  fontMultiplier,
}: {
  item: Contraction;
  styles: ReturnType<typeof createStyles>;
  fontMultiplier: number;
}) => (
  <View style={styles.cardScrollView}>
    <View style={styles.card}>
      <ScrollView contentContainerStyle={styles.cardContentContainer}>
        <AccessibleText style={styles.cardWord} baseSize={40}>
          {item.word}
        </AccessibleText>

        <View style={styles.typeBadge}>
          <AccessibleText style={styles.typeBadgeText} baseSize={13}>
            {item.type}
          </AccessibleText>
        </View>

        <View style={styles.divider} />

        <AccessibleText style={styles.cardDescription} baseSize={15}>
          {item.description}
        </AccessibleText>

        <View style={styles.brailleContainer}>
          <BrailleCell
            dots={item.dots}
            styles={styles}
            fontMultiplier={fontMultiplier}
          />
        </View>

        <View style={styles.dotListContainer}>
          <AccessibleText style={styles.dotListTitle} baseSize={15}>
            Pontos ativos:
          </AccessibleText>
          <View style={styles.dotListGrid}>
            {item.dots.length === 0 ? (
              <AccessibleText style={styles.dotListText} baseSize={14}>
                Nenhum ponto
              </AccessibleText>
            ) : (
              item.dots.map((dotNumber) => (
                <View key={dotNumber} style={styles.dotListItem}>
                  <View style={styles.dotBullet} />
                  <AccessibleText style={styles.dotListText} baseSize={14}>
                    Ponto {dotNumber}
                  </AccessibleText>
                </View>
              ))
            )}
          </View>
        </View>

        {item.word.length > 1 && (
          <View style={styles.tipContainer}>
            <MaterialCommunityIcons
              name="information-outline"
              size={18 * fontMultiplier}
              color={styles.tipIcon.color}
            />
            <AccessibleText style={styles.tipText} baseSize={13}>
              Use esta contração para escrever "{item.word}" com apenas uma
              célula!
            </AccessibleText>
          </View>
        )}
      </ScrollView>
    </View>
  </View>
);

// --- Célula Braille ---
const BrailleCell = ({
  dots,
  styles,
  fontMultiplier,
}: {
  dots: number[];
  styles: ReturnType<typeof createStyles>;
  fontMultiplier: number;
}) => {
  const BrailleDot = ({ number }: { number: number }) => {
    const isPressed = dots.includes(number);
    return (
      <View
        style={[styles.dot, isPressed && styles.dotPressed]}
        accessibilityLabel={`Ponto ${number}${
          isPressed ? " ativo" : " inativo"
        }`}
      />
    );
  };

  return (
    <View style={styles.brailleCellOutline}>
      <View style={styles.dotColumn}>
        <BrailleDot number={1} />
        <BrailleDot number={2} />
        <BrailleDot number={3} />
      </View>
      <View style={styles.dotColumn}>
        <BrailleDot number={4} />
        <BrailleDot number={5} />
        <BrailleDot number={6} />
      </View>
    </View>
  );
};

// --- Tela Principal ---
export default function ContractionsLessonScreen({ navigation }: ScreenProps) {
  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled,
    lineHeightMultiplier,
    letterSpacing,
  } = useSettings();

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled,
    lineHeightMultiplier,
    letterSpacing
  );

  const introItem: Contraction = {
    word: "INTRO",
    dots: [],
    description: "Introdução ao Braille Grau 2",
    type: "Palavra",
  };
  const lessonData = [introItem, ...CONTRACTION_LIST];

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken[];
  }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
      console.log(`📄 Card ${viewableItems[0].index + 1}/${lessonData.length}`);
    }
  };

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };
  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const handleFinishLesson = async () => {
    try {
      await AsyncStorage.setItem(LESSON_COMPLETED_KEY, "true");
      console.log("✅ Lição de contrações concluída!");
      navigation.goBack();
    } catch (e) {
      console.error("❌ Erro ao salvar progresso da lição", e);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex - 1,
        animated: true,
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < lessonData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={28}
          color={theme.text}
        />
      </TouchableOpacity>

      <View style={styles.contentArea}>
        <FlatList
          ref={flatListRef}
          data={lessonData}
          renderItem={({ item }) =>
            item.word === "INTRO" ? (
              <IntroCard styles={styles} fontMultiplier={fontSizeMultiplier} />
            ) : (
              <ContractionCard
                item={item}
                styles={styles}
                fontMultiplier={fontSizeMultiplier}
              />
            )
          }
          keyExtractor={(item) => item.word}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />
      </View>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={32}
            color={currentIndex === 0 ? theme.text + "30" : theme.text}
          />
        </TouchableOpacity>

        <AccessibleText style={styles.pageIndicator} baseSize={17}>
          {currentIndex + 1} / {lessonData.length}
        </AccessibleText>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentIndex === lessonData.length - 1 && styles.navButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={currentIndex === lessonData.length - 1}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={32}
            color={
              currentIndex === lessonData.length - 1
                ? theme.text + "30"
                : theme.text
            }
          />
        </TouchableOpacity>
      </View>

      <AccessibleButton
        style={styles.button}
        onPress={handleFinishLesson}
        accessibilityText="Finalizar Lição"
      >
        <MaterialCommunityIcons
          name="check-circle-outline"
          size={22}
          color={theme.buttonText}
        />
        <AccessibleText style={styles.buttonText} baseSize={18}>
          Finalizar Lição
        </AccessibleText>
      </AccessibleButton>
    </View>
  );
}

// --- Styles Create Function ---
const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexiaFontEnabled: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    backButton: {
      position: "absolute",
      top: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 15 : 55,
      left: 15,
      zIndex: 10,
      padding: 8,
    },
    contentArea: {
      flex: 1,
      justifyContent: "center",
    },
    flatListContent: {
      alignItems: "center",
      paddingVertical: 10,
    },
    // ✅ CORREÇÃO AQUI
    cardScrollView: {
      width: CARD_WIDTH,
      marginHorizontal: (width - CARD_WIDTH) / 2,
      height: height * 0.7, // 👈 Alterado de maxHeight para height
    },
    card: {
      width: "100%",
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 20,
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      overflow: "hidden",
    },
    cardContentContainer: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      alignItems: "center",
    },
    headerIcon: {
      marginBottom: 8,
    },
    cardWord: {
      fontSize: 36 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
      marginBottom: 10,
    },
    typeBadge: {
      backgroundColor: theme.button ?? "#191970",
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      marginBottom: 10,
    },
    typeBadgeText: {
      color: theme.buttonText ?? "#FFFFFF",
      fontSize: 13 * fontMultiplier,
      fontWeight: "600",
      textAlign: "center",
    },
    divider: {
      width: "80%",
      height: 1,
      backgroundColor: theme.cardText + "20",
      marginVertical: 12,
    },
    cardDescription: {
      fontSize: 15 * fontMultiplier,
      color: theme.cardText,
      opacity: 0.95,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
      lineHeight: 21 * fontMultiplier * lineHeightMultiplier,
      marginBottom: 15,
      paddingHorizontal: 5,
    },
    infoSection: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
      width: "100%",
      paddingHorizontal: 8,
    },
    infoTextContainer: {
      flex: 1,
      marginLeft: 12,
    },
    infoTitle: {
      fontSize: 16 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginBottom: 4,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    infoDescription: {
      fontSize: 14 * fontMultiplier,
      color: theme.cardText,
      opacity: 0.85,
      lineHeight: 19 * fontMultiplier * lineHeightMultiplier,
      fontFamily: isDyslexiaFontEnabled
        ? "OpenDyslexiaFont-Regular"
        : undefined,
    },
    brailleContainer: {
      width: "100%",
      alignItems: "center",
      marginVertical: 10,
    },
    brailleCellOutline: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: 120,
      height: 160,
      borderRadius: 18,
      borderWidth: 4,
      borderColor: theme.button ?? "#191970",
      backgroundColor: theme.background,
      paddingVertical: 10,
      paddingHorizontal: 8,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    dotColumn: {
      justifyContent: "space-around",
      height: "100%",
    },
    dot: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.background,
      borderWidth: 3,
      borderColor: theme.text + "30",
      marginVertical: 4,
    },
    dotPressed: {
      backgroundColor: theme.text,
      borderColor: theme.text,
      elevation: 3,
      shadowColor: theme.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 3,
    },
    dotListContainer: {
      width: "100%",
      paddingHorizontal: 16,
      marginTop: 10,
    },
    dotListTitle: {
      fontSize: 15 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginBottom: 8,
      textAlign: "center",
    },
    dotListGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 8,
    },
    dotListItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: theme.background + "40",
      borderRadius: 12,
    },
    dotBullet: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: theme.cardText,
      marginRight: 6,
    },
    dotListText: {
      fontSize: 14 * fontMultiplier,
      color: theme.cardText,
      fontWeight: "600",
    },
    tipContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.background + "60",
      padding: 10,
      borderRadius: 12,
      marginTop: 12,
      width: "100%",
    },
    tipIcon: {
      color: theme.cardText,
      marginRight: 8,
    },
    tipText: {
      flex: 1,
      fontSize: 13 * fontMultiplier,
      color: theme.cardText,
      opacity: 0.85,
      fontStyle: "italic",
      lineHeight: 18 * fontMultiplier,
    },
    navigationContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.background,
    },
    navButton: {
      padding: 8,
    },
    navButtonDisabled: {
      opacity: 0.25,
    },
    pageIndicator: {
      color: theme.text,
      opacity: 0.85,
      fontSize: 17 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.button ?? "#191970",
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 28,
      elevation: 4,
      marginHorizontal: 20,
      marginBottom: 20,
      gap: 8,
    },
    buttonText: {
      color: theme.buttonText ?? "#FFFFFF",
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    iconColor: {
      color: theme.cardText,
    },
  });
