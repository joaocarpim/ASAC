// src/context/ContrastProvider.tsx CORRIGIDO

import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// ✅ Importando 'Theme' para tipar o 'theme'
import { ContrastContextData, ContrastMode, Theme } from "../types/contrast";
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

  // ✅ Tipando o 'theme'
  const theme: Theme = themes[contrastMode];

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {/* Adicionando cor ao loading para ele ser visível */}
        <ActivityIndicator size="large" color={themes[contrastMode].text} />
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

// ✅ CORREÇÃO: Padronizando o nome do hook para 'useContrast'
export function useContrast() {
  const context = useContext(ContrastContext);
  if (!context) {
    throw new Error("useContrast must be used within a ContrastProvider");
  }
  return context;
}
