// src/services/ContractionSubject.ts

export type NotificationType = "success" | "error";

export interface NotificationEvent {
  message: string;
  type: NotificationType;
}

type Observer = (data: NotificationEvent) => void;

class ContractionSubjectClass {
  private observers: Observer[] = [];

  // Quem quiser ouvir (a notificação visual), se inscreve aqui
  subscribe(observer: Observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer: Observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  // A tela do jogo chama isso para disparar o evento
  notify(data: NotificationEvent) {
    this.observers.forEach((observer) => observer(data));
  }
}

export const ContractionSubject = new ContractionSubjectClass();
