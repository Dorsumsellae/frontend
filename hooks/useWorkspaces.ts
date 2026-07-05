"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

/** Liste des notebooks (workspaces) + notebook par defaut du serveur. */
export function useWorkspaces() {
  return useQuery({ queryKey: ["workspaces"], queryFn: api.getWorkspaces });
}
