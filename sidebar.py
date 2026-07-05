"""Barre laterale Streamlit : workspace, document, indexation, modele, historique.

`render_sidebar` orchestre toute la colonne de gauche et renvoie le contexte dont
la zone principale a besoin : le workspace actif et la liste de ses documents.
"""

import streamlit as st

import api_client

# Libelle de l'option "creer un workspace" dans le selecteur.
NEW_WS_LABEL = "➕ Nouveau workspace…"


def render_sidebar():
    """Affiche la barre laterale et retourne (workspace_actif, documents)."""
    with st.sidebar:
        active_ws = _render_workspace_section()
        documents = _render_document_section(active_ws)
        _render_indexation_section(active_ws)
        _render_model_section()
        _render_history_section()
    return active_ws, documents


def _render_workspace_section():
    """Section 0 : selection/creation du workspace actif. Retourne son nom."""
    st.header("0. Workspace")

    # Recupere les workspaces existants et le workspace par defaut du serveur.
    ws_data = api_client.get_workspaces()
    existing_ws = ws_data.get("workspaces", []) if ws_data else []
    default_ws = ws_data.get("default", "default") if ws_data else "default"

    ws_options = existing_ws + [NEW_WS_LABEL]

    # Selection du workspace actif (index par defaut = workspace serveur si present).
    current = st.session_state.workspace or default_ws
    ws_index = ws_options.index(current) if current in ws_options else 0
    ws_choice = st.selectbox(
        "Workspace actif",
        options=ws_options,
        index=ws_index,
        help="Cloisonne les documents et les recherches. Chaque workspace est independant.",
    )

    if ws_choice == NEW_WS_LABEL:
        # Saisie libre : le workspace n'existe qu'une fois un document indexe dedans.
        new_ws = st.text_input(
            "Nom du nouveau workspace",
            placeholder="ex. projet-alpha",
            help="Lettres, chiffres, '.', '-', '_' (1 a 64 caracteres).",
        )
        active_ws = new_ws.strip() or default_ws
    else:
        active_ws = ws_choice

    # Un changement de workspace reinitialise la selection de document courante.
    if active_ws != st.session_state.workspace:
        st.session_state.workspace = active_ws
        st.session_state.filename = None
        st.session_state.indexed = False

    st.caption(f"\U0001f4c1 Workspace : **{active_ws}**")
    st.divider()
    return active_ws


def _render_document_section(active_ws):
    """Section 1 : liste, selection, gestion de l'index, upload, import YouTube.

    Retourne la liste des documents indexes du workspace (utilisee par la zone
    principale pour savoir si l'on peut interroger).
    """
    st.header("1. Document")

    documents = api_client.get_documents(active_ws)

    if documents:
        st.markdown("**Documents disponibles :**")
        noms = [d["filename"] for d in documents]
        choix = st.selectbox("Selectionner un document", noms)

        # Utiliser le document selectionne sans reindexer.
        if st.button("✅ Utiliser ce document"):
            st.session_state.filename = choix
            st.session_state.indexed = True  # Deja indexe : on passe directement a True
            st.success(f"Document selectionne : {choix}")

        # Nombre de passages indexes pour le document choisi.
        for d in documents:
            if d["filename"] == choix:
                st.caption(f"Passages indexes : {d['chunks_indexed']}")

        st.divider()

        # Gestion de l'index (masquee par defaut).
        with st.expander("\U0001f5d1️ Gerer l'index"):
            if st.button("Supprimer ce document de l'index"):
                result = api_client.reset_index(active_ws, filename=choix)
                if result:
                    chunks = result.get("chunks_removed", 0)
                    docs = result.get("documents_removed", 0)
                    st.success(
                        f"Document supprime — {docs} document(s) et {chunks} "
                        "passages retires de l'index"
                    )
                    st.session_state.filename = None
                    st.session_state.indexed = False
                    st.rerun()
                else:
                    st.error("Erreur lors de la suppression")

            if st.button("⚠️ Vider ce workspace"):
                result = api_client.reset_index(active_ws)  # Pas de filename = tout le workspace
                if result:
                    chunks = result.get("chunks_removed", 0)
                    docs = result.get("documents_removed", 0)
                    st.success(
                        f"Workspace vide — {docs} document(s) et {chunks} "
                        "passages supprimes"
                    )
                    st.session_state.filename = None
                    st.session_state.indexed = False
                    st.rerun()
                else:
                    st.error("Erreur lors de la reinitialisation")
    else:
        st.info("Aucun document indexe pour l'instant.")

    st.divider()
    _render_upload(active_ws)
    _render_youtube_import(active_ws)
    return documents


def _render_upload(active_ws):
    """Formulaire d'upload d'un nouveau document."""
    st.markdown("**Ajouter un document :**")
    uploaded = st.file_uploader(
        "Charger un document",
        type=["txt", "pdf", "md", "srt", "vtt"],
        help="Texte, PDF (non scanne), ou transcript horodate (.srt, .vtt, ou .txt [HH:MM:SS]).",
    )

    if st.button("Envoyer le document", disabled=uploaded is None):
        with st.spinner("Envoi du document..."):
            content_type = uploaded.type or "application/octet-stream"
            data, error = api_client.upload_document(
                active_ws, uploaded.name, uploaded.getvalue(), content_type
            )
        if error:
            st.error(f"Erreur lors de l'envoi : {error}")
        else:
            st.session_state.filename = uploaded.name
            st.session_state.indexed = False  # Pas encore indexe
            st.success(f"Document envoye : {uploaded.name}")
            st.rerun()


def _render_youtube_import(active_ws):
    """Import direct d'un transcript YouTube (sous-titres ou transcription ASR)."""
    st.markdown("**Ou importer une video YouTube :**")
    yt_url = st.text_input(
        "URL YouTube",
        placeholder="https://www.youtube.com/watch?v=…",
        label_visibility="collapsed",
    )
    yt_langs = st.text_input(
        "Langues preferees (codes separes par des virgules)",
        value="",
        placeholder="(vide = langue originale + repli anglais)",
        help="Laisser vide : langue originale de la video, avec repli sur l'anglais. "
        "Sinon, codes par ordre de priorite, ex. « fr,en ».",
    )
    # Nombre de locuteurs : utile UNIQUEMENT si la video n'a pas de sous-titres
    # (fallback transcription audio). "Un seul" saute la diarisation -> plus rapide.
    speakers_choice = st.selectbox(
        "Locuteurs (si transcription audio)",
        options=["Auto-detection", "Un seul (plus rapide)", "2", "3", "4", "5", "6"],
        index=0,
        help="Si la video n'a pas de sous-titres, elle est transcrite. Indiquer le "
        "nombre de locuteurs optimise la diarisation ; « un seul » la desactive.",
    )
    _speakers_map = {"Auto-detection": None, "Un seul (plus rapide)": 1}
    num_speakers = _speakers_map.get(speakers_choice, None)
    if num_speakers is None and speakers_choice.isdigit():
        num_speakers = int(speakers_choice)

    if st.button("\U0001f4e5 Importer depuis YouTube", disabled=not yt_url):
        with st.spinner("Recuperation / transcription et indexation…"):
            languages = [c.strip() for c in yt_langs.split(",") if c.strip()]
            data, error = api_client.ingest_youtube(
                yt_url, active_ws, languages or None, num_speakers
            )
        if data:
            st.session_state.filename = data["filename"]
            st.session_state.indexed = True  # ingestion = indexation immediate
            # Provenance : sous-titres YouTube, ou transcription audio (ASR).
            prov = "sous-titres" if data.get("provenance") == "captions" else "transcription audio (ASR)"
            diar = " · \U0001f5e3️ diarise" if data.get("diarized") else ""
            st.success(
                f"✅ Transcript importe — {prov} ({data.get('language', '?')}){diar} — "
                f"{data['chunks_indexed']} passages indexes."
            )
            st.rerun()
        else:
            st.error(f"Échec de l'import YouTube : {error}")


def _render_indexation_section(active_ws):
    """Section 2 : choix de la strategie de decoupage et lancement de l'indexation."""
    st.header("2. Indexation")

    if st.session_state.filename:
        st.info(f"Fichier actuel : {st.session_state.filename}")

    strategy = st.radio(
        "Strategie de decoupage :",
        options=["fixed", "recursive"],
        index=0,  # "fixed" par defaut
        help="fixed : decoupage par taille fixe | recursive : decoupage intelligent par paragraphes",
    )

    if st.button("Lancer l'indexation", disabled=st.session_state.filename is None):
        progress = st.progress(0, text="Demarrage de l'indexation...")
        progress.progress(20, text="Lecture du document...")
        data, error = api_client.index_document(
            active_ws, st.session_state.filename, strategy
        )
        if error:
            progress.empty()
            st.error(f"Erreur lors de l'indexation : {error}")
        else:
            progress.progress(60, text="Creation des embeddings...")
            progress.progress(100, text="Indexation terminee !")
            chunks = data.get("chunks_indexed", 0)
            st.session_state.indexed = True
            st.success(
                f"✅ Indexation terminee — {chunks} passages crees "
                f"avec la strategie '{strategy}'"
            )
            st.rerun()

    if st.session_state.indexed:
        st.success("✅ Document indexe — vous pouvez poser des questions")

    st.divider()


def _render_model_section():
    """Selecteur du modele Ollama (memorise dans l'etat de session)."""
    st.header("\U0001f916 Modele")

    models_data = api_client.get_models()
    if models_data:
        model_names = [m["name"] for m in models_data.get("models", [])]
        default_model = models_data.get("default")
        default_index = model_names.index(default_model) if default_model in model_names else 0

        chosen_model = st.selectbox(
            "Modele Ollama",
            options=model_names,
            index=default_index,
            help="Modele utilise pour generer la reponse. Defaut serveur si non modifie.",
        )
        st.session_state.selected_model = chosen_model
    else:
        st.caption("⚠️ Impossible de recuperer la liste des modeles (serveur Ollama injoignable ?)")

    st.divider()


def _render_history_section():
    """Historique des questions/reponses de la session."""
    st.header("\U0001f4cb Historique")

    if st.session_state.historique:
        if st.button("\U0001f5d1️ Effacer l'historique"):
            st.session_state.historique = []
            st.rerun()
        # Les questions les plus recentes en premier.
        for i, item in enumerate(reversed(st.session_state.historique)):
            with st.expander(
                f"Q{len(st.session_state.historique) - i} : {item['question'][:40]}..."
            ):
                st.write(item["answer"])
    else:
        st.caption("Aucune question posee pour l'instant.")
