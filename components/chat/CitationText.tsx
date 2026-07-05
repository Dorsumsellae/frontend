"use client";

import { Fragment, type ReactNode } from "react";
import Typography from "@mui/material/Typography";
import type { Source } from "@/types/api";
import { CitationChip } from "./CitationChip";

const CITATION_RE = /\[(\d+)\]/g;

/** Rend une reponse en remplacant les marqueurs `[n]` par des puces de citation.
 *
 * Un marqueur dont l'index ne correspond a aucune source (frequent avec un petit
 * modele) est laisse tel quel, en texte : degradation gracieuse.
 */
export function CitationText({
  text,
  sources,
}: {
  text: string;
  sources?: Source[];
}) {
  const byCite = new Map<number, Source>();
  (sources ?? []).forEach((s, i) => byCite.set(s.cite ?? i + 1, s));

  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  CITATION_RE.lastIndex = 0;
  while ((match = CITATION_RE.exec(text)) !== null) {
    const n = parseInt(match[1], 10);
    const source = byCite.get(n);
    if (!source) continue; // marqueur hors borne -> laisse dans le texte
    if (match.index > last) {
      parts.push(<Fragment key={key++}>{text.slice(last, match.index)}</Fragment>);
    }
    parts.push(<CitationChip key={key++} index={n} source={source} />);
    last = match.index + match[0].length;
  }
  parts.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);

  return (
    <Typography variant="body2" component="div" sx={{ whiteSpace: "pre-wrap" }}>
      {parts}
    </Typography>
  );
}
