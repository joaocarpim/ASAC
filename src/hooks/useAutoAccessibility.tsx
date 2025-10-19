// src/hooks/useAutoAccessibility.tsx

import { useEffect, useRef, useCallback, useState } from "react";
import { useElementDetection } from "./useElementDetection";
import { TextExtractor } from "../utils/textExtractor";

export interface AutoAccessibilityOptions {
  priority?: number;
  forceRegister?: boolean;
  updateOnLayout?: boolean;
  debounceMs?: number;
}

// Interface básica para contexto de acessibilidade (sem importação)
interface AccessibilityContext {
  isAccessibilityMode: boolean;
  refreshElements?: () => void;
}

// Hook básico que será usado até o contexto ser criado
const useBasicAccessibility = (): AccessibilityContext => {
  const [isAccessibilityMode, setIsAccessibilityMode] = useState(false);

  // Para desenvolvimento, podemos ativar por padrão ou criar um toggle
  useEffect(() => {
    // Ativar automaticamente para teste
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
  const { isAccessibilityMode, refreshElements } = useBasicAccessibility(); // Usar versão básica por enquanto

  const { registerElement, unregisterElement, updateElementPosition } =
    useElementDetection();

  const elementRef = useRef<any>(null);
  const elementIdRef = useRef<string | null>(null);
  const lastComponentRef = useRef<any>(null);
  // --- CORREÇÃO APLICADA ---
  // O tipo correto para o ambiente React Native é NodeJS.Timeout
  const registerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRegisteredRef = useRef<boolean>(false);

  const [registrationAttempts, setRegistrationAttempts] = useState(0);
  const maxRegistrationAttempts = 3;

  const {
    forceRegister = false,
    updateOnLayout = true,
    debounceMs = 100,
  } = options;

  /**
   * Registra o componente automaticamente
   */
  const registerComponent = useCallback(async () => {
    // Limpar timeout anterior
    if (registerTimeoutRef.current) {
      clearTimeout(registerTimeoutRef.current);
    }

    if (!elementRef.current || !isAccessibilityMode) {
      return false;
    }

    if (registrationAttempts >= maxRegistrationAttempts) {
      console.warn("Máximo de tentativas de registro atingido");
      return false;
    }

    try {
      // Capturar o componente atual
      const currentComponent = elementRef.current;

      // Se já está registrado com o mesmo componente, não re-registrar
      if (
        currentComponent === lastComponentRef.current &&
        isRegisteredRef.current
      ) {
        return true;
      }

      // Se mudou o componente, desregistrar o anterior
      if (
        elementIdRef.current &&
        currentComponent !== lastComponentRef.current
      ) {
        unregisterElement(elementIdRef.current);
        elementIdRef.current = null;
        isRegisteredRef.current = false;
      }

      // Extrair informações automaticamente do componente
      let componentToAnalyze = currentComponent;

      // Se é uma ref para um elemento React Native, tentar pegar o componente pai
      if (currentComponent._children && currentComponent._children.length > 0) {
        componentToAnalyze = currentComponent._children[0];
      }

      const elementInfo = TextExtractor.processElement(componentToAnalyze);

      // Verificar se vale a pena registrar
      const hasValidText =
        elementInfo.text &&
        elementInfo.text !== `${elementInfo.type} sem texto`;
      const isForced = forceRegister;
      const isInteractive = elementInfo.isInteractive;

      if (!hasValidText && !isForced && !isInteractive) {
        return false;
      }

      // Registrar elemento
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

  /**
   * Desregistra o componente
   */
  const unregisterComponent = useCallback(() => {
    if (registerTimeoutRef.current) {
      clearTimeout(registerTimeoutRef.current);
    }

    if (elementIdRef.current) {
      unregisterElement(elementIdRef.current);
      elementIdRef.current = null;
      lastComponentRef.current = null;
      isRegisteredRef.current = false;
    }
  }, [unregisterElement]);

  /**
   * Atualiza posição quando layout muda
   */
  const handleLayoutChange = useCallback(() => {
    if (!isAccessibilityMode || !updateOnLayout) return;

    // Debounce para evitar muitas atualizações
    if (registerTimeoutRef.current) {
      clearTimeout(registerTimeoutRef.current);
    }

    registerTimeoutRef.current = setTimeout(async () => {
      if (elementIdRef.current && elementRef.current) {
        // Tentar atualizar posição primeiro
        const updated = await updateElementPosition(
          elementIdRef.current,
          elementRef
        );

        // Se não conseguiu atualizar, re-registrar
        if (!updated) {
          await registerComponent();
        }
      } else {
        // Se não tem elemento registrado, tentar registrar
        await registerComponent();
      }
    }, debounceMs);
  }, [
    isAccessibilityMode,
    updateOnLayout,
    debounceMs,
    updateElementPosition,
    registerComponent,
  ]);

  /**
   * Força novo registro
   */
  const forceReregister = useCallback(async () => {
    unregisterComponent();
    setRegistrationAttempts(0);
    return await registerComponent();
  }, [unregisterComponent, registerComponent]);

  // Registrar/desregistrar baseado no modo de acessibilidade
  useEffect(() => {
    if (isAccessibilityMode) {
      // Pequeno delay para garantir que o componente foi montado
      const timeoutId = setTimeout(registerComponent, 50);
      return () => clearTimeout(timeoutId);
    } else {
      unregisterComponent();
    }
  }, [isAccessibilityMode, registerComponent, unregisterComponent]);

  // Limpeza na desmontagem
  useEffect(() => {
    return () => {
      unregisterComponent();
      if (registerTimeoutRef.current) {
        clearTimeout(registerTimeoutRef.current);
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
