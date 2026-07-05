// URL publique du backend, appelee depuis le navigateur. Inlinee au build
// (prefixe NEXT_PUBLIC_). CORS est ouvert cote backend, donc l'appel cross-origin
// navigateur -> http://localhost:8000 fonctionne.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
