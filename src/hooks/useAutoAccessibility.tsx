// src/hooks/useAutoAccessibility.tsx (Cross-Platform Fix)
import { useEffect, useRef, useCallback, useState } from "react";
import { useElementDetection } from "./useElementDetection";
import { TextExtractor } from "../utils/textExtractor";

export interface AutoAccessibilityOptions {
  priority?: number;
  forceRegister?: boolean;
  updateOnLayout?: boolean;
  debounceMs?: number;
}

interface AccessibilityContext {
  isAccessibilityMode: boolean;
  refreshElements?: () => void;
}

const useBasicAccessibility = (): AccessibilityContext => {
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);

  useEffect(() => {
    setIsAccessibilityMode(true);
  }, []);

  return {
    isAccessibilityMode,
    refreshElements: () => console.log("Refreshing elements..."),
  };
};

export const useAutoAccessibility = (
  customType?: string,
  options: AutoAccessibilityOptions = {}
) => {
  const { isAccessibilityMode, refreshElements } = useBasicAccessibility();
  const { registerElement, unregisterElement, updateElementPosition } =
    useElementDetection();

  const elementRef = useRef<any>(null);
  const elementIdRef = useRef<string | null>(null);
  const lastComponentRef = useRef<any>(null);

  // ✅ FIX: Tipo cross-platform para timeout
  const registerTimeoutRef = useRef<number | NodeJS.Timeout | null>(null);
  const isRegisteredRef = useRef<boolean>(false);

  const [registrationAttempts, setRegistrationAttempts] = useState(0);
  const maxRegistrationAttempts = 3;

  const {
    forceRegister = false,
    updateOnLayout = true,
    debounceMs = 100,
  } = options;

  const registerComponent = useCallback(async () => {
    // ✅ Limpar timeout de forma segura
    if (registerTimeoutRef.current) {
      if (typeof registerTimeoutRef.current === "number") {
        clearTimeout(registerTimeoutRef.current);
      } else {
        clearTimeout(registerTimeoutRef.current as NodeJS.Timeout);
      }
    }

    if (!elementRef.current || !isAccessibilityMode) {
      return false;
    }

    if (registrationAttempts >= maxRegistrationAttempts) {
      console.warn("Máximo de tentativas de registro atingido");
      return false;
    }

    try {
      const currentComponent = elementRef.current;

      if (
        currentComponent === lastComponentRef.current &&
        isRegisteredRef.current
      ) {
        return true;
      }

      if (
        elementIdRef.current &&
        currentComponent !== lastComponentRef.current
      ) {
        unregisterElement(elementIdRef.current);
        elementIdRef.current = null;
        isRegisteredRef.current = false;
      }

      let componentToAnalyze = currentComponent;

      if (currentComponent._children && currentComponent._children.length > 0) {
        componentToAnalyze = currentComponent._children[0];
      }

      const elementInfo = TextExtractor.processElement(componentToAnalyze);

      const hasValidText =
        elementInfo.text &&
        elementInfo.text !== `${elementInfo.type} sem texto`;
      const isForced = forceRegister;
      const isInteractive = elementInfo.isInteractive;

      if (!hasValidText && !isForced && !isInteractive) {
        return false;
      }

      const elementId = await registerElement(
        componentToAnalyze,
        elementRef,
        `auto-${Math.random().toString(36).substr(2, 9)}`
      );

      if (elementId) {
        elementIdRef.current = elementId;
        lastComponentRef.current = currentComponent;
        isRegisteredRef.current = true;
        setRegistrationAttempts(0);

        console.log("Elemento registrado:", {
          id: elementId,
          type: elementInfo.type,
          text:
            elementInfo.text.substring(0, 50) +
            (elementInfo.text.length > 50 ? "..." : ""),
          isInteractive: elementInfo.isInteractive,
        });

        return true;
      } else {
        setRegistrationAttempts((prev) => prev + 1);
        return false;
      }
    } catch (error) {
      console.warn("Erro ao registrar componente automaticamente:", error);
      setRegistrationAttempts((prev) => prev + 1);
      return false;
    }
  }, [
    isAccessibilityMode,
    registerElement,
    unregisterElement,
    forceRegister,
    registrationAttempts,
  ]);

  const unregisterComponent = useCallback(() => {
    if (registerTimeoutRef.current) {
      if (typeof registerTimeoutRef.current === "number") {
        clearTimeout(registerTimeoutRef.current);
      } else {
        clearTimeout(registerTimeoutRef.current as NodeJS.Timeout);
      }
    }

    if (elementIdRef.current) {
      unregisterElement(elementIdRef.current);
      elementIdRef.current = null;
      lastComponentRef.current = null;
      isRegisteredRef.current = false;
    }
  }, [unregisterElement]);

  const handleLayoutChange = useCallback(() => {
    if (!isAccessibilityMode || !updateOnLayout) return;

    if (registerTimeoutRef.current) {
      if (typeof registerTimeoutRef.current === "number") {
        clearTimeout(registerTimeoutRef.current);
      } else {
        clearTimeout(registerTimeoutRef.current as NodeJS.Timeout);
      }
    }

    // ✅ Armazenar como tipo genérico
    registerTimeoutRef.current = setTimeout(async () => {
      if (elementIdRef.current && elementRef.current) {
        const updated = await updateElementPosition(
          elementIdRef.current,
          elementRef
        );

        if (!updated) {
          await registerComponent();
        }
      } else {
        await registerComponent();
      }
    }, debounceMs) as any; // Type assertion para compatibilidade
  }, [
    isAccessibilityMode,
    updateOnLayout,
    debounceMs,
    updateElementPosition,
    registerComponent,
  ]);

  const forceReregister = useCallback(async () => {
    unregisterComponent();
    setRegistrationAttempts(0);
    return await registerComponent();
  }, [unregisterComponent, registerComponent]);

  useEffect(() => {
    if (isAccessibilityMode) {
      const timeoutId = setTimeout(registerComponent, 50);
      return () => clearTimeout(timeoutId);
    } else {
      unregisterComponent();
    }
  }, [isAccessibilityMode, registerComponent, unregisterComponent]);

  useEffect(() => {
    return () => {
      unregisterComponent();
      if (registerTimeoutRef.current) {
        if (typeof registerTimeoutRef.current === "number") {
          clearTimeout(registerTimeoutRef.current);
        } else {
          clearTimeout(registerTimeoutRef.current as NodeJS.Timeout);
        }
      }
    };
  }, [unregisterComponent]);

  return {
    elementRef,
    handleLayoutChange,
    registerComponent,
    unregisterComponent,
    forceReregister,
    isRegistered: isRegisteredRef.current,
    registrationAttempts,
    isAccessibilityMode,
  };
};
