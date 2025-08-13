// src/components/ScreenHeader.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

type ScreenHeaderProps = {
  title: string;
  rightIcon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onRightIconPress?: () => void;
};

export default function ScreenHeader({
  title,
  rightIcon,
  onRightIconPress,
}: ScreenHeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.iconButton}
      >
        <MaterialCommunityIcons name="arrow-left" size={30} color="#191970" />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
      {rightIcon ? (
        <TouchableOpacity onPress={onRightIconPress} style={styles.iconButton}>
          <MaterialCommunityIcons name={rightIcon} size={30} color="#191970" />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconButton} /> // Espaço vazio para alinhar o título
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#191970",
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
