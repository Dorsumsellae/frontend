"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useNotebooks, useNotebookMutations } from "@/hooks/useNotebooks";
import { useModels } from "@/hooks/useModels";
import { useUiStore } from "@/stores/uiStore";
import { LABELS } from "@/lib/vocab";

const NEW_NOTEBOOK = "__new__";

export function TopBar() {
  const { data: notebooksData } = useNotebooks();
  const { data: modelsData } = useModels();
  const { create } = useNotebookMutations();
  const activeNotebook = useUiStore((s) => s.activeNotebook);
  const setActiveNotebook = useUiStore((s) => s.setActiveNotebook);
  const selectedModel = useUiStore((s) => s.selectedModel);
  const setSelectedModel = useUiStore((s) => s.setSelectedModel);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const notebooks = useMemo(() => notebooksData?.notebooks ?? [], [notebooksData]);
  const models = modelsData?.models ?? [];

  // Au premier chargement : notebook actif = notebook par defaut du serveur.
  useEffect(() => {
    if (!activeNotebook && notebooksData?.default) {
      setActiveNotebook(notebooksData.default);
    }
  }, [activeNotebook, notebooksData?.default, setActiveNotebook]);

  useEffect(() => {
    if (!selectedModel && modelsData?.default) setSelectedModel(modelsData.default);
  }, [selectedModel, modelsData?.default, setSelectedModel]);

  // Options du selecteur : notebooks connus, + l'actif s'il n'y figure pas encore
  // (fenetre entre creation et rafraichissement de la liste).
  const options = useMemo(() => {
    const list = notebooks.map((n) => ({ id: n.id, title: n.title }));
    if (activeNotebook && !list.some((n) => n.id === activeNotebook)) {
      list.unshift({ id: activeNotebook, title: activeNotebook });
    }
    return list;
  }, [notebooks, activeNotebook]);

  const onNotebookChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (value === NEW_NOTEBOOK) {
      setDialogOpen(true);
      return;
    }
    setActiveNotebook(value);
  };

  const confirmNew = () => {
    const title = newTitle.trim();
    if (!title) return;
    create.mutate(title, {
      onSuccess: (notebook) => setActiveNotebook(notebook.id),
    });
    setNewTitle("");
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

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <Select value={activeNotebook ?? ""} displayEmpty onChange={onNotebookChange}>
            {options.length === 0 && (
              <MenuItem value="" disabled>
                Aucun notebook
              </MenuItem>
            )}
            {options.map((n) => (
              <MenuItem key={n.id} value={n.id}>
                {n.title}
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
            label="Titre du notebook"
            placeholder="ex. Warhammer paint"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            helperText="Titre libre (espaces et majuscules autorisés)."
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmNew();
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={confirmNew} disabled={!newTitle.trim()}>
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
}
