"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Chip from "@mui/material/Chip";
import type { Source } from "@/types/api";
import { sourceLabel } from "@/lib/vocab";
import { formatSeconds } from "@/lib/format";

/** Contenu du popover d'une citation : extrait du passage source (+ lien video). */
export function SourcePopover({ source }: { source: Source }) {
  return (
    <Box sx={{ p: 2, maxWidth: 360 }}>
      <Typography variant="subtitle2" gutterBottom>
        {sourceLabel(source.filename)}
      </Typography>
      {source.speaker && (
        <Chip size="small" label={source.speaker} sx={{ mb: 1 }} />
      )}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ whiteSpace: "pre-wrap" }}
      >
        {source.excerpt}
      </Typography>
      {source.timecode_url && source.start_seconds != null && (
        <Box sx={{ mt: 1 }}>
          <Link
            href={source.timecode_url}
            target="_blank"
            rel="noopener"
            variant="body2"
          >
            ▶ Ouvrir la vidéo à {formatSeconds(source.start_seconds)}
          </Link>
        </Box>
      )}
    </Box>
  );
}
