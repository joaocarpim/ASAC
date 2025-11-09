// src/components/progress/ModuleCard.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AccessibleText } from "../AccessibleComponents";

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

export const ModuleCard = ({
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString?: string) => {
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
  };

  const totalQuestions = correctAnswers + wrongAnswers;
  const isPerfect = wrongAnswers === 0 && correctAnswers > 0;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const getAccuracyInfo = () => {
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
  };

  const accuracyInfo = getAccuracyInfo();

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
      >
        <View style={styles.moduleHeader}>
          <View style={styles.moduleHeaderLeft}>
            <View
              style={[
                styles.moduleNumberBadge,
                { backgroundColor: theme.text },
              ]}
            >
              <AccessibleText
                baseSize={22}
                style={[styles.moduleNumberText, { color: theme.card }]}
              >
                {moduleNumber}
              </AccessibleText>
            </View>
            <View>
              <AccessibleText
                baseSize={20}
                style={[styles.moduleTitle, { color: theme.text }]}
              >
                Módulo {moduleNumber}
              </AccessibleText>
              <AccessibleText
                baseSize={13}
                style={[styles.moduleSubtitle, { color: theme.text }]}
              >
                {totalQuestions} {totalQuestions === 1 ? "questão" : "questões"}
              </AccessibleText>
              {updatedAt && (
                <AccessibleText
                  baseSize={11}
                  style={[styles.dateText, { color: theme.text }]}
                >
                  Última tentativa: {formatDate(updatedAt)}
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
              style={[styles.accuracyLabel, { color: theme.text }]}
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
              <AccessibleText
                baseSize={18}
                style={[styles.statBoxValue, { color: theme.text }]}
              >
                {correctAnswers}
              </AccessibleText>
              <AccessibleText
                baseSize={12}
                style={[styles.statBoxLabel, { color: theme.text }]}
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
                style={[styles.statBoxValue, { color: theme.text }]}
              >
                {wrongAnswers}
              </AccessibleText>
              <AccessibleText
                baseSize={12}
                style={[styles.statBoxLabel, { color: theme.text }]}
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
                style={[styles.statBoxValue, { color: theme.text }]}
              >
                {formatTime(timeSpent)}
              </AccessibleText>
              <AccessibleText
                baseSize={12}
                style={[styles.statBoxLabel, { color: theme.text }]}
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
                style={[styles.statBoxValue, { color: theme.text }]}
              >
                {accuracy}%
              </AccessibleText>
              <AccessibleText
                baseSize={12}
                style={[styles.statBoxLabel, { color: theme.text }]}
              >
                Precisão
              </AccessibleText>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.moduleFooter, { borderTopColor: theme.border }]}>
          <AccessibleText
            baseSize={14}
            style={[styles.viewDetailsText, { color: theme.text }]}
          >
            {wrongAnswers > 0 ? "Ver erros detalhados" : "Desempenho perfeito!"}
          </AccessibleText>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={theme.text}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Estilos para o ModuleCard
const styles = StyleSheet.create({
  moduleCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  moduleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  moduleNumberBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  moduleNumberText: {
    fontWeight: "bold",
  },
  moduleTitle: {
    fontWeight: "bold",
  },
  moduleSubtitle: {
    marginTop: 2,
  },
  dateText: {
    marginTop: 4,
    opacity: 0.7,
  },
  accuracySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  accuracyBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  accuracyText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  accuracyLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  accuracyLabel: {
    fontWeight: "600",
  },
  statsScrollContainer: {
    marginBottom: 16,
  },
  statsScrollContent: {
    paddingRight: 20,
  },
  moduleStatsGrid: {
    flexDirection: "row",
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 20,
  },
  statBox: {
    alignItems: "center",
    gap: 6,
    minWidth: 80,
  },
  statBoxValue: {
    fontWeight: "bold",
  },
  statBoxLabel: {
    fontWeight: "500",
  },
  moduleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 4,
  },
  viewDetailsText: {
    fontWeight: "600",
  },
});
