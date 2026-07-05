"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

/** Notes (panneau Studio) persistees par notebook + mutations add/remove. */
export function useNotes(notebookId: string | null) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["notes", notebookId],
    queryFn: () => api.getNotes(notebookId as string),
    enabled: !!notebookId,
  });
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["notes", notebookId] });

  const add = useMutation({
    mutationFn: (text: string) => api.addNote(notebookId as string, text),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (noteId: number) => api.deleteNote(notebookId as string, noteId),
    onSuccess: invalidate,
  });

  return { notes: query.data ?? [], isLoading: query.isLoading, add, remove };
}
