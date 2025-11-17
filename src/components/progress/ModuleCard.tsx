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
  theme: any; // Mantido como 'any' para bater com seu código
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

    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }, { scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          style={[styles.moduleCard, { backgroundColor: theme.card }]} // Fundo Azul
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={styles.moduleHeader}>
            <View style={styles.moduleHeaderLeft}>
              {/* ✅ CORREÇÃO DO BADGE (Fundo Branco, Texto Azul) */}
              <View
                style={[
                  styles.moduleNumberBadge,
                  { backgroundColor: theme.cardText }, // Era theme.text (azul)
                ]}
              >
                <AccessibleText
                  baseSize={22}
                  style={[styles.moduleNumberText, { color: theme.text }]} // Era theme.card (azul)
                >
                  {moduleNumber}
                </AccessibleText>
              </View>

              <View>
                {/* ✅ CORREÇÃO 1 (Texto Branco) */}
                <AccessibleText
                  baseSize={20}
                  style={[styles.moduleTitle, { color: theme.cardText }]} // Era theme.text
                >
                  Módulo {moduleNumber}
                </AccessibleText>

                {/* ✅ CORREÇÃO 2 (Texto Branco) */}
                <AccessibleText
                  baseSize={13}
                  style={[styles.moduleSubtitle, { color: theme.cardText }]} // Era theme.text
                >
                  {totalQuestions}{" "}
                  {totalQuestions === 1 ? "questão" : "questões"}
                </AccessibleText>

                {formattedDate && (
                  /* ✅ CORREÇÃO 3 (Texto Branco) */
                  <AccessibleText
                    baseSize={11}
                    style={[styles.dateText, { color: theme.cardText }]} // Era theme.text
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
              {/* ✅ CORREÇÃO 4 (Texto Branco) */}
              <AccessibleText
                baseSize={14}
                style={[styles.accuracyLabel, { color: theme.cardText }]} // Era theme.text
              >
                {accuracyInfo.text}
              </AccessibleText>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={styles.statsScrollContainer}
            contentContainerStyle={styles.statsScrollContent}
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
                {/* ✅ CORREÇÃO 5 (Texto Branco) */}
                <AccessibleText
                  baseSize={18}
                  style={[styles.statBoxValue, { color: theme.cardText }]} // Era theme.text
                >
                  {correctAnswers}
                </AccessibleText>
                {/* ✅ CORREÇÃO 6 (Texto Branco) */}
                <AccessibleText
                  baseSize={12}
                  style={[styles.statBoxLabel, { color: theme.cardText }]} // Era theme.text
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
                {/* ✅ CORREÇÃO 7 (Texto Branco) */}
                <AccessibleText
                  baseSize={18}
                  style={[styles.statBoxValue, { color: theme.cardText }]} // Era theme.text
                >
                  {wrongAnswers}
                </AccessibleText>
                {/* ✅ CORREÇÃO 8 (Texto Branco) */}
                <AccessibleText
                  baseSize={12}
                  style={[styles.statBoxLabel, { color: theme.cardText }]} // Era theme.text
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
                {/* ✅ CORREÇÃO 9 (Texto Branco) */}
                <AccessibleText
                  baseSize={18}
                  style={[styles.statBoxValue, { color: theme.cardText }]} // Era theme.text
                >
                  {formattedTime}
                </AccessibleText>
                {/* ✅ CORREÇÃO 10 (Texto Branco) */}
                <AccessibleText
                  baseSize={12}
                  style={[styles.statBoxLabel, { color: theme.cardText }]} // Era theme.text
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
                {/* ✅ CORREÇÃO 11 (Texto Branco) */}
                <AccessibleText
                  baseSize={18}
                  style={[styles.statBoxValue, { color: theme.cardText }]} // Era theme.text
                >
                  {accuracy}%
                </AccessibleText>
                {/* ✅ CORREÇÃO 12 (Texto Branco) */}
                <AccessibleText
                  baseSize={12}
                  style={[styles.statBoxLabel, { color: theme.cardText }]} // Era theme.text
                >
                  Precisão
                </AccessibleText>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.moduleFooter, { borderTopColor: theme.border }]}>
            {/* ✅ CORREÇÃO 13 (Texto Branco) */}
            <AccessibleText
              baseSize={14}
              style={[styles.viewDetailsText, { color: theme.cardText }]} // Era theme.text
            >
              {wrongAnswers > 0
                ? "Ver erros detalhados"
                : "Desempenho perfeito!"}
            </AccessibleText>
            {/* ✅ CORREÇÃO 14 (Ícone Branco) */}
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={theme.cardText} // Era theme.text
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
