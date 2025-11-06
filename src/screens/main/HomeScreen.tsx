// src/screens/main/HomeScreen.tsx

import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Alert,
  ActivityIndicator,
  FlatList,
  Platform,
  TextStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as APIt from "../../API";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";

import {
  getUserById,
  canStartModule,
  ensureUserInDB,
} from "../../services/progressService";

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

/* ===========================
   Estilos (criado antes da tipagem para evitar forward-ref TS)
   =========================== */

const BOX_SIZE = 90;

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

    container: { flex: 1, backgroundColor: theme.background },

    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
      paddingHorizontal: 20,
    },

    headerTitle: {
      fontSize: 24 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 24 * fontMultiplier * lineHeightMultiplier,
      letterSpacing,
    },

    headerSubtitle: {
      fontSize: 14 * fontMultiplier,
      color: theme.text,
      opacity: 0.8,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 14 * fontMultiplier * lineHeightMultiplier,
      letterSpacing,
    },

    headerIcon: {
      backgroundColor: theme.button ?? "#191970",
      borderRadius: 12,
      padding: 6,
    },

    statsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      alignSelf: "center",
      marginVertical: 14,
    },

    statCard: {
      width: BOX_SIZE,
      height: BOX_SIZE,
      backgroundColor: theme.card,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      padding: 6,
    },

    statIcon: {
      fontSize: 28 * fontMultiplier,
      color: theme.cardText,
    } as TextStyle,

    statValue: {
      color: theme.cardText,
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "900" : "bold",
      marginTop: 2,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },

    statLabel: {
      color: theme.cardText,
      fontSize: 11 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },

    modulesList: { paddingHorizontal: 20, paddingBottom: 10, gap: 8 },

    moduleItem: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
    },

    moduleIconContainer: {
      backgroundColor: theme.background,
      borderRadius: 25,
      padding: 8,
      marginRight: 12,
    },

    moduleIcon: {
      fontSize: 24 * fontMultiplier,
      color: theme.text,
    } as TextStyle,

    moduleTextContainer: { flex: 1 },

    moduleTitle: {
      color: theme.cardText,
      fontSize: 14 * fontMultiplier,
      fontWeight: isBold ? "900" : "bold",
      marginBottom: 2,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },

    moduleSubtitle: {
      color: theme.cardText,
      fontSize: 12 * fontMultiplier,
      opacity: 0.9,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },

    moduleStatusIndicator: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginLeft: 10,
    },

    lockIcon: {
      fontSize: 26 * fontMultiplier,
      color: theme.text,
      marginLeft: 10,
    } as TextStyle,

    actionsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      margin: 5,
      alignSelf: "center",
      paddingBottom: 70,
      paddingHorizontal: 20,
    },

    actionButton: {
      width: BOX_SIZE,
      height: BOX_SIZE,
      backgroundColor: theme.card,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
      padding: 6,
    },

    actionIcon: {
      fontSize: 28 * fontMultiplier,
      color: theme.cardText,
    } as TextStyle,

    actionLabel: {
      color: theme.cardText,
      fontSize: 11 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });

/* ===========================
   Tipagens (agora que createStyles existe)
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

/* ---------- SUBCOMPONENTES ---------- */

const StatCard: React.FC<StatCardProps> = ({ iconName, value, label, styles }) => {
  const iconStyle = styles.statIcon as TextStyle;
  return (
    <AccessibleView accessibilityText={`${label}: ${value}.`} style={styles.statCard}>
      <MaterialCommunityIcons name={iconName} size={iconStyle.fontSize} color={iconStyle.color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </AccessibleView>
  );
};

const ActionButton: React.FC<ActionButtonProps> = ({ iconName, label, onPress, styles }) => {
  const iconStyle = styles.actionIcon as TextStyle;
  return (
    <AccessibleButton accessibilityText={`${label}. Toque para abrir.`} onPress={onPress} style={styles.actionButton}>
      <MaterialCommunityIcons name={iconName} size={iconStyle.fontSize} color={iconStyle.color} />
      <Text style={styles.actionLabel}>{label}</Text>
    </AccessibleButton>
  );
};

const ModuleItem: React.FC<ModuleItemProps> = ({ module, completed, isLocked, onPress, styles }) => {
  const iconStyle = styles.moduleIcon as TextStyle;
  const lockIconStyle = styles.lockIcon as TextStyle;
  // icons preparados: módulo 1, 2, 3
  const iconMap: React.ComponentProps<typeof MaterialCommunityIcons>["name"][] = [
    "alphabet-latin",
    "hand-wave-outline",
    "star-box-outline",
  ];

  const iconName = iconMap[module.moduleId - 1] ?? ("book-outline" as React.ComponentProps<typeof MaterialCommunityIcons>["name"]);

  return (
    <AccessibleButton
      accessibilityText={`Módulo ${module.moduleId}. ${completed ? "Concluído" : isLocked ? "Bloqueado" : "Disponível"}.`}
      onPress={onPress}
      disabled={isLocked}
      style={[styles.moduleItem, isLocked && { opacity: 0.55 }]}
    >
      <View style={styles.moduleIconContainer}>
        <MaterialCommunityIcons name={iconName} size={iconStyle.fontSize} color={iconStyle.color} />
      </View>
      <View style={styles.moduleTextContainer}>
        <Text style={styles.moduleTitle}>Módulo {module.moduleId}</Text>
        <Text style={styles.moduleSubtitle}>{module.title}</Text>
      </View>
      {isLocked ? (
        <MaterialCommunityIcons name="lock-outline" size={lockIconStyle.fontSize} color={lockIconStyle.color} />
      ) : (
        <View style={[styles.moduleStatusIndicator, { backgroundColor: completed ? "#4CD964" : "#FFCC00" }]} />
      )}
    </AccessibleButton>
  );
};

/* ---------- COMPONENTE PRINCIPAL ---------- */

const HomeScreen: React.FC<NativeStackScreenProps<RootStackParamList, "Home">> = ({ navigation }) => {
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

  const fetchData = useCallback(async () => {
    if (!user?.userId) {
      setLoadingUser(false);
      return;
    }
    setLoadingUser(true);

    try {
      let uResult = await getUserById(user.userId);
      if (!uResult && user.email && user.name) {
        uResult = await ensureUserInDB(user.userId, user.name, user.email);
      }
      setDbUser(uResult);
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
      setDbUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, [user?.userId, user?.email, user?.name]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const openModule = async (moduleId: number) => {
    if (!user?.userId) return;
    const allowed = await canStartModule(user.userId, moduleId);
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  /* ✅ Parsing seguro de modulesCompleted (pode ser array, string JSON, etc.) */
  const rawModules = (() => {
    const m = dbUser.modulesCompleted ?? [];
    if (Array.isArray(m)) return m;
    if (typeof m === "string") {
      try {
        const parsed = JSON.parse(m);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // string simples com separador?
        return m.split?.(",").map((s: string) => parseInt(String(s).trim(), 10)).filter((n: number) => !isNaN(n)) ?? [];
      }
    }
    return [];
  })();

  const completedModuleNumbers: number[] = Array.from(
    new Set(
      rawModules.map((item: any) => {
        if (typeof item === "number") return item;
        if (typeof item === "string") {
          const n = parseInt(item, 10);
          return isNaN(n) ? NaN : n;
        }
        if (item && typeof item === "object" && typeof item.moduleNumber === "number") {
          return item.moduleNumber;
        }
        return NaN;
      })
    )
  ).filter((n) => !isNaN(n));

  const completedCount = completedModuleNumbers.length;
  const modulesProgressString = `${completedCount}/${DEFAULT_MODULES.length}`;

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }]}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} />

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
          <MaterialCommunityIcons name="logout" size={26} color={theme.buttonText ?? "#FFFFFF"} />
        </AccessibleButton>
      </View>

      <View style={styles.statsContainer}>
        <StatCard iconName="hand-coin" value={dbUser.coins ?? 0} label="Moedas" styles={styles} />
        <StatCard iconName="trophy-variant" value={(dbUser.points ?? 0).toLocaleString("pt-BR")} label="Pontos" styles={styles} />
        <StatCard iconName="book-multiple" value={modulesProgressString} label="Módulos" styles={styles} />
      </View>

      <FlatList
        data={DEFAULT_MODULES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isCompleted = completedModuleNumbers.includes(item.moduleId);
          const isLocked = !isCompleted && item.moduleId > 1 && !completedModuleNumbers.includes(item.moduleId - 1);

          return (
            <ModuleItem
              module={item}
              completed={isCompleted}
              isLocked={isLocked}
              onPress={() => openModule(item.moduleId)}
              styles={styles}
            />
          );
        }}
        contentContainerStyle={styles.modulesList}
      />

      <View style={styles.actionsContainer}>
        <ActionButton iconName="podium-gold" label="Ranking" onPress={() => navigation.navigate("Ranking")} styles={styles} />
        <ActionButton iconName="road-variant" label="Jornada" onPress={() => navigation.navigate("LearningPath")} styles={styles} />
        <ActionButton iconName="medal-outline" label="Conquistas" onPress={() => navigation.navigate("Achievements")} styles={styles} />
        <ActionButton iconName="rocket-launch-outline" label="Progresso" onPress={() => navigation.navigate("Progress")} styles={styles} />
      </View>
    </View>
  );
};

export default HomeScreen;
