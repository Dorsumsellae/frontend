"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/apiClient";

/** Modeles Ollama disponibles cote serveur (pour le selecteur). */
export function useModels() {
  return useQuery({ queryKey: ["models"], queryFn: api.getModels });
}
