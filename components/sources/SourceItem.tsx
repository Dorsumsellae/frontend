"use client";

import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArticleIcon from "@mui/icons-material/Article";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SmartDisplayIcon from "@mui/icons-material/SmartDisplay";
import SubtitlesIcon from "@mui/icons-material/Subtitles";
import type { SvgIconComponent } from "@mui/icons-material";
import type { DocumentInfo, SourceType } from "@/types/api";
import { useUiStore } from "@/stores/uiStore";
import { useSourceMutations } from "@/hooks/useSourceMutations";
import { sourceLabel } from "@/lib/vocab";

const ICONS: Record<SourceType, SvgIconComponent> = {
  text: ArticleIcon,
  pdf: PictureAsPdfIcon,
  youtube: SmartDisplayIcon,
  transcript: SubtitlesIcon,
};

export function SourceItem({ doc }: { doc: DocumentInfo }) {
  const selected = useUiStore((s) => s.selectedFilenames.has(doc.filename));
  const toggleSource = useUiStore((s) => s.toggleSource);
  const highlighted = useUiStore(
    (s) => s.highlightedSource?.filename === doc.filename,
  );
  const activeNotebook = useUiStore((s) => s.activeNotebook);
  const { deleteSource } = useSourceMutations(activeNotebook);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = ICONS[doc.type] ?? ArticleIcon;

  useEffect(() => {
    if (highlighted) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [highlighted]);

  return (
    <Box
      ref={ref}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.5,
        transition: "background-color 0.3s",
        bgcolor: highlighted ? "action.selected" : "transparent",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Checkbox
        size="small"
        checked={selected}
        onChange={() => toggleSource(doc.filename)}
      />
      <Icon fontSize="small" sx={{ color: "text.secondary" }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" noWrap title={doc.filename}>
          {sourceLabel(doc.filename)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {doc.chunks_indexed} passage(s)
        </Typography>
      </Box>
      <Tooltip title="Supprimer">
        <span>
          <IconButton
            size="small"
            onClick={() => deleteSource.mutate(doc.filename)}
            disabled={deleteSource.isPending}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
