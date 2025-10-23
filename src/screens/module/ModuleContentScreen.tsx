import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextStyle,
  ViewStyle,
  Platform,
  ColorValue,
} from "react-native";
import { generateClient } from 'aws-amplify/api';
import { getModule, lessonsByModuleIdAndLessonNumber } from '../../graphql/queries';
import * as APIt from '../../API';
import { ModelSortDirection } from '../../API';

import { RootStackScreenProps } from "../../navigation/types";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { useContrast } from "../../hooks/useContrast";
import { Theme } from "../../types/contrast";
import {
  AccessibleView, // ✅ Usa AccessibleView
  AccessibleHeader,
  AccessibleText,
  AccessibleButton,
} from "../../components/AccessibleComponents"; // Verifique este caminho
import { useAccessibility } from "../../context/AccessibilityProvider"; // Verifique este caminho
import { Gesture, GestureDetector, Directions } from "react-native-gesture-handler";
import { useSettings } from "../../hooks/useSettings"; // Verifique este caminho
import { useAuthStore } from "../../store/authStore"; // Verifique este caminho
import { canStartModule } from "../../services/progressService"; // Verifique este caminho

// Função para verificar se a cor é escura
function isColorDark(color: ColorValue | undefined): boolean {
    if (!color || typeof color !== 'string' || !color.startsWith('#')) return false;
    const hex = color.replace('#', '');
    if (hex.length !== 6) return false;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance < 149;
}

export default function ModuleContentScreen({ route, navigation }: RootStackScreenProps<'ModuleContent'>) {
  const { moduleId } = route.params;
  const [moduleData, setModuleData] = useState<APIt.Module | null>(null);
  const [lessons, setLessons] = useState<APIt.Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const { user } = useAuthStore();
  const { theme } = useContrast();
  const { speakText } = useAccessibility();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const styles = getStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const client = generateClient();

  useEffect(() => {
    // ... (lógica fetchModuleAndLessons como antes) ...
     const fetchModuleAndLessons = async () => { /* ... */ };
     fetchModuleAndLessons();
  }, [moduleId, client, navigation]);

  useEffect(() => {
    // ... (lógica speakText como antes) ...
  }, [currentPageIndex, lessons, isLoading, speakText]);

  const renderLesson = (lesson: APIt.Lesson) => (
     // ✅ CORREÇÃO: Usa 'accessibilityText' conforme exigido pelo componente
     <AccessibleView key={lesson.id} style={styles.contentCard} accessibilityText={`Lição ${lesson.lessonNumber}: ${lesson.title}. Conteúdo: ${lesson.content}`}>
       <AccessibleHeader level={2} style={styles.contentTitle}>
           {lesson.lessonNumber}. {lesson.title}
       </AccessibleHeader>
       {/* {lesson.image && <Image source={{ uri: lesson.image }} style={styles.lessonImage} />} */}
       <ScrollView nestedScrollEnabled={true} style={{ flexShrink: 1 }}>
         <AccessibleText baseSize={16} style={styles.contentBody}>
             {lesson.content}
         </AccessibleText>
       </ScrollView>
     </AccessibleView>
  );

  const handlePrevious = () => { /* ... (código handlePrevious) ... */ };
  const handleNextPage = async () => { /* ... (código handleNextPage) ... */ };

  const flingLeft = Gesture.Fling().direction(Directions.LEFT).onEnd(handleNextPage);
  const flingRight = Gesture.Fling().direction(Directions.RIGHT).onEnd(handlePrevious);
  const composedGestures = Gesture.Race(flingLeft, flingRight);

  const statusBarStyle = isColorDark(theme.background) ? 'light-content' : 'dark-content';

  if (isLoading && !moduleData) { /* ... (código loading) ... */ }
  if (!moduleData && !isLoading) { /* ... (código erro) ... */ }

  const currentLesson = lessons.length > 0 ? lessons[currentPageIndex] : null;
  const totalPages = lessons.length > 0 ? lessons.length : 1;
  const pageNumber = lessons.length > 0 ? currentPageIndex + 1 : 1;
  const mainAccessibilityText = currentLesson ? `Página ${pageNumber} de ${totalPages}. ${currentLesson.title}. Conteúdo: ${currentLesson.content}. Deslize para a esquerda para avançar, ou para a direita para voltar.` : `Nenhuma lição encontrada para ${moduleData!.title}. Deslize para a esquerda para ir ao quiz, ou para a direita para voltar.`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={theme.background} />
      <ScreenHeader title={moduleData!.title || "Módulo"} />

      <GestureDetector gesture={composedGestures}>
        <View style={styles.scrollArea}>
            {/* ✅ CORREÇÃO: Usa 'accessibilityText' conforme exigido pelo componente */}
            <AccessibleView style={styles.contentCard} accessibilityText={mainAccessibilityText} >
                {isLoading ? (
                    <ActivityIndicator color={theme.cardText} />
                ) : currentLesson ? (
                    <>
                         <AccessibleHeader level={2} style={styles.contentTitle} numberOfLines={2} adjustsFontSizeToFit>
                             {currentLesson.lessonNumber}. {currentLesson.title}
                         </AccessibleHeader>
                         <ScrollView nestedScrollEnabled={true} style={{ flexShrink: 1 }}>
                             <AccessibleText baseSize={16} style={styles.contentBody}>
                                 {currentLesson.content}
                             </AccessibleText>
                         </ScrollView>
                    </>
                ) : (
                    <View style={styles.contentContainer}>
                        <Text style={[styles.contentBody, styles.emptyText]}>
                            Nenhuma lição encontrada.
                        </Text>
                         <AccessibleButton
                            style={[styles.quizButton, { backgroundColor: theme.button ?? '#191970', marginTop: 30 }]}
                            onPress={handleNextPage}
                            disabled={isLoading}
                            accessibilityLabel={`Iniciar questionário do Módulo ${moduleData!.moduleNumber || ''}`} // Label aqui está ok para botão
                        >
                            <Text style={[styles.quizButtonText, { color: theme.buttonText ?? '#FFFFFF' }]}>
                                {isLoading ? 'Verificando...' : 'Fazer Questionário'}
                            </Text>
                        </AccessibleButton>
                    </View>
                )}
            </AccessibleView>
            <Text style={styles.pageIndicator}>{pageNumber} / {totalPages}</Text>
        </View>
      </GestureDetector>
    </View>
  );
}

// ✅ DEFINIÇÃO COMPLETA E ÚNICA DA FUNÇÃO getStyles (COLE NO FINAL DO ARQUIVO)
const getStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeightMultiplier: number, // Nome correto
  letterSpacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    // ... (definição completa dos estilos, como na versão anterior) ...
    container: { flex: 1, backgroundColor: theme.background },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background },
    contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { fontSize: 18 * fontMultiplier, textAlign: 'center', color: theme.text, lineHeight: 18 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? 'OpenDyslexic-Regular': undefined },
    emptyText: { fontSize: 16 * fontMultiplier, textAlign: 'center', marginTop: 30, fontStyle: 'italic', color: theme.text, lineHeight: 16 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? 'OpenDyslexic-Regular': undefined },
    scrollArea: { flex: 1, padding: 20 },
    scrollContent: { paddingBottom: 40 },
    moduleDescription: { fontSize: 16 * fontMultiplier, marginBottom: 25, fontStyle: 'italic', textAlign: 'center', color: theme.text, lineHeight: 16 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? 'OpenDyslexic-Regular': undefined },
    contentCard: { marginBottom: 25, padding: 15, borderRadius: 8, backgroundColor: theme.card, flex: 1 },
    contentTitle: { fontSize: 20 * fontMultiplier, fontWeight: isBold ? 'bold' : 'bold', marginBottom: 10, color: theme.cardText, lineHeight: 20 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? 'OpenDyslexic-Regular': undefined, textAlign: 'center' },
    contentBody: { fontSize: 16 * fontMultiplier, lineHeight: 24 * lineHeightMultiplier, color: theme.cardText, fontWeight: isBold ? 'bold' : 'normal', letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? 'OpenDyslexic-Regular': undefined, textAlign: 'left' },
    lessonImage: { width: '100%', height: 200, resizeMode: 'contain', marginBottom: 15, borderRadius: 8 },
    quizButton: { marginTop: 30, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
    quizButtonText: { fontSize: 16 * fontMultiplier, fontWeight: 'bold' },
    pageIndicator: { fontSize: 14 * fontMultiplier, fontWeight: isBold ? 'bold' : '600', color: theme.text, marginTop: 10, lineHeight: 14 * fontMultiplier * lineHeightMultiplier, letterSpacing: letterSpacing, fontFamily: isDyslexiaFont ? 'OpenDyslexic-Regular': undefined, textAlign: 'center' },
  });