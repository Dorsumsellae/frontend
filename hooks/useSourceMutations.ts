"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

/** Mutations d'ajout/suppression de sources, invalidant la liste des documents. */
export function useSourceMutations(workspace: string | null) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["documents", workspace] });
    qc.invalidateQueries({ queryKey: ["workspaces"] });
  };

  // Upload -> index : deux appels backend enchaines (l'index cree les embeddings).
  const uploadAndIndex = useMutation({
    mutationFn: async ({
      file,
      strategy,
    }: {
      file: File;
      strategy: "fixed" | "recursive";
    }) => {
      const ws = workspace as string;
      await api.uploadDocument(ws, file);
      return api.indexDocument(ws, file.name, strategy);
    },
    onSuccess: invalidate,
  });

  const ingestYoutube = useMutation({
    mutationFn: ({ url, languages }: { url: string; languages?: string[] }) =>
      api.ingestYoutube(workspace as string, url, languages),
    onSuccess: invalidate,
  });

  const deleteSource = useMutation({
    mutationFn: (filename: string) => api.resetIndex(workspace as string, filename),
    onSuccess: invalidate,
  });

  return { uploadAndIndex, ingestYoutube, deleteSource };
}
