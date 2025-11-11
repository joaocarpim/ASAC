import React, { useState, useCallback, useEffect, useRef } from "react";
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

// IMPORTAR OS STORES E O ÁUDIO
import { useModalStore } from "../../store/useModalStore";
import { useNotificationQueueStore } from "../../store/useNotificationQueueStore";
import { Audio } from "expo-av";

/* ===========================
    Estilos
   =========================== */
const BOX_SIZE = 85;

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
      fontSize: 26 * fontMultiplier,
      color: theme.cardText,
    } as TextStyle,
    statValue: {
      color: theme.cardText,
      fontSize: 17 * fontMultiplier,
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

    // ✅ ESTILO DO CONTAINER CORRIGIDO
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "center", // Centraliza os botões na linha
      alignItems: "center",
      flexWrap: "wrap", // Permite quebrar a linha
      gap: 8, // Espaço entre os botões
      alignSelf: "center",
      paddingBottom: 70, // Espaçamento inferior

      // Define a largura exata para 3 botões (85*3) + 2 vãos (8*2)
      width: BOX_SIZE * 3 + 8 * 2, // = 271
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
      fontSize: 26 * fontMultiplier,
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
    Tipagens e Subcomponentes
   =========================== */
// ... (Subcomponentes StatCard, ActionButton, ModuleItem permanecem iguais)
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
      {" "}
      <MaterialCommunityIcons
        name={iconName}
        size={iconStyle.fontSize}
        color={iconStyle.color}
      />{" "}
      <Text style={styles.statValue}>{value}</Text>{" "}
      <Text style={styles.statLabel}>{label}</Text>{" "}
    </AccessibleView>
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
      {" "}
      <MaterialCommunityIcons
        name={iconName}
        size={iconStyle.fontSize}
        color={iconStyle.color}
      />{" "}
      <Text style={styles.actionLabel}>{label}</Text>{" "}
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
      {" "}
      <View style={styles.moduleIconContainer}>
        {" "}
        <MaterialCommunityIcons
          name={iconName}
          size={iconStyle.fontSize}
          color={iconStyle.color}
        />{" "}
      </View>{" "}
      <View style={styles.moduleTextContainer}>
        {" "}
        <Text style={styles.moduleTitle}>Módulo {module.moduleId}</Text>{" "}
        <Text style={styles.moduleSubtitle}>{module.title}</Text>{" "}
      </View>{" "}
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
      )}{" "}
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

  // EFEITO PARA MOSTRAR A MENSAGEM DE BOAS-VINDAS (agora sem som)
  useEffect(() => {
    if (dbUser && !welcomeMessageShown && !pendingNotification) {
      const title = `🎉 Seja Bem-Vindo(a)!`;
      const message = `Olá, ${dbUser.name}! Estamos felizes em ver você por aqui.`;

      const showWelcomeModal = () => {
        // Apenas chama o modal. O modal vai tocar o seu próprio som.
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
            size={26}
            color={theme.buttonText ?? "#FFFFFF"}
          />
        </AccessibleButton>
      </View>
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
      <FlatList
        data={DEFAULT_MODULES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isCompleted = completedModuleNumbers.includes(item.moduleId);
          const isLocked = !canStartModule(
            item.moduleId,
            completedModuleNumbers
          );
          return (
            <ModuleItem
              module={item}
              completed={isCompleted}
              isLocked={isLocked}
              onPress={() => openModule(item.moduleId, completedModuleNumbers)}
              styles={styles}
            />
          );
        }}
        contentContainerStyle={styles.modulesList}
      />

      {/* A ordem dos botões já está correta (4º item é o Progresso) */}
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
        <ActionButton
          iconName="alphabetical"
          label="Alfabeto"
          onPress={() => navigation.navigate("AlphabetSections")}
          styles={styles}
        />
        <ActionButton
          iconName="cog"
          label="Configs"
          onPress={() => navigation.navigate("Settings")}
          styles={styles}
        />
      </View>
    </View>
  );
};

export default HomeScreen;
