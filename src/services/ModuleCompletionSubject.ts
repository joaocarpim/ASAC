// Interface para definir quais dados serão enviados no evento
export interface ModuleCompletionData {
  moduleId: string;
  moduleNumber: number;
  accuracy: number;
  passed: boolean;
}

// Interface para garantir que todo observador tenha o método update
interface Observer {
  update(data: ModuleCompletionData): void;
}

class ModuleCompletionSubject {
  private observers: Observer[] = [];

  // Método para um "ouvinte" se registrar
  public subscribe(observer: Observer): void {
    const isSubscribed = this.observers.includes(observer);
    if (isSubscribed) {
      return console.log("[Subject] Observador já estava inscrito.");
    }
    this.observers.push(observer);
    console.log("[Subject] Observador inscrito com sucesso.");
  }

  // Método para um "ouvinte" parar de ouvir
  public unsubscribe(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex === -1) {
      return console.log(
        "[Subject] Observador não encontrado para desinscrever."
      );
    }
    this.observers.splice(observerIndex, 1);
    console.log("[Subject] Observador desinscrito.");
  }

  // Método que o app chamará para "gritar" o evento para todos
  public notify(data: ModuleCompletionData): void {
    console.log(
      `[Subject] Notificando ${this.observers.length} observadores...`
    );
    for (const observer of this.observers) {
      observer.update(data);
    }
  }
}

// Exporta uma instância única (Singleton) para que todo o app use o mesmo Sujeito
export const moduleCompletionSubject = new ModuleCompletionSubject();
