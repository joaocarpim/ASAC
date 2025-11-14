// src/screens/main/HomeScreen.tsx
import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
  TextStyle,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as APIt from "../../API";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import progressService from "../../services/progressService";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleText,
  AccessibleHeader,
  AccessibleButton,
} from "../../components/AccessibleComponents";
import { DEFAULT_MODULES } from "../../navigation/moduleTypes";

// IMPORTAR OS STORES
import { useModalStore } from "../../store/useModalStore";
import { useNotificationQueueStore } from "../../store/useNotificationQueueStore";

/* ===========================
    Estilos
   =========================== */
const BOX_SIZE = 75;
const FEATURE_BUTTON_WIDTH = 165;
const FEATURE_BUTTON_HEIGHT = 110;

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexiaFontEnabled: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number
) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
      paddingHorizontal: 16,
    },
    headerTitle: {
      fontSize: 22 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 22 * fontMultiplier * lineHeightMultiplier,
      letterSpacing,
    },
    headerSubtitle: {
      fontSize: 13 * fontMultiplier,
      color: theme.text,
      opacity: 0.8,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 13 * fontMultiplier * lineHeightMultiplier,
      letterSpacing,
    },
    headerIcon: {
      backgroundColor: theme.button ?? "#191970",
      borderRadius: 10,
      padding: 6,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      alignSelf: "center",
      marginVertical: 12,
    },
    statCard: {
      width: BOX_SIZE,
      height: BOX_SIZE,
      backgroundColor: theme.card,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      padding: 4,
    },
    statIcon: {
      fontSize: 22 * fontMultiplier,
      color: theme.cardText,
    } as TextStyle,
    statValue: {
      color: theme.cardText,
      fontSize: 15 * fontMultiplier,
      fontWeight: isBold ? "900" : "bold",
      marginTop: 2,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    statLabel: {
      color: theme.cardText,
      fontSize: 10 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },

    // MÓDULOS COM CONFIG E ALFABETO
    modulesSection: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    modulesSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    modulesTitle: {
      fontSize: 16 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      flex: 1,
    },
    headerButtons: {
      flexDirection: "row",
      gap: 8,
    },
    smallButton: {
      width: 44,
      height: 44,
      backgroundColor: theme.card,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    smallIcon: {
      fontSize: 22 * fontMultiplier,
      color: theme.cardText,
    } as TextStyle,
    modulesList: {
      gap: 8,
      marginBottom: 12,
    },
    moduleItem: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
    },
    moduleIconContainer: {
      backgroundColor: theme.background,
      borderRadius: 22,
      padding: 8,
      marginRight: 10,
    },
    moduleIcon: {
      fontSize: 20 * fontMultiplier,
      color: theme.text,
    } as TextStyle,
    moduleTextContainer: { flex: 1 },
    moduleTitle: {
      color: theme.cardText,
      fontSize: 13 * fontMultiplier,
      fontWeight: isBold ? "900" : "bold",
      marginBottom: 2,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    moduleSubtitle: {
      color: theme.cardText,
      fontSize: 11 * fontMultiplier,
      opacity: 0.9,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    moduleStatusIndicator: {
      width: 14,
      height: 14,
      borderRadius: 7,
      marginLeft: 8,
    },
    lockIcon: {
      fontSize: 22 * fontMultiplier,
      color: theme.text,
      marginLeft: 8,
    } as TextStyle,

    // 🎨 FEATURES EM DESTAQUE (LADO A LADO)
    featuresSection: {
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    featuresRow: {
      flexDirection: "row",
      gap: 10,
      justifyContent: "center",
    },
    featureButton: {
      width: FEATURE_BUTTON_WIDTH,
      height: FEATURE_BUTTON_HEIGHT,
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 12,
      justifyContent: "space-between",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    featureIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
    },
    featureWriting: {
      backgroundColor: "#FF6B6B",
    },
    featureContractions: {
      backgroundColor: "#4ECDC4",
    },
    featureIcon: {
      fontSize: 28 * fontMultiplier,
      color: "#FFFFFF",
    } as TextStyle,
    featureTitle: {
      color: theme.cardText,
      fontSize: 14 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      marginTop: 8,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    featureSubtitle: {
      color: theme.cardText,
      fontSize: 11 * fontMultiplier,
      opacity: 0.7,
      marginTop: 2,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },

    // AÇÕES RÁPIDAS
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
      marginVertical: 8,
      paddingHorizontal: 16,
    },
    actionButton: {
      width: BOX_SIZE,
      height: BOX_SIZE,
      backgroundColor: theme.card,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      padding: 4,
    },
    actionIcon: {
      fontSize: 22 * fontMultiplier,
      color: theme.cardText,
    } as TextStyle,
    actionLabel: {
      color: theme.cardText,
      fontSize: 10 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });

/* ===========================
    Tipagens e Subcomponentes
   =========================== */
type HomeScreenStyles = ReturnType<typeof createStyles>;

interface StatCardProps {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  value: string | number;
  label: string;
  styles: HomeScreenStyles;
}

interface ActionButtonProps {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress: () => void;
  styles: HomeScreenStyles;
}

interface ModuleItemProps {
  module: { id: string; moduleId: number; title: string; description?: string };
  completed: boolean;
  isLocked: boolean;
  onPress: () => void;
  styles: HomeScreenStyles;
}

interface FeatureButtonProps {
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  gradientType: "writing" | "contractions";
  onPress: () => void;
  styles: HomeScreenStyles;
}

const StatCard: React.FC<StatCardProps> = ({
  iconName,
  value,
  label,
  styles,
}) => {
  const iconStyle = styles.statIcon as TextStyle;
  return (
    <AccessibleView
      accessibilityText={`${label}: ${value}.`}
      style={styles.statCard}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={iconStyle.fontSize}
        color={iconStyle.color}
      />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </AccessibleView>
  );
};

const FeatureButton: React.FC<FeatureButtonProps> = ({
  title,
  subtitle,
  iconName,
  gradientType,
  onPress,
  styles,
}) => {
  const iconStyle = styles.featureIcon as TextStyle;

  return (
    <AccessibleButton
      accessibilityText={`${title}. ${subtitle}`}
      onPress={onPress}
      style={styles.featureButton}
    >
      <View
        style={[
          styles.featureIconContainer,
          gradientType === "writing"
            ? styles.featureWriting
            : styles.featureContractions,
        ]}
      >
        <MaterialCommunityIcons
          name={iconName}
          size={iconStyle.fontSize}
          color="#FFFFFF"
        />
      </View>
      <View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
    </AccessibleButton>
  );
};

const ActionButton: React.FC<ActionButtonProps> = ({
  iconName,
  label,
  onPress,
  styles,
}) => {
  const iconStyle = styles.actionIcon as TextStyle;
  return (
    <AccessibleButton
      accessibilityText={`${label}. Toque para abrir.`}
      onPress={onPress}
      style={styles.actionButton}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={iconStyle.fontSize}
        color={iconStyle.color}
      />
      <Text style={styles.actionLabel}>{label}</Text>
    </AccessibleButton>
  );
};

const ModuleItem: React.FC<ModuleItemProps> = ({
  module,
  completed,
  isLocked,
  onPress,
  styles,
}) => {
  const iconStyle = styles.moduleIcon as TextStyle;
  const lockIconStyle = styles.lockIcon as TextStyle;
  const iconMap: React.ComponentProps<typeof MaterialCommunityIcons>["name"][] =
    ["alphabet-latin", "hand-wave-outline", "star-box-outline"];
  const iconName =
    iconMap[module.moduleId - 1] ??
    ("book-outline" as React.ComponentProps<
      typeof MaterialCommunityIcons
    >["name"]);
  return (
    <AccessibleButton
      accessibilityText={`Módulo ${module.moduleId}. ${completed ? "Concluído" : isLocked ? "Bloqueado" : "Disponível"}.`}
      onPress={onPress}
      disabled={isLocked}
      style={[styles.moduleItem, isLocked && { opacity: 0.55 }]}
    >
      <View style={styles.moduleIconContainer}>
        <MaterialCommunityIcons
          name={iconName}
          size={iconStyle.fontSize}
          color={iconStyle.color}
        />
      </View>
      <View style={styles.moduleTextContainer}>
        <Text style={styles.moduleTitle}>Módulo {module.moduleId}</Text>
        <Text style={styles.moduleSubtitle}>{module.title}</Text>
      </View>
      {isLocked ? (
        <MaterialCommunityIcons
          name="lock-outline"
          size={lockIconStyle.fontSize}
          color={lockIconStyle.color}
        />
      ) : (
        <View
          style={[
            styles.moduleStatusIndicator,
            { backgroundColor: completed ? "#4CD964" : "#FFCC00" },
          ]}
        />
      )}
    </AccessibleButton>
  );
};

/* ---------- COMPONENTE PRINCIPAL ---------- */
const HomeScreen: React.FC<
  NativeStackScreenProps<RootStackParamList, "Home">
> = ({ navigation }) => {
  const { user, signOut } = useAuthStore();
  const [loadingUser, setLoadingUser] = useState(true);
  const [dbUser, setDbUser] = useState<APIt.User | null>(null);

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

  const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);
  const { showModal } = useModalStore();
  const { pendingNotification, dequeueNotification } =
    useNotificationQueueStore();

  useFocusEffect(
    useCallback(() => {
      if (pendingNotification) {
        console.log(
          "[HomeScreen] Notificação pendente (Módulo) encontrada. Mostrando modal..."
        );
        showModal(pendingNotification.title, pendingNotification.message);
        dequeueNotification();
      }
    }, [pendingNotification, showModal, dequeueNotification])
  );

  useEffect(() => {
    if (dbUser && !welcomeMessageShown && !pendingNotification) {
      const title = `🎉 Seja Bem-Vindo(a)!`;
      const message = `Olá, ${dbUser.name}! Estamos felizes em ver você por aqui.`;

      const showWelcomeModal = () => {
        showModal(title, message);
        setWelcomeMessageShown(true);
      };

      const timer = setTimeout(showWelcomeModal, 500);
      return () => clearTimeout(timer);
    }
  }, [dbUser, welcomeMessageShown, pendingNotification, showModal]);

  const fetchData = useCallback(async () => {
    if (!user?.userId) {
      setLoadingUser(false);
      return;
    }
    setLoadingUser(true);
    try {
      const uResult = await progressService.getUserById(user.userId);
      setDbUser(uResult as APIt.User | null);
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
      setDbUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, [user?.userId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const canStartModule = (
    moduleId: number,
    completedModules: number[]
  ): boolean => {
    if (moduleId === 1) return true;
    return completedModules.includes(moduleId - 1);
  };

  const openModule = async (moduleId: number, completedModules: number[]) => {
    if (!user?.userId) return;
    const allowed = canStartModule(moduleId, completedModules);
    if (!allowed) {
      Alert.alert("Bloqueado", "Conclua o módulo anterior para avançar.");
      return;
    }
    navigation.navigate("ModuleContent", { moduleId: String(moduleId) });
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => signOut() },
    ]);
  };

  if (loadingUser || !dbUser) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  const rawModules = dbUser.modulesCompleted;
  const completedModuleNumbers: number[] = (() => {
    if (Array.isArray(rawModules)) {
      return rawModules.filter((n): n is number => typeof n === "number");
    }
    return [];
  })();
  const completedCount = completedModuleNumbers.length;
  const modulesProgressString = `${completedCount}/${DEFAULT_MODULES.length}`;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
      ]}
    >
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <AccessibleHeader level={1} style={styles.headerTitle}>
              Olá, {dbUser.name ?? user?.name ?? "Usuário"}!
            </AccessibleHeader>
            <AccessibleText baseSize={16} style={styles.headerSubtitle}>
              Continue aprendendo com ASAC
            </AccessibleText>
          </View>
          <AccessibleButton onPress={handleLogout} style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="logout"
              size={22}
              color={theme.buttonText ?? "#FFFFFF"}
            />
          </AccessibleButton>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatCard
            iconName="hand-coin"
            value={dbUser.coins ?? 0}
            label="Moedas"
            styles={styles}
          />
          <StatCard
            iconName="trophy-variant"
            value={(dbUser.points ?? 0).toLocaleString("pt-BR")}
            label="Pontos"
            styles={styles}
          />
          <StatCard
            iconName="book-multiple"
            value={modulesProgressString}
            label="Módulos"
            styles={styles}
          />
        </View>

        {/* MÓDULOS COM CONFIG E ALFABETO */}
        <View style={styles.modulesSection}>
          <View style={styles.modulesSectionHeader}>
            <Text style={styles.modulesTitle}>Seus Módulos</Text>
            <View style={styles.headerButtons}>
              <AccessibleButton
                onPress={() => navigation.navigate("Settings")}
                style={styles.smallButton}
                accessibilityText="Configurações"
              >
                <MaterialCommunityIcons
                  name="cog"
                  size={(styles.smallIcon as TextStyle).fontSize}
                  color={(styles.smallIcon as TextStyle).color}
                />
              </AccessibleButton>

              <AccessibleButton
                onPress={() => navigation.navigate("AlphabetSections")}
                style={styles.smallButton}
                accessibilityText="Alfabeto"
              >
                <MaterialCommunityIcons
                  name="alphabetical"
                  size={(styles.smallIcon as TextStyle).fontSize}
                  color={(styles.smallIcon as TextStyle).color}
                />
              </AccessibleButton>
            </View>
          </View>

          <View style={styles.modulesList}>
            {DEFAULT_MODULES.map((item) => {
              const isCompleted = completedModuleNumbers.includes(
                item.moduleId
              );
              const isLocked = !canStartModule(
                item.moduleId,
                completedModuleNumbers
              );
              return (
                <ModuleItem
                  key={item.id}
                  module={item}
                  completed={isCompleted}
                  isLocked={isLocked}
                  onPress={() =>
                    openModule(item.moduleId, completedModuleNumbers)
                  }
                  styles={styles}
                />
              );
            })}
          </View>
        </View>

        {/* 🎨 FEATURES EM DESTAQUE (LADO A LADO) */}
        <View style={styles.featuresSection}>
          <View style={styles.featuresRow}>
            <FeatureButton
              title="Escrita"
              subtitle="Teste sua velocidade"
              iconName="keyboard-variant"
              gradientType="writing"
              onPress={() => navigation.navigate("WritingChallengeIntro")}
              styles={styles}
            />

            <FeatureButton
              title="Contrações"
              subtitle="Aprenda atalhos"
              iconName="alpha-c-box-outline"
              gradientType="contractions"
              onPress={() => navigation.navigate("ContractionsHome")}
              styles={styles}
            />
          </View>
        </View>

        {/* AÇÕES RÁPIDAS */}
        <View style={styles.actionsContainer}>
          <ActionButton
            iconName="podium-gold"
            label="Ranking"
            onPress={() => navigation.navigate("Ranking")}
            styles={styles}
          />
          <ActionButton
            iconName="road-variant"
            label="Jornada"
            onPress={() => navigation.navigate("LearningPath")}
            styles={styles}
          />
          <ActionButton
            iconName="medal-outline"
            label="Conquistas"
            onPress={() => navigation.navigate("Achievements")}
            styles={styles}
          />
          <ActionButton
            iconName="rocket-launch-outline"
            label="Progresso"
            onPress={() => navigation.navigate("Progress")}
            styles={styles}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
