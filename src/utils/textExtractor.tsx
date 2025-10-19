import React from "react";

export interface ElementInfo {
  text: string;
  type: string;
  role: string;
  isInteractive: boolean;
  priority: number;
}

// Interfaces para tipagem das props
interface ComponentProps {
  accessibilityLabel?: string;
  title?: string;
  placeholder?: string;
  alt?: string;
  value?: any;
  children?: React.ReactNode;
  onPress?: () => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  source?: { uri: string } | number;
  multiline?: boolean;
  numberOfLines?: number;
  data?: any[];
  accessibilityRole?: string;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  onValueChange?: (value: any) => void;
  onSelectionChange?: (event: any) => void;
  onClick?: () => void;
  onTouchMove?: () => void;
  [key: string]: any;
}

interface ComponentType {
  name?: string;
  displayName?: string;
  [key: string]: any;
}

export class TextExtractor {
  static extractTextFromElement(element: any): string {
    if (!element) return "";

    if (typeof element === "string" || typeof element === "number") {
      return String(element).trim();
    }

    if (Array.isArray(element)) {
      return element
        .map((item) => this.extractTextFromElement(item))
        .filter((text) => text.length > 0)
        .join(" ");
    }

    if (React.isValidElement(element)) {
      const props = element.props as ComponentProps;

      // Prioridades de extração
      if (props.accessibilityLabel) return props.accessibilityLabel;
      if (props.title) return props.title;
      if (props.placeholder) return `Campo: ${props.placeholder}`;
      if (props.alt) return props.alt;
      if (props.value && typeof props.value === "string")
        return `Valor: ${props.value}`;

      // Extrair de children recursivamente
      if (props.children) {
        return this.extractTextFromElement(props.children);
      }
    }

    if (element && typeof element === "object" && "children" in element) {
      return this.extractTextFromElement((element as any).children);
    }

    return "";
  }

  static identifyComponentType(element: any): string {
    if (!element) return "elemento";

    if (React.isValidElement(element)) {
      const elementType = element.type as ComponentType;
      const props = element.props as ComponentProps;

      // Identificação por tipo de componente
      if (typeof elementType === "string") {
        const typeMap: { [key: string]: string } = {
          Text: "texto",
          TextInput: "campo de entrada",
          Image: "imagem",
          Button: "botão",
          TouchableOpacity: "botão",
          TouchableHighlight: "botão",
          TouchableWithoutFeedback: "botão",
          Pressable: "botão",
          ScrollView: "área de rolagem",
          FlatList: "lista",
          SectionList: "lista de seções",
          View: "área",
        };

        if (typeMap[elementType]) {
          return typeMap[elementType];
        }
      }

      // Identificação por nome da função/classe
      if (typeof elementType === "function") {
        const name =
          (elementType as ComponentType).name ||
          (elementType as ComponentType).displayName ||
          "";
        const lowerName = name.toLowerCase();

        if (lowerName.includes("button")) return "botão";
        if (lowerName.includes("text") && !lowerName.includes("input"))
          return "texto";
        if (lowerName.includes("input") || lowerName.includes("field"))
          return "campo de entrada";
        if (lowerName.includes("image") || lowerName.includes("avatar"))
          return "imagem";
        if (lowerName.includes("icon")) return "ícone";
        if (lowerName.includes("card")) return "cartão";
        if (lowerName.includes("modal")) return "janela modal";
        if (lowerName.includes("header")) return "cabeçalho";
        if (lowerName.includes("footer")) return "rodapé";
        if (lowerName.includes("nav")) return "navegação";
        if (lowerName.includes("tab")) return "aba";
        if (lowerName.includes("menu")) return "menu";
        if (lowerName.includes("picker")) return "seletor";
        if (lowerName.includes("slider")) return "controle deslizante";
        if (lowerName.includes("switch")) return "interruptor";
      }

      // Identificação por propriedades
      if (props.onPress || props.onTouchStart || props.onTouchEnd)
        return "botão";
      if (
        props.source &&
        ((typeof props.source === "object" && "uri" in props.source) ||
          typeof props.source === "number")
      )
        return "imagem";
      if (props.multiline !== undefined || props.numberOfLines !== undefined)
        return "campo de texto";
      if (props.data && Array.isArray(props.data)) return "lista";

      // Por accessibilityRole
      if (props.accessibilityRole) {
        const roleMap: { [key: string]: string } = {
          button: "botão",
          text: "texto",
          image: "imagem",
          header: "cabeçalho",
          link: "link",
          search: "campo de busca",
          textbox: "campo de texto",
          checkbox: "caixa de seleção",
          radio: "botão de rádio",
          tab: "aba",
          tablist: "lista de abas",
          menu: "menu",
          menubar: "barra de menu",
          menuitem: "item de menu",
          toolbar: "barra de ferramentas",
          progressbar: "barra de progresso",
          slider: "controle deslizante",
          switch: "interruptor",
          alert: "alerta",
          dialog: "diálogo",
        };

        if (roleMap[props.accessibilityRole]) {
          return roleMap[props.accessibilityRole];
        }
      }
    }

    return "elemento";
  }

  static isInteractive(element: any): boolean {
    if (!React.isValidElement(element)) return false;

    const props = element.props as ComponentProps;
    const elementType = element.type;

    // Props que indicam interatividade
    const interactiveProps = [
      "onPress",
      "onTouchStart",
      "onTouchEnd",
      "onTouchMove",
      "onChangeText",
      "onFocus",
      "onBlur",
      "onSubmitEditing",
      "onValueChange",
      "onSelectionChange",
      "onClick",
    ];

    if (interactiveProps.some((prop) => props[prop])) return true;

    // Tipos nativos interativos
    if (typeof elementType === "string") {
      const interactiveTypes = [
        "Button",
        "TouchableOpacity",
        "TouchableHighlight",
        "TouchableWithoutFeedback",
        "Pressable",
        "TextInput",
      ];
      if (interactiveTypes.includes(elementType)) return true;
    }

    // Componentes customizados interativos
    if (typeof elementType === "function") {
      const name =
        (elementType as ComponentType).name ||
        (elementType as ComponentType).displayName ||
        "";
      const interactiveNames = [
        "button",
        "touchable",
        "pressable",
        "clickable",
      ];
      if (
        interactiveNames.some((interactive) =>
          name.toLowerCase().includes(interactive)
        )
      ) {
        return true;
      }
    }

    // Por accessibilityRole
    if (props.accessibilityRole) {
      const interactiveRoles = [
        "button",
        "link",
        "textbox",
        "checkbox",
        "radio",
        "tab",
        "menuitem",
        "slider",
        "switch",
      ];
      if (interactiveRoles.includes(props.accessibilityRole)) return true;
    }

    return false;
  }

  static getPriority(element: any): number {
    const type = this.identifyComponentType(element);
    const isInteractive = this.isInteractive(element);

    // Sistema de prioridades (maior número = maior prioridade)
    const priorityMap: { [key: string]: number } = {
      botão: 10,
      "campo de entrada": 9,
      link: 8,
      cabeçalho: 7,
      texto: 5,
      imagem: 4,
      ícone: 3,
      área: 1,
      elemento: 1,
    };

    let priority = priorityMap[type] || 1;

    // Bonus para elementos interativos
    if (isInteractive) {
      priority += 2;
    }

    return priority;
  }

  static generateContextDescription(
    element: any,
    siblings: any[],
    index: number
  ): string {
    const totalSiblings = siblings.length;
    let context = "";

    if (totalSiblings > 1) {
      context += ` Item ${index + 1} de ${totalSiblings}`;
    }

    const type = this.identifyComponentType(element);

    // Contexto específico por tipo
    switch (type) {
      case "botão":
        if (totalSiblings > 1) context += " em grupo de botões";
        break;
      case "campo de entrada":
        context += " campo editável";
        break;
      case "imagem":
        context += " conteúdo visual";
        break;
      case "texto":
        if (totalSiblings > 1) context += " em bloco de texto";
        break;
    }

    return context;
  }

  static processElement(element: any, context?: any): ElementInfo {
    const text = this.extractTextFromElement(element);
    const type = this.identifyComponentType(element);
    const isInteractive = this.isInteractive(element);
    const priority = this.getPriority(element);

    // Determinar role baseado no tipo
    let role = "text";
    if (isInteractive) {
      if (type === "botão") role = "button";
      else if (type === "campo de entrada") role = "textbox";
      else if (type === "link") role = "link";
      else role = "button";
    } else {
      if (type === "imagem") role = "image";
      else if (type === "cabeçalho") role = "header";
      else role = "text";
    }

    return {
      text: text || `${type} sem texto`,
      type,
      role,
      isInteractive,
      priority,
    };
  }

  static processElementList(elements: any[]): ElementInfo[] {
    return elements
      .map((element, index) => {
        const info = this.processElement(element);
        const context = this.generateContextDescription(
          element,
          elements,
          index
        );

        if (context) {
          info.text += `.${context}`;
        }

        return info;
      })
      .sort((a, b) => b.priority - a.priority); // Ordenar por prioridade
  }

  static createAnnouncement(elementInfo: ElementInfo): string {
    let announcement = "";

    // Prefixo com tipo se não for texto simples
    if (elementInfo.type !== "texto" && elementInfo.type !== "elemento") {
      announcement += `${elementInfo.type}: `;
    }

    // Conteúdo principal
    announcement += elementInfo.text;

    // Sufixo com dica de interação
    if (elementInfo.isInteractive) {
      switch (elementInfo.type) {
        case "botão":
          announcement += ". Toque para ativar";
          break;
        case "campo de entrada":
          announcement += ". Toque para editar";
          break;
        case "link":
          announcement += ". Toque para abrir";
          break;
        default:
          announcement += ". Interativo";
      }
    }

    return announcement;
  }
}
