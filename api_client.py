"""Client HTTP du backend RAG : centralise tous les appels reseau.

Cette couche ne fait *que* du reseau : elle renvoie des donnees pretes a l'emploi
et n'affiche jamais rien (la couche UI Streamlit decide de l'affichage). Deux
conventions de retour cohabitent :

- **GET d'affichage** (`get_*`) : renvoient la donnee, ou `None`/`[]` si le backend
  est injoignable, pour que l'interface reste utilisable en mode degrade.
- **Actions** (`upload_document`, `index_document`, `reset_index`, `ingest_youtube`,
  `ask`) : renvoient un couple `(data, erreur)` dont l'un des deux vaut `None`.

L'extraction du message d'erreur lisible est mutualisee dans `error_detail`.
"""

import os

import requests

# URL du backend FastAPI, configurable via variable d'environnement.
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Timeouts (secondes) adaptes a chaque appel : court pour les GET d'affichage,
# long pour l'indexation, la generation LLM et la transcription YouTube.
_TIMEOUT_SHORT = 10
_TIMEOUT_UPLOAD = 30
_TIMEOUT_RESET = 30
_TIMEOUT_INDEX = 120
_TIMEOUT_ASK = 120
_TIMEOUT_YOUTUBE = 300


def error_detail(exc: requests.RequestException) -> str:
    """Extrait le message d'erreur le plus parlant d'une exception `requests`.

    Le backend (FastAPI) repond ses erreurs sous la forme `{"detail": "..."}` :
    on privilegie ce message quand il est present, sinon on retombe sur le texte
    brut de l'exception (ex. erreur de connexion, sans reponse HTTP).
    """
    detail = str(exc)
    response = getattr(exc, "response", None)
    if response is not None:
        try:
            detail = response.json().get("detail", detail)
        except ValueError:
            pass
    return detail


# --- GET d'affichage (degradation gracieuse : None/[] si backend injoignable) ---


def get_workspaces():
    """GET /workspaces -> {"workspaces": [...], "default": "..."} ou None."""
    try:
        resp = requests.get(f"{BACKEND_URL}/workspaces", timeout=_TIMEOUT_SHORT)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException:
        return None


def get_documents(workspace):
    """GET /documents -> liste des documents indexes du workspace (ou [])."""
    try:
        resp = requests.get(
            f"{BACKEND_URL}/documents",
            params={"workspace": workspace},
            timeout=_TIMEOUT_SHORT,
        )
        resp.raise_for_status()
        return resp.json().get("documents", [])
    except requests.RequestException:
        return []


def get_models():
    """GET /models -> {"models": [...], "default": "..."} ou None si Ollama KO."""
    try:
        resp = requests.get(f"{BACKEND_URL}/models", timeout=_TIMEOUT_SHORT)
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException:
        return None


# --- Actions (renvoient un couple (data, erreur)) ---------------------------


def upload_document(workspace, name, content, content_type):
    """POST /upload : envoie un document (multipart). Retourne (data, erreur)."""
    try:
        files = {"file": (name, content, content_type)}
        resp = requests.post(
            f"{BACKEND_URL}/upload",
            files=files,
            data={"workspace": workspace},
            timeout=_TIMEOUT_UPLOAD,
        )
        resp.raise_for_status()
        return resp.json(), None
    except requests.RequestException as exc:
        return None, error_detail(exc)


def index_document(workspace, filename, strategy):
    """POST /index : indexe un document deja stocke. Retourne (data, erreur)."""
    try:
        resp = requests.post(
            f"{BACKEND_URL}/index",
            json={"filename": filename, "workspace": workspace, "strategy": strategy},
            timeout=_TIMEOUT_INDEX,
        )
        resp.raise_for_status()
        return resp.json(), None
    except requests.RequestException as exc:
        return None, error_detail(exc)


def reset_index(workspace, filename=None):
    """POST /reset : reinitialise l'index d'un workspace (ou d'un seul document).

    Si `filename` est fourni : supprime uniquement ce document du workspace ;
    sinon : supprime tous les documents du workspace. Retourne le compte-rendu
    JSON, ou None si le backend est injoignable.
    """
    try:
        body = {"workspace": workspace}
        if filename:
            body["filename"] = filename
        resp = requests.post(
            f"{BACKEND_URL}/reset", json=body, timeout=_TIMEOUT_RESET
        )
        resp.raise_for_status()
        return resp.json()
    except requests.RequestException:
        return None


def ingest_youtube(url, workspace, languages=None, num_speakers=None):
    """POST /ingest/youtube : importe et indexe une video. Retourne (data, erreur)."""
    try:
        body = {"url": url, "workspace": workspace}
        if languages:
            body["languages"] = languages
        if num_speakers:
            body["num_speakers"] = num_speakers
        resp = requests.post(
            f"{BACKEND_URL}/ingest/youtube", json=body, timeout=_TIMEOUT_YOUTUBE
        )
        resp.raise_for_status()
        return resp.json(), None
    except requests.RequestException as exc:
        return None, error_detail(exc)


def ask(question, workspace, filename=None, model=None):
    """POST /ask : question -> reponse + sources. Retourne (data, erreur)."""
    try:
        payload = {"question": question, "workspace": workspace}
        if filename:
            payload["filename"] = filename
        if model:
            payload["model"] = model
        resp = requests.post(
            f"{BACKEND_URL}/ask", json=payload, timeout=_TIMEOUT_ASK
        )
        resp.raise_for_status()
        return resp.json(), None
    except requests.RequestException as exc:
        return None, error_detail(exc)
