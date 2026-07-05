"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import YouTubeIcon from "@mui/icons-material/YouTube";
import { useUiStore } from "@/stores/uiStore";
import { UploadDialog } from "./UploadDialog";
import { YouTubeDialog } from "./YouTubeDialog";

export function AddSourceMenu() {
  const activeNotebook = useUiStore((s) => s.activeNotebook);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [ytOpen, setYtOpen] = useState(false);

  return (
    <>
      <Button
        size="small"
        variant="contained"
        startIcon={<AddIcon />}
        onClick={(e) => setAnchor(e.currentTarget)}
        disabled={!activeNotebook}
      >
        Ajouter
      </Button>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            setUploadOpen(true);
          }}
        >
          <ListItemIcon>
            <UploadFileIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Importer un fichier</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchor(null);
            setYtOpen(true);
          }}
        >
          <ListItemIcon>
            <YouTubeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Importer une vidéo YouTube</ListItemText>
        </MenuItem>
      </Menu>
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
      <YouTubeDialog open={ytOpen} onClose={() => setYtOpen(false)} />
    </>
  );
}
