// Etat UI (Zustand) : notebook actif, sources selectionnees, conversation courante.
// Les notebooks, l'historique persiste et les notes viennent du serveur (TanStack
// Query). La conversation « vivante » est ici ; elle est hydratee a l'ouverture d'un
// notebook depuis l'historique persiste, puis alimentee par les tours de chat.

import { create } from "zustand";
import type { UiChatMessage } from "@/types/api";

export interface HighlightedSource {
  filename: string;
  passageId: number;
}

interface UiState {
  activeNotebook: string | null;
  selectedFilenames: Set<string>;
  selectedModel: string | null;
  messages: UiChatMessage[];
  highlightedSource: HighlightedSource | null;

  setActiveNotebook: (notebookId: string) => void;
  toggleSource: (filename: string) => void;
  setSelectedSources: (filenames: string[]) => void;
  clearSelection: () => void;
  setSelectedModel: (model: string | null) => void;

  setMessages: (messages: UiChatMessage[]) => void;
  addMessage: (message: UiChatMessage) => void;
  updateMessage: (id: string, patch: Partial<UiChatMessage>) => void;
  clearMessages: () => void;

  setHighlightedSource: (highlight: HighlightedSource | null) => void;
}

export function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

export const useUiStore = create<UiState>((set) => ({
  activeNotebook: null,
  selectedFilenames: new Set<string>(),
  selectedModel: null,
  messages: [],
  highlightedSource: null,

  // Changer de notebook reinitialise la selection et la conversation (rehydratee ensuite).
  setActiveNotebook: (notebookId) =>
    set({
      activeNotebook: notebookId,
      selectedFilenames: new Set<string>(),
      messages: [],
      highlightedSource: null,
    }),

  toggleSource: (filename) =>
    set((state) => {
      const next = new Set(state.selectedFilenames);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return { selectedFilenames: next };
    }),

  setSelectedSources: (filenames) =>
    set({ selectedFilenames: new Set(filenames) }),
  clearSelection: () => set({ selectedFilenames: new Set<string>() }),
  setSelectedModel: (model) => set({ selectedModel: model }),

  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  clearMessages: () => set({ messages: [] }),

  setHighlightedSource: (highlight) => set({ highlightedSource: highlight }),
}));
