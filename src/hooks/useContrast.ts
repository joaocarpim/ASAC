// src/hooks/useContrast.ts

import { useContext } from "react";
import { ContrastContext } from "../context/ContrastProvider";
import { ContrastContextData } from "../types/contrast";

export function useContrast(): ContrastContextData {
  const context = useContext(ContrastContext);

  if (!context) {
    throw new Error("useContrast must be used within a ContrastProvider");
  }

  return context;
}
