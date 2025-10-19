import { Dispatch, SetStateAction } from "react";

export interface AccessibleElement {
  id: string;
  type: "botão" | "texto" | "campo" | "imagem" | "área";
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isInteractive: boolean;
  priority: number;
  lastUpdated?: number;
}

export interface MagnifierState {
  isActive: boolean;
  x: number;
  y: number;
  scale: number;
  currentElement: AccessibleElement | null;
  // Campo para a nova funcionalidade de "travar" no elemento
  zoomFocus: AccessibleElement | null;
}

export interface SpeechConfig {
  lang: string;
  rate: number;
  volume: number;
}

export interface AccessibilityContextType {
  isVoiceMode: boolean;
  magnifier: MagnifierState;
  toggleVoiceMode: () => void;
  toggleMagnifierMode: () => void;
  updateMagnifierPosition: (x: number, y: number) => void;

  /**
   * speakText: fala texto via TTS.
   * elementId é opcional — pode ser usado para evitar anúncios duplicados.
   */
  speakText: (text: string, elementId?: string) => void;

  registerElement: (element: AccessibleElement) => void;
  unregisterElement: (id: string) => void;
  findElementAtPosition: (x: number, y: number) => AccessibleElement | null;

  panResponder: any;
  magnifierPanResponder: any;
  clearAllElements: () => void;
  getElementCount: () => number;
  speakMagnifierText: (text: string) => void;

  /**
   * getElementsUnderMagnifier:
   * - chamada sem argumentos (ex.: getElementsUnderMagnifier()) continua funcionando;
   * - chamada com coordenadas e raio também é permitida:
   *   getElementsUnderMagnifier(x, y, radius)
   */
  getElementsUnderMagnifier: (
    x?: number,
    y?: number,
    radius?: number
  ) => AccessibleElement[];

  findElementsAtMagnifierPosition: () => AccessibleElement[];

  /**
   * announceElementsUnderMagnifier: função auxiliar que pode falar/anunciar
   * os elementos encontrados em (x,y). Opcionalmente usada pelo provider/lente.
   */
  announceElementsUnderMagnifier?: (x?: number, y?: number) => void;

  // Função para permitir que a Lente ou outros componentes atualizem o estado
  setMagnifier: Dispatch<SetStateAction<MagnifierState>>;
}
