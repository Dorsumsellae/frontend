// Etat UI (Zustand) : notebook actif, sources selectionnees, conversation, notes.
// L'etat serveur (workspaces, documents, models) est gere par TanStack Query.

import { create } from "zustand";
import type { UiChatMessage } from "@/types/api";

export interface Note {
  id: string;
  text: string;
}

export interface HighlightedSource {
  filename: string;
  passageId: number;
}

interface UiState {
  activeNotebook: string | null;
  selectedFilenames: Set<string>;
  selectedModel: string | null;
  messages: UiChatMessage[];
  notes: Note[];
  highlightedSource: HighlightedSource | null;

  setActiveNotebook: (workspace: string) => void;
  toggleSource: (filename: string) => void;
  setSelectedSources: (filenames: string[]) => void;
  clearSelection: () => void;
  setSelectedModel: (model: string | null) => void;

  addMessage: (message: UiChatMessage) => void;
  updateMessage: (id: string, patch: Partial<UiChatMessage>) => void;
  clearMessages: () => void;

  addNote: (text: string) => void;
  removeNote: (id: string) => void;

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
  notes: [],
  highlightedSource: null,

  // Changer de notebook reinitialise la selection et la conversation.
  setActiveNotebook: (workspace) =>
    set({
      activeNotebook: workspace,
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

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  clearMessages: () => set({ messages: [] }),

  addNote: (text) =>
    set((state) => ({ notes: [...state.notes, { id: genId(), text }] })),
  removeNote: (id) =>
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) })),

  setHighlightedSource: (highlight) => set({ highlightedSource: highlight }),
}));
