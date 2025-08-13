// src/context/SettingsContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

// Tipos para as opções de configuração
export type Theme = "claro" | "escuro" | "azul";
export type FontSize = "atual" | "grande" | "extra";

// Tipo para o estado do contexto
interface ISettingsContext {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  zoom: number;
  setZoom: (value: number) => void;
  isNarrationEnabled: boolean;
  setIsNarrationEnabled: (value: boolean) => void;
  isSoundEffectsEnabled: boolean;
  setIsSoundEffectsEnabled: (value: boolean) => void;
}

// Cria o Context com um valor padrão (pode ser undefined se você sempre usar o Provider)
export const SettingsContext = createContext<ISettingsContext | undefined>(
  undefined
);

// Cria o Provedor de Contexto
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("claro");
  const [fontSize, setFontSize] = useState<FontSize>("atual");
  const [zoom, setZoom] = useState(0.5); // 0 a 1
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(true);
  const [isSoundEffectsEnabled, setIsSoundEffectsEnabled] = useState(true);

  return (
    <SettingsContext.Provider
      value={{
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Hook customizado para usar o contexto mais facilmente
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
