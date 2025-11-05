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
// ✅ 1. IMPORTE O DICIONÁRIO BRAILLE PARA USAR NO BOTÃO DE PRÁTICA LIVRE
import { BRAILLE_ALPHABET } from "../../navigation/brailleLetters";

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
  module: { id: string; moduleId: number; title: string; description: string };
  completed: boolean;
  isLocked: boolean;
  onPress: () => void;
  styles: HomeScreenStyles;
}

// --- SUBCOMPONENTES (Corrigidos) ---
const StatCard: React.FC<StatCardProps> = ({
  iconName,
  value,
  label,
  styles,
}) => {
  const accessibilityText = `${label}: ${value}.`;
  const iconStyle = styles.statIcon as TextStyle;
  return (
    <AccessibleView
      accessibilityText={accessibilityText}
      style={styles.statCard}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={iconStyle.fontSize}
        color={iconStyle.color}
      />
      <Text style={styles.statValue}>{value}</Text>
      {/* ✅ CORREÇÃO: Removido o {" "} que estava solto */}
      <Text style={styles.statLabel}>{label}</Text>
    </AccessibleView>
  );
};
const ActionButton: React.FC<ActionButtonProps> = ({
  iconName,
  label,
  onPress,
  styles,
}) => {
  const accessibilityText = `${label}. Toque para abrir.`;
  const iconStyle = styles.actionIcon as TextStyle;
  return (
    <AccessibleButton
      accessibilityText={accessibilityText}
      onPress={onPress}
      style={styles.actionButton}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={iconStyle.fontSize}
        color={iconStyle.color}
      />
      <Text style={styles.actionLabel}>{label}</Text>
      {/* ✅ CORREÇÃO: Removido o {" "} que estava solto */}
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
  const status = completed ? "Concluído" : isLocked ? "Bloqueado" : "Pendente";
  const accessibilityText = `Módulo ${module.moduleId}: ${module.title}, ${module.description}. Status: ${status}. Toque para abrir.`;
  let iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"] =
    "book-outline";
  if (module.moduleId === 1) iconName = "alphabet-latin";
  else if (module.moduleId === 2) iconName = "hand-wave-outline";
  else if (module.moduleId === 3) iconName = "star-box-outline";
  const iconStyle = styles.moduleIcon as TextStyle;
  const lockIconStyle = styles.lockIcon as TextStyle;
  return (
    <AccessibleButton
      accessibilityText={accessibilityText}
      onPress={onPress}
      style={[styles.moduleItem, isLocked && { opacity: 0.65 }]}
    >
      <View style={styles.moduleIconContainer}>
        <MaterialCommunityIcons
          name={iconName}
          size={iconStyle.fontSize}
          color={iconStyle.color}
        />
      </View>
      {/* ✅ CORREÇÃO: Removido o {" "} que estava solto */}
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

// --- COMPONENTE PRINCIPAL ---
const HomeScreen: React.FC<
  NativeStackScreenProps<RootStackParamList, "Home">
> = ({ navigation }) => {
  const { user, signOut } = useAuthStore();
  const [loadingUser, setLoadingUser] = useState(true);
  const [dbUser, setDbUser] = useState<APIt.User | null>(null);
  const [loadingModules, setLoadingModules] = useState(true);

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

  // ... (toda a lógica de fetchData, useFocusEffect, openModule, handleLogout, e verificações de loading permanece exatamente a mesma) ...
  const fetchData = useCallback(async () => {
    if (!user?.userId) {
      setLoadingUser(false);
      setLoadingModules(false);
      return;
    }
    setLoadingUser(true);
    setLoadingModules(true);
    try {
      let uResult = await getUserById(user.userId);
      if (!uResult && user.email && user.name) {
        console.log("⚠️ Usuário não encontrado no DB, criando...");
        uResult = await ensureUserInDB(user.userId, user.name, user.email);
      }
      setDbUser(uResult);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      Alert.alert("Erro", "Não foi possível carregar o perfil do usuário.");
      setDbUser(null);
    } finally {
      setLoadingUser(false);
      setLoadingModules(false);
    }
  }, [user?.userId, user?.email, user?.name]);
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const performFetch = async () => {
        if (isActive) {
          setLoadingUser(true);
          setLoadingModules(true);
        }
        await fetchData();
      };
      performFetch();
      return () => {
        isActive = false;
      };
    }, [fetchData])
  );
  const openModule = async (moduleId: number) => {
    if (!user?.userId || moduleId === 0) return;
    const allowed = await canStartModule(user.userId, moduleId);
    if (!allowed) {
      Alert.alert("Bloqueado", "Conclua o módulo anterior para avançar.");
      return;
    }
    navigation.navigate("ModuleContent", { moduleId: String(moduleId) });
  };
  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair do aplicativo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => signOut() },
    ]);
  };
  if (loadingUser || !user) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }
  if (!dbUser && !loadingUser) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <Text style={{ color: theme.text }}>
          {" "}
          Erro ao carregar dados do perfil.{" "}
        </Text>
      </View>
    );
  }
  const modulesData = dbUser?.modulesCompleted ?? [];
  let completedModuleNumbers: number[] = [];
  if (modulesData) {
    if (typeof modulesData === "string") {
      completedModuleNumbers = modulesData
        .split(",")
        .map((num) => parseInt(num.trim(), 10))
        .filter((num) => !isNaN(num));
    } else if (Array.isArray(modulesData)) {
      completedModuleNumbers = modulesData
        .map((item) => {
          if (typeof item === "number") return item;
          if (typeof item === "string") return parseInt(item, 10);
          if (typeof item === "object" && (item as any).moduleNumber)
            return (item as any).moduleNumber;
          return NaN;
        })
        .filter((num) => !isNaN(num));
    }
  }
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
        translucent={Platform.OS === "android"}
      />
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <AccessibleHeader level={1} style={styles.headerTitle}>
              Olá, {dbUser?.name || user.name || "Usuário"}!
            </AccessibleHeader>
            <AccessibleText baseSize={16} style={styles.headerSubtitle}>
              Continue aprendendo com ASAC
            </AccessibleText>
          </View>
          <AccessibleButton
            accessibilityText="Sair do aplicativo"
            onPress={handleLogout}
            style={styles.headerIcon}
          >
            <MaterialCommunityIcons
              name="logout"
              size={28}
              color={theme.buttonText ?? "#FFFFFF"}
            />
          </AccessibleButton>
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            iconName="hand-coin"
            value={dbUser?.coins ?? 0}
            label="Moedas"
            styles={styles}
          />
          <StatCard
            iconName="trophy-variant"
            value={(dbUser?.points ?? 0).toLocaleString("pt-BR")}
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

        <View style={{ flex: 1 }}>
          <View style={styles.sectionHeader}>
            <AccessibleHeader level={2} style={styles.sectionTitle}>
              Módulos de Aprendizado
            </AccessibleHeader>
            <View style={styles.sectionHeaderIcons}>
              <AccessibleButton
                onPress={() => navigation.navigate("Alphabet")}
                accessibilityText="Botão: Abrir aprendizado do alfabeto Braille"
              >
                <MaterialCommunityIcons
                  name="dots-horizontal-circle-outline"
                  size={32}
                  color={theme.text}
                />
              </AccessibleButton>
              <AccessibleButton
                onPress={() => navigation.navigate("Settings")}
                accessibilityText="Botão: Abrir configurações do aplicativo"
              >
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={32}
                  color={theme.text}
                />
              </AccessibleButton>
            </View>
          </View>

          <FlatList
            data={DEFAULT_MODULES}
            keyExtractor={(item) => item.id}
            renderItem={({ item: module }) => {
              const isLocked =
                module.moduleId > 1 &&
                !completedModuleNumbers.includes(module.moduleId - 1);
              const isCompleted = completedModuleNumbers.includes(
                module.moduleId
              );
              return (
                <ModuleItem
                  module={module}
                  completed={isCompleted}
                  isLocked={isLocked}
                  onPress={() => openModule(module.moduleId)}
                  styles={styles}
                />
              );
            }}
            contentContainerStyle={styles.modulesList}
          />
        </View>

        {/* ✅ 2. CONTAINER DE AÇÕES ATUALIZADO COM OS NOVOS BOTÕES */}
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
      </View>
    </View>
  );
};

// --- ESTILOS (sem alterações, mas o ActionButton para "Conquistas" foi removido como no seu código original) ---
const BOX_SIZE = 90;
const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexiaFontEnabled: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number
): StyleSheet.NamedStyles<any> =>
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
      fontWeight: isBold ? "bold" : "normal",
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
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
      marginTop: 10,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 17 * fontMultiplier,
      fontWeight: isBold ? "900" : "bold",
      color: theme.text,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    sectionHeaderIcons: { flexDirection: "row", gap: 12 },
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

export default HomeScreen;
