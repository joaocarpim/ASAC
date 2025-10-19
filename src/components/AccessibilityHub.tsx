import React, { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Animated,
} from "react-native";

import FloatingAccessibilityButton from "./FloatingAccessibilityButton";
import MagnifierButton from "./MagnifierButton";

const AccessibilityHub: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuTranslateX = useRef(new Animated.Value(150)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);

    Animated.parallel([
      Animated.timing(menuTranslateX, {
        toValue: newState ? 0 : 150,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(menuOpacity, {
        toValue: newState ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animatedMenuStyle = {
    transform: [{ translateX: menuTranslateX }],
    opacity: menuOpacity,
  };

  return (
    <View style={styles.hubContainer}>
      <Animated.View style={[styles.menuContainer, animatedMenuStyle]}>
        <FloatingAccessibilityButton />
        <MagnifierButton />
      </Animated.View>

      <TouchableOpacity
        onPress={toggleMenu}
        style={styles.mainButton}
        accessible={true}
        accessibilityLabel={
          isMenuOpen
            ? "Fechar menu de acessibilidade"
            : "Abrir menu de acessibilidade"
        }
      >
        <Image
          source={{
            uri: "https://www.ufsm.br/app/uploads/sites/391/2015/09/LOGO_ACESSIBILIDADE_-_AGOSTO_2015.jpg",
          }}
          style={styles.mainButtonImage}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  hubContainer: {
    position: "absolute",
    bottom: 20,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 999,
  },
  menuContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(25, 25, 112, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 33,
    marginRight: 15,
    bottom: -10,
  },
  mainButton: {
    bottom: -10,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#191970",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },

  mainButtonImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

export default AccessibilityHub;
