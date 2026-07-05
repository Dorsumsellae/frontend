"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

/** Liste des notebooks (persistes, avec titre libre) + defaut serveur. */
export function useNotebooks() {
  return useQuery({ queryKey: ["notebooks"], queryFn: api.getNotebooks });
}

/** Mutations de gestion des notebooks (creation par titre, renommage, suppression). */
export function useNotebookMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["notebooks"] });

  const create = useMutation({
    mutationFn: (title: string) => api.createNotebook(title),
    onSuccess: invalidate,
  });
  const rename = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api.renameNotebook(id, title),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.deleteNotebook(id),
    onSuccess: invalidate,
  });

  return { create, rename, remove };
}
