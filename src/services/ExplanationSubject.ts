// src/services/ExplanationSubject.ts

export interface ExplanationEvent {
  title: string;
  message: string;
  // ✅ CORREÇÃO: Adicionados todos os tipos necessários
  type: "info" | "success" | "warning" | "error";
  onDismiss?: () => void;
}

type Observer = (data: ExplanationEvent) => void;

class ExplanationSubjectClass {
  private observers: Observer[] = [];

  subscribe(observer: Observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer: Observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify(data: ExplanationEvent) {
    this.observers.forEach((observer) => observer(data));
  }
}

export const ExplanationSubject = new ExplanationSubjectClass();
