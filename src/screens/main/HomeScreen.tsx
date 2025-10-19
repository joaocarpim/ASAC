// src/screens/home/HomeScreen.tsx

import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { getUserById, canStartModule } from "../../services/progressService";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleText,
  AccessibleHeader,
  AccessibleButton,
} from "../../components/AccessibleComponents";

// --- SUB-COMPONENTES PARA ORGANIZAÇÃO (sem alterações) ---

const StatCard: React.FC<{
  iconName: any;
  value: string | number;
  label: string;
  styles: any;
}> = ({ iconName, value, label, styles }) => {
  const accessibilityText = `${label}: ${value}.`;
  return (
    <AccessibleView
      accessibilityText={accessibilityText}
      style={styles.statCard}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={styles.statIcon.fontSize}
        color={styles.statIcon.color}
      />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </AccessibleView>
  );
};

const ModuleItem: React.FC<{
  iconName: any;
  title: string;
  subtitle: string;
  completed: boolean;
  onPress: () => void;
  styles: any;
}> = ({ iconName, title, subtitle, completed, onPress, styles }) => {
  const status = completed ? "Concluído" : "Não concluído";
  const accessibilityText = `${title}, ${subtitle}. Status: ${status}. Toque para abrir.`;

  return (
    <AccessibleButton
      accessibilityText={accessibilityText}
      onPress={onPress}
      style={styles.moduleItem}
    >
      <View style={styles.moduleIconContainer}>
        <MaterialCommunityIcons
          name={iconName}
          size={styles.moduleIcon.fontSize}
          color={styles.moduleIcon.color}
        />
      </View>
      <View style={styles.moduleTextContainer}>
        <Text style={styles.moduleTitle}>{title}</Text>
        <Text style={styles.moduleSubtitle}>{subtitle}</Text>
      </View>
      <View
        style={[
          styles.moduleStatusIndicator,
          { backgroundColor: completed ? "#4CD964" : "#FFCC00" },
        ]}
      />
    </AccessibleButton>
  );
};

const ActionButton: React.FC<{
  iconName: any;
  label: string;
  onPress: () => void;
  styles: any;
}> = ({ iconName, label, onPress, styles }) => {
  const accessibilityText = `${label}. Toque para abrir.`;
  return (
    <AccessibleButton
      accessibilityText={accessibilityText}
      onPress={onPress}
      style={styles.actionButton}
    >
      <MaterialCommunityIcons
        name={iconName}
        size={styles.actionIcon.fontSize}
        color={styles.actionIcon.color}
      />
      <Text style={styles.actionLabel}>{label}</Text>
    </AccessibleButton>
  );
};

// --- COMPONENTE PRINCIPAL ---

const HomeScreen: React.FC<
  NativeStackScreenProps<RootStackParamList, "Home">
> = ({ navigation }) => {
  const { user, signOut, refreshUserFromDB } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dbUser, setDbUser] = useState<any>(null);

  const { theme } = useContrast();
  // 🔹 1. Obter as configurações que faltavam
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled,
    lineHeightMultiplier, // Adicionado
    letterSpacing, // Adicionado
  } = useSettings();

  // Passar as novas configurações para a função de estilos
  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled,
    lineHeightMultiplier, // Adicionado
    letterSpacing // Adicionado
  );

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
          const u = await getUserById(user.userId);
          setDbUser(u);
          await refreshUserFromDB();
        } catch (error) {
          Alert.alert("Erro", "Não foi possível carregar os dados do usuário.");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, [user])
  );
  // ... (O restante do código do componente permanece o mesmo)
  const openModule = async (moduleNumber: number) => {
    if (!user) return;
    const allowed = await canStartModule(user.userId, moduleNumber);
    if (!allowed) {
      Alert.alert("Bloqueado", "Conclua o módulo anterior para avançar.");
      return;
    }
    navigation.navigate("ModuleContent", { moduleId: moduleNumber });
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente sair do aplicativo?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => signOut() },
    ]);
  };

  if (loading || !dbUser || !user) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  const [completedCount] = (dbUser.modulesCompleted || "0/3")
    .split("/")
    .map(Number);

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.background}
      />
      <View style={styles.container}>
        {/* --- CABEÇALHO --- */}
        <View style={styles.header}>
          <View>
            <AccessibleHeader level={1} style={styles.headerTitle}>
              Olá, {dbUser.name || user.name}!
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
              color={theme.buttonText}
            />
          </AccessibleButton>
        </View>

        {/* --- ESTATÍSTICAS --- */}
        <View style={styles.statsContainer}>
          <StatCard
            iconName="coin"
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
            value={dbUser.modulesCompleted || "0/3"}
            label="Módulos"
            styles={styles}
          />
        </View>

        {/* --- MÓDULOS --- */}
        <View>
          <View style={styles.sectionHeader}>
            <AccessibleHeader level={2} style={styles.sectionTitle}>
              Módulos de Aprendizado
            </AccessibleHeader>

            <AccessibleView
              style={styles.sectionHeaderIcons}
              accessibilityText="Ações rápidas. Contém botões para o alfabeto e configurações."
            >
              <AccessibleButton
                onPress={() => navigation.navigate("Braille")}
                accessibilityText="Botão: Abrir alfabeto Braille"
              >
                <MaterialCommunityIcons
                  name="book-open-page-variant-outline"
                  size={24}
                  color={theme.text}
                />
              </AccessibleButton>

              <AccessibleButton
                onPress={() => navigation.navigate("Settings")}
                accessibilityText="Botão: Abrir configurações do aplicativo"
              >
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={24}
                  color={theme.text}
                />
              </AccessibleButton>
            </AccessibleView>
          </View>

          <View style={styles.modulesList}>
            <ModuleItem
              iconName="alphabet-latin"
              title="Módulo 1"
              subtitle="Alfabeto Completo"
              completed={completedCount >= 1}
              onPress={() => openModule(1)}
              styles={styles}
            />
            <ModuleItem
              iconName="hand-wave-outline"
              title="Módulo 2"
              subtitle="Palavras em Braille"
              completed={completedCount >= 2}
              onPress={() => openModule(2)}
              styles={styles}
            />
            <ModuleItem
              iconName="star-box-outline"
              title="Módulo 3"
              subtitle="Formule Frases"
              completed={completedCount >= 3}
              onPress={() => openModule(3)}
              styles={styles}
            />
          </View>
        </View>

        {/* --- AÇÕES --- */}
        <View style={styles.actionsContainer}>
          <ActionButton
            iconName="podium-gold"
            label="Ranking"
            onPress={() => navigation.navigate("Ranking")}
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

// --- ESTILOS (ATUALIZADOS) ---
const BOX_SIZE = 90;

// 🔹 2. Atualizar a função de estilos para receber as novas configurações
const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexiaFontEnabled: boolean,
  lineHeightMultiplier: number, // Adicionado
  letterSpacing: number // Adicionado
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 10,
      gap: 14,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 24 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 24 * fontMultiplier * lineHeightMultiplier, // Aplicado
      letterSpacing: letterSpacing, // Aplicado
    },
    headerSubtitle: {
      fontSize: 14 * fontMultiplier,
      color: theme.text,
      opacity: 0.8,
      fontWeight: isBold ? "bold" : "normal", // 🔹 3. Adicionado para consistência
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 14 * fontMultiplier * lineHeightMultiplier, // Aplicado
      letterSpacing: letterSpacing, // Aplicado
    },
    headerIcon: {
      backgroundColor: theme.button,
      borderRadius: 12,
      padding: 6,
    },
    statsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      alignSelf: "center",
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
    },
    statValue: {
      color: theme.cardText,
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "900" : "bold", // 🔹 3. Adicionado para consistência
      marginTop: 2,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 18 * fontMultiplier * lineHeightMultiplier, // Aplicado
      letterSpacing: letterSpacing, // Aplicado
    },
    statLabel: {
      color: theme.cardText,
      fontSize: 11 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600", // 🔹 3. Adicionado para consistência
      marginTop: 1,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 11 * fontMultiplier * lineHeightMultiplier, // Aplicado
      letterSpacing: letterSpacing, // Aplicado
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    sectionHeaderIcons: {
      flexDirection: "row",
      gap: 12,
    },
    sectionTitle: {
      fontSize: 17 * fontMultiplier,
      fontWeight: isBold ? "900" : "bold", // 🔹 3. Adicionado para consistência
      color: theme.text,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 17 * fontMultiplier * lineHeightMultiplier, // Aplicado
      letterSpacing: letterSpacing, // Aplicado
    },
    modulesList: {
      gap: 8,
    },
    moduleItem: {
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
    },
    moduleIconContainer: {
      backgroundColor: theme.background,
      borderRadius: 25,
      padding: 6,
      marginRight: 8,
    },
    moduleIcon: {
      fontSize: 22 * fontMultiplier,
      color: theme.text,
    },
    moduleTextContainer: {
      flex: 1,
    },
    moduleTitle: {
      color: theme.cardText,
      fontSize: 13 * fontMultiplier,
      fontWeight: isBold ? "900" : "bold", // 🔹 3. Adicionado para consistência
      marginBottom: 1,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 13 * fontMultiplier * lineHeightMultiplier, // Aplicado
      letterSpacing: letterSpacing, // Aplicado
    },
    moduleSubtitle: {
      color: theme.cardText,
      fontSize: 11 * fontMultiplier,
      fontWeight: isBold ? "bold" : "normal", // 🔹 3. Adicionado para consistência
      opacity: 0.9,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 11 * fontMultiplier * lineHeightMultiplier, // Aplicado
      letterSpacing: letterSpacing, // Aplicado
    },
    moduleStatusIndicator: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      alignSelf: "center",
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
    },
    actionLabel: {
      color: theme.cardText,
      fontSize: 11 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600", // 🔹 3. Adicionado para consistência
      marginTop: 1,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 11 * fontMultiplier * lineHeightMultiplier, // Aplicado
      letterSpacing: letterSpacing, // Aplicado
    },
  });

export default HomeScreen;
