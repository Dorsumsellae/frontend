"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import { useUiStore } from "@/stores/uiStore";
import { useSourceMutations } from "@/hooks/useSourceMutations";
import { ApiError } from "@/lib/apiClient";

export function UploadDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const activeNotebook = useUiStore((s) => s.activeNotebook);
  const { uploadAndIndex } = useSourceMutations(activeNotebook);
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<"fixed" | "recursive">("fixed");

  const submit = () => {
    if (!file) return;
    uploadAndIndex.mutate(
      { file, strategy },
      {
        onSuccess: () => {
          setFile(null);
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Importer un fichier</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Button variant="outlined" component="label">
            {file ? file.name : "Choisir un fichier (.txt, .pdf, .md, .srt, .vtt)"}
            <input
              hidden
              type="file"
              accept=".txt,.pdf,.md,.markdown,.srt,.vtt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </Button>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Stratégie de découpage
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={strategy}
              onChange={(_, v) => v && setStrategy(v)}
              sx={{ display: "block", mt: 0.5 }}
            >
              <ToggleButton value="fixed">fixed</ToggleButton>
              <ToggleButton value="recursive">recursive</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {uploadAndIndex.isPending && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Envoi et indexation…
              </Typography>
              <LinearProgress />
            </Box>
          )}
          {uploadAndIndex.isError && (
            <Alert severity="error">
              {(uploadAndIndex.error as ApiError)?.message ?? "Échec de l'import."}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!file || uploadAndIndex.isPending}
        >
          Importer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
