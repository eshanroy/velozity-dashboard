import { useEffect, useRef } from "react";

interface UseWebSocketProps {
  accessToken: string | null;
  onMessage: (data: any) => void;
}

export const useWebSocket = ({
  accessToken,
  onMessage,
}: UseWebSocketProps) => {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const apiUrl =
      import.meta.env.VITE_API_URL ||
      "http://localhost:5000";

    const wsUrl = apiUrl
      .replace(/^http:/, "ws:")
      .replace(/^https:/, "wss:");

    const socket = new WebSocket(
      `${wsUrl}/ws?token=${encodeURIComponent(
        accessToken
      )}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        console.error(
          "Failed to parse WebSocket message"
        );
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
      socketRef.current = null;
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [accessToken, onMessage]);

  return socketRef;
};