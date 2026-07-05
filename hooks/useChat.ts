"use client";

import { useCallback, useState } from "react";
import { api, ApiError } from "@/lib/apiClient";
import { genId, useUiStore } from "@/stores/uiStore";
import type { ChatMessage } from "@/types/api";

/** Envoi d'un tour de conversation : ajoute la question, appelle /chat, remplit la reponse.
 *
 * L'historique complet (tous les tours precedents) est transmis au backend, qui
 * reste stateless. La reponse conserve ses propres `sources` afin que les
 * citations `[n]` se resolvent par message.
 */
export function useChat() {
  const [pending, setPending] = useState(false);
  const activeNotebook = useUiStore((s) => s.activeNotebook);
  const selectedFilenames = useUiStore((s) => s.selectedFilenames);
  const selectedModel = useUiStore((s) => s.selectedModel);
  const messages = useUiStore((s) => s.messages);
  const addMessage = useUiStore((s) => s.addMessage);
  const updateMessage = useUiStore((s) => s.updateMessage);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || !activeNotebook || pending) return;

      const assistantId = genId();
      addMessage({ id: genId(), role: "user", content: question });
      addMessage({ id: assistantId, role: "assistant", content: "", pending: true });
      setPending(true);

      // Historique = tours precedents + nouvelle question (l'assistant en attente exclu).
      const history: ChatMessage[] = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: question },
      ];

      try {
        const res = await api.chat({
          messages: history,
          workspace: activeNotebook,
          filenames: Array.from(selectedFilenames),
          model: selectedModel ?? undefined,
        });
        updateMessage(assistantId, {
          content: res.answer,
          sources: res.sources,
          cited: res.cited ?? null,
          model: res.model,
          pending: false,
        });
      } catch (err) {
        const message =
          err instanceof ApiError ? err.message : "Erreur lors de l'appel au backend.";
        updateMessage(assistantId, { content: "", error: message, pending: false });
      } finally {
        setPending(false);
      }
    },
    [
      activeNotebook,
      messages,
      pending,
      selectedFilenames,
      selectedModel,
      addMessage,
      updateMessage,
    ],
  );

  return { send, pending };
}
