import React, { createContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ISettingsContext {
  fontSizeMultiplier: number;
  setFontSizeMultiplier: (value: number) => void;
  isBoldTextEnabled: boolean;
  toggleBoldText: () => void;
  lineHeightMultiplier: number;
  setLineHeightMultiplier: (value: number) => void;
  letterSpacing: number;
  setLetterSpacing: (value: number) => void;
  isDyslexiaFontEnabled: boolean;
  toggleDyslexiaFont: () => void;
  isMagnifierEnabled: boolean;
  toggleMagnifier: () => void;
  isVoiceEnabled: boolean;
  toggleVoice: () => void;

  // 🔹 Novo
  imageScale: number;
  setImageScale: (value: number) => void;
}

export const SettingsContext = createContext<ISettingsContext | undefined>(
  undefined
);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [fontSizeMultiplier, setFontSizeMultiplierState] = useState(1.0);
  const [isBoldTextEnabled, setBoldTextEnabled] = useState(false);
  const [lineHeightMultiplier, setLineHeightMultiplierState] = useState(1.0);
  const [letterSpacing, setLetterSpacingState] = useState(0);
  const [isDyslexiaFontEnabled, setDyslexiaFontEnabled] = useState(false);
  const [isMagnifierEnabled, setMagnifierEnabled] = useState(false);
  const [isVoiceEnabled, setVoiceEnabled] = useState(true);

  // 🔹 Novo estado para imagens
  const [imageScale, setImageScaleState] = useState(1.0);

  useEffect(() => {
    const loadSettings = async () => {
      const settingsStr = await AsyncStorage.getItem("@app_settings");
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        setFontSizeMultiplierState(settings.fontSizeMultiplier || 1.0);
        setBoldTextEnabled(settings.isBoldTextEnabled || false);
        setLineHeightMultiplierState(settings.lineHeightMultiplier || 1.0);
        setLetterSpacingState(settings.letterSpacing || 0);
        setDyslexiaFontEnabled(settings.isDyslexiaFontEnabled || false);
        setMagnifierEnabled(settings.isMagnifierEnabled || false);
        setVoiceEnabled(settings.isVoiceEnabled === false ? false : true);
        setImageScaleState(settings.imageScale || 1.0); // 🔹 carrega do storage
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async (newSettings: Partial<ISettingsContext>) => {
    try {
      const currentSettingsStr = await AsyncStorage.getItem("@app_settings");
      const currentSettings = currentSettingsStr
        ? JSON.parse(currentSettingsStr)
        : {};
      const updatedSettings = { ...currentSettings, ...newSettings };
      await AsyncStorage.setItem(
        "@app_settings",
        JSON.stringify(updatedSettings)
      );
    } catch (e) {
      console.error("Failed to save settings.", e);
    }
  };

  const setFontSizeMultiplier = (value: number) => {
    setFontSizeMultiplierState(value);
    saveSettings({ fontSizeMultiplier: value });
  };
  const toggleBoldText = () => {
    const newValue = !isBoldTextEnabled;
    setBoldTextEnabled(newValue);
    saveSettings({ isBoldTextEnabled: newValue });
  };
  const setLineHeightMultiplier = (value: number) => {
    setLineHeightMultiplierState(value);
    saveSettings({ lineHeightMultiplier: value });
  };
  const setLetterSpacing = (value: number) => {
    setLetterSpacingState(value);
    saveSettings({ letterSpacing: value });
  };
  const toggleDyslexiaFont = () => {
    const newValue = !isDyslexiaFontEnabled;
    setDyslexiaFontEnabled(newValue);
    saveSettings({ isDyslexiaFontEnabled: newValue });
  };
  const toggleMagnifier = () => {
    const newValue = !isMagnifierEnabled;
    setMagnifierEnabled(newValue);
    saveSettings({ isMagnifierEnabled: newValue });
  };
  const toggleVoice = () => {
    const newValue = !isVoiceEnabled;
    setVoiceEnabled(newValue);
    saveSettings({ isVoiceEnabled: newValue });
  };

  // 🔹 Setter para imagem
  const setImageScale = (value: number) => {
    setImageScaleState(value);
    saveSettings({ imageScale: value });
  };

  const value = {
    fontSizeMultiplier,
    setFontSizeMultiplier,
    isBoldTextEnabled,
    toggleBoldText,
    lineHeightMultiplier,
    setLineHeightMultiplier,
    letterSpacing,
    setLetterSpacing,
    isDyslexiaFontEnabled,
    toggleDyslexiaFont,
    isMagnifierEnabled,
    toggleMagnifier,
    isVoiceEnabled,
    toggleVoice,
    imageScale,
    setImageScale,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
