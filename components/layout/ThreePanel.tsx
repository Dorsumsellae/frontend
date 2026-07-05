"use client";

import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

/** Coquille 3 panneaux (Sources | Chat | Studio) facon NotebookLM. */
export function ThreePanel({
  left,
  center,
  right,
}: {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        minHeight: 0,
        gap: 1.5,
        p: 1.5,
        bgcolor: "background.default",
      }}
    >
      <Panel sx={{ width: 300, flexShrink: 0 }}>{left}</Panel>
      <Panel sx={{ flex: 1, minWidth: 0 }}>{center}</Panel>
      <Panel sx={{ width: 320, flexShrink: 0 }}>{right}</Panel>
    </Box>
  );
}

function Panel({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        ...(sx as object),
      }}
    >
      {children}
    </Box>
  );
}
