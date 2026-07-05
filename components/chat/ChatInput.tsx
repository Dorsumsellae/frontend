"use client";

import { useState, type KeyboardEvent } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";

export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [text, setText] = useState("");

  const submit = () => {
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <Box
      sx={{
        p: 1.5,
        borderTop: "1px solid",
        borderColor: "divider",
        display: "flex",
        gap: 1,
        alignItems: "flex-end",
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Posez une question sur vos sources…"
        multiline
        maxRows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
      />
      <IconButton color="primary" onClick={submit} disabled={disabled || !text.trim()}>
        <SendIcon />
      </IconButton>
    </Box>
  );
}
