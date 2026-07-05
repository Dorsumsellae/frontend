"use client";

import Box from "@mui/material/Box";
import { TopBar } from "@/components/layout/TopBar";
import { ThreePanel } from "@/components/layout/ThreePanel";
import { SourcesPanel } from "@/components/sources/SourcesPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { StudioPanel } from "@/components/studio/StudioPanel";

export default function HomePage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TopBar />
      <ThreePanel
        left={<SourcesPanel />}
        center={<ChatPanel />}
        right={<StudioPanel />}
      />
    </Box>
  );
}
