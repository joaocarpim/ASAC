// src/screens/main/HomeScreen.tsx
import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
  TextStyle,
  FlatList,
  Dimensions,
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
  AccessibleHeader,
  AccessibleButton,
  AccessibleText,
} from "../../components/AccessibleComponents";
import { DEFAULT_MODULES } from "../../navigation/moduleTypes";
import { useModalStore } from "../../store/useModalStore";
import { useNotificationQueueStore } from "../../store/useNotificationQueueStore";

const { width } = Dimensions.get("window");
const BOX_SIZE = 80; // Aumentei levemente para preencher melhor o centro
const SCREEN_PADDING = 16;
const GAP_SIZE = 12;
// Cálculo ajustado para features
const FEATURE_BUTTON_WIDTH = (width - SCREEN_PADDING * 2 - GAP_SIZE) / 2;
const FEATURE_BUTTON_HEIGHT = 115;

// ✅ Cache do usuário (Mantido para performance)
let userCache: APIt.User | null = null;
let userCacheTime = 0;
const USER_CACHE_TTL = 20000;

type HomeScreenStyles = ReturnType<typeof createStyles>;

interface StatCardProps {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  value: string | number;
  label: string;
  styles: HomeScreenStyles;
}

interface ModuleItemProps {
  module: { id: string; moduleId: number; title: string };
  completed: boolean;
  isLocked: boolean;
  onPress: () => void;
  styles: HomeScreenStyles;
}

interface FeatureButtonProps {
  title: string;
  subtitle: string;
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  gradientType: string;
  onPress: () => void;
  styles: HomeScreenStyles;
}

// ✅ COMPONENTES MEMOIZADOS

const StatCard = React.memo<StatCardProps>(
  ({ iconName, value, label, styles }) => {
    const iconStyle = styles.statIcon as TextStyle;
    return (
      <View
        style={styles.statCard}
        accessible={true}
        accessibilityLabel={`${label}: ${value}`}
        accessibilityRole="text"
      >
        <MaterialCommunityIcons
          name={iconName}
          size={iconStyle.fontSize}
          color={iconStyle.color}
          accessible={false}
        />
        <Text style={styles.statValue} accessible={false}>
          {value}
        </Text>
        <Text style={styles.statLabel} accessible={false}>
          {label}
        </Text>
      </View>
    );
  }
);

const FeatureButton = React.memo<FeatureButtonProps>(
  ({ title, subtitle, iconName, gradientType, onPress, styles }) => {
    const iconStyle = styles.featureIcon as TextStyle;

    const bgStyle = useMemo(() => {
      const styleMap: Record<string, any> = {
        writing: styles.featureWriting,
        journey: styles.featureJourney,
        ranking: styles.featureRanking,
        progress: styles.featureProgress,
        alphabet: styles.featureAlphabet,
        achievements: styles.featureAchievements,
      };
      return styleMap[gradientType] || styles.featureJourney;
    }, [gradientType, styles]);

    return (
      <AccessibleButton
        accessibilityText={`${title}. ${subtitle}`}
        onPress={onPress}
        style={styles.featureButton}
      >
        <View style={[styles.featureIconContainer, bgStyle]} accessible={false}>
          <MaterialCommunityIcons
            name={iconName}
            size={iconStyle.fontSize}
            color="#FFFFFF"
            accessible={false}
          />
        </View>
        <View accessible={false}>
          <Text style={styles.featureTitle} accessible={false}>
            {title}
          </Text>
          <Text style={styles.featureSubtitle} accessible={false}>
            {subtitle}
          </Text>
        </View>
      </AccessibleButton>
    );
  }
);

const ModuleItem = React.memo<ModuleItemProps>(
  ({ module, completed, isLocked, onPress, styles }) => {
    const iconStyle = styles.moduleIcon as TextStyle;
    const lockIconStyle = styles.lockIcon as TextStyle;

    const iconMap: React.ComponentProps<
      typeof MaterialCommunityIcons
    >["name"][] = ["alphabet-latin", "hand-wave-outline", "star-box-outline"];

    const iconName = iconMap[module.moduleId - 1] ?? "book-outline";
    const statusText = completed
      ? "Concluído"
      : isLocked
      ? "Bloqueado"
      : "Disponível";

    return (
      <AccessibleButton
        accessibilityText={`Módulo ${module.moduleId}. ${statusText}.`}
        onPress={onPress}
        disabled={isLocked}
        style={[styles.moduleItem, isLocked && { opacity: 0.6 }]}
      >
        <View style={styles.moduleIconContainer} accessible={false}>
          <MaterialCommunityIcons
            name={iconName}
            size={iconStyle.fontSize}
            color={iconStyle.color}
            accessible={false}
          />
        </View>
        <View style={styles.moduleTextContainer} accessible={false}>
          <Text style={styles.moduleTitle} accessible={false}>
            Módulo {module.moduleId}
          </Text>
        </View>
        {isLocked ? (
          <MaterialCommunityIcons
            name="lock-outline"
            size={lockIconStyle.fontSize}
            color={lockIconStyle.color}
            accessible={false}
          />
        ) : (
          <View
            style={[
              styles.moduleStatusIndicator,
              { backgroundColor: completed ? "#4CD964" : "#FFCC00" },
            ]}
            accessible={false}
          />
        )}
      </AccessibleButton>
    );
  }
);

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

  const styles = useMemo(
    () =>
      createStyles(
        theme,
        fontSizeMultiplier,
        isBoldTextEnabled,
        isDyslexiaFontEnabled,
        lineHeightMultiplier,
        letterSpacing
      ),
    [
      theme,
      fontSizeMultiplier,
      isBoldTextEnabled,
      isDyslexiaFontEnabled,
      lineHeightMultiplier,
      letterSpacing,
    ]
  );

  const [welcomeMessageShown, setWelcomeMessageShown] = useState(false);
  const { showModal } = useModalStore();
  const { pendingNotification, dequeueNotification } =
    useNotificationQueueStore();

  useFocusEffect(
    useCallback(() => {
      if (pendingNotification) {
        showModal(pendingNotification.title, pendingNotification.message);
        dequeueNotification();
      }
    }, [pendingNotification, showModal, dequeueNotification])
  );

  useEffect(() => {
    if (dbUser && !welcomeMessageShown && !pendingNotification) {
      const timer = setTimeout(() => {
        showModal(
          `🎉 Seja Bem-Vindo(a)!`,
          `Olá, ${dbUser.name}! Estamos felizes em ver você por aqui.`
        );
        setWelcomeMessageShown(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [dbUser, welcomeMessageShown, pendingNotification, showModal]);

  const fetchData = useCallback(async () => {
    if (!user?.userId) {
      setLoadingUser(false);
      return;
    }

    const now = Date.now();
    if (userCache && now - userCacheTime < USER_CACHE_TTL) {
      setDbUser(userCache);
      setLoadingUser(false);
      return;
    }

    setLoadingUser(true);
    try {
      const uResult = await progressService.getUserById(user.userId);
      const userData = uResult as APIt.User | null;
      userCache = userData;
      userCacheTime = now;
      setDbUser(userData);
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

  const canStartModule = useCallback(
    (moduleId: number, completedModules: number[]): boolean => {
      if (moduleId === 1) return true;
      return completedModules.includes(moduleId - 1);
    },
    []
  );

  const openModule = useCallback(
    async (moduleId: number, completedModules: number[]) => {
      if (!user?.userId) return;
      const allowed = canStartModule(moduleId, completedModules);
      if (!allowed) {
        Alert.alert("Bloqueado", "Conclua o módulo anterior para avançar.");
        return;
      }
      navigation.navigate("ModuleContent", { moduleId: String(moduleId) });
    },
    [user?.userId, canStartModule, navigation]
  );

  const handleLogout = useCallback(() => {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => signOut() },
    ]);
  }, [signOut]);

  const completedModuleNumbers = useMemo(() => {
    const rawModules = dbUser?.modulesCompleted;
    if (Array.isArray(rawModules)) {
      return rawModules.filter((n): n is number => typeof n === "number");
    }
    return [];
  }, [dbUser?.modulesCompleted]);

  const statsData = useMemo(
    () => [
      {
        iconName: "hand-coin" as const,
        value: dbUser?.coins ?? 0,
        label: "Moedas",
      },
      {
        iconName: "trophy-variant" as const,
        value: (dbUser?.points ?? 0).toLocaleString("pt-BR"),
        label: "Pontos",
      },
      {
        iconName: "book-multiple" as const,
        value: `${completedModuleNumbers.length}/${DEFAULT_MODULES.length}`,
        label: "Módulos",
      },
    ],
    [dbUser?.coins, dbUser?.points, completedModuleNumbers.length]
  );

  const featuresData = useMemo(
    () => [
      {
        title: "Escrita",
        subtitle: "Teste sua velocidade",
        iconName: "keyboard-variant" as const,
        gradientType: "writing",
        screen: "WritingChallengeIntro" as const,
      },
      {
        title: "Jornada",
        subtitle: "Seu caminho",
        iconName: "road-variant" as const,
        gradientType: "journey",
        screen: "LearningPath" as const,
      },
      {
        title: "Ranking",
        subtitle: "Líderes",
        iconName: "podium-gold" as const,
        gradientType: "ranking",
        screen: "Ranking" as const,
      },
      {
        title: "Progresso",
        subtitle: "Estatísticas",
        iconName: "rocket-launch-outline" as const,
        gradientType: "progress",
        screen: "Progress" as const,
      },
      {
        title: "Alfabeto",
        subtitle: "Referência Braille",
        iconName: "alphabetical" as const,
        gradientType: "alphabet",
        screen: "AlphabetSections" as const,
      },
      {
        title: "Conquistas",
        subtitle: "Suas medalhas",
        iconName: "medal-outline" as const,
        gradientType: "achievements",
        screen: "Achievements" as const,
      },
    ],
    []
  );

  const modulesData = useMemo(
    () =>
      DEFAULT_MODULES.map((item) => ({
        ...item,
        completed: completedModuleNumbers.includes(item.moduleId),
        isLocked: !canStartModule(item.moduleId, completedModuleNumbers),
      })),
    [completedModuleNumbers, canStartModule]
  );

  if (loadingUser || !dbUser) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  // Header com Stats centralizados
  const ListHeader = (
    <>
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

      {/* ✅ Centralização: Usando View simples com flex e justify */}
      <View style={styles.statsWrapper}>
        {statsData.map((stat, index) => (
          <StatCard
            key={stat.label}
            iconName={stat.iconName}
            value={stat.value}
            label={stat.label}
            styles={styles}
          />
        ))}
      </View>

      <View style={styles.modulesSection}>
        <View style={styles.modulesSectionHeader}>
          <Text style={styles.modulesTitle}>Seus Módulos</Text>
          <AccessibleButton
            onPress={() => navigation.navigate("Settings")}
            style={styles.smallButton}
            accessibilityText="Configurações do aplicativo"
          >
            <MaterialCommunityIcons
              name="cog"
              size={(styles.smallIcon as TextStyle).fontSize}
              color={(styles.smallIcon as TextStyle).color}
            />
          </AccessibleButton>
        </View>
      </View>
    </>
  );

  // Footer com Features
  const ListFooter = (
    <View style={styles.featuresSection}>
      <View style={styles.featuresRow}>
        {featuresData.map((feature, index) => (
          <FeatureButton
            key={feature.title}
            {...feature}
            onPress={() => navigation.navigate(feature.screen)}
            styles={styles}
          />
        ))}
      </View>
    </View>
  );

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

      <FlatList
        data={modulesData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ModuleItem
            module={item}
            completed={item.completed}
            isLocked={item.isLocked}
            onPress={() => openModule(item.moduleId, completedModuleNumbers)}
            styles={styles}
          />
        )}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        // Props de otimização
        removeClippedSubviews={Platform.OS === "android"}
        initialNumToRender={4}
        maxToRenderPerBatch={3}
        windowSize={5}
      />
    </View>
  );
};

export default HomeScreen;

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
    },
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingBottom: 40 },
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
    },
    headerSubtitle: {
      fontSize: 13 * fontMultiplier,
      color: theme.text,
      opacity: 0.8,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    headerIcon: {
      backgroundColor: theme.button ?? "#191970",
      borderRadius: 10,
      padding: 6,
    },
    // ✅ Estilo novo para centralizar Stats
    statsWrapper: {
      flexDirection: "row",
      justifyContent: "center", // Centraliza horizontalmente
      alignItems: "center",
      gap: 12, // Espaçamento entre os cards
      marginVertical: 16,
      paddingHorizontal: 16,
    },
    statCard: {
      width: BOX_SIZE,
      height: BOX_SIZE,
      backgroundColor: theme.card,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      padding: 4,
      // Sombra leve para destaque
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    statIcon: {
      fontSize: 24 * fontMultiplier,
      color: theme.cardText,
    } as TextStyle,
    statValue: {
      color: theme.cardText,
      fontSize: 14 * fontMultiplier,
      fontWeight: isBold ? "900" : "bold",
      marginTop: 4,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
    },
    statLabel: {
      color: theme.cardText,
      fontSize: 10 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    modulesSection: { paddingHorizontal: 16, marginBottom: 12 },
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
    moduleItem: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 14,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      marginHorizontal: 16,
      elevation: 1,
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
    moduleTextContainer: { flex: 1, justifyContent: "center" },
    moduleTitle: {
      color: theme.cardText,
      fontSize: 14 * fontMultiplier,
      fontWeight: isBold ? "900" : "bold",
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
    featuresSection: { paddingHorizontal: 16, marginTop: 12 },
    // Ajustado para wrap (quebra de linha) para usar com map
    featuresRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: GAP_SIZE,
    },
    featureButton: {
      width: FEATURE_BUTTON_WIDTH,
      height: FEATURE_BUTTON_HEIGHT,
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 12,
      justifyContent: "space-between",
      marginBottom: GAP_SIZE, // Espaço vertical entre linhas
      elevation: 2,
    },
    featureIconContainer: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: "center",
      alignItems: "center",
    },
    featureWriting: { backgroundColor: "#FF6B6B" },
    featureJourney: { backgroundColor: "#4ECDC4" },
    featureRanking: { backgroundColor: "#FFD93D" },
    featureProgress: { backgroundColor: "#6C5CE7" },
    featureAlphabet: { backgroundColor: "#54A0FF" },
    featureAchievements: { backgroundColor: "#FA8231" },
    featureIcon: {
      fontSize: 24 * fontMultiplier,
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
      fontSize: 10 * fontMultiplier,
      opacity: 0.7,
      marginTop: 2,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });
