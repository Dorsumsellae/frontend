// Mapping vocabulaire UI (NotebookLM) <-> API (RAG). Le format « fil » ne change
// jamais : l'API continue de parler de workspace/filename. Centralise ici pour que
// l'interface parle de « Notebook » et « Source » sans toucher au backend.

/** Un « Notebook » cote UI = un workspace cote API. */
export type NotebookId = string;

/** Une « Source » cote UI = un filename cote API. */
export type SourceId = string;

export const LABELS = {
  notebook: "Notebook",
  notebooks: "Notebooks",
  source: "Source",
  sources: "Sources",
  newNotebook: "Nouveau notebook",
  addSource: "Ajouter une source",
} as const;

/** Nom lisible d'une source a partir de son filename (retire le prefixe youtube_). */
export function sourceLabel(filename: string): string {
  if (filename.startsWith("youtube_")) {
    return filename.replace(/^youtube_/, "").replace(/\.txt$/, "");
  }
  return filename;
}
