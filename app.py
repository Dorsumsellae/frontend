"""Interface Streamlit de l'assistant documentaire RAG (point d'entree).

L'application est decoupee en modules :
    - api_client : couche HTTP (tous les appels au backend FastAPI) ;
    - state      : initialisation de l'etat de session ;
    - sidebar    : barre laterale (workspace, document, indexation, modele, historique) ;
    - qa         : zone principale de questions/reponses ;
    - formatting : petits utilitaires d'affichage.
"""

import streamlit as st

from sidebar import render_sidebar
from state import init_session_state
from qa import render_question_area

# Configuration de la page (doit etre le premier appel Streamlit).
st.set_page_config(page_title="Assistant documentaire RAG", page_icon="📄")
st.title("📄 Assistant documentaire Lite RAG")
st.caption("Répond à partir du document fourni — sinon il le dit clairement.")

init_session_state()

# La barre laterale produit le workspace actif et ses documents, consommes ensuite
# par la zone principale.
active_ws, documents = render_sidebar()
render_question_area(active_ws, documents)
