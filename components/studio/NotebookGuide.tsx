"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

const TIPS = [
  "Sélectionnez des sources à gauche pour cibler la recherche.",
  "Cliquez sur une citation [n] pour voir le passage source.",
  "L'assistant répond uniquement à partir de vos sources.",
];

export function NotebookGuide() {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Guide
      </Typography>
      <List dense disablePadding>
        {TIPS.map((tip) => (
          <ListItem key={tip} disableGutters>
            <ListItemText
              primary={`• ${tip}`}
              primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
