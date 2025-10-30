import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleHeader,
} from "../../components/AccessibleComponents";
import { useSettings } from "../../hooks/useSettings";
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";
import { useAuthStore } from "../../store/authStore";
import { getUserById } from "../../services/progressService";

const MODULE_EMOJIS = ["🎓", "🏆", "⭐"];
const MODULE_ICONS: React.ComponentProps<typeof MaterialCommunityIcons>["name"][] = [
  "school",
  "trophy",
  "star"
];

export default function AchievementsScreen() {
  const navigation = useNavigation();
  const { theme } = useContrast();
  const { user } = useAuthStore();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const [progressoAtual, setProgressoAtual] = useState(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const modulosTotais = 3;

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const fetchAchievements = useCallback(async () => {
    if (!user?.userId) return;

    setLoading(true);
    try {
      const dbUser = await getUserById(user.userId);
      if (dbUser) {
        const modulesCompleted = Array.isArray(dbUser.modulesCompleted)
          ? dbUser.modulesCompleted.length
          : 0;

        setProgressoAtual(modulesCompleted);
        setAchievements(dbUser.achievements?.items || []);
      }
    } catch (error) {
      console.error("Erro ao buscar conquistas:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  useFocusEffect(
    useCallback(() => {
      fetchAchievements();
    }, [fetchAchievements])
  );

  const handleGoBack = () => {
    navigation.goBack();
  };

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleGoBack);

  const renderModuleIcons = () => {
    let icons = [];
    for (let i = 1; i <= modulosTotais; i++) {
      const isCompleted = i <= progressoAtual;
      icons.push(
        <View key={i} style={[
          styles.moduloIconContainer,
          isCompleted && styles.moduloIconCompleted
        ]}>
          {isCompleted ? (
            <Text style={styles.moduloEmoji}>{MODULE_EMOJIS[i - 1]}</Text>
          ) : (
            <MaterialCommunityIcons name="lock" size={28} color={theme.text} />
          )}
        </View>
      );
    }
    return icons;
  };

  if (loading) {
    return (
      <GestureDetector gesture={flingRight}>
        <View style={styles.page}>
          <StatusBar
            barStyle={theme.statusBarStyle}
            backgroundColor={theme.background}
          />
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} accessibilityLabel="Voltar">
              <MaterialCommunityIcons
                name="arrow-left"
                size={28}
                color={theme.text}
              />
            </TouchableOpacity>
            <AccessibleHeader level={1} style={styles.headerTitle}>
              Minhas Conquistas
            </AccessibleHeader>
            <View style={styles.headerIconPlaceholder} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.text} />
          </View>
        </View>
      </GestureDetector>
    );
  }

  return (
    <GestureDetector gesture={flingRight}>
      <View style={styles.page}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} accessibilityLabel="Voltar">
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color={theme.text}
            />
          </TouchableOpacity>
          <AccessibleHeader level={1} style={styles.headerTitle}>
            Minhas Conquistas
          </AccessibleHeader>
          <View style={styles.headerIconPlaceholder} />
        </View>
        
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          <AccessibleView accessibilityText="Medalha de conquistas">
            <Text style={styles.seloEmoji}>🎖️</Text>
          </AccessibleView>

          <View style={styles.achievementsContainer}>
            <Text style={styles.sectionTitle}>Módulos Concluídos</Text>
            <View style={styles.modulosRow}>{renderModuleIcons()}</View>
            <Text style={styles.progressText}>
              {progressoAtual} de {modulosTotais} módulos concluídos
            </Text>
          </View>

          {achievements.length > 0 ? (
            <View style={styles.achievementsList}>
              <Text style={styles.sectionTitle}>Suas Conquistas</Text>
              {achievements.map((achievement, index) => (
                <View
                  key={achievement.id}
                  style={styles.achievementCard}
                >
                  <View style={styles.achievementIconContainer}>
                    <Text style={styles.achievementEmoji}>
                      {MODULE_EMOJIS[achievement.moduleNumber - 1] || "🏅"}
                    </Text>
                  </View>
                  <View style={styles.achievementTextContainer}>
                    <Text style={styles.achievementTitle}>
                      {achievement.title}
                    </Text>
                    <Text style={styles.achievementDate}>
                      {new Date(achievement.createdAt).toLocaleDateString(
                        "pt-BR"
                      )}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="emoticon-sad-outline"
                size={50}
                color={theme.cardText}
                style={{ opacity: 0.5 }}
              />
              <Text style={styles.emptyTitle}>Sem Conquistas Ainda</Text>
              <Text style={styles.emptySubtitle}>
                Complete os módulos para ganhar emblemas!
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
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
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
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
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 30,
    },
    seloEmoji: { 
      fontSize: 80, 
      marginBottom: 20, 
      textAlign: "center" 
    },
    achievementsContainer: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginBottom: 15,
      textAlign: "center",
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    modulosRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 15,
    },
    moduloIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
      marginHorizontal: 8,
      opacity: 0.4,
      borderWidth: 2,
      borderColor: theme.cardText,
    },
    moduloIconCompleted: {
      opacity: 1,
      borderColor: "#4CD964",
    },
    moduloEmoji: {
      fontSize: 32,
    },
    progressText: {
      fontSize: 14 * fontMultiplier,
      color: theme.cardText,
      fontWeight: isBold ? "bold" : "normal",
      lineHeight: 14 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    achievementsList: {
      marginTop: 10,
    },
    achievementCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 15,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    achievementIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },
    achievementEmoji: {
      fontSize: 32,
    },
    achievementTextContainer: {
      flex: 1,
    },
    achievementTitle: {
      fontSize: 16 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginBottom: 4,
      lineHeight: 16 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    achievementDate: {
      fontSize: 12 * fontMultiplier,
      color: theme.cardText,
      opacity: 0.7,
      lineHeight: 12 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptyCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 30,
      alignItems: "center",
      marginTop: 20,
    },
    emptyTitle: {
      fontSize: 18 * fontMultiplier,
      fontWeight: "bold",
      color: theme.cardText,
      marginTop: 15,
      marginBottom: 8,
      lineHeight: 18 * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    emptySubtitle: {
      fontSize: 14 * fontMultiplier,
      color: theme.cardText,
      textAlign: "center",
      opacity: 0.8,
      lineHeight: 20 * lineHeight,
      fontWeight: isBold ? "bold" : "normal",
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });