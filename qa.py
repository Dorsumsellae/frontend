"""Zone principale : saisie de la question, appel /ask, affichage reponse + sources."""

import streamlit as st

import api_client
from formatting import format_seconds


def render_question_area(active_ws, documents):
    """Affiche la zone de questions pour le workspace actif."""
    st.header("3. Poser une question")

    # La recherche porte sur TOUT le workspace actif : on peut interroger des qu'au
    # moins un document y est indexe, sans en selectionner un en particulier.
    has_docs = bool(documents)

    if not has_docs:
        st.warning(
            f"⚠️ Aucun document indexe dans le workspace « {active_ws} ». "
            "Chargez et indexez un document dans la barre laterale."
        )
    else:
        st.caption(
            f"\U0001f50e La recherche porte sur les {len(documents)} document(s) du "
            f"workspace « {active_ws} ». Cochez l'option ci-dessous pour la restreindre "
            "a un seul."
        )

    question = st.text_input(
        "Votre question",
        placeholder="Que dit le texte sur l'education ?",
        disabled=not has_docs,
    )

    # Par defaut la recherche porte sur tout le workspace ; option pour la restreindre
    # au seul document selectionne.
    limit_to_doc = st.checkbox(
        "Limiter la recherche au document selectionne",
        value=False,
        disabled=not st.session_state.filename,
        help="Sinon, la recherche porte sur tous les documents du workspace actif.",
    )

    if st.button("Interroger", type="primary", disabled=not question or not has_docs):
        filename = st.session_state.filename if (limit_to_doc and st.session_state.filename) else None
        model = st.session_state.selected_model or None
        with st.spinner("Recherche et generation de la reponse..."):
            data, error = api_client.ask(question, active_ws, filename=filename, model=model)
        if error:
            st.error(f"Erreur lors de l'appel au backend : {error}")
        else:
            _render_answer(data)
            st.session_state.historique.append(
                {"question": question, "answer": data.get("answer", "")}
            )


def _render_answer(data):
    """Affiche la reponse generee, le modele utilise et les sources."""
    st.subheader("Reponse")
    st.write(data.get("answer", ""))

    used_model = data.get("model")
    if used_model:
        st.caption(f"\U0001f916 Modele utilise : {used_model}")

    sources = data.get("sources", [])
    st.info(f"\U0001f50d {len(sources)} passage(s) trouve(s) dans le document")

    st.subheader("Sources")
    if not sources:
        st.info("Aucune source trouvee.")
        return

    for s in sources:
        # Pour un transcript : afficher l'instant (cliquable si URL video).
        time_label = ""
        if s.get("start_seconds") is not None:
            time_label = f" — ⏱️ {format_seconds(s['start_seconds'])}"
        # Locuteur si transcript diarise (ASR).
        speaker_label = f" · \U0001f5e3️ {s['speaker']}" if s.get("speaker") else ""
        with st.expander(
            f"\U0001f4c4 {s['filename']} — passage {s['passage_id']}{time_label}{speaker_label}"
            + (f" (score {s['score']:.3f})" if s.get("score") is not None else "")
        ):
            if s.get("timecode_url"):
                st.markdown(
                    f"▶️ [Ouvrir la video a {format_seconds(s['start_seconds'])}]"
                    f"({s['timecode_url']})"
                )
            st.write(s["excerpt"])  # Extrait du passage utilise
