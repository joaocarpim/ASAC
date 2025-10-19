import { useContext } from "react";
import { SettingsContext, ISettingsContext } from "../context/SettingsProvider";

export function useSettings(): ISettingsContext {
  const context = useContext(SettingsContext);

  if (context === undefined) {
    throw new Error("useSettings deve ser usado dentro de um SettingsProvider");
  }

  return context;
}
