// src/store/useNotificationQueueStore.ts
import { create } from "zustand";

interface NotificationData {
  title: string;
  message: string;
}

interface NotificationQueueState {
  pendingNotification: NotificationData | null;
  // Ação para o Observer "enfileirar" a notificação
  queueNotification: (data: NotificationData) => void;
  // Ação para a HomeScreen "pegar" a notificação da fila
  dequeueNotification: () => NotificationData | null;
}

export const useNotificationQueueStore = create<NotificationQueueState>(
  (set, get) => ({
    pendingNotification: null,

    queueNotification: (data) => {
      // Armazena a notificação que está pendente
      set({ pendingNotification: data });
      console.log("[QueueStore] Notificação enfileirada:", data.title);
    },

    dequeueNotification: () => {
      // Pega a notificação pendente e limpa a fila
      const notification = get().pendingNotification;
      if (notification) {
        set({ pendingNotification: null });
        console.log("[QueueStore] Notificação entregue:", notification.title);
        return notification;
      }
      return null;
    },
  })
);
