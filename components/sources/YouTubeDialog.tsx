"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import { useUiStore } from "@/stores/uiStore";
import { useSourceMutations } from "@/hooks/useSourceMutations";
import { ApiError } from "@/lib/apiClient";

export function YouTubeDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const activeNotebook = useUiStore((s) => s.activeNotebook);
  const { ingestYoutube } = useSourceMutations(activeNotebook);
  const [url, setUrl] = useState("");
  const [langs, setLangs] = useState("");

  const submit = () => {
    if (!url.trim()) return;
    const languages = langs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    ingestYoutube.mutate(
      { url: url.trim(), languages: languages.length ? languages : undefined },
      {
        onSuccess: () => {
          setUrl("");
          setLangs("");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Importer une vidéo YouTube</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="URL YouTube"
            placeholder="https://www.youtube.com/watch?v=…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <TextField
            fullWidth
            label="Langues préférées (optionnel)"
            placeholder="fr,en"
            helperText="Vide = langue originale de la vidéo, avec repli sur l'anglais."
            value={langs}
            onChange={(e) => setLangs(e.target.value)}
          />
          {ingestYoutube.isPending && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Récupération / transcription et indexation…
              </Typography>
              <LinearProgress />
            </Box>
          )}
          {ingestYoutube.isError && (
            <Alert severity="error">
              {(ingestYoutube.error as ApiError)?.message ?? "Échec de l'import."}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={!url.trim() || ingestYoutube.isPending}
        >
          Importer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
