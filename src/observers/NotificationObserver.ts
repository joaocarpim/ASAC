// src/observers/NotificationObserver.ts
import { ModuleCompletionData } from "../services/ModuleCompletionSubject";
import * as Notifications from "expo-notifications";
// ❌ Audio foi removido
import { useModalStore } from "../store/useModalStore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true, // Deixa o OS tocar o som (para app em background)
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationObserver {
  // ❌ Construtor e funções de som removidas

  public async update(data: ModuleCompletionData): Promise<void> {
    if (data.passed) {
      console.log(
        `[NotificationObserver] Módulo ${data.moduleNumber} passou. Disparando eventos.`
      );

      const title = "Módulo Concluído!";
      const body = `Parabéns! Você completou o Módulo ${data.moduleNumber} com ${data.accuracy}% de acerto!`;

      try {
        // ❌ Tocar som customizado foi REMOVIDO daqui

        // 1. Notificação do Sistema (background)
        await Notifications.scheduleNotificationAsync({
          content: {
            title: title,
            body: body,
            data: {
              moduleNumber: data.moduleNumber,
              accuracy: data.accuracy,
              type: "module_completion",
            },
            sound: "default", // Usa o som padrão do OS
          },
          trigger: null,
        });

        // 2. Notificação In-App (Modal)
        // (O modal agora tocará seu próprio som)
        useModalStore.getState().showModal(title, body);

        console.log(
          "[NotificationObserver] Notificação do OS e Modal In-App disparados"
        );
      } catch (error) {
        console.warn(
          "[NotificationObserver] Erro ao exibir notificação:",
          error
        );
      }
    } else {
      console.log(
        `[NotificationObserver] Módulo ${data.moduleNumber} não passou (${data.accuracy}%), sem notificação.`
      );
    }
  }

  //  Função cleanup removida
}

export const notificationObserver = new NotificationObserver();
