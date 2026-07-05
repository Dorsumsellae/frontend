"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { useDocuments } from "@/hooks/useDocuments";
import { useUiStore } from "@/stores/uiStore";
import { SourceItem } from "./SourceItem";
import { AddSourceMenu } from "./AddSourceMenu";
import { LABELS } from "@/lib/vocab";

export function SourcesPanel() {
  const activeNotebook = useUiStore((s) => s.activeNotebook);
  const selected = useUiStore((s) => s.selectedFilenames);
  const setSelectedSources = useUiStore((s) => s.setSelectedSources);
  const clearSelection = useUiStore((s) => s.clearSelection);
  const { data: documents = [], isLoading } = useDocuments(activeNotebook);

  const allSelected = documents.length > 0 && selected.size === documents.length;
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) clearSelection();
    else setSelectedSources(documents.map((d) => d.filename));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {LABELS.sources}
        </Typography>
        <AddSourceMenu />
      </Box>
      <Divider />

      {isLoading ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress size={24} />
        </Box>
      ) : documents.length === 0 ? (
        <Box sx={{ p: 3, color: "text.secondary" }}>
          <Typography variant="body2">
            Aucune source. Ajoutez un document ou une vidéo pour démarrer.
          </Typography>
        </Box>
      ) : (
        <>
          <FormControlLabel
            sx={{ px: 2, py: 0.5, m: 0 }}
            control={
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={someSelected}
                onChange={toggleAll}
              />
            }
            label={
              <Typography variant="caption">
                Tout sélectionner ({selected.size}/{documents.length})
              </Typography>
            }
          />
          <Divider />
          <Stack sx={{ overflowY: "auto", flex: 1 }}>
            {documents.map((doc) => (
              <SourceItem key={doc.filename} doc={doc} />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
