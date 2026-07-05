import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assistant documentaire — Notebooks",
  description: "Assistant RAG facon NotebookLM : sources, chat conversationnel et citations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppRouterCacheProvider options={{ key: "mui" }}>
          <Providers>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
