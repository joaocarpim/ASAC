import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  GestureResponderEvent,
} from "react-native";
import ViewShot from "react-native-view-shot";
import { useAccessibility } from "../context/AccessibilityProvider";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface MagnifierLensProps {
  viewShotRef: React.RefObject<ViewShot | null>;
}

const MagnifierLens: React.FC<MagnifierLensProps> = ({ viewShotRef }) => {
  const { magnifier } = useAccessibility();

  const [viewShotUri, setViewShotUri] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const positionX = useRef(new Animated.Value(magnifier.x)).current;
  const positionY = useRef(new Animated.Value(magnifier.y)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const MAGNIFIER_SIZE = 180;
  const MAGNIFIER_RADIUS = MAGNIFIER_SIZE / 2;
  const ZOOM_FACTOR = 1.8;

  const captureAndZoom = useCallback(async () => {
    if (!viewShotRef.current?.capture) return;
    try {
      const uri = await viewShotRef.current.capture();
      setViewShotUri(uri);
      setIsZoomed(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error("Erro ao capturar a tela.", error);
    }
  }, [viewShotRef, opacity]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsZoomed(false);
        Animated.timing(opacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { pageX, pageY } = evt.nativeEvent;
        Animated.parallel([
          Animated.timing(positionX, {
            toValue: pageX,
            duration: 0,
            useNativeDriver: false,
          }),
          Animated.timing(positionY, {
            toValue: pageY,
            duration: 0,
            useNativeDriver: false,
          }),
        ]).start();
      },
      onPanResponderRelease: () => {
        captureAndZoom();
      },
    })
  ).current;

  useEffect(() => {
    if (magnifier.isActive) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scale, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [magnifier.isActive, scale]);

  const animatedMagnifierStyle = {
    transform: [
      { translateX: positionX },
      { translateY: positionY },
      { scale: scale },
    ],
  };

  const imageTransformX = Animated.add(
    positionX,
    new Animated.Value(-screenWidth * ZOOM_FACTOR + MAGNIFIER_RADIUS)
  );

  const imageTransformY = Animated.add(
    positionY,
    new Animated.Value(-screenHeight * ZOOM_FACTOR + MAGNIFIER_RADIUS)
  );

  const animatedImageStyle = {
    width: screenWidth * ZOOM_FACTOR,
    height: screenHeight * ZOOM_FACTOR,
    transform: [
      { translateX: imageTransformX },
      { translateY: imageTransformY },
    ],
    opacity: opacity,
  };

  return (
    <Animated.View
      style={[
        styles.magnifierContainer,
        animatedMagnifierStyle,
        { left: -MAGNIFIER_RADIUS, top: -MAGNIFIER_RADIUS },
      ]}
      {...panResponder.panHandlers}
    >
           {" "}
      <View style={styles.lens}>
               {" "}
        {viewShotUri && (
          <Animated.Image
            source={{ uri: viewShotUri }}
            fadeDuration={0}
            style={animatedImageStyle}
          />
        )}
             {" "}
      </View>
            <View style={styles.centerCrosshair} />   {" "}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  magnifierContainer: {
    position: "absolute",
    width: 180,
    height: 180,
    zIndex: 2000,
    elevation: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  lens: {
    width: "100%",
    height: "100%",
    borderRadius: 90,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(120, 120, 120, 0.6)",
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  centerCrosshair: {
    position: "absolute",
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 59, 48, 0.8)",
    borderRadius: 10,
  },
});

export default MagnifierLens;
