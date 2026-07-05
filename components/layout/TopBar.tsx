"use client";

import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useModels } from "@/hooks/useModels";
import { useUiStore } from "@/stores/uiStore";
import { LABELS } from "@/lib/vocab";

const NEW_NOTEBOOK = "__new__";

export function TopBar() {
  const { data: ws } = useWorkspaces();
  const { data: modelsData } = useModels();
  const activeNotebook = useUiStore((s) => s.activeNotebook);
  const setActiveNotebook = useUiStore((s) => s.setActiveNotebook);
  const selectedModel = useUiStore((s) => s.selectedModel);
  const setSelectedModel = useUiStore((s) => s.setSelectedModel);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  // Au premier chargement : notebook actif = workspace serveur par defaut.
  useEffect(() => {
    if (!activeNotebook && ws?.default) setActiveNotebook(ws.default);
  }, [activeNotebook, ws?.default, setActiveNotebook]);

  // Modele par defaut = defaut serveur.
  useEffect(() => {
    if (!selectedModel && modelsData?.default) setSelectedModel(modelsData.default);
  }, [selectedModel, modelsData?.default, setSelectedModel]);

  const notebooks = Array.from(
    new Set([
      ...(ws?.workspaces ?? []),
      ...(activeNotebook ? [activeNotebook] : []),
    ]),
  );
  const models = modelsData?.models ?? [];

  const onNotebookChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (value === NEW_NOTEBOOK) {
      setDialogOpen(true);
      return;
    }
    setActiveNotebook(value);
  };

  const confirmNew = () => {
    const name = newName.trim();
    if (name) setActiveNotebook(name);
    setNewName("");
    setDialogOpen(false);
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <AutoStoriesIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {LABELS.notebooks}
        </Typography>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select value={activeNotebook ?? ""} displayEmpty onChange={onNotebookChange}>
            {notebooks.length === 0 && (
              <MenuItem value="" disabled>
                Aucun notebook
              </MenuItem>
            )}
            {notebooks.map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
            <MenuItem value={NEW_NOTEBOOK}>➕ {LABELS.newNotebook}…</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Modèle</InputLabel>
          <Select
            label="Modèle"
            value={models.length ? (selectedModel ?? "") : ""}
            onChange={(e) => setSelectedModel(e.target.value || null)}
            disabled={!models.length}
          >
            {models.map((m) => (
              <MenuItem key={m.name} value={m.name}>
                {m.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Toolbar>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>{LABELS.newNotebook}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Nom du notebook"
            placeholder="ex. projet-alpha"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            helperText="Lettres, chiffres, '.', '-', '_' (1 à 64 caractères)."
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmNew();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={confirmNew} disabled={!newName.trim()}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}
