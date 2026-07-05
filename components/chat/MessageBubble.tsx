"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import type { UiChatMessage } from "@/types/api";
import { CitationText } from "./CitationText";
import { sourceLabel } from "@/lib/vocab";

export function MessageBubble({ message }: { message: UiChatMessage }) {
  if (message.role === "user") {
    return (
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Paper
          elevation={0}
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            px: 2,
            py: 1,
            borderRadius: 3,
            maxWidth: "80%",
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {message.content}
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
      <Paper
        variant="outlined"
        sx={{ px: 2, py: 1.5, borderRadius: 3, maxWidth: "92%", width: "100%" }}
      >
        {message.pending ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
            <CircularProgress size={16} />
            <Typography variant="body2">Recherche et génération…</Typography>
          </Box>
        ) : message.error ? (
          <Alert severity="error">{message.error}</Alert>
        ) : (
          <>
            <CitationText text={message.content} sources={message.sources} />
            {message.sources && message.sources.length > 0 && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Sources
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                  {message.sources.map((s) => (
                    <Chip
                      key={`${s.filename}-${s.passage_id}`}
                      size="small"
                      variant="outlined"
                      label={`[${s.cite}] ${sourceLabel(s.filename)}`}
                    />
                  ))}
                </Stack>
              </>
            )}
            {message.model && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                🤖 {message.model}
              </Typography>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
