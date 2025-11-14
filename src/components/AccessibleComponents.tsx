// src/components/AccessibleComponents.tsx
// Componentes pré-configurados com acessibilidade automática (Otimizado com React.memo)

import React, { useMemo, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  View,
  ViewProps,
  TextProps,
  TouchableOpacityProps,
  TextInputProps,
  ImageProps,
} from "react-native";
import { AccessibleElement } from "./AccessibleElement";
import { useSettings } from "../hooks/useSettings";

// ==========================================
// TEXTO ACESSÍVEL
// ==========================================

interface AccessibleTextProps extends TextProps {
  children: React.ReactNode;
  accessibilityText?: string;
  priority?: number;
  baseSize: number;
}

export const AccessibleText = React.memo<AccessibleTextProps>(
  ({ children, accessibilityText, priority = 5, baseSize, style, ...rest }) => {
    const { fontSizeMultiplier } = useSettings();

    const finalFontSize = useMemo(
      () => baseSize * fontSizeMultiplier,
      [baseSize, fontSizeMultiplier]
    );

    const extractText = useCallback((node: React.ReactNode): string => {
      if (typeof node === "string" || typeof node === "number") {
        return String(node);
      }
      if (Array.isArray(node)) {
        return node.map(extractText).join(" ");
      }
      return "";
    }, []);

    const textContent = useMemo(
      () => accessibilityText || extractText(children),
      [accessibilityText, children, extractText]
    );

    return (
      <AccessibleElement
        textToSpeak={textContent}
        type="texto"
        priority={priority}
      >
        <Text style={[style, { fontSize: finalFontSize }]} {...rest}>
          {children}
        </Text>
      </AccessibleElement>
    );
  }
);

AccessibleText.displayName = "AccessibleText";

// ==========================================
// BOTÃO ACESSÍVEL
// ==========================================
interface AccessibleButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  accessibilityText?: string;
  priority?: number;
}

export const AccessibleButton = React.memo<AccessibleButtonProps>(
  ({ children, accessibilityText, priority = 10, ...touchableProps }) => {
    const extractButtonText = useCallback((node: React.ReactNode): string => {
      if (typeof node === "string" || typeof node === "number") {
        return String(node);
      }
      if (React.isValidElement(node)) {
        const element = node as React.ReactElement<{
          children?: React.ReactNode;
        }>;
        if (element.props.children) {
          return extractButtonText(element.props.children);
        }
      }
      if (Array.isArray(node)) {
        return node
          .map(extractButtonText)
          .filter((text) => text)
          .join(" ");
      }
      return "";
    }, []);

    const buttonText = useMemo(
      () =>
        accessibilityText || extractButtonText(children) || "Botão sem texto",
      [accessibilityText, children, extractButtonText]
    );

    return (
      <AccessibleElement
        textToSpeak={buttonText}
        type="botão"
        priority={priority}
      >
        <TouchableOpacity {...touchableProps}>{children}</TouchableOpacity>
      </AccessibleElement>
    );
  }
);

AccessibleButton.displayName = "AccessibleButton";

// ==========================================
// CAMPO DE ENTRADA ACESSÍVEL
// ==========================================
interface AccessibleTextInputProps extends TextInputProps {
  label?: string;
  accessibilityText?: string;
  priority?: number;
}

export const AccessibleTextInput = React.memo<AccessibleTextInputProps>(
  ({ label, accessibilityText, placeholder, priority = 9, ...inputProps }) => {
    const fieldText = useMemo(
      () =>
        accessibilityText ||
        (label ? `Campo ${label}` : "") ||
        (placeholder ? `Campo: ${placeholder}` : "Campo de entrada"),
      [accessibilityText, label, placeholder]
    );

    return (
      <AccessibleElement
        textToSpeak={fieldText}
        type="campo"
        priority={priority}
      >
        <TextInput
          placeholder={placeholder}
          accessibilityLabel={fieldText}
          {...inputProps}
        />
      </AccessibleElement>
    );
  }
);

AccessibleTextInput.displayName = "AccessibleTextInput";

// ==========================================
// IMAGEM ACESSÍVEL
// ==========================================
interface AccessibleImageProps extends ImageProps {
  alt: string;
  accessibilityText?: string;
  priority?: number;
}

export const AccessibleImage = React.memo<AccessibleImageProps>(
  ({ alt, accessibilityText, priority = 4, ...imageProps }) => {
    const imageText = useMemo(
      () => accessibilityText || `Imagem: ${alt}`,
      [accessibilityText, alt]
    );

    return (
      <AccessibleElement
        textToSpeak={imageText}
        type="imagem"
        priority={priority}
      >
        <Image accessibilityLabel={imageText} {...imageProps} />
      </AccessibleElement>
    );
  }
);

AccessibleImage.displayName = "AccessibleImage";

// ==========================================
// ÁREA/VIEW ACESSÍVEL
// ==========================================
interface AccessibleViewProps extends ViewProps {
  children?: React.ReactNode;
  accessibilityText: string;
  priority?: number;
  type?: "área" | "texto" | "botão" | "campo" | "imagem";
}

export const AccessibleView = React.memo<AccessibleViewProps>(
  ({
    children,
    accessibilityText,
    priority = 1,
    type = "área",
    ...viewProps
  }) => {
    return (
      <AccessibleElement
        textToSpeak={accessibilityText}
        type={type}
        priority={priority}
      >
        <View {...viewProps}>{children}</View>
      </AccessibleElement>
    );
  }
);

AccessibleView.displayName = "AccessibleView";

// ==========================================
// HOC PARA TORNAR QUALQUER COMPONENTE ACESSÍVEL
// ==========================================
export function withAccessibility<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  textExtractor: (props: P) => string,
  type: "texto" | "botão" | "campo" | "imagem" | "área" = "área",
  priority: number = 5
) {
  const WithAccessibilityComponent = React.forwardRef<any, P>((props, ref) => {
    const text = useMemo(() => textExtractor(props as P), [props]);

    return (
      <AccessibleElement textToSpeak={text} type={type} priority={priority}>
        <WrappedComponent {...(props as P)} ref={ref} />
      </AccessibleElement>
    );
  });

  WithAccessibilityComponent.displayName = `WithAccessibility(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithAccessibilityComponent;
}

// ==========================================
// CARD ACESSÍVEL
// ==========================================
interface AccessibleCardProps extends ViewProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
}

export const AccessibleCard = React.memo<AccessibleCardProps>(
  ({ title, subtitle, children, onPress, style, ...viewProps }) => {
    const cardText = useMemo(
      () => `${title}${subtitle ? `. ${subtitle}` : ""}`,
      [title, subtitle]
    );

    const isInteractive = !!onPress;

    const CardContent = (
      <View style={style} {...viewProps}>
        {children}
      </View>
    );

    if (isInteractive) {
      return (
        <AccessibleElement textToSpeak={cardText} type="botão" priority={8}>
          <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            {CardContent}
          </TouchableOpacity>
        </AccessibleElement>
      );
    }

    return (
      <AccessibleElement textToSpeak={cardText} type="área" priority={6}>
        {CardContent}
      </AccessibleElement>
    );
  }
);

AccessibleCard.displayName = "AccessibleCard";

// ==========================================
// HEADER ACESSÍVEL
// ==========================================
interface AccessibleHeaderProps extends TextProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const AccessibleHeader = React.memo<AccessibleHeaderProps>(
  ({ children, level = 1, ...textProps }) => {
    const headerText = useMemo(
      () => (typeof children === "string" ? children : "Cabeçalho"),
      [children]
    );

    const priority = useMemo(() => 10 - level, [level]); // H1 = 9, H6 = 4

    const fullText = useMemo(
      () => `Cabeçalho nível ${level}: ${headerText}`,
      [level, headerText]
    );

    return (
      <AccessibleElement
        textToSpeak={fullText}
        type="texto"
        priority={priority}
      >
        <Text {...textProps}>{children}</Text>
      </AccessibleElement>
    );
  }
);

AccessibleHeader.displayName = "AccessibleHeader";

// ==========================================
// LISTA ACESSÍVEL
// ==========================================
interface AccessibleListProps extends ViewProps {
  data: Array<{ id: string; text: string; [key: string]: any }>;
  renderItem: (item: any, index: number) => React.ReactNode;
  listTitle?: string;
}

export const AccessibleList = React.memo<AccessibleListProps>(
  ({ data, renderItem, listTitle = "Lista", ...viewProps }) => {
    const listText = useMemo(
      () => `${listTitle} com ${data.length} itens`,
      [listTitle, data.length]
    );

    return (
      <AccessibleElement textToSpeak={listText} type="área" priority={6}>
        <View {...viewProps}>
          {data.map((item, index) => (
            <AccessibleElement
              key={item.id}
              textToSpeak={`Item ${index + 1} de ${data.length}: ${item.text}`}
              type="área"
              priority={5}
            >
              {renderItem(item, index)}
            </AccessibleElement>
          ))}
        </View>
      </AccessibleElement>
    );
  }
);

AccessibleList.displayName = "AccessibleList";

// ==========================================
// BOTÃO DE NAVEGAÇÃO COM ÍCONE
// ==========================================
interface AccessibleIconButtonProps extends TouchableOpacityProps {
  icon: string;
  label: string;
  description?: string;
}

export const AccessibleIconButton = React.memo<AccessibleIconButtonProps>(
  ({ icon, label, description, children, ...touchableProps }) => {
    const buttonText = useMemo(
      () => `${label}${description ? `. ${description}` : ""}`,
      [label, description]
    );

    return (
      <AccessibleElement textToSpeak={buttonText} type="botão" priority={10}>
        <TouchableOpacity {...touchableProps}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontSize: 24 }}>{icon}</Text>
            {children}
          </View>
        </TouchableOpacity>
      </AccessibleElement>
    );
  }
);

AccessibleIconButton.displayName = "AccessibleIconButton";
