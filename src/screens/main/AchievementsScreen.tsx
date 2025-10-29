import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
import { useSettings } from "../../hooks/useSettings";
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";

export default function AchievementsScreen() {
  const navigation = useNavigation();
  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleGoBack);

  const progressoAtual = 1;
  const modulosTotais = 3;

  const renderModuleIcons = () => {
    let icons = [];
    for (let i = 1; i <= modulosTotais; i++) {
      const isCompleted = i <= progressoAtual;
      icons.push(
        <View key={i} style={styles.moduloIconContainer}>
          {isCompleted ? (
            <Text style={styles.moduloIconText}>{i}</Text>
          ) : (
            <MaterialCommunityIcons name="lock" size={24} color={theme.text} />
          )}
        </View>
      );
    }
    return icons;
  };

  const cardAccessibilityText = `Sem Conquistas. Continue Aprendendo para obter seu selo.`;
  const progressAccessibilityText = `Progresso Atual: ${progressoAtual} de ${modulosTotais} módulos concluídos.`;

  return (
    <GestureDetector gesture={flingRight}>
      <AccessibleView
        style={styles.page}
        accessibilityText="Tela de Minhas Conquistas. Deslize para a direita para voltar."
      >
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <View style={styles.header}>
          <AccessibleButton onPress={handleGoBack} accessibilityText="Voltar">
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color={styles.headerTitle.color}
            />
          </AccessibleButton>
          <AccessibleHeader level={1} style={styles.headerTitle}>
            Minhas Conquistas
          </AccessibleHeader>
          <View style={styles.headerIconPlaceholder} />
        </View>
        <View style={styles.container}>
          <AccessibleView accessibilityText="Medalha de conquistas">
            <Text style={styles.seloEmoji}>🎖️</Text>
          </AccessibleView>
          <AccessibleView
            style={styles.card}
            accessibilityText={cardAccessibilityText}
          >
            <MaterialCommunityIcons
              name="emoticon-sad-outline"
              style={styles.mascoteIcon}
            />
            <Text style={styles.cardTitle}>Sem Conquistas</Text>
            <Text style={styles.cardSubtitle}>
              Continue Aprendendo!{"\n"}Para obter seu selo
            </Text>
          </AccessibleView>
          <AccessibleView
            style={styles.progressoContainer}
            accessibilityText={progressAccessibilityText}
          >
            <Text style={styles.progressoTitle}>Progresso Atual:</Text>
            <View style={styles.modulosRow}>{renderModuleIcons()}</View>
            <Text style={styles.progressoSubtitle}>
              {progressoAtual} de {modulosTotais} módulos concluídos
            </Text>
          </AccessibleView>
        </View>
      </AccessibleView>
    </GestureDetector>
  );
}

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    page: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 15,
      paddingHorizontal: 20,
      width: "100%",
    },
    headerTitle: {
      color: theme.text,
      opacity: 0.8,
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    headerIconPlaceholder: { width: 28 },
    container: {
      flex: 1,
      alignItems: "center",
      // AJUSTE: Centraliza o conteúdo verticalmente na tela.
      justifyContent: "center",
      paddingHorizontal: 20,
    },
    // AJUSTE: Diminuído o espaçamento inferior pois o layout agora é mais natural.
    seloEmoji: { fontSize: 90, marginBottom: 15 },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      // AJUSTE: Aumentado o padding vertical e diminuído o horizontal para se adaptar melhor.
      paddingVertical: 20,
      paddingHorizontal: 25,
      alignItems: "center",
      width: "100%",
      position: "relative",
      // AJUSTE: Aumentado o espaçamento para o próximo elemento.
      marginBottom: 30,
      // AJUSTE: Removida a margem negativa.
    },
    mascoteIcon: {
      position: "absolute",
      top: 10,
      right: 15,
      fontSize: 45,
      color: theme.cardText,
      opacity: 0.3,
    },
    cardTitle: {
      fontSize: 20 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginBottom: 5,
      lineHeight: 20 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    cardSubtitle: {
      fontSize: 14 * fontMultiplier,
      color: theme.cardText,
      textAlign: "center",
      lineHeight: 20 * lineHeight,
      fontWeight: isBold ? "bold" : "normal",
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    progressoContainer: {
      backgroundColor: theme.card,
      borderRadius: 16,
      // AJUSTE: Aumentado o padding para dar mais respiro.
      padding: 15,
      width: "100%",
      alignItems: "center",
      // AJUSTE: Removida a margem negativa.
    },
    progressoTitle: {
      fontSize: 15 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginBottom: 10,
      lineHeight: 15 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    modulosRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    moduloIconContainer: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 8,
    },
    moduloIconText: {
      color: theme.text,
      fontSize: 20 * fontMultiplier,
      fontWeight: "bold",
      lineHeight: 20 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    progressoSubtitle: {
      fontSize: 12 * fontMultiplier,
      color: theme.cardText,
      // AJUSTE: Aumentado espaçamento superior para melhor leitura.
      marginTop: 10,
      fontWeight: isBold ? "bold" : "normal",
      lineHeight: 12 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });
