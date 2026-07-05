"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

/** Historique de conversation persiste d'un notebook (pour hydrater le chat).
 *
 * `staleTime: Infinity` : on hydrate le store une seule fois a l'ouverture ; la
 * conversation vit ensuite cote client (le backend persiste chaque tour en /chat).
 */
export function useNotebookMessages(notebookId: string | null) {
  return useQuery({
    queryKey: ["messages", notebookId],
    queryFn: () => api.getMessages(notebookId as string),
    enabled: !!notebookId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
