// Types du contrat d'API du backend FastAPI (voir backend/app/api/schemas.py).
// Le format « fil » garde les noms backend (workspace, filename) ; le mapping vers
// le vocabulaire NotebookLM (Notebook / Source) est fait dans lib/vocab.ts.

export type SourceType = "text" | "pdf" | "youtube" | "transcript";

export interface WorkspacesResponse {
  workspaces: string[];
  default: string;
}

export interface DocumentInfo {
  filename: string;
  chunks_indexed: number;
  type: SourceType;
  source_url: string | null;
}

export interface DocumentsResponse {
  workspace: string;
  documents: DocumentInfo[];
  count: number;
}

export interface ModelInfo {
  name: string;
  is_default: boolean;
}

export interface ModelsResponse {
  models: ModelInfo[];
  default: string;
}

export interface Source {
  filename: string;
  passage_id: number;
  excerpt: string;
  score?: number | null;
  cite?: number | null;
  start_seconds?: number | null;
  source_url?: string | null;
  timecode_url?: string | null;
  speaker?: string | null;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  model: string;
  cited?: number[] | null;
}

export interface UploadResponse {
  filename: string;
  workspace: string;
}

export interface IndexResponse {
  filename: string;
  workspace: string;
  chunks_indexed: number;
}

export interface IngestYoutubeResponse {
  filename: string;
  workspace: string;
  video_id: string;
  source_url: string;
  language: string;
  provenance: "captions" | "asr";
  diarized: boolean;
  chunks_indexed: number;
}

export interface ResetResponse {
  scope: "workspace" | "document";
  workspace: string;
  documents_removed: number;
  chunks_removed: number;
}

// Message de chat enrichi cote UI : l'assistant conserve ses propres sources afin
// que les citations [n] se resolvent par message.
export interface UiChatMessage extends ChatMessage {
  id: string;
  sources?: Source[];
  cited?: number[] | null;
  model?: string;
  pending?: boolean;
  error?: string;
}

// --- Notebooks / conversations / notes (persistes en base) ---

export interface Notebook {
  id: string; // slug technique (= workspace)
  title: string; // titre libre affiche
  created_at?: string | null;
}

export interface NotebooksResponse {
  notebooks: Notebook[];
  default: string;
}

// Message tel que persiste cote serveur (id numerique).
export interface StoredMessage {
  id: number;
  role: ChatRole;
  content: string;
  sources?: Source[] | null;
  cited?: number[] | null;
  model?: string | null;
  created_at?: string | null;
}

export interface Note {
  id: number;
  text: string;
  created_at?: string | null;
}
