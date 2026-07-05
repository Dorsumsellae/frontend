"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useUiStore } from "@/stores/uiStore";

export function SavedNotes() {
  const notes = useUiStore((s) => s.notes);
  const addNote = useUiStore((s) => s.addNote);
  const removeNote = useUiStore((s) => s.removeNote);
  const [text, setText] = useState("");

  const add = () => {
    const value = text.trim();
    if (!value) return;
    addNote(value);
    setText("");
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Notes
      </Typography>
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
            <IconButton size="small" onClick={() => removeNote(note.id)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Paper>
        ))}
      </Stack>
      <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Ajouter une note…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
        />
        <Button variant="outlined" onClick={add} disabled={!text.trim()}>
          +
        </Button>
      </Box>
    </Box>
  );
}
