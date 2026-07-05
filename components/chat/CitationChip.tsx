"use client";

import { useState, type MouseEvent } from "react";
import Chip from "@mui/material/Chip";
import Popover from "@mui/material/Popover";
import type { Source } from "@/types/api";
import { useUiStore } from "@/stores/uiStore";
import { SourcePopover } from "./SourcePopover";

/** Puce de citation cliquable `[n]` : surligne la source a gauche et ouvre son extrait. */
export function CitationChip({ index, source }: { index: number; source: Source }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const setHighlighted = useUiStore((s) => s.setHighlightedSource);

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    setAnchor(e.currentTarget);
    setHighlighted({ filename: source.filename, passageId: source.passage_id });
  };

  return (
    <>
      <Chip
        label={index}
        size="small"
        color="primary"
        variant="outlined"
        onClick={onClick}
        sx={{
          height: 18,
          mx: 0.25,
          cursor: "pointer",
          verticalAlign: "middle",
          "& .MuiChip-label": { px: 0.75, fontSize: 11 },
        }}
      />
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <SourcePopover source={source} />
      </Popover>
    </>
  );
}
