"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

/** Sources (documents) indexees du notebook actif. */
export function useDocuments(workspace: string | null) {
  return useQuery({
    queryKey: ["documents", workspace],
    queryFn: () => api.getDocuments(workspace as string),
    enabled: !!workspace,
  });
}
