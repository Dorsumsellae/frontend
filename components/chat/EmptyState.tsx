"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

const SUGGESTIONS = [
  "Résume les points clés de mes sources.",
  "Quelles sont les idées principales ?",
  "Y a-t-il des chiffres importants ?",
];

export function EmptyState({
  onPick,
  hasSources,
}: {
  onPick: (question: string) => void;
  hasSources: boolean;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 4,
        color: "text.secondary",
        textAlign: "center",
      }}
    >
      <ChatBubbleOutlineIcon sx={{ fontSize: 48, mb: 1 }} />
      <Typography variant="h6" gutterBottom>
        Discutez avec vos sources
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {hasSources
          ? "Posez une question ; les réponses citent les passages sources."
          : "Ajoutez au moins une source pour commencer."}
      </Typography>
      {hasSources && (
        <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center">
          {SUGGESTIONS.map((s) => (
            <Chip key={s} label={s} variant="outlined" onClick={() => onPick(s)} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
