import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient: Client | null = null;

type MessageHandler = (payload: unknown) => void;

const subscriptions: Map<string, MessageHandler[]> = new Map();

export function connectWebSocket(): Promise<void> {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      reject(new Error('No access token available'));
      return;
    }

    if (stompClient?.active) {
      resolve();
      return;
    }

    stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 5000,
      onConnect: () => {
        // Re-subscribe to all previous registered designations after re-connect
        subscriptions.forEach((handlers, destination) => {
          stompClient?.subscribe(destination, (message: IMessage) => {
            const payload = JSON.parse(message.body);
            handlers.forEach((handler) => handler(payload));
          });
        });
        resolve();
      },
      onStompError: (frame) => {
        console.error('WebSocket STOMP error:', frame);
        reject(new Error('WebSocket connection failed'));
      }
    });

    stompClient.activate();
  });
}

export function subscribeToDestination(destination: string, handler: MessageHandler) {
  if (!subscriptions.has(destination)) subscriptions.set(destination, []);
  subscriptions.get(destination)?.push(handler);

  // If already connected, subscribe immediately
  if (stompClient?.connected) {
    stompClient.subscribe(destination, (message: IMessage) => {
      const payload = JSON.parse(message.body);
      handler(payload);
    });
  }
}

export function unsubscribeFromDestination(destination: string, handler: MessageHandler) {
  const handlers = subscriptions.get(destination);
  if (handlers) {
    subscriptions.set(
      destination,
      handlers.filter((h) => h !== handler)
    );
  }
}

export function disconnectWebSocket() {
  stompClient?.deactivate();
  stompClient = null;
  subscriptions.clear();
}