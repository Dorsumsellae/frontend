// Couche HTTP typee vers le backend FastAPI. Ne fait que du reseau (aucun rendu).
// `errorDetail` reproduit l'extraction du message d'erreur cote backend
// (api_client.error_detail / _http_error_detail) : on privilegie {"detail": ...}.

import { API_BASE_URL } from "./config";
import type {
  ChatMessage,
  ChatResponse,
  DocumentsResponse,
  DocumentInfo,
  IndexResponse,
  IngestYoutubeResponse,
  ModelsResponse,
  Note,
  Notebook,
  NotebooksResponse,
  ResetResponse,
  StoredMessage,
  UploadResponse,
  WorkspacesResponse,
} from "@/types/api";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function errorDetail(resp: Response): Promise<string> {
  try {
    const data = await resp.json();
    if (data && typeof data.detail === "string") return data.detail;
  } catch {
    // Corps non-JSON : on retombe sur le statut.
  }
  return resp.statusText || `Erreur HTTP ${resp.status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const resp = await fetch(`${API_BASE_URL}${path}`, init);
  if (!resp.ok) {
    throw new ApiError(await errorDetail(resp), resp.status);
  }
  return (await resp.json()) as T;
}

function jsonInit(body: unknown, method = "POST"): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

const enc = encodeURIComponent;

export const api = {
  getWorkspaces: () => request<WorkspacesResponse>("/workspaces"),

  getDocuments: (workspace: string): Promise<DocumentInfo[]> =>
    request<DocumentsResponse>(
      `/documents?workspace=${encodeURIComponent(workspace)}`,
    ).then((r) => r.documents),

  getModels: () => request<ModelsResponse>("/models"),

  uploadDocument: (workspace: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    form.append("workspace", workspace);
    return request<UploadResponse>("/upload", { method: "POST", body: form });
  },

  indexDocument: (
    workspace: string,
    filename: string,
    strategy: "fixed" | "recursive" = "fixed",
  ) => request<IndexResponse>("/index", jsonInit({ workspace, filename, strategy })),

  ingestYoutube: (
    workspace: string,
    url: string,
    languages?: string[],
    numSpeakers?: number,
  ) =>
    request<IngestYoutubeResponse>(
      "/ingest/youtube",
      jsonInit({
        workspace,
        url,
        ...(languages && languages.length ? { languages } : {}),
        ...(numSpeakers ? { num_speakers: numSpeakers } : {}),
      }),
    ),

  resetIndex: (workspace: string, filename?: string) =>
    request<ResetResponse>(
      "/reset",
      jsonInit({ workspace, ...(filename ? { filename } : {}) }),
    ),

  chat: (params: {
    messages: ChatMessage[];
    workspace: string;
    filenames?: string[];
    model?: string;
    topK?: number;
  }) =>
    request<ChatResponse>(
      "/chat",
      jsonInit({
        messages: params.messages,
        workspace: params.workspace,
        ...(params.filenames && params.filenames.length
          ? { filenames: params.filenames }
          : {}),
        ...(params.model ? { model: params.model } : {}),
        ...(params.topK ? { top_k: params.topK } : {}),
      }),
    ),

  // --- Notebooks / conversations / notes (persistes) ---

  getNotebooks: () => request<NotebooksResponse>("/notebooks"),

  createNotebook: (title: string) =>
    request<Notebook>("/notebooks", jsonInit({ title })),

  renameNotebook: (id: string, title: string) =>
    request<Notebook>(`/notebooks/${enc(id)}`, jsonInit({ title }, "PATCH")),

  deleteNotebook: (id: string) =>
    request<{ deleted: string }>(`/notebooks/${enc(id)}`, { method: "DELETE" }),

  getMessages: (id: string): Promise<StoredMessage[]> =>
    request<{ notebook_id: string; messages: StoredMessage[] }>(
      `/notebooks/${enc(id)}/messages`,
    ).then((r) => r.messages),

  clearMessages: (id: string) =>
    request<{ messages_removed: number }>(`/notebooks/${enc(id)}/messages`, {
      method: "DELETE",
    }),

  getNotes: (id: string): Promise<Note[]> =>
    request<{ notebook_id: string; notes: Note[] }>(
      `/notebooks/${enc(id)}/notes`,
    ).then((r) => r.notes),

  addNote: (id: string, text: string) =>
    request<Note>(`/notebooks/${enc(id)}/notes`, jsonInit({ text })),

  deleteNote: (id: string, noteId: number) =>
    request<{ deleted: number }>(`/notebooks/${enc(id)}/notes/${noteId}`, {
      method: "DELETE",
    }),
};
