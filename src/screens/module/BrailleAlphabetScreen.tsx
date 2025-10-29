import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, StatusBar, StyleSheet } from "react-native";
import {
  Gesture,
  GestureDetector,
  Directions,
} from "react-native-gesture-handler";
import { useContrast } from "../../hooks/useContrast";
import { useAccessibility } from "../../context/AccessibilityProvider";
import {
  AccessibleHeader,
  AccessibleText,
} from "../../components/AccessibleComponents";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { Theme } from "../../types/contrast";
import { Audio } from "expo-av";
import ConfettiCannon from "react-native-confetti-cannon";
import { useNavigation } from "@react-navigation/native";
import { useSettings } from "../../hooks/useSettings";

const BRAILLE_ALPHABET = [
  {
    letter: "A",
    img: require("../../../assets/images/a.png"),
    desc: "Ponto 1 levantado.",
  },
  {
    letter: "B",
    img: require("../../../assets/images/b.png"),
    desc: "Pontos 1 e 2 levantados.",
  },
  {
    letter: "C",
    img: require("../../../assets/images/c.png"),
    desc: "Pontos 1 e 4 levantados.",
  },
  {
    letter: "D",
    img: require("../../../assets/images/d.png"),
    desc: "Pontos 1, 4 e 5 levantados.",
  },
  {
    letter: "E",
    img: require("../../../assets/images/e.png"),
    desc: "Pontos 1 e 5 levantados.",
  },
  {
    letter: "F",
    img: require("../../../assets/images/f.png"),
    desc: "Pontos 1, 2 e 4 levantados.",
  },
  {
    letter: "G",
    img: require("../../../assets/images/g.png"),
    desc: "Pontos 1, 2, 4 e 5 levantados.",
  },
  {
    letter: "H",
    img: require("../../../assets/images/h.png"),
    desc: "Pontos 1, 2 e 5 levantados.",
  },
  {
    letter: "I",
    img: require("../../../assets/images/i.png"),
    desc: "Pontos 2 e 4 levantados.",
  },
  {
    letter: "J",
    img: require("../../../assets/images/j.png"),
    desc: "Pontos 2, 4 e 5 levantados.",
  },
  {
    letter: "K",
    img: require("../../../assets/images/k.png"),
    desc: "Pontos 1 e 3 levantados.",
  },
  {
    letter: "L",
    img: require("../../../assets/images/l.png"),
    desc: "Pontos 1, 2 e 3 levantados.",
  },
  {
    letter: "M",
    img: require("../../../assets/images/m.png"),
    desc: "Pontos 1, 3 e 4 levantados.",
  },
  {
    letter: "N",
    img: require("../../../assets/images/n.png"),
    desc: "Pontos 1, 3, 4 e 5 levantados.",
  },
  {
    letter: "O",
    img: require("../../../assets/images/o.png"),
    desc: "Pontos 1, 3 e 5 levantados.",
  },
  {
    letter: "P",
    img: require("../../../assets/images/p.png"),
    desc: "Pontos 1, 2, 3 e 4 levantados.",
  },
  {
    letter: "Q",
    img: require("../../../assets/images/q.png"),
    desc: "Pontos 1, 2, 3, 4 e 5 levantados.",
  },
  {
    letter: "R",
    img: require("../../../assets/images/r.png"),
    desc: "Pontos 1, 2, 3 e 5 levantados.",
  },
  {
    letter: "S",
    img: require("../../../assets/images/s.png"),
    desc: "Pontos 2, 3 e 4 levantados.",
  },
  {
    letter: "T",
    img: require("../../../assets/images/t.png"),
    desc: "Pontos 2, 3, 4 e 5 levantados.",
  },
  {
    letter: "U",
    img: require("../../../assets/images/u.png"),
    desc: "Pontos 1, 3 e 6 levantados.",
  },
  {
    letter: "V",
    img: require("../../../assets/images/v.png"),
    desc: "Pontos 1, 2, 3 e 6 levantados.",
  },
  {
    letter: "W",
    img: require("../../../assets/images/w.png"),
    desc: "Pontos 2, 4, 5 e 6 levantados.",
  },
  {
    letter: "X",
    img: require("../../../assets/images/x.png"),
    desc: "Pontos 1, 3, 4 e 6 levantados.",
  },
  {
    letter: "Y",
    img: require("../../../assets/images/y.png"),
    desc: "Pontos 1, 3, 4, 5 e 6 levantados.",
  },
  {
    letter: "Z",
    img: require("../../../assets/images/z.png"),
    desc: "Pontos 1, 3, 5 e 6 levantados.",
  },
  {
    letter: "numero",
    img: require("../../../assets/images/numero.png"),
    desc: "Pontos 3, 4, 5 e 6 levantados.",
  },
  {
    letter: "0",
    img: require("../../../assets/images/0.png"),
    desc: "Pontos 2, 4 e 5 levantados.",
  },
  {
    letter: "1",
    img: require("../../../assets/images/1.png"),
    desc: "Ponto 1 levantado.",
  },
  {
    letter: "2",
    img: require("../../../assets/images/2.png"),
    desc: "Pontos 1 e 2 levantados.",
  },
  {
    letter: "3",
    img: require("../../../assets/images/3.png"),
    desc: "Pontos 1 e 4 levantados.",
  },
  {
    letter: "4",
    img: require("../../../assets/images/4.png"),
    desc: "Pontos 1, 4 e 5 levantados.",
  },
  {
    letter: "5",
    img: require("../../../assets/images/5.png"),
    desc: "Pontos 1 e 5 levantados.",
  },
  {
    letter: "6",
    img: require("../../../assets/images/6.png"),
    desc: "Pontos 1, 2 e 4 levantados.",
  },
  {
    letter: "7",
    img: require("../../../assets/images/7.png"),
    desc: "Pontos 1, 2, 4 e 5 levantados.",
  },
  {
    letter: "8",
    img: require("../../../assets/images/8.png"),
    desc: "Pontos 1, 2 e 5 levantados.",
  },
  {
    letter: "9",
    img: require("../../../assets/images/9.png"),
    desc: "Pontos 2 e 4 levantados.",
  },
  {
    letter: "2pontos",
    img: require("../../../assets/images/2pontos.png"),
    desc: "Pontos 2 e 5 levantados.",
  },
  {
    letter: "esclamacao",
    img: require("../../../assets/images/esclamacao.png"),
    desc: "Pontos 2, 3 e 5 levantados.",
  },
  {
    letter: "interrogacao",
    img: require("../../../assets/images/interrogacao.png"),
    desc: "Pontos 2, 3 e 6 levantados.",
  },
  {
    letter: "ponto",
    img: require("../../../assets/images/ponto.png"),
    desc: "Ponto 3 levantado.",
  },
  {
    letter: "pontovirgula",
    img: require("../../../assets/images/pontovirgula.png"),
    desc: "Pontos 2 e 3 levantados.",
  },
  {
    letter: "virgula",
    img: require("../../../assets/images/virgula.png"),
    desc: "Ponto 2 levantado.",
  },
];

function getAccessibilityInfo(item: { letter: string; desc: string }) {
  const { letter } = item;
  if (/^[A-Z]$/.test(letter)) {
    return { type: "Letra", name: letter, title: `Letra ${letter}` };
  }
  if (/^[0-9]$/.test(letter)) {
    return { type: "Número", name: letter, title: `Número ${letter}` };
  }
  switch (letter) {
    case "numero":
      return { type: "Sinal de", name: "Número", title: "Sinal de Número" };
    case "esclamacao":
      return {
        type: "Ponto de",
        name: "Exclamação",
        title: "Ponto de Exclamação",
      };
    case "interrogacao":
      return {
        type: "Ponto de",
        name: "Interrogação",
        title: "Ponto de Interrogação",
      };
    case "ponto":
      return { type: "Sinal de", name: "Ponto final", title: "Ponto Final" };
    case "pontovirgula":
      return { type: "", name: "Ponto e vírgula", title: "Ponto e Vírgula" };
    case "2pontos":
      return { type: "", name: "Dois-pontos", title: "Dois-Pontos" };
    case "virgula":
      return { type: "", name: "Vírgula", title: "Vírgula" };
    default:
      return { type: "Símbolo", name: letter, title: `Símbolo ${letter}` };
  }
}

export default function BrailleAlphabetScreen() {
  const [pageIndex, setPageIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const { theme } = useContrast();
  const { speakText } = useAccessibility();
  const navigation = useNavigation();
  const { isDyslexiaFontEnabled } = useSettings();

  const soundObject = useRef<Audio.Sound | null>(null);

  const totalPages = BRAILLE_ALPHABET.length;
  const current = BRAILLE_ALPHABET[pageIndex];
  const styles = getStyles(theme, isDyslexiaFontEnabled);
  const accInfo = getAccessibilityInfo(current);

  const playCelebrationSound = async () => {
    try {
      if (soundObject.current === null) {
        const { sound } = await Audio.Sound.createAsync(
          require("../../../assets/som/happy.mp3"),
          { shouldPlay: true }
        );
        soundObject.current = sound;
      } else {
        await soundObject.current.replayAsync();
      }
    } catch (error) {
      console.warn("Erro ao tocar som:", error);
    }
  };

  useEffect(() => {
    return () => {
      soundObject.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (isFinished) return;
    const textToSpeak = `${accInfo.title}. ${current.desc}`;
    const timer = setTimeout(() => speakText(textToSpeak), 250);
    return () => clearTimeout(timer);
  }, [pageIndex, isFinished]);

  const handleGoHome = () => {
    navigation.navigate("Home" as never);
  };

  const handleNext = () => {
    if (pageIndex < totalPages - 1) {
      setPageIndex((prev) => prev + 1);
    } else if (!isFinished) {
      setShowConfetti(true);
      playCelebrationSound();
      speakText(
        "Parabéns! Você concluiu a lição. Deslize para a direita ou toque duas vezes para voltar à tela inicial."
      );
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (pageIndex > 0) {
      setPageIndex((prev) => prev - 1);
    }
  };

  const singleTap = Gesture.Tap().onEnd(() => {
    if (!isFinished) {
      speakText(`${accInfo.title}. ${current.desc}`);
    }
  });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (isFinished) {
        handleGoHome();
      }
    });

  const flingLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      if (!isFinished) handleNext();
    });

  const flingRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      if (isFinished || pageIndex === 0) {
        handleGoHome();
      } else {
        handlePrev();
      }
    });

  const combinedGestures = Gesture.Race(
    flingLeft,
    flingRight,
    doubleTap,
    singleTap
  );

  return (
    <GestureDetector gesture={combinedGestures}>
      <View style={styles.container}>
        <StatusBar
          backgroundColor={theme.background}
          barStyle="light-content"
        />
        <ScreenHeader
          title={isFinished ? "Parabéns!" : "Aprendendo o Alfabeto Braille"}
        />

        {showConfetti && (
          <ConfettiCannon
            count={200}
            origin={{ x: -10, y: 0 }}
            fadeOut={true}
          />
        )}

        {isFinished ? (
          <View
            style={styles.page}
            accessible={true}
            accessibilityLabel="Parabéns! Você concluiu a lição. Deslize para a direita ou toque duas vezes para voltar à tela inicial."
          >
            <Text style={styles.completionText}>Parabéns!</Text>
            <Text style={styles.completionSubText}>
              Deslize para a direita ou toque duas vezes para voltar à tela
              inicial
            </Text>
          </View>
        ) : (
          <View
            style={styles.page}
            accessible={true}
            accessibilityLabel={`${accInfo.title}. ${current.desc}`}
            accessibilityHint="Deslize para navegar. Toque para ouvir novamente."
          >
            <AccessibleHeader level={2} style={styles.title} accessible={false}>
              {accInfo.title}
            </AccessibleHeader>
            <Image
              source={current.img}
              style={styles.image}
              accessible={false}
            />
            <AccessibleText
              style={styles.description}
              baseSize={18}
              accessible={false}
            >
              {current.desc}
            </AccessibleText>
            <Text style={styles.pageIndicator}>
              {pageIndex + 1} / {totalPages}
            </Text>
          </View>
        )}
      </View>
    </GestureDetector>
  );
}

const getStyles = (theme: Theme, isDyslexiaFontEnabled: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    page: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 20,
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    image: { width: 220, height: 220, resizeMode: "contain", marginBottom: 20 },
    description: {
      fontSize: 18,
      textAlign: "center",
      color: theme.text,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    pageIndicator: {
      position: "absolute",
      bottom: 20,
      fontSize: 16,
      color: theme.text,
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    completionText: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.text,
      textAlign: "center",
      marginBottom: 10,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    completionSubText: {
      fontSize: 18,
      color: theme.text,
      textAlign: "center",
      paddingHorizontal: 20,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });
