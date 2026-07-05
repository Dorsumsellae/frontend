"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { useUiStore } from "@/stores/uiStore";
import { useDocuments } from "@/hooks/useDocuments";
import { useNotebooks } from "@/hooks/useNotebooks";
import { NotebookGuide } from "./NotebookGuide";
import { SavedNotes } from "./SavedNotes";

export function StudioPanel() {
  const activeNotebook = useUiStore((s) => s.activeNotebook);
  const { data: documents = [] } = useDocuments(activeNotebook);
  const { data: notebooksData } = useNotebooks();

  const title =
    notebooksData?.notebooks.find((n) => n.id === activeNotebook)?.title ??
    activeNotebook ??
    "—";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Studio
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {title} · {documents.length} source(s)
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ overflowY: "auto", flex: 1 }}>
        <NotebookGuide />
        <Divider />
        <SavedNotes />
      </Box>
    </Box>
  );
}
