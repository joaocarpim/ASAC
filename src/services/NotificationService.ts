// src/services/NotificationService.ts

export interface NotificationData {
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

type Listener = (data: NotificationData | void) => void;

class NotificationServiceClass {
  private listeners: Map<string, Listener[]> = new Map();

  /**
   * Registra um ouvinte para um evento
   */
  public on(event: string, listener: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  /**
   * Remove um ouvinte específico
   */
  public off(event: string, listener: Listener): void {
    if (!this.listeners.has(event)) return;

    const listeners = this.listeners.get(event)!;
    const index = listeners.indexOf(listener);

    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Emite um evento para todos os ouvintes
   */
  private emit(event: string, data?: NotificationData): void {
    if (!this.listeners.has(event)) return;

    const listeners = this.listeners.get(event)!;
    listeners.forEach((listener) => listener(data));
  }

  /**
   * Mostra uma notificação in-app
   */
  public show(data: NotificationData): void {
    this.emit("show", data);
  }

  /**
   * Esconde a notificação atual
   */
  public hide(): void {
    this.emit("hide");
  }
}

// Exporta uma instância única (Singleton)
export const NotificationService = new NotificationServiceClass();
