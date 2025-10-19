import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { canStartModule } from "../../services/progressService";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  GestureDetector,
  Gesture,
  Directions,
} from "react-native-gesture-handler";
import {
  AccessibleView,
  AccessibleHeader,
  AccessibleText,
} from "../../components/AccessibleComponents";
// 👇 1. IMPORTAR O useSettings 👇
import { useSettings } from "../../hooks/useSettings";
import { DEFAULT_MODULES } from "../../navigation/moduleTypes"; // Importação que faltava

const { width } = Dimensions.get("window");
const scaleFactor = width / 375;
const responsiveFontSize = (size: number) => Math.round(size * scaleFactor);

export default function ModulePreQuizScreen({
  route,
  navigation,
}: RootStackScreenProps<"ModulePreQuiz">) {
  const { moduleId } = route.params;
  const { user } = useAuthStore();
  const [checking, setChecking] = useState(false);
  const { theme } = useContrast();
  const [moduleData, setModuleData] = useState<any>(null);

  // 👇 2. OBTER OS VALORES DAS CONFIGURAÇÕES 👇
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  useEffect(() => {
    const m = DEFAULT_MODULES.find((mm) => mm.moduleId === moduleId);
    setModuleData(m);
  }, [moduleId]);

  // 👇 3. PASSAR OS VALORES PARA A CRIAÇÃO DE ESTILOS (DENTRO DO useMemo) 👇
  const styles = useMemo(
    () =>
      getStyles(
        theme,
        fontSizeMultiplier,
        isBoldTextEnabled,
        lineHeightMultiplier,
        letterSpacing,
        isDyslexiaFontEnabled
      ),
    [
      theme,
      fontSizeMultiplier,
      isBoldTextEnabled,
      lineHeightMultiplier,
      letterSpacing,
      isDyslexiaFontEnabled,
    ]
  );

  const handleStartQuiz = async () => {
    if (checking) return;
    if (!user) {
      Alert.alert("Erro", "Usuário não autenticado.");
      return;
    }
    setChecking(true);
    const allowed = await canStartModule(user.userId, moduleId);
    setChecking(false);
    if (!allowed) {
      Alert.alert(
        "Bloqueado",
        "Você precisa concluir o módulo anterior primeiro."
      );
      return;
    }
    navigation.navigate("ModuleQuiz", { moduleId });
  };

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => navigation.goBack());
  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => handleStartQuiz());
  const composedGestures = Gesture.Race(flingLeft, flingRight);

  if (!moduleData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={theme.text} size="large" />
      </View>
    );
  }

  return (
    <GestureDetector gesture={composedGestures}>
      <AccessibleView
        style={styles.container}
        accessibilityText="Tela de instruções do questionário. Arraste para a esquerda para começar, ou para a direita para voltar."
      >
        <View style={styles.contentContainer}>
          <AccessibleHeader level={1} style={styles.title}>
            Você concluiu todo o conteúdo!
          </AccessibleHeader>
          <AccessibleHeader level={2} style={styles.subtitle}>
            Sobre o Questionário
          </AccessibleHeader>
          <AccessibleView
            style={styles.infoContainer}
            accessibilityText="Informações sobre o questionário, com 6 itens."
          >
            <AccessibleText
              baseSize={15}
              style={styles.infoText}
              accessibilityText="Questões: 10."
            >
              📝 Questões: 10
            </AccessibleText>
            <AccessibleText
              baseSize={15}
              style={styles.infoText}
              accessibilityText="Para passar: 7 acertos."
            >
              ✅ Para passar: 7 acertos
            </AccessibleText>
            <AccessibleText
              baseSize={15}
              style={styles.infoText}
              accessibilityText="Moedas por acerto: 15."
            >
              🪙 Moedas por acerto: 15
            </AccessibleText>
            <AccessibleText
              baseSize={15}
              style={styles.infoText}
              accessibilityText="Pontuação: 12.250."
            >
              🏆 Pontuação: 12.250
            </AccessibleText>
            <AccessibleText
              baseSize={15}
              style={styles.infoText}
              accessibilityText="Tentativas: Ilimitadas."
            >
              🔄 Tentativas: Ilimitadas
            </AccessibleText>
            <AccessibleText
              baseSize={15}
              style={styles.infoText}
              accessibilityText="Feedback: Áudio e visual."
            >
              🔊 Feedback: Áudio e visual
            </AccessibleText>
          </AccessibleView>
          <AccessibleView
            style={styles.tipContainer}
            accessibilityText="Dica: Leia todo o conteúdo com atenção antes de iniciar o questionário."
          >
            <Text style={[styles.icon, { fontSize: responsiveFontSize(18) }]}>
              💡
            </Text>
            <Text style={styles.tipText}>
              Dica: Leia todo o conteúdo com atenção antes de iniciar o
              questionário.
            </Text>
          </AccessibleView>
          {checking && (
            <AccessibleView accessibilityText="Verificando. Por favor, aguarde.">
              <ActivityIndicator
                style={{ marginTop: 20 }}
                size="large"
                color={theme.text}
              />
            </AccessibleView>
          )}
        </View>
      </AccessibleView>
    </GestureDetector>
  );
}

const getStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  letterSpacing: number,
  isDyslexiaFont: boolean
) => {
  const isHighContrastTheme = theme.background === "#0055A4";
  const textColor = isHighContrastTheme ? "#FFFFFF" : theme.text;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
    },
    contentContainer: { flexGrow: 1, justifyContent: "center", padding: 20 },
    title: {
      fontSize: responsiveFontSize(22) * fontMultiplier,
      fontWeight: isBold ? "bold" : "bold",
      color: textColor,
      marginBottom: 5,
      textAlign: "center",
      lineHeight: responsiveFontSize(22) * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    subtitle: {
      fontSize: responsiveFontSize(18) * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      color: textColor,
      marginBottom: 15,
      textAlign: "center",
      lineHeight: responsiveFontSize(18) * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    infoContainer: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      gap: 15,
    },
    infoText: {
      fontSize: responsiveFontSize(15) * fontMultiplier,
      color: theme.cardText,
      fontWeight: isBold ? "bold" : "normal",
      lineHeight: responsiveFontSize(15) * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    tipContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 5,
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.card,
    },
    icon: { marginRight: 12 },
    tipText: {
      fontSize: responsiveFontSize(14) * fontMultiplier,
      color: textColor,
      flex: 1,
      fontWeight: isBold ? "bold" : "normal",
      lineHeight: responsiveFontSize(14) * fontMultiplier * lineHeight,
      letterSpacing: letterSpacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
  });
};
