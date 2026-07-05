"""Petits utilitaires de formatage pour l'affichage."""


def format_seconds(seconds):
    """Formate des secondes en MM:SS (ou HH:MM:SS au-dela d'une heure)."""
    total = int(seconds)
    h, m, s = total // 3600, (total % 3600) // 60, total % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"
