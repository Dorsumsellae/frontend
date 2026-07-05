"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { useUiStore } from "@/stores/uiStore";
import { useDocuments } from "@/hooks/useDocuments";
import { useChat } from "@/hooks/useChat";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";

export function ChatPanel() {
  const activeNotebook = useUiStore((s) => s.activeNotebook);
  const messages = useUiStore((s) => s.messages);
  const selected = useUiStore((s) => s.selectedFilenames);
  const { data: documents = [] } = useDocuments(activeNotebook);
  const { send, pending } = useChat();

  const hasSources = documents.length > 0;
  const scope =
    selected.size > 0
      ? `${selected.size} source(s) sélectionnée(s)`
      : "toutes les sources";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Chat
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Recherche sur : {hasSources ? scope : "aucune source"}
        </Typography>
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
