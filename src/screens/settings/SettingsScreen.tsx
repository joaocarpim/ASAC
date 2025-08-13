import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Switch } from "react-native";
import { useSettings, Theme, FontSize } from "../../context/SettingsContext"; // Agora o import funciona!
import ScreenHeader from "../../components/layout/ScreenHeader";

// DEFINIÇÃO DE TIPOS PARA AS PROPS DOS COMPONENTES AUXILIARES
type OptionSelectorProps = {
  title: string;
  options: string[];
  selectedOption: Theme | FontSize;
  onSelect: (option: any) => void;
};

type SettingRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

// Componente com tipos aplicados
const OptionSelector = ({
  title,
  options,
  selectedOption,
  onSelect,
}: OptionSelectorProps) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.optionsRow}>
      {options.map((option: string) => (
        <TouchableOpacity
          key={option}
          style={[
            styles.optionButton,
            selectedOption === option && styles.optionButtonSelected,
          ]}
          onPress={() => onSelect(option)}
        >
          <Text
            style={[
              styles.optionButtonText,
              selectedOption === option && styles.optionButtonTextSelected,
            ]}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// Componente com tipos aplicados
const SettingRow = ({ label, value, onValueChange }: SettingRowProps) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingRowLabel}>{label}</Text>
    <Switch
      trackColor={{ false: "#767577", true: "#FFC700" }}
      thumbColor={value ? "#191970" : "#f4f3f4"}
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);

export default function SettingsScreen() {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    zoom,
    setZoom,
    isNarrationEnabled,
    setIsNarrationEnabled,
    isSoundEffectsEnabled,
    setIsSoundEffectsEnabled,
  } = useSettings();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <ScreenHeader title="Configurações" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <OptionSelector
          title="Temas de Cores"
          options={["claro", "escuro", "azul"]}
          selectedOption={theme}
          onSelect={setTheme}
        />
        <OptionSelector
          title="Tamanho da Fonte"
          options={["atual", "grande", "extra"]}
          selectedOption={fontSize}
          onSelect={setFontSize}
        />
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Zoom da Página</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={zoom}
            onValueChange={setZoom}
            minimumTrackTintColor="#191970"
            maximumTrackTintColor="#000000"
            thumbTintColor="#191970"
          />
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Configurações de Áudio</Text>
          <View style={styles.audioSettingsContainer}>
            <SettingRow
              label="Narração por Voz"
              value={isNarrationEnabled}
              onValueChange={setIsNarrationEnabled}
            />
            <SettingRow
              label="Efeitos Sonoros"
              value={isSoundEffectsEnabled}
              onValueChange={setIsSoundEffectsEnabled}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Os estilos permanecem os mesmos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionContainer: { marginBottom: 30 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#191970",
    marginBottom: 15,
  },
  optionsRow: { flexDirection: "row", justifyContent: "space-between" },
  optionButton: {
    flex: 1,
    backgroundColor: "#191970",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  optionButtonSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#191970",
    borderWidth: 2,
  },
  optionButtonText: { color: "#FFFFFF", fontWeight: "bold" },
  optionButtonTextSelected: { color: "#191970" },
  slider: { width: "100%", height: 40 },
  audioSettingsContainer: {
    backgroundColor: "#191970",
    borderRadius: 12,
    padding: 10,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  settingRowLabel: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
