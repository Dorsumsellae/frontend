"use client";

import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useUiStore } from "@/stores/uiStore";
import { MessageBubble } from "./MessageBubble";

export function MessageList() {
  const messages = useUiStore((s) => s.messages);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Stack spacing={1.5} sx={{ p: 2, overflowY: "auto", flex: 1 }}>
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <Box ref={endRef} />
    </Stack>
  );
}
