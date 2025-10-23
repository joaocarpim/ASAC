import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  Alert,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
  TextStyle,
  ViewStyle,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { generateClient } from 'aws-amplify/api';
import { listModules } from '../../graphql/queries';
import * as APIt from '../../API';

import { RootStackParamList } from "../../navigation/types"; // CONFIRMADO QUE ESTÁ CORRETO
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

// --- TIPOS E INTERFACES ---
type HomeScreenStyles = ReturnType<typeof createStyles>;

interface StatCardProps {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  value: string | number;
  label: string;
  styles: HomeScreenStyles;
}

interface ActionButtonProps {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  onPress: () => void;
  styles: HomeScreenStyles;
}

interface ModuleItemProps {
  module: APIt.Module;
  completed: boolean;
  onPress: () => void;
  styles: HomeScreenStyles;
}

// --- SUB-COMPONENTES CORRIGIDOS ---

const StatCard: React.FC<StatCardProps> = ({ iconName, value, label, styles }) => {
  const accessibilityText = `${label}: ${value}.`;
  const iconStyle = styles.statIcon as TextStyle;
  return (
    <AccessibleView accessibilityText={accessibilityText} style={styles.statCard}>
      <MaterialCommunityIcons name={iconName} size={iconStyle.fontSize} color={iconStyle.color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </AccessibleView>
  );
};

const ActionButton: React.FC<ActionButtonProps> = ({ iconName, label, onPress, styles }) => {
  const accessibilityText = `${label}. Toque para abrir.`;
  const iconStyle = styles.actionIcon as TextStyle;
  return (
    <AccessibleButton accessibilityText={accessibilityText} onPress={onPress} style={styles.actionButton}>
      <MaterialCommunityIcons name={iconName} size={iconStyle.fontSize} color={iconStyle.color} />
      <Text style={styles.actionLabel}>{label}</Text>
    </AccessibleButton>
  );
};

const ModuleItem: React.FC<ModuleItemProps> = ({ module, completed, onPress, styles }) => {
  const status = completed ? "Concluído" : "Não concluído";
  const accessibilityText = `Módulo ${module.moduleNumber}: ${module.title}, ${module.description}. Status: ${status}. Toque para abrir.`;

  let iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'] = "book-outline";
  if (module.moduleNumber === 1) iconName = "alphabet-latin";
  else if (module.moduleNumber === 2) iconName = "hand-wave-outline";
  else if (module.moduleNumber === 3) iconName = "star-box-outline";

  const iconStyle = styles.moduleIcon as TextStyle;

  return (
    <AccessibleButton accessibilityText={accessibilityText} onPress={onPress} style={styles.moduleItem}>
      <View style={styles.moduleIconContainer}>
        <MaterialCommunityIcons name={iconName} size={iconStyle.fontSize} color={iconStyle.color} />
      </View>
      <View style={styles.moduleTextContainer}>
        <Text style={styles.moduleTitle}>Módulo {module.moduleNumber}</Text>
        <Text style={styles.moduleSubtitle}>{module.title}</Text>
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


// --- COMPONENTE PRINCIPAL ---
const HomeScreen: React.FC<NativeStackScreenProps<RootStackParamList, "Home">> = ({ navigation }) => {
  const { user, signOut, refreshUserFromDB } = useAuthStore();
  const [loadingUser, setLoadingUser] = useState(true);
  const [dbUser, setDbUser] = useState<APIt.User | null>(null);
  const [modules, setModules] = useState<APIt.Module[]>([]);
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

  const client = generateClient();

  // Função para buscar dados
  const fetchData = useCallback(async () => {
    if (!user?.userId) {
      setLoadingUser(false);
      setLoadingModules(false);
      return;
    }

    // Define loading no início
    setLoadingUser(true);
    setLoadingModules(true);

    try {
      const [uResult, modulesResult] = await Promise.all([
        getUserById(user.userId),
        client.graphql({ query: listModules })
      ]);

      setDbUser(uResult);

      const fetchedModules = (modulesResult.data?.listModules?.items || [])
        .filter((m): m is APIt.Module => Boolean(m))
        .sort((a, b) => (a.moduleNumber ?? 0) - (b.moduleNumber ?? 0));
      setModules(fetchedModules);

    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados. Verifique sua conexão.");
      setDbUser(null);
      setModules([]);
    } finally {
      setLoadingUser(false);
      setLoadingModules(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]); // Removido 'client' das dependências, ele é estável

  // useFocusEffect chama fetchData
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const performFetch = async () => {
        // Define loading aqui dentro para garantir a cada foco
        if (isActive) {
          setLoadingUser(true);
          setLoadingModules(true);
        }
        await fetchData();
        // fetchData já lida com o fim do loading no finally
      };

      performFetch();

      return () => {
        isActive = false;
      };
    }, [fetchData])
  );


  // Navegação (moduleId já está como string)
  const openModule = async (moduleId: string, moduleNumber: number | null | undefined) => {
    const modNum = moduleNumber ?? 0;
    if (!user?.userId || modNum === 0) return;
    const allowed = await canStartModule(user.userId, modNum);
    if (!allowed) {
      Alert.alert("Bloqueado", "Conclua o módulo anterior para avançar.");
      return;
    }
    navigation.navigate("ModuleContent", { moduleId: moduleId });
  };

  const handleLogout = () => {
     Alert.alert("Sair", "Deseja realmente sair do aplicativo?", [
       { text: "Cancelar", style: "cancel" },
       { text: "Sair", onPress: () => signOut() },
     ]);
   };

  // Loading inicial
  if (loadingUser || !user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }
  // Só mostra erro se dbUser for null APÓS o loading terminar
  if (!dbUser && !loadingUser) {
     return (
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
            <Text style={{color: theme.text}}>Erro ao carregar dados do perfil.</Text>
        </View>
     );
  }

  // ✅ CORREÇÃO FINAL Lógica `modulesCompleted`
  let completedModuleNumbers: number[] = [];
  const modulesData = dbUser?.modulesCompleted;

  if (modulesData) {
    if (typeof modulesData === 'string' && modulesData.length > 0) {
      completedModuleNumbers = modulesData
        .split(',')
        .map(numStr => parseInt(numStr.trim(), 10))
        // Filtra explicitamente por números inteiros
        .filter((num): num is number => Number.isInteger(num));
    } else if (Array.isArray(modulesData)) {
      // Filtra explicitamente por números inteiros
      completedModuleNumbers = modulesData.filter(
        (n): n is number => Number.isInteger(n)
      );
    }
  }
  const completedCount = completedModuleNumbers.length;
  const modulesProgressString = loadingModules ? '...' : `${completedCount}/${modules.length || '?'}`;


  return (
    <View style={[styles.container, {paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0}]}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.background} translucent={Platform.OS === 'android'} />
      <View style={{ flex: 1 }}>
        {/* --- CABEÇALHO --- */}
        <View style={styles.header}>
            <View>
                <AccessibleHeader level={1} style={styles.headerTitle}> Olá, {dbUser?.name || user.name || 'Usuário'}! </AccessibleHeader>
                <AccessibleText baseSize={16} style={styles.headerSubtitle}> Continue aprendendo com ASAC </AccessibleText>
            </View>
            <AccessibleButton accessibilityText="Sair do aplicativo" onPress={handleLogout} style={styles.headerIcon}>
                <MaterialCommunityIcons name="logout" size={28} color={theme.buttonText ?? '#FFFFFF'} />
            </AccessibleButton>
        </View>

        {/* --- ESTATÍSTICAS --- */}
        <View style={styles.statsContainer}>
          <StatCard iconName="hand-coin" value={dbUser?.coins ?? 0} label="Moedas" styles={styles} />
          <StatCard iconName="trophy-variant" value={(dbUser?.points ?? 0).toLocaleString("pt-BR")} label="Pontos" styles={styles} />
          <StatCard iconName="book-multiple" value={modulesProgressString} label="Módulos" styles={styles} />
        </View>

        {/* --- MÓDULOS --- */}
        <View style={{flex: 1}}>
          <View style={styles.sectionHeader}>
            <AccessibleHeader level={2} style={styles.sectionTitle}> Módulos de Aprendizado </AccessibleHeader>
            <View style={styles.sectionHeaderIcons}>
              <AccessibleButton onPress={() => navigation.navigate("Braille")} accessibilityText="Botão: Abrir alfabeto Braille">
                <MaterialCommunityIcons name="book-open-page-variant-outline" size={24} color={theme.text} />
              </AccessibleButton>
              <AccessibleButton onPress={() => navigation.navigate("Settings")} accessibilityText="Botão: Abrir configurações do aplicativo">
                <MaterialCommunityIcons name="cog-outline" size={24} color={theme.text} />
              </AccessibleButton>
            </View>
          </View>

          {loadingModules ? (
            <ActivityIndicator color={theme.text} style={{ marginTop: 20 }}/>
          ) : modules.length === 0 ? (
             <Text style={[styles.sectionTitle, { textAlign: 'center', marginTop: 20, fontStyle: 'italic'}]}>Nenhum módulo disponível.</Text>
          ) : (
            <FlatList
              data={modules}
              keyExtractor={(item) => item.id}
              renderItem={({ item: module }) => (
                <ModuleItem
                  module={module}
                  completed={completedModuleNumbers.includes(module.moduleNumber ?? -1)}
                  onPress={() => openModule(module.id, module.moduleNumber)}
                  styles={styles} // Passa o objeto styles inteiro
                />
              )}
              contentContainerStyle={styles.modulesList}
            />
          )}
        </View>

        {/* --- AÇÕES --- */}
        <View style={styles.actionsContainer}>
          <ActionButton iconName="podium-gold" label="Ranking" onPress={() => navigation.navigate("Ranking")} styles={styles} />
          <ActionButton iconName="medal-outline" label="Conquistas" onPress={() => navigation.navigate("Achievements")} styles={styles} />
          <ActionButton iconName="rocket-launch-outline" label="Progresso" onPress={() => navigation.navigate("Progress")} styles={styles} />
        </View>
      </View>
    </View>
  );
};

// --- ESTILOS --- (DEFINIÇÃO COMPLETA NO FINAL DO ARQUIVO)
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
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background },
    container: { flex: 1, backgroundColor: theme.background },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingHorizontal: 20 },
    headerTitle: { fontSize: 24 * fontMultiplier, fontWeight: isBold ? "bold" : "700", color: theme.text, fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined, lineHeight: 24 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing },
    headerSubtitle: { fontSize: 14 * fontMultiplier, color: theme.text, opacity: 0.8, fontWeight: isBold ? "bold" : "normal", fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined, lineHeight: 14 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing },
    headerIcon: { backgroundColor: theme.button ?? '#191970', borderRadius: 12, padding: 6 },
    statsContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, alignSelf: "center", marginVertical: 14 },
    statCard: { width: BOX_SIZE, height: BOX_SIZE, backgroundColor: theme.card, borderRadius: 16, justifyContent: "center", alignItems: "center", padding: 6 },
    statIcon: { fontSize: 28 * fontMultiplier, color: theme.cardText } as TextStyle,
    statValue: { color: theme.cardText, fontSize: 18 * fontMultiplier, fontWeight: isBold ? "900" : "bold", marginTop: 2, fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined, lineHeight: 18 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing },
    statLabel: { color: theme.cardText, fontSize: 11 * fontMultiplier, fontWeight: isBold ? "bold" : "600", marginTop: 1, fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined, lineHeight: 11 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, textAlign: 'center' },
    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, marginTop: 10, paddingHorizontal: 20 },
    sectionHeaderIcons: { flexDirection: "row", gap: 12 },
    sectionTitle: { fontSize: 17 * fontMultiplier, fontWeight: isBold ? "900" : "bold", color: theme.text, fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined, lineHeight: 17 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing },
    modulesList: { paddingHorizontal: 20, paddingBottom: 10, gap: 8 },
    moduleItem: { backgroundColor: theme.card, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 12, flexDirection: "row", alignItems: "center" },
    moduleIconContainer: { backgroundColor: theme.background, borderRadius: 25, padding: 8, marginRight: 12 },
    moduleIcon: { fontSize: 24 * fontMultiplier, color: theme.text } as TextStyle,
    moduleTextContainer: { flex: 1 },
    moduleTitle: { color: theme.cardText, fontSize: 14 * fontMultiplier, fontWeight: isBold ? "900" : "bold", marginBottom: 2, fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined, lineHeight: 14 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing },
    moduleSubtitle: { color: theme.cardText, fontSize: 12 * fontMultiplier, fontWeight: isBold ? "bold" : "normal", opacity: 0.9, fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined, lineHeight: 12 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing },
    moduleStatusIndicator: { width: 10, height: 10, borderRadius: 5, marginLeft: 10 },
    actionsContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, alignSelf: "center", marginTop: 'auto', paddingBottom: 10, paddingHorizontal: 20 },
    actionButton: { width: BOX_SIZE, height: BOX_SIZE, backgroundColor: theme.card, borderRadius: 16, justifyContent: "center", alignItems: "center", padding: 6 },
    actionIcon: { fontSize: 28 * fontMultiplier, color: theme.cardText } as TextStyle,
    actionLabel: { color: theme.cardText, fontSize: 11 * fontMultiplier, fontWeight: isBold ? "bold" : "600", marginTop: 1, fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined, lineHeight: 11 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, textAlign: 'center' },
});

export default HomeScreen;