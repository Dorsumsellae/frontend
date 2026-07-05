"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useUiStore } from "@/stores/uiStore";
import { useNotes } from "@/hooks/useNotes";

export function SavedNotes() {
  const activeNotebook = useUiStore((s) => s.activeNotebook);
  const { notes, isLoading, add, remove } = useNotes(activeNotebook);
  const [text, setText] = useState("");

  const submit = () => {
    const value = text.trim();
    if (!value || !activeNotebook) return;
    add.mutate(value, { onSuccess: () => setText("") });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Notes
      </Typography>
      {isLoading ? (
        <CircularProgress size={18} />
      ) : (
        <Stack spacing={1}>
          {notes.map((note) => (
            <Paper
              key={note.id}
              variant="outlined"
              sx={{ p: 1, display: "flex", gap: 1, alignItems: "flex-start" }}
            >
              <Typography variant="body2" sx={{ flex: 1, whiteSpace: "pre-wrap" }}>
                {note.text}
              </Typography>
              <IconButton size="small" onClick={() => remove.mutate(note.id)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))}
        </Stack>
      )}
      <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Ajouter une note…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          disabled={!activeNotebook}
        />
        <Button
          variant="outlined"
          onClick={submit}
          disabled={!text.trim() || !activeNotebook || add.isPending}
        >
          +
        </Button>
      </Box>
    </Box>
  );
}
