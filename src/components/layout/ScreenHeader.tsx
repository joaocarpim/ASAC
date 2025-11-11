import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { AccessibleButton, AccessibleHeader } from "../AccessibleComponents";

import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";

type ScreenHeaderProps = {
  title: string;
  onBackPress?: () => void;
  rightIcon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onRightIconPress?: () => void;
  backButtonAccessibilityLabel?: string;
  rightButtonAccessibilityLabel?: string;
};

export default function ScreenHeader({
  title,
  onBackPress,
  rightIcon,
  onRightIconPress,
  backButtonAccessibilityLabel = "Voltar",
  rightButtonAccessibilityLabel,
}: ScreenHeaderProps) {
  const navigation = useNavigation();
  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled,
  } = useSettings();

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    lineHeightMultiplier,
    letterSpacing,
    isDyslexiaFontEnabled
  );

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>
           {" "}
      <AccessibleButton
        onPress={handleBackPress}
        style={styles.iconButton}
        // ✅ ALTERADO: De 'accessibilityText' para 'accessibilityLabel'
        accessibilityLabel={backButtonAccessibilityLabel}
      >
               {" "}
        <MaterialCommunityIcons
          name="arrow-left"
          size={30}
          color={theme.text}
        />
             {" "}
      </AccessibleButton>
           {" "}
      <AccessibleHeader level={1} style={styles.title}>
                {title}     {" "}
      </AccessibleHeader>
           {" "}
      {rightIcon ? (
        <AccessibleButton
          onPress={onRightIconPress}
          style={styles.iconButton}
          // ✅ ALTERADO: De 'accessibilityText' para 'accessibilityLabel'
          accessibilityLabel={
            rightButtonAccessibilityLabel || `Botão ${rightIcon}`
          }
        >
                   {" "}
          <MaterialCommunityIcons
            name={rightIcon}
            size={30}
            color={theme.text}
          />
                 {" "}
        </AccessibleButton>
      ) : (
        <View style={styles.iconButton} />
      )}
         {" "}
    </View>
  );
}

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  lineHeight: number,
  spacing: number,
  isDyslexiaFont: boolean
) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginTop: 15,
      backgroundColor: theme.background,
    },
    title: {
      color: theme.text,
      flex: 1,
      textAlign: "center",
      fontSize: 22 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      lineHeight: 22 * fontMultiplier * lineHeight,
      letterSpacing: spacing,
      fontFamily: isDyslexiaFont ? "OpenDyslexic-Regular" : undefined,
    },
    iconButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
  });
