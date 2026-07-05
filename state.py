"""Initialisation de l'etat de session Streamlit (persiste entre interactions)."""

import streamlit as st

# Valeurs par defaut de l'etat partage entre la barre laterale et la zone de Q/R.
_DEFAULTS = {
    "workspace": None,       # Workspace actif (cloisonnement des documents)
    "filename": None,        # Nom du fichier selectionne
    "indexed": False,        # True si le document est indexe dans ChromaDB
    "historique": [],        # Liste des questions/reponses de la session
    "selected_model": None,  # Modele Ollama selectionne
}


def init_session_state() -> None:
    """Cree les cles d'etat manquantes avec leur valeur par defaut."""
    for key, value in _DEFAULTS.items():
        if key not in st.session_state:
            st.session_state[key] = value
