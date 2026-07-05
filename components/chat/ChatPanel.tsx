"use client";

import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { useQueryClient } from "@tanstack/react-query";
import { useUiStore } from "@/stores/uiStore";
import { useDocuments } from "@/hooks/useDocuments";
import { useNotebookMessages } from "@/hooks/useNotebookMessages";
import { useChat } from "@/hooks/useChat";
import { api } from "@/lib/apiClient";
import type { StoredMessage, UiChatMessage } from "@/types/api";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";

function toUiMessage(m: StoredMessage): UiChatMessage {
  return {
    id: `db-${m.id}`,
    role: m.role,
    content: m.content,
    sources: m.sources ?? undefined,
    cited: m.cited ?? undefined,
    model: m.model ?? undefined,
  };
}

export function ChatPanel() {
  const activeNotebook = useUiStore((s) => s.activeNotebook);
  const messages = useUiStore((s) => s.messages);
  const selected = useUiStore((s) => s.selectedFilenames);
  const setMessages = useUiStore((s) => s.setMessages);
  const clearMessagesStore = useUiStore((s) => s.clearMessages);
  const { data: documents = [] } = useDocuments(activeNotebook);
  const { data: serverMessages } = useNotebookMessages(activeNotebook);
  const { send, pending } = useChat();
  const qc = useQueryClient();

  // Hydrate la conversation depuis l'historique persiste, une seule fois par notebook.
  const hydratedRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      activeNotebook &&
      serverMessages &&
      hydratedRef.current !== activeNotebook
    ) {
      setMessages(serverMessages.map(toUiMessage));
      hydratedRef.current = activeNotebook;
    }
  }, [activeNotebook, serverMessages, setMessages]);

  const clearHistory = async () => {
    if (!activeNotebook) return;
    clearMessagesStore();
    hydratedRef.current = activeNotebook; // considere comme hydrate (vide)
    try {
      await api.clearMessages(activeNotebook);
    } catch {
      // best-effort
    }
    qc.setQueryData(["messages", activeNotebook], []);
  };

  const hasSources = documents.length > 0;
  const scope =
    selected.size > 0
      ? `${selected.size} source(s) sélectionnée(s)`
      : "toutes les sources";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Chat
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Recherche sur : {hasSources ? scope : "aucune source"}
          </Typography>
        </Box>
        {messages.length > 0 && (
          <Tooltip title="Effacer la conversation">
            <IconButton size="small" onClick={clearHistory}>
              <DeleteSweepIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Divider />

      {messages.length === 0 ? (
        <EmptyState hasSources={hasSources} onPick={(q) => send(q)} />
      ) : (
        <MessageList />
      )}

      <ChatInput onSend={send} disabled={!activeNotebook || !hasSources || pending} />
    </Box>
  );
}
