"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { connectWebSocket, disconnectWebSocket } from "./socketClient";

export function useWebSocketConnection() {
  const { isAuthenticated } = useAuthStore();
  const connectedRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !connectedRef.current) {
      connectedRef.current = true;
      connectWebSocket().catch((err) => {
        console.error('Failed to connect WebSocket:', err);
        connectedRef.current = false;
      });
    }

    return () => {
      if (!isAuthenticated) {
        disconnectWebSocket();
        connectedRef.current = false;
      }
    };
  }, [isAuthenticated]);
}