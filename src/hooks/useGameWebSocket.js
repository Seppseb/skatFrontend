import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE = import.meta.env.VITE_BACKEND_URL;

// Hook to handle websocket connection per game
export function useGameWebSocket(gameId, onMessage) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!gameId) return;

    const socket = new SockJS(API_BASE + "/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // auto reconnect every 5s
      onConnect: () => {
        setIsConnected(true);
        client.subscribe(`/topic/games/${gameId}`, (message) => {
          try {
            const event = JSON.parse(message.body);
            onMessageRef.current?.(event);
          } catch (e) {
            console.error("Failed to parse websocket message:", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      setIsConnected(false);
      client.deactivate();
    };
  }, [gameId]);

  return { isConnected };
}

export function useGameListWebSocket(onMessage) {
  const clientRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const socket = new SockJS(API_BASE + "/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000, // auto reconnect every 5s
      onConnect: () => {
        setIsConnected(true);
        client.subscribe("/topic/gameList", (message) => {
          try {
            const event = JSON.parse(message.body);
            onMessageRef.current?.(event);
          } catch (e) {
            console.error("Failed to parse gameList websocket message:", e);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      setIsConnected(false);
      client.deactivate();
    };
  }, []);

  return { isConnected };
}
