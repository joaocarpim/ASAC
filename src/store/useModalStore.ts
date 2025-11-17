// src/store/useModalStore.ts - COM CONFIRMAÇÃO

import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  playSound: boolean;
  onConfirm?: () => void; // ✅ NOVO: callback de confirmação
  showModal: (
    title: string,
    message: string,
    playSound?: boolean,
    onConfirm?: () => void
  ) => void;
  hideModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  title: "",
  message: "",
  playSound: true,
  onConfirm: undefined,

  showModal: (title, message, playSound = true, onConfirm) => {
    console.log("[useModalStore] 📢 Modal aberto:", {
      title,
      message,
      playSound,
      hasConfirm: !!onConfirm,
    });
    set({ isOpen: true, title, message, playSound, onConfirm });
  },

  hideModal: () => {
    console.log("[useModalStore] 🚫 Modal fechado");
    set({
      isOpen: false,
      title: "",
      message: "",
      playSound: true,
      onConfirm: undefined,
    });
  },
}));
