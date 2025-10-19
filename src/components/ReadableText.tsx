import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  TextProps,
  TouchableOpacity,
  View,
  ViewProps,
} from "react-native";
import { useAccessibility } from "../context/AccessibilityProvider";
import { AccessibleElement } from "../types/accessibility";

// --- COMPONENTE DE TEXTO ---
interface ReadableTextProps extends TextProps {
  children: React.ReactNode;
}

// Componente que substitui o Text padrão e registra automaticamente no sistema principal
export const ReadableText: React.FC<ReadableTextProps> = ({
  children,
  style,
  ...props
}) => {
  const { isVoiceMode, magnifier, registerElement, unregisterElement } =
    useAccessibility();
  const textRef = useRef<Text>(null);
  const [elementId] = useState(
    () => `text-${Math.random().toString(36).substr(2, 9)}`
  );

  // Extrair texto do children
  const extractTextContent = (node: React.ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") {
      return String(node);
    }
    // --- CORREÇÃO 1 APLICADA AQUI ---
    if (React.isValidElement(node)) {
      const element = node as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      if (element.props.children) {
        return React.Children.toArray(element.props.children)
          .map(extractTextContent)
          .join("");
      }
    }
    // ---------------------------------
    if (Array.isArray(node)) {
      return node.map(extractTextContent).join(" ");
    }
    return "";
  };

  const textContent = extractTextContent(children);

  const measureAndRegister = () => {
    const shouldRegister = isVoiceMode || magnifier.isActive;

    if (shouldRegister && textRef.current && textContent.trim()) {
      textRef.current.measure((x, y, width, height, pageX, pageY) => {
        if (width > 0 && height > 0) {
          const element: AccessibleElement = {
            id: elementId,
            text: textContent.trim(),
            type: "texto",
            x: pageX,
            y: pageY,
            width,
            height,
            isInteractive: false,
            priority: 5,
            lastUpdated: Date.now(),
          };
          registerElement(element);
        }
      });
    }
  };

  useEffect(() => {
    const shouldRegister = isVoiceMode || magnifier.isActive;

    if (shouldRegister) {
      const timer = setTimeout(measureAndRegister, 100);
      return () => {
        clearTimeout(timer);
        unregisterElement(elementId);
      };
    } else {
      unregisterElement(elementId);
    }
  }, [isVoiceMode, magnifier.isActive, textContent]);

  const isAccessibilityActive = isVoiceMode || magnifier.isActive;

  return (
    <Text
      ref={textRef}
      style={[
        style,
        isAccessibilityActive && {
          backgroundColor: "rgba(0, 122, 255, 0.05)",
          borderWidth: 1,
          borderColor: "rgba(0, 122, 255, 0.2)",
          borderRadius: 2,
        },
      ]}
      onLayout={measureAndRegister}
      {...props}
    >
      {children}
    </Text>
  );
};

// --- COMPONENTE DE BOTÃO ---
interface ReadableButtonProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
}

export const ReadableButton: React.FC<ReadableButtonProps> = ({
  children,
  onPress,
  style,
  ...props
}) => {
  const { isVoiceMode, magnifier, registerElement, unregisterElement } =
    useAccessibility();
  const buttonRef = useRef<View>(null);
  const [elementId] = useState(
    () => `button-${Math.random().toString(36).substr(2, 9)}`
  );

  // Extrair texto do botão
  const extractTextContent = (node: React.ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") {
      return String(node);
    }
    // --- CORREÇÃO 2 APLICADA AQUI ---
    if (React.isValidElement(node)) {
      const element = node as React.ReactElement<{
        children?: React.ReactNode;
      }>;
      if (element.type === Text || element.type === ReadableText) {
        return extractTextContent(element.props.children);
      }
      if (element.props.children) {
        return React.Children.toArray(element.props.children)
          .map(extractTextContent)
          .join(" ");
      }
    }
    // ---------------------------------
    if (Array.isArray(node)) {
      return node.map(extractTextContent).join(" ");
    }
    return "";
  };

  const textContent = extractTextContent(children);

  const measureAndRegister = () => {
    const shouldRegister = isVoiceMode || magnifier.isActive;

    if (shouldRegister && buttonRef.current && textContent.trim()) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        if (width > 0 && height > 0) {
          const element: AccessibleElement = {
            id: elementId,
            text: textContent.trim(),
            type: "botão",
            x: pageX,
            y: pageY,
            width,
            height,
            isInteractive: true,
            priority: 10,
            lastUpdated: Date.now(),
          };
          registerElement(element);
        }
      });
    }
  };

  useEffect(() => {
    const shouldRegister = isVoiceMode || magnifier.isActive;

    if (shouldRegister) {
      const timer = setTimeout(measureAndRegister, 100);
      return () => {
        clearTimeout(timer);
        unregisterElement(elementId);
      };
    } else {
      unregisterElement(elementId);
    }
  }, [isVoiceMode, magnifier.isActive, textContent]);

  const isAccessibilityActive = isVoiceMode || magnifier.isActive;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <View
        ref={buttonRef}
        style={[
          style,
          isAccessibilityActive && {
            backgroundColor: "rgba(0, 122, 255, 0.05)",
            borderWidth: 1,
            borderColor: "rgba(0, 122, 255, 0.2)",
            borderRadius: 4,
          },
        ]}
        onLayout={measureAndRegister}
        {...props}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
};
