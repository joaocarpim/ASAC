import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { PanResponder, Dimensions, PixelRatio } from "react-native";
import {
  AccessibleElement,
  AccessibilityContextType,
  SpeechConfig,
  MagnifierState,
} from "../types/accessibility";

/** PrecisionElement estendido */
interface PrecisionElement extends AccessibleElement {
  centerX: number;
  centerY: number;
  area: number;
  distanceFromTouch: number;
  touchRadius: number;
  bbox: { left: number; top: number; right: number; bottom: number };
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(
  null
);

interface AccessibilityProviderProps {
  children: React.ReactNode;
  speechConfig?: Partial<SpeechConfig>;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  speechConfig = {},
}) => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [magnifier, setMagnifier] = useState<MagnifierState>({
    isActive: false,
    x: 200,
    y: 300,
    scale: 2,
    currentElement: null,
    zoomFocus: null,
  });

  const elementsRef = useRef<Map<string, AccessibleElement>>(new Map());
  const elementCacheRef = useRef<Map<string, PrecisionElement>>(new Map());
  const lastSpokenRef = useRef<string>("");
  const lastMagnifiedElementIdRef = useRef<string | null>(null);
  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTouchPositionRef = useRef<{ x: number; y: number } | null>(null);

  const speechSettings: SpeechConfig = {
    lang: "pt-BR",
    rate: 0.9,
    volume: 1.0,
    ...speechConfig,
  };

  const { width, height } = Dimensions.get("window");
  const PIXEL_RATIO = PixelRatio.get();

  const MAGNIFIER_RADIUS = 75;
  const INTERSECTION_SAMPLES = 8;

  /* -------------------- utilitários -------------------- */

  const normalizeCoord = useCallback((x: number, y: number) => {
    return { x, y };
  }, []);

  const createPrecisionData = useCallback(
    (element: AccessibleElement, px: number, py: number): PrecisionElement => {
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      const area = Math.max(1, element.width * element.height);
      const distanceFromTouch = Math.hypot(px - centerX, py - centerY);
      let touchRadius = Math.min(element.width, element.height) / 2;
      if (element.isInteractive) touchRadius = Math.max(touchRadius, 20);
      touchRadius = Math.min(touchRadius, 120);
      const bbox = {
        left: element.x,
        top: element.y,
        right: element.x + element.width,
        bottom: element.y + element.height,
      };
      const pe: PrecisionElement = {
        ...element,
        centerX,
        centerY,
        area,
        distanceFromTouch,
        touchRadius,
        bbox,
      };
      elementCacheRef.current.set(element.id, pe);
      return pe;
    },
    []
  );

  const circleRectIntersectionArea = useCallback(
    (
      cx: number,
      cy: number,
      r: number,
      rect: { left: number; top: number; right: number; bottom: number }
    ) => {
      const S = INTERSECTION_SAMPLES;
      const rectW = Math.max(0.0001, rect.right - rect.left);
      const rectH = Math.max(0.0001, rect.bottom - rect.top);
      let hits = 0;
      for (let i = 0; i < S; i++) {
        for (let j = 0; j < S; j++) {
          const sampleX = rect.left + ((i + 0.5) / S) * rectW;
          const sampleY = rect.top + ((j + 0.5) / S) * rectH;
          const d2 =
            (sampleX - cx) * (sampleX - cx) + (sampleY - cy) * (sampleY - cy);
          if (d2 <= r * r) hits++;
        }
      }
      const sampleArea = (rectW * rectH) / (S * S);
      return hits * sampleArea;
    },
    []
  );

  const isPointInElementWithTolerance = useCallback(
    (
      element: PrecisionElement,
      touchX: number,
      touchY: number,
      magnifierRadius = 0
    ) => {
      const basicContainment =
        touchX >= element.x &&
        touchX <= element.x + element.width &&
        touchY >= element.y &&
        touchY <= element.y + element.height;
      if (basicContainment) return true;

      if (element.isInteractive) {
        const distanceToCenter = Math.hypot(
          touchX - element.centerX,
          touchY - element.centerY
        );
        if (distanceToCenter <= element.touchRadius) return true;
      }

      if (magnifierRadius > 0) {
        const interArea = circleRectIntersectionArea(
          touchX,
          touchY,
          magnifierRadius,
          element.bbox
        );
        const relative = interArea / Math.max(1, element.area);
        if (relative > 0.08) return true;
      }

      if (element.type === "texto") {
        const tolerance = Math.min(
          element.width * 0.1,
          element.height * 0.1,
          15
        );
        return (
          touchX >= element.x - tolerance &&
          touchX <= element.x + element.width + tolerance &&
          touchY >= element.y - tolerance &&
          touchY <= element.y + element.height + tolerance
        );
      }
      return false;
    },
    [circleRectIntersectionArea]
  );

  const calculatePrecisionScore = useCallback(
    (
      element: PrecisionElement,
      touchX: number,
      touchY: number,
      magnifierRadius = 0
    ) => {
      let score = 0;
      score += (element.priority ?? 0) * 10;
      const exactContainment =
        touchX >= element.x &&
        touchX <= element.x + element.width &&
        touchY >= element.y &&
        touchY <= element.y + element.height;
      if (exactContainment) {
        score += 50;
        const centerDistance = Math.hypot(
          touchX - element.centerX,
          touchY - element.centerY
        );
        const normalizedCenterDistance =
          centerDistance / Math.max(element.width, element.height);
        score += (1 - Math.min(1, normalizedCenterDistance)) * 20;
      }
      const maxDistance = 100;
      const proximityScore = Math.max(
        0,
        ((maxDistance - element.distanceFromTouch) / maxDistance) * 30
      );
      score += proximityScore;
      const maxArea = width * height * 0.1;
      const sizeScore = Math.max(0, ((maxArea - element.area) / maxArea) * 20);
      score += sizeScore;
      if (element.isInteractive) {
        score += 25;
        if (element.type === "botão") score += 10;
      }
      const screenArea = width * height;
      const elementAreaPercentage = element.area / screenArea;
      if (elementAreaPercentage > 0.3) score -= 30;
      if (
        element.text &&
        element.text.length > 5 &&
        !element.text.includes("sem texto")
      )
        score += 15;

      if (magnifierRadius > 0) {
        const interArea = circleRectIntersectionArea(
          touchX,
          touchY,
          magnifierRadius,
          element.bbox
        );
        const interRel = interArea / Math.max(1, element.area);
        score += interRel * 60;
      }

      return Math.max(0, score);
    },
    [width, height, circleRectIntersectionArea]
  );

  const isValidSelection = useCallback(
    (element: PrecisionElement, touchX: number, touchY: number) => {
      if (element.distanceFromTouch > 150) return false;
      if (!element.text || element.text.length < 2) return false;
      const screenArea = width * height;
      const elementAreaPercentage = element.area / screenArea;
      if (elementAreaPercentage > 0.5) return false;
      return true;
    },
    [width, height]
  );

  const findElementInExpandedRadius = useCallback(
    (touchX: number, touchY: number): AccessibleElement | null => {
      const expandedCandidates: Array<{
        element: AccessibleElement;
        distance: number;
      }> = [];
      for (const element of elementsRef.current.values()) {
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        const distance = Math.hypot(touchX - centerX, touchY - centerY);
        if (distance <= 120) expandedCandidates.push({ element, distance });
      }
      if (expandedCandidates.length === 0) return null;
      expandedCandidates.sort(
        (a, b) =>
          a.distance - b.distance || b.element.priority - a.element.priority
      );
      return expandedCandidates[0].element;
    },
    []
  );

  const findElementAtPositionPrecise = useCallback(
    (
      touchX: number,
      touchY: number,
      magnifierRadius = 0
    ): AccessibleElement | null => {
      if (lastTouchPositionRef.current) {
        const distance = Math.hypot(
          touchX - lastTouchPositionRef.current.x,
          touchY - lastTouchPositionRef.current.y
        );
        if (distance > 50) elementCacheRef.current.clear();
      }
      lastTouchPositionRef.current = { x: touchX, y: touchY };

      const candidates: PrecisionElement[] = [];

      for (const el of elementsRef.current.values()) {
        const cached = elementCacheRef.current.get(el.id);
        const pe = cached ?? createPrecisionData(el, touchX, touchY);
        pe.distanceFromTouch = Math.hypot(
          touchX - pe.centerX,
          touchY - pe.centerY
        );

        if (
          isPointInElementWithTolerance(pe, touchX, touchY, magnifierRadius)
        ) {
          candidates.push(pe);
        }
      }

      if (candidates.length === 0) {
        return findElementInExpandedRadius(touchX, touchY);
      }

      const scored = candidates.map((c) => ({
        element: c,
        score: calculatePrecisionScore(c, touchX, touchY, magnifierRadius),
      }));

      scored.sort((a, b) => b.score - a.score);

      const best = scored[0]?.element;
      if (best && isValidSelection(best, touchX, touchY)) return best;
      return null;
    },
    [
      createPrecisionData,
      isPointInElementWithTolerance,
      findElementInExpandedRadius,
      calculatePrecisionScore,
      isValidSelection,
    ]
  );

  /* -------------------- TTS / announce -------------------- */

  const speakText = useCallback(
    (text: string) => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      speechTimeoutRef.current = setTimeout(() => {
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = speechSettings.lang;
          utterance.rate = speechSettings.rate;
          utterance.volume = speechSettings.volume;
          utterance.onerror = (e) => console.warn("Erro na síntese de voz:", e);
          window.speechSynthesis.speak(utterance);
        }
        console.log("🔊 [Acessibilidade]:", text);
      }, 50);
    },
    [speechSettings]
  );

  const createElementAnnouncement = useCallback(
    (element: AccessibleElement) => {
      let announcement = `${element.type}: ${element.text}`;
      if (element.isInteractive) {
        announcement += ". Toque duas vezes para ativar";
      }
      return announcement;
    },
    []
  );

  /* -------------------- registro / limpeza -------------------- */

  const registerElement = useCallback((element: AccessibleElement) => {
    elementsRef.current.set(element.id, {
      ...element,
      lastUpdated: Date.now(),
    });
    elementCacheRef.current.delete(element.id);
  }, []);

  const unregisterElement = useCallback((id: string) => {
    elementsRef.current.delete(id);
    elementCacheRef.current.delete(id);
  }, []);

  const clearAllElements = useCallback(() => {
    elementsRef.current.clear();
    elementCacheRef.current.clear();
    lastSpokenRef.current = "";
    lastMagnifiedElementIdRef.current = null;
  }, []);

  /* -------------------- controles de modo / panResponder (voz) -------------------- */

  const toggleVoiceMode = useCallback(() => {
    const newMode = !isVoiceMode;
    setIsVoiceMode(newMode);
    if (newMode) {
      speakText(
        "Explorar por Toque ativado. Pressione e arraste o dedo pela tela."
      );
    } else {
      speakText("Explorar por Toque desativado");
      if (typeof window !== "undefined" && "speechSynthesis" in window)
        window.speechSynthesis.cancel();
    }
  }, [isVoiceMode, speakText]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isVoiceMode && !magnifier.isActive,
    onMoveShouldSetPanResponder: () => isVoiceMode && !magnifier.isActive,
    onPanResponderGrant: (evt) => {
      const { pageX, pageY } = evt.nativeEvent;
      const el = findElementAtPositionPrecise(pageX, pageY);
      if (el) {
        lastSpokenRef.current = el.id;
        speakText(createElementAnnouncement(el));
      } else {
        lastSpokenRef.current = "vazio";
        speakText("Área vazia.");
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      const { moveX, moveY } = gestureState;
      const element = findElementAtPositionPrecise(moveX, moveY);

      if (element && element.id !== lastSpokenRef.current) {
        lastSpokenRef.current = element.id;
        speakText(createElementAnnouncement(element));
      } else if (!element && lastSpokenRef.current !== "vazio") {
        lastSpokenRef.current = "vazio";
        speakText("Área vazia.");
      }
    },
    onPanResponderRelease: () => {
      lastSpokenRef.current = "";
    },
  });

  /* -------------------- lupa: update, getElementsUnderMagnifier, announce -------------------- */

  const toggleMagnifierMode = useCallback(() => {
    const newMode = !magnifier.isActive;
    setMagnifier((prev) => ({
      ...prev,
      isActive: newMode,
      currentElement: null,
      zoomFocus: null,
    }));
    lastMagnifiedElementIdRef.current = null;
    if (newMode)
      speakText("Lupa ativada. Arraste para ampliar e ler o conteúdo.");
    else speakText("Lupa desativada");
  }, [magnifier.isActive, speakText]);

  const updateMagnifierPosition = useCallback(
    (pageX: number, pageY: number) => {
      const boundedX = Math.max(
        MAGNIFIER_RADIUS,
        Math.min(width - MAGNIFIER_RADIUS, pageX)
      );
      const boundedY = Math.max(
        MAGNIFIER_RADIUS,
        Math.min(height - MAGNIFIER_RADIUS, pageY)
      );

      setMagnifier((prev) => ({ ...prev, x: boundedX, y: boundedY }));

      const element = findElementAtPositionPrecise(
        boundedX,
        boundedY,
        MAGNIFIER_RADIUS
      );
      setMagnifier((prev) => ({ ...prev, currentElement: element }));

      if (element && element.id !== lastMagnifiedElementIdRef.current) {
        lastMagnifiedElementIdRef.current = element.id;
        speakText(createElementAnnouncement(element));
      } else if (!element && lastMagnifiedElementIdRef.current !== null) {
        lastMagnifiedElementIdRef.current = null;
      }
    },
    [width, height, findElementAtPositionPrecise, speakText]
  );

  const getElementsUnderMagnifier = useCallback(
    (pageX?: number, pageY?: number, radius?: number) => {
      let cx = magnifier.x;
      let cy = magnifier.y;
      if (typeof pageX === "number" && typeof pageY === "number") {
        const n = normalizeCoord(pageX, pageY);
        cx = n.x;
        cy = n.y;
      }
      const r = typeof radius === "number" ? radius : MAGNIFIER_RADIUS;

      const list: Array<{ el: AccessibleElement; inter: number }> = [];
      for (const el of elementsRef.current.values()) {
        const bbox = {
          left: el.x,
          top: el.y,
          right: el.x + el.width,
          bottom: el.y + el.height,
        };
        const inter = circleRectIntersectionArea(cx, cy, r, bbox);
        if (inter > 0) list.push({ el, inter });
      }
      list.sort((a, b) => b.inter - a.inter || b.el.priority - a.el.priority);
      return list.map((i) => i.el);
    },
    [magnifier.x, magnifier.y, normalizeCoord, circleRectIntersectionArea]
  );

  const announceElementsUnderMagnifier = useCallback(
    (pageX?: number, pageY?: number, radius?: number) => {
      const elements = getElementsUnderMagnifier(pageX, pageY, radius);
      if (!elements || elements.length === 0) {
        speakText("Nenhum elemento detectado.");
        return;
      }
      const names = elements.map((e) => e.text || e.type).join(", ");
      speakText(`Elementos detectados: ${names}`);
    },
    [getElementsUnderMagnifier, speakText]
  );

  const findElementsAtMagnifierPosition = useCallback(() => {
    if (!magnifier.isActive) return [];
    return magnifier.currentElement ? [magnifier.currentElement] : [];
  }, [magnifier.isActive, magnifier.currentElement]);

  const magnifierPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => magnifier.isActive,
    onMoveShouldSetPanResponder: () => magnifier.isActive,
    onPanResponderGrant: (evt) => {
      if (!magnifier.isActive) return;
      setMagnifier((prev) => ({ ...prev, zoomFocus: null }));
      const { pageX, pageY } = evt.nativeEvent;
      updateMagnifierPosition(pageX, pageY);
    },
    onPanResponderMove: (evt, gestureState) => {
      if (!magnifier.isActive) return;
      updateMagnifierPosition(gestureState.moveX, gestureState.moveY);
    },
    onPanResponderRelease: (evt) => {
      if (!magnifier.isActive) return;
      const { pageX, pageY } = evt.nativeEvent;
      const elements = getElementsUnderMagnifier(
        pageX,
        pageY,
        MAGNIFIER_RADIUS
      );
      const top = elements[0] ?? null;
      setMagnifier((prev) => ({ ...prev, zoomFocus: top }));
      if (top) {
        speakText(`Lupa focada em: ${top.text}`);
      } else {
        speakText("Lupa liberada: nenhum elemento focado.");
      }
    },
  });

  /* -------------------- cleanup -------------------- */

  useEffect(() => {
    return () => {
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* -------------------- contexto -------------------- */

  const contextValue: AccessibilityContextType = {
    isVoiceMode,
    toggleVoiceMode,
    panResponder,
    speakText,
    registerElement,
    unregisterElement,
    clearAllElements,
    getElementCount: () => elementsRef.current.size,
    findElementAtPosition: findElementAtPositionPrecise,
    magnifier,
    setMagnifier,
    toggleMagnifierMode,
    updateMagnifierPosition,
    magnifierPanResponder,
    speakMagnifierText: speakText,
    getElementsUnderMagnifier,
    findElementsAtMagnifierPosition,
    announceElementsUnderMagnifier,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility deve ser usado dentro de um AccessibilityProvider"
    );
  }
  return context;
};

export const useMagnifier = () => {
  const context = useAccessibility();
  return {
    magnifier: context.magnifier,
    toggleMagnifier: context.toggleMagnifierMode,
    updateMagnifierPosition: context.updateMagnifierPosition,
    panResponder: context.magnifierPanResponder,
    getElementsUnderMagnifier: context.getElementsUnderMagnifier,
  };
};
