// src/hooks/useElementDetection.tsx (Cross-Platform Fix)
import { useCallback, useRef, useEffect } from "react";
import { findNodeHandle, UIManager, Platform } from "react-native";
import { TextExtractor, ElementInfo } from "../utils/textExtractor";

export interface DetectedElement extends ElementInfo {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  nodeHandle: number | null;
  component: any;
  lastUpdated: number;
}

export const useElementDetection = () => {
  const detectedElementsRef = useRef<Map<string, DetectedElement>>(new Map());

  // ✅ FIX: Tipo cross-platform
  const scanTimeoutRef = useRef<number | NodeJS.Timeout | null>(null);

  const measureQueueRef = useRef<
    Array<{
      component: any;
      ref: any;
      resolve: (element: DetectedElement | null) => void;
    }>
  >([]);
  const isProcessingQueueRef = useRef<boolean>(false);

  const processQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || measureQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;

    while (measureQueueRef.current.length > 0) {
      const item = measureQueueRef.current.shift();
      if (item) {
        try {
          const element = await scanComponentInternal(item.component, item.ref);
          item.resolve(element);
        } catch (error) {
          console.warn("Erro ao processar elemento da fila:", error);
          item.resolve(null);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    isProcessingQueueRef.current = false;
  }, []);

  const scanComponentInternal = useCallback(
    (component: any, componentRef: any): Promise<DetectedElement | null> => {
      return new Promise((resolve) => {
        if (!componentRef || !componentRef.current) {
          resolve(null);
          return;
        }

        try {
          if (
            Platform.OS === "web" &&
            componentRef.current.getBoundingClientRect
          ) {
            const rect = componentRef.current.getBoundingClientRect();
            const elementInfo = TextExtractor.processElement(component);

            const detectedElement: DetectedElement = {
              id: `web-element-${Math.random().toString(36).substr(2, 9)}`,
              x: rect.left + window.scrollX,
              y: rect.top + window.scrollY,
              width: rect.width,
              height: rect.height,
              nodeHandle: null,
              component,
              lastUpdated: Date.now(),
              ...elementInfo,
            };

            resolve(rect.width > 0 && rect.height > 0 ? detectedElement : null);
            return;
          }

          const nodeHandle = findNodeHandle(componentRef.current);
          if (!nodeHandle) {
            resolve(null);
            return;
          }

          UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
            try {
              if (width === 0 && height === 0) {
                resolve(null);
                return;
              }

              const elementInfo = TextExtractor.processElement(component);

              const detectedElement: DetectedElement = {
                id: `element-${nodeHandle}-${Math.random()
                  .toString(36)
                  .substr(2, 5)}`,
                x: pageX,
                y: pageY,
                width,
                height,
                nodeHandle,
                component,
                lastUpdated: Date.now(),
                ...elementInfo,
              };

              resolve(detectedElement);
            } catch (error) {
              console.warn("Erro ao processar medição:", error);
              resolve(null);
            }
          });
        } catch (error) {
          console.warn("Erro ao obter nodeHandle:", error);
          resolve(null);
        }
      });
    },
    []
  );

  const scanComponent = useCallback(
    (component: any, componentRef: any): Promise<DetectedElement | null> => {
      return new Promise((resolve) => {
        measureQueueRef.current.push({ component, ref: componentRef, resolve });
        processQueue();
      });
    },
    [processQueue]
  );

  const scanComponentTree = useCallback(
    async (
      rootComponent: any,
      rootRef: any,
      maxDepth: number = 3
    ): Promise<DetectedElement[]> => {
      const elements: DetectedElement[] = [];
      const visited = new Set();

      const scanRecursive = async (
        component: any,
        ref: any,
        depth: number = 0
      ) => {
        if (depth > maxDepth || !component) return;

        const componentKey = component._owner
          ? component._owner.key
          : Math.random();
        if (visited.has(componentKey)) return;
        visited.add(componentKey);

        const element = await scanComponent(component, ref);
        if (element) {
          elements.push(element);
        }

        if (component && component.props && component.props.children) {
          const children = Array.isArray(component.props.children)
            ? component.props.children
            : [component.props.children];

          for (const child of children) {
            if (child && typeof child === "object" && child.type) {
              await scanRecursive(child, null, depth + 1);
            }
          }
        }
      };

      await scanRecursive(rootComponent, rootRef);
      return elements;
    },
    [scanComponent]
  );

  const registerElement = useCallback(
    async (
      component: any,
      ref: any,
      customId?: string
    ): Promise<string | null> => {
      try {
        const element = await scanComponent(component, ref);
        if (element) {
          const id = customId || element.id;
          detectedElementsRef.current.set(id, { ...element, id });
          return id;
        }
        return null;
      } catch (error) {
        console.warn("Erro ao registrar elemento:", error);
        return null;
      }
    },
    [scanComponent]
  );

  const unregisterElement = useCallback((id: string) => {
    detectedElementsRef.current.delete(id);
  }, []);

  const findElementAtPosition = useCallback(
    (x: number, y: number): DetectedElement | null => {
      const candidates: DetectedElement[] = [];

      for (const element of detectedElementsRef.current.values()) {
        const { x: elemX, y: elemY, width, height } = element;

        if (
          x >= elemX &&
          x <= elemX + width &&
          y >= elemY &&
          y <= elemY + height
        ) {
          candidates.push(element);
        }
      }

      if (candidates.length === 0) return null;
      if (candidates.length === 1) return candidates[0];

      let bestMatch = candidates[0];
      let bestScore = calculateElementScore(bestMatch, x, y);

      for (let i = 1; i < candidates.length; i++) {
        const candidate = candidates[i];
        const score = calculateElementScore(candidate, x, y);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = candidate;
        }
      }

      return bestMatch;
    },
    []
  );

  const calculateElementScore = (
    element: DetectedElement,
    x: number,
    y: number
  ): number => {
    const area = element.width * element.height;
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );

    let score = element.priority * 100;
    score += 1000 / Math.max(area, 1);
    score -= distanceFromCenter;

    if (element.isInteractive) {
      score += 50;
    }

    return score;
  };

  const getAllElements = useCallback((): DetectedElement[] => {
    return Array.from(detectedElementsRef.current.values()).sort(
      (a, b) => b.priority - a.priority
    );
  }, []);

  const getElementsInArea = useCallback(
    (
      startX: number,
      startY: number,
      endX: number,
      endY: number
    ): DetectedElement[] => {
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      return Array.from(detectedElementsRef.current.values()).filter(
        (element) => {
          const elemCenterX = element.x + element.width / 2;
          const elemCenterY = element.y + element.height / 2;

          return (
            elemCenterX >= minX &&
            elemCenterX <= maxX &&
            elemCenterY >= minY &&
            elemCenterY <= maxY
          );
        }
      );
    },
    []
  );

  const cleanupOldElements = useCallback(() => {
    const now = Date.now();
    const maxAge = 30000;

    for (const [id, element] of detectedElementsRef.current.entries()) {
      if (now - element.lastUpdated > maxAge) {
        detectedElementsRef.current.delete(id);
      }
    }
  }, []);

  const clearElements = useCallback(() => {
    detectedElementsRef.current.clear();
    measureQueueRef.current = [];
  }, []);

  const refreshElements = useCallback(() => {
    cleanupOldElements();

    if (scanTimeoutRef.current) {
      if (typeof scanTimeoutRef.current === "number") {
        clearTimeout(scanTimeoutRef.current);
      } else {
        clearTimeout(scanTimeoutRef.current as NodeJS.Timeout);
      }
    }

    scanTimeoutRef.current = setTimeout(() => {
      console.log(`Elementos detectados: ${detectedElementsRef.current.size}`);
    }, 100) as any;
  }, [cleanupOldElements]);

  const updateElementPosition = useCallback(
    async (elementId: string, componentRef: any): Promise<boolean> => {
      const existingElement = detectedElementsRef.current.get(elementId);
      if (!existingElement) return false;

      try {
        const updatedElement = await scanComponentInternal(
          existingElement.component,
          componentRef
        );
        if (updatedElement) {
          detectedElementsRef.current.set(elementId, {
            ...updatedElement,
            id: elementId,
            lastUpdated: Date.now(),
          });
          return true;
        }
      } catch (error) {
        console.warn("Erro ao atualizar posição do elemento:", error);
      }

      return false;
    },
    [scanComponentInternal]
  );

  useEffect(() => {
    const cleanupInterval = setInterval(cleanupOldElements, 10000);

    return () => {
      clearInterval(cleanupInterval);
      if (scanTimeoutRef.current) {
        if (typeof scanTimeoutRef.current === "number") {
          clearTimeout(scanTimeoutRef.current);
        } else {
          clearTimeout(scanTimeoutRef.current as NodeJS.Timeout);
        }
      }
    };
  }, [cleanupOldElements]);

  return {
    registerElement,
    unregisterElement,
    findElementAtPosition,
    getAllElements,
    getElementsInArea,
    clearElements,
    refreshElements,
    scanComponent,
    scanComponentTree,
    updateElementPosition,
    getElementCount: () => detectedElementsRef.current.size,
  };
};
