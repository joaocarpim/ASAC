// src/components/AccessibleComponents.tsx
// Componentes pré-configurados com acessibilidade automática

import React from "react";
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

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  accessibilityText,
  priority = 5,
  baseSize,
  style,
  ...rest
}) => {
  const { fontSizeMultiplier } = useSettings();
  const finalFontSize = baseSize * fontSizeMultiplier;

  const extractText = (node: React.ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") {
      return String(node);
    }
    if (Array.isArray(node)) {
      return node.map(extractText).join(" ");
    }
    return "";
  };

  const textContent = accessibilityText || extractText(children);

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
};

// ==========================================
// BOTÃO ACESSÍVEL
// ==========================================
interface AccessibleButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  accessibilityText?: string;
  priority?: number;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  accessibilityText,
  priority = 10,
  ...touchableProps
}) => {
  const extractButtonText = (node: React.ReactNode): string => {
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
  };

  const buttonText =
    accessibilityText || extractButtonText(children) || "Botão sem texto";

  return (
    <AccessibleElement
      textToSpeak={buttonText}
      type="botão"
      priority={priority}
    >
      <TouchableOpacity {...touchableProps}>{children}</TouchableOpacity>
    </AccessibleElement>
  );
};

// ==========================================
// CAMPO DE ENTRADA ACESSÍVEL
// ==========================================
interface AccessibleTextInputProps extends TextInputProps {
  label?: string;
  accessibilityText?: string;
  priority?: number;
}

export const AccessibleTextInput: React.FC<AccessibleTextInputProps> = ({
  label,
  accessibilityText,
  placeholder,
  priority = 9,
  ...inputProps
}) => {
  const fieldText =
    accessibilityText ||
    (label ? `Campo ${label}` : "") ||
    (placeholder ? `Campo: ${placeholder}` : "Campo de entrada");

  return (
    <AccessibleElement textToSpeak={fieldText} type="campo" priority={priority}>
      <TextInput
        placeholder={placeholder}
        accessibilityLabel={fieldText}
        {...inputProps}
      />
    </AccessibleElement>
  );
};

// ==========================================
// IMAGEM ACESSÍVEL
// ==========================================
interface AccessibleImageProps extends ImageProps {
  alt: string;
  accessibilityText?: string;
  priority?: number;
}

export const AccessibleImage: React.FC<AccessibleImageProps> = ({
  alt,
  accessibilityText,
  priority = 4,
  ...imageProps
}) => {
  const imageText = accessibilityText || `Imagem: ${alt}`;

  return (
    <AccessibleElement
      textToSpeak={imageText}
      type="imagem"
      priority={priority}
    >
      <Image accessibilityLabel={imageText} {...imageProps} />
    </AccessibleElement>
  );
};

// ==========================================
// ÁREA/VIEW ACESSÍVEL
// ==========================================
interface AccessibleViewProps extends ViewProps {
  children?: React.ReactNode; // ✅ CORREÇÃO: Propriedade tornada opcional
  accessibilityText: string;
  priority?: number;
  type?: "área" | "texto" | "botão" | "campo" | "imagem";
}

export const AccessibleView: React.FC<AccessibleViewProps> = ({
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
};

// ==========================================
// HOC PARA TORNAR QUALQUER COMPONENTE ACESSÍVEL
// ==========================================
export function withAccessibility<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  textExtractor: (props: P) => string,
  type: "texto" | "botão" | "campo" | "imagem" | "área" = "área",
  priority: number = 5
) {
  return React.forwardRef<any, P>((props, ref) => {
    const text = textExtractor(props as P);

    return (
      <AccessibleElement textToSpeak={text} type={type} priority={priority}>
        <WrappedComponent {...(props as P)} ref={ref} />
      </AccessibleElement>
    );
  });
}

// ==========================================
// EXEMPLOS DE COMPONENTES CUSTOMIZADOS
// ==========================================

// Card acessível
interface AccessibleCardProps extends ViewProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
}

export const AccessibleCard: React.FC<AccessibleCardProps> = ({
  title,
  subtitle,
  children,
  onPress,
  style,
  ...viewProps
}) => {
  const cardText = `${title}${subtitle ? `. ${subtitle}` : ""}`;
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
};

// Header acessível
interface AccessibleHeaderProps extends TextProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const AccessibleHeader: React.FC<AccessibleHeaderProps> = ({
  children,
  level = 1,
  ...textProps
}) => {
  const headerText = typeof children === "string" ? children : "Cabeçalho";
  const priority = 10 - level; // H1 = prioridade 9, H6 = prioridade 4

  return (
    <AccessibleElement
      textToSpeak={`Cabeçalho nível ${level}: ${headerText}`}
      type="texto"
      priority={priority}
    >
      <Text {...textProps}>{children}</Text>
    </AccessibleElement>
  );
};

// Lista acessível
interface AccessibleListProps extends ViewProps {
  data: Array<{ id: string; text: string; [key: string]: any }>;
  renderItem: (item: any, index: number) => React.ReactNode;
  listTitle?: string;
}

export const AccessibleList: React.FC<AccessibleListProps> = ({
  data,
  renderItem,
  listTitle = "Lista",
  ...viewProps
}) => {
  const listText = `${listTitle} com ${data.length} itens`;

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
};

// Botão de navegação com ícone
interface AccessibleIconButtonProps extends TouchableOpacityProps {
  icon: string; // emoji ou texto do ícone
  label: string;
  description?: string;
}

export const AccessibleIconButton: React.FC<AccessibleIconButtonProps> = ({
  icon,
  label,
  description,
  children,
  ...touchableProps
}) => {
  const buttonText = `${label}${description ? `. ${description}` : ""}`;

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
};
