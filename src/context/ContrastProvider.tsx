// src/context/ContrastProvider.tsx

import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ContrastContextData, ContrastMode } from "../types/contrast";
import { themes } from "../theme";
import { ActivityIndicator, View } from "react-native";

export const ContrastContext = createContext<ContrastContextData>(
  {} as ContrastContextData
);

interface ContrastProviderProps {
  children: ReactNode;
}

export const ContrastProvider: React.FC<ContrastProviderProps> = ({
  children,
}) => {
  const [contrastMode, setContrastMode] = useState<ContrastMode>("blue_yellow");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem("@app_contrast_mode");
        if (savedMode !== null) {
          setContrastMode(savedMode as ContrastMode);
        }
      } catch (e) {
        console.error("Failed to load contrast preference.", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreference();
  }, []);

  const changeContrastMode = async (mode: ContrastMode) => {
    try {
      await AsyncStorage.setItem("@app_contrast_mode", mode);
      setContrastMode(mode);
    } catch (e) {
      console.error("Failed to save contrast preference.", e);
    }
  };

  const theme = themes[contrastMode];

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ContrastContext.Provider
      value={{ contrastMode, theme, changeContrastMode }}
    >
      {children}
    </ContrastContext.Provider>
  );
};
