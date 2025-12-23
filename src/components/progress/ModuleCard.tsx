import React, { useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AccessibleText } from "../AccessibleComponents";

import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type ModuleCardProps = {
  moduleNumber: number;
  accuracy: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeSpent: number;
  onPress: () => void;
  index: number;
  theme: any;
  updatedAt?: string;
};

export const ModuleCard = React.memo(
  ({
    moduleNumber,
    accuracy,
    correctAnswers,
    wrongAnswers,
    timeSpent,
    onPress,
    index,
    theme,
    updatedAt,
  }: ModuleCardProps) => {
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

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

    useEffect(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, [index, slideAnim, fadeAnim]);

    const formatTime = useCallback((seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return `${mins}m ${secs}s`;
    }, []);

    const formatTimeAccessible = useCallback((seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      let text = "";
      if (mins > 0) text += `${mins} minutos `;
      if (secs > 0 || text === "") text += `${secs} segundos`;
      return text;
    }, []);

    const formatDate = useCallback((dateString?: string) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "";
      }
    }, []);

    const totalQuestions = useMemo(
      () => correctAnswers + wrongAnswers,
      [correctAnswers, wrongAnswers]
    );

    const isPerfect = useMemo(
      () => wrongAnswers === 0 && correctAnswers > 0,
      [wrongAnswers, correctAnswers]
    );

    const handlePressIn = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }, [scaleAnim]);

    const accuracyInfo = useMemo(() => {
      if (accuracy >= 90) {
        return {
          icon: "trophy" as IconName,
          text: "Excelente!",
          color: "#4CAF50",
        };
      } else if (accuracy >= 70) {
        return {
          icon: "thumb-up" as IconName,
          text: "Aprovado",
          color: "#FF9800",
        };
      } else {
        return {
          icon: "alert" as IconName,
          text: "Pode Melhorar",
          color: "#F44336",
        };
      }
    }, [accuracy]);

    const formattedDate = useMemo(
      () => formatDate(updatedAt),
      [updatedAt, formatDate]
    );
    const formattedTime = useMemo(
      () => formatTime(timeSpent),
      [timeSpent, formatTime]
    );

    // ✅ CONSTRUÇÃO DO TEXTO DE ACESSIBILIDADE
    // Isso cria uma frase única que o TalkBack lerá ao focar no card
    const cardAccessibilityLabel = useMemo(() => {
      return `Módulo ${moduleNumber}. 
      Status: ${accuracyInfo.text}, Precisão de ${accuracy}%.
      ${totalQuestions} questões realizadas.
      Data: ${formattedDate || "Não disponível"}.
      Desempenho: ${correctAnswers} acertos e ${wrongAnswers} erros.
      Tempo total: ${formatTimeAccessible(timeSpent)}.
      ${
        wrongAnswers > 0
          ? "Toque duas vezes para ver detalhes dos erros."
          : "Desempenho perfeito!"
      }`;
    }, [
      moduleNumber,
      accuracyInfo,
      accuracy,
      totalQuestions,
      formattedDate,
      correctAnswers,
      wrongAnswers,
      timeSpent,
      formatTimeAccessible,
    ]);

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          style={[styles.moduleCard, { backgroundColor: theme.card }]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          // ✅ ACESSIBILIDADE DE FOCO ÚNICO
          accessible={true} // Diz ao sistema que este container é um elemento acessível
          accessibilityRole="button" // Identifica como botão clicável
          accessibilityLabel={cardAccessibilityLabel} // O texto completo a ser lido
          // focusable={true} é implícito no TouchableOpacity, mas garante navegação por teclado
        >
          {/* Todos os elementos abaixo são visuais. 
             Como o Pai tem accessible={true}, o TalkBack ignora os filhos individualmente 
             e foca apenas no Pai, lendo o accessibilityLabel definido acima.
          */}

          <View style={styles.moduleHeader}>
            <View style={styles.moduleHeaderLeft}>
              <View
                style={[
                  styles.moduleNumberBadge,
                  { backgroundColor: theme.cardText },
                ]}
              >
                <AccessibleText
                  baseSize={22}
                  style={[styles.moduleNumberText, { color: theme.text }]}
                >
                  {moduleNumber}
                </AccessibleText>
              </View>

              <View>
                <AccessibleText
                  baseSize={20}
                  style={[styles.moduleTitle, { color: theme.cardText }]}
                >
                  Módulo {moduleNumber}
                </AccessibleText>

                <AccessibleText
                  baseSize={13}
                  style={[styles.moduleSubtitle, { color: theme.cardText }]}
                >
                  {totalQuestions}{" "}
                  {totalQuestions === 1 ? "questão" : "questões"}
                </AccessibleText>

                {formattedDate && (
                  <AccessibleText
                    baseSize={11}
                    style={[styles.dateText, { color: theme.cardText }]}
                  >
                    Última tentativa: {formattedDate}
                  </AccessibleText>
                )}
              </View>
            </View>
            {isPerfect && (
              <MaterialCommunityIcons name="crown" size={28} color="#FFD700" />
            )}
          </View>

          <View style={styles.accuracySection}>
            <View
              style={[
                styles.accuracyBadge,
                { backgroundColor: accuracyInfo.color },
              ]}
            >
              <MaterialCommunityIcons
                name={accuracyInfo.icon}
                size={20}
                color="#FFFFFF"
              />
              <AccessibleText baseSize={16} style={styles.accuracyText}>
                {accuracy}%
              </AccessibleText>
            </View>
            <View style={styles.accuracyLabelContainer}>
              <MaterialCommunityIcons
                name={accuracyInfo.icon}
                size={18}
                color={accuracyInfo.color}
              />
              <AccessibleText
                baseSize={14}
                style={[styles.accuracyLabel, { color: theme.cardText }]}
              >
                {accuracyInfo.text}
              </AccessibleText>
            </View>
          </View>

          {/* ScrollView interno marcado como não importante para acessibilidade 
              pois o pai já leu o conteúdo */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.statsScrollContainer}
            contentContainerStyle={styles.statsScrollContent}
            importantForAccessibility="no-hide-descendants"
          >
            <View
              style={[styles.moduleStatsGrid, { borderTopColor: theme.border }]}
            >
              <View style={styles.statBox}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color="#4CAF50"
                />
                <AccessibleText
                  baseSize={18}
                  style={[styles.statBoxValue, { color: theme.cardText }]}
                >
                  {correctAnswers}
                </AccessibleText>
                <AccessibleText
                  baseSize={12}
                  style={[styles.statBoxLabel, { color: theme.cardText }]}
                >
                  Acertos
                </AccessibleText>
              </View>

              <View style={styles.statBox}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={24}
                  color="#F44336"
                />
                <AccessibleText
                  baseSize={18}
                  style={[styles.statBoxValue, { color: theme.cardText }]}
                >
                  {wrongAnswers}
                </AccessibleText>
                <AccessibleText
                  baseSize={12}
                  style={[styles.statBoxLabel, { color: theme.cardText }]}
                >
                  Erros
                </AccessibleText>
              </View>

              <View style={styles.statBox}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={24}
                  color="#2196F3"
                />
                <AccessibleText
                  baseSize={18}
                  style={[styles.statBoxValue, { color: theme.cardText }]}
                >
                  {formattedTime}
                </AccessibleText>
                <AccessibleText
                  baseSize={12}
                  style={[styles.statBoxLabel, { color: theme.cardText }]}
                >
                  Tempo
                </AccessibleText>
              </View>

              <View style={styles.statBox}>
                <MaterialCommunityIcons
                  name="bullseye-arrow"
                  size={24}
                  color="#9C27B0"
                />
                <AccessibleText
                  baseSize={18}
                  style={[styles.statBoxValue, { color: theme.cardText }]}
                >
                  {accuracy}%
                </AccessibleText>
                <AccessibleText
                  baseSize={12}
                  style={[styles.statBoxLabel, { color: theme.cardText }]}
                >
                  Precisão
                </AccessibleText>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.moduleFooter, { borderTopColor: theme.border }]}>
            <AccessibleText
              baseSize={14}
              style={[styles.viewDetailsText, { color: theme.cardText }]}
            >
              {wrongAnswers > 0
                ? "Ver erros detalhados"
                : "Desempenho perfeito!"}
            </AccessibleText>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={theme.cardText}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

ModuleCard.displayName = "ModuleCard";

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    moduleCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    moduleHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    moduleHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    moduleNumberBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
    },
    moduleNumberText: {
      fontWeight: "bold",
      fontSize: 14,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    moduleTitle: {
      fontWeight: "bold",
      fontSize: 16,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing: letterSpacing,
    },
    moduleSubtitle: {
      marginTop: 1,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing: letterSpacing,
    },
    dateText: {
      marginTop: 2,
      opacity: 0.7,
      fontSize: 12,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing: letterSpacing,
    },
    accuracySection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      marginBottom: 20,
      paddingHorizontal: 0,
      gap: 20,
    },
    accuracyBadge: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 16,
      paddingHorizontal: 8,
      paddingVertical: 8,
      gap: 4,
    },
    accuracyText: {
      color: "#FFFFFF",
      fontWeight: "bold",
      fontSize: 12,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    accuracyLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    accuracyLabel: {
      fontWeight: "600",
      fontSize: 12,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing: letterSpacing,
    },
    statsScrollContainer: {
      marginBottom: 8,
    },
    statsScrollContent: {
      paddingRight: 0,
    },
    moduleStatsGrid: {
      flexDirection: "row",
      paddingTop: 4,
      borderTopWidth: 1,
      gap: 8,
    },
    statBox: {
      alignItems: "center",
      gap: 2,
      minWidth: 60,
    },
    statBoxValue: {
      fontWeight: "bold",
      fontSize: 12,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing: letterSpacing,
    },
    statBoxLabel: {
      fontWeight: "500",
      fontSize: 10,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing: letterSpacing,
    },
    moduleFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 4,
      borderTopWidth: 1,
      gap: 2,
    },
    viewDetailsText: {
      fontWeight: "600",
      fontSize: 12,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
      letterSpacing: letterSpacing,
    },
  });
