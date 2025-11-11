import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  showModal: (title: string, message: string) => void;
  hideModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  title: "",
  message: "",
  showModal: (title, message) => set({ isOpen: true, title, message }),
  hideModal: () => set({ isOpen: false, title: "", message: "" }),
}));
