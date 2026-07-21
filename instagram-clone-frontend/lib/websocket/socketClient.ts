import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient: Client | null = null;

type MessageHandler = (payload: unknown) => void;

const handlersByDestination: Map<string, MessageHandler[]> = new Map();
const nativeSubscriptions: Map<string, StompSubscription> = new Map();

function ensureNativeSubscription(destination: string) {
  if (!stompClient?.connected) return;
  if (nativeSubscriptions.has(destination)) return; // already subscribed natively, don't duplicate

  const subscription = stompClient.subscribe(destination, (message: IMessage) => {
    const payload = JSON.parse(message.body);
    const handlers = handlersByDestination.get(destination) || [];
    handlers.forEach((handler) => handler(payload));
  });

  nativeSubscriptions.set(destination, subscription);
}

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
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        // Re-establish exactly one native subscription per destination after (re)connect
        nativeSubscriptions.clear();
        handlersByDestination.forEach((_, destination) => {
          ensureNativeSubscription(destination);
        });
        resolve();
      },
      onStompError: (frame) => {
        console.error('WebSocket STOMP error:', frame);
        reject(new Error('WebSocket connection failed'));
      },
    });

    stompClient.activate();
  });
}

export function subscribeToDestination(destination: string, handler: MessageHandler) {
  const existingHandlers = handlersByDestination.get(destination) || [];

  // Avoid registering the exact same handler function twice (e.g. React Strict Mode double-invoke)
  if (existingHandlers.includes(handler)) return;

  handlersByDestination.set(destination, [...existingHandlers, handler]);
  ensureNativeSubscription(destination);
}

export function unsubscribeFromDestination(destination: string, handler: MessageHandler) {
  const handlers = handlersByDestination.get(destination);
  if (!handlers) return;

  const remaining = handlers.filter((h) => h !== handler);
  handlersByDestination.set(destination, remaining);

  // No more listeners for this destination - tear down the native subscription too
  if (remaining.length === 0) {
    const subscription = nativeSubscriptions.get(destination);
    subscription?.unsubscribe();
    nativeSubscriptions.delete(destination);
    handlersByDestination.delete(destination);
  }
}

export function disconnectWebSocket() {
  nativeSubscriptions.forEach((sub) => sub.unsubscribe());
  nativeSubscriptions.clear();
  handlersByDestination.clear();
  stompClient?.deactivate();
  stompClient = null;
}