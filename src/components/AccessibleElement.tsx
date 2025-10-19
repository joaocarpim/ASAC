// src/components/AccessibleElement.tsx
// Componente principal para tornar elementos acessíveis

import React, { useRef, useEffect, useMemo } from "react";
import { View, ViewStyle } from "react-native";
import { useAccessibility } from "../context/AccessibilityProvider";
import { AccessibleElement as AccessibleElementType } from "../types/accessibility";

interface AccessibleElementProps {
  children: React.ReactNode;
  textToSpeak: string;
  type?: "texto" | "botão" | "campo" | "imagem" | "área";
  priority?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

export const AccessibleElement: React.FC<AccessibleElementProps> = ({
  children,
  textToSpeak,
  type = "área",
  priority = 5,
  style,
  disabled = false,
}) => {
  const { isVoiceMode, registerElement, unregisterElement } =
    useAccessibility();
  const viewRef = useRef<View>(null);
  const elementIdRef = useRef<string>(
    `accessible-${Math.random().toString(36).substr(2, 9)}`
  );

  // Detectar se é interativo analisando os children
  const isInteractive = useMemo(() => {
    if (disabled) return false;

    const checkInteractive = (child: any): boolean => {
      if (!child) return false;

      // Verificar se tem propriedades de interação
      if (
        child.props?.onPress ||
        child.props?.onTouchStart ||
        child.props?.onTouchEnd ||
        child.props?.onLongPress
      ) {
        return true;
      }

      // Verificar tipo do componente
      if (child.type) {
        const childTypeName = child.type.name || child.type.displayName || "";
        const interactiveTypes = [
          "touchableopacity",
          "touchablehighlight",
          "touchablewithoutfeedback",
          "pressable",
          "button",
          "textinput",
        ];

        if (
          interactiveTypes.some((interactiveType) =>
            childTypeName.toLowerCase().includes(interactiveType)
          )
        ) {
          return true;
        }
      }

      // Verificar children recursivamente (máximo 2 níveis)
      if (child.props?.children) {
        const childrenArray = React.Children.toArray(child.props.children);
        return childrenArray.some(checkInteractive);
      }

      return false;
    };

    const childrenArray = React.Children.toArray(children);
    return childrenArray.some(checkInteractive);
  }, [children, disabled]);

  // Ajustar prioridade baseado no tipo e interatividade
  const adjustedPriority = useMemo(() => {
    let basePriority = priority;

    // Prioridades por tipo
    const typePriorities = {
      botão: 10,
      campo: 9,
      texto: 5,
      imagem: 4,
      área: 1,
    };

    basePriority = typePriorities[type] || basePriority;

    // Bonus para elementos interativos
    if (isInteractive) {
      basePriority += 2;
    }

    return basePriority;
  }, [priority, type, isInteractive]);

  // Função para medir e registrar o elemento
  const measureAndRegister = () => {
    if (!viewRef.current || !textToSpeak?.trim() || disabled) {
      return;
    }

    viewRef.current.measure((x, y, width, height, pageX, pageY) => {
      // Só registrar se tem dimensões válidas
      if (width > 0 && height > 0) {
        const element: AccessibleElementType = {
          id: elementIdRef.current,
          text: textToSpeak.trim(),
          type,
          x: pageX,
          y: pageY,
          width,
          height,
          isInteractive,
          priority: adjustedPriority,
          lastUpdated: Date.now(),
        };

        registerElement(element);
      }
    });
  };

  // Registrar/desregistrar baseado no modo de voz
  useEffect(() => {
    if (!isVoiceMode || !textToSpeak?.trim() || disabled) {
      // Desregistrar se modo desabilitado ou texto vazio
      unregisterElement(elementIdRef.current);
      return;
    }

    // Aguardar layout ser calculado antes de medir
    const timeoutId = setTimeout(measureAndRegister, 150);

    return () => {
      clearTimeout(timeoutId);
      unregisterElement(elementIdRef.current);
    };
  }, [
    isVoiceMode,
    textToSpeak,
    type,
    adjustedPriority,
    isInteractive,
    disabled,
  ]);

  // Calcular estilo com destaque visual
  const computedStyle = useMemo(() => {
    const baseStyle = Array.isArray(style)
      ? Object.assign({}, ...style)
      : style || {};

    if (isVoiceMode && !disabled) {
      return [
        baseStyle,
        {
          borderWidth: 1,
          borderColor: isInteractive
            ? "rgba(0, 122, 255, 0.7)"
            : "rgba(0, 122, 255, 0.4)",
          borderStyle: "dashed" as const,
          borderRadius: 4,
          backgroundColor: isInteractive
            ? "rgba(0, 122, 255, 0.1)"
            : "rgba(0, 122, 255, 0.05)",
        },
      ];
    }

    return baseStyle;
  }, [style, isVoiceMode, isInteractive, disabled]);

  return (
    <View
      ref={viewRef}
      style={computedStyle}
      onLayout={measureAndRegister}
      accessible={isInteractive}
      accessibilityLabel={textToSpeak}
      accessibilityRole={isInteractive ? "button" : "text"}
    >
      {children}
    </View>
  );
};
