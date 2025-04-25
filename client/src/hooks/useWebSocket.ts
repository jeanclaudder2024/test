import { useState, useEffect, useCallback } from 'react';

interface WebSocketOptions {
  onOpen?: () => void;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
  reconnectOnClose?: boolean;
  reconnectInterval?: number;
}

/**
 * Hook for connecting to WebSocket server
 */
export function useWebSocket(options: WebSocketOptions = {}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);

  // Setup WebSocket connection
  const setupWebSocket = useCallback(() => {
    try {
      // Use the current protocol (ws or wss) and host, with the correct path
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log('Connecting to WebSocket at:', wsUrl);
      const newSocket = new WebSocket(wsUrl);
      
      newSocket.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setError(null);
        if (options.onOpen) options.onOpen();
      };
      
      newSocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle formatted messages with type and data
          if (message && typeof message === 'object') {
            // Log heartbeats but don't forward them to consumers
            if (message.type === 'heartbeat') {
              console.log('WebSocket heartbeat received:', message.timestamp);
              return;
            }
            
            // Handle error messages
            if (message.type === 'error') {
              console.error('WebSocket server error:', message.data);
              return;
            }
            
            // Handle connection confirmations
            if (message.type === 'connected') {
              console.log('WebSocket connection confirmed:', message.data);
              return;
            }
            
            // Process regular data messages
            if (options.onMessage) {
              // For backward compatibility, if we get a raw array without type, 
              // pass it directly
              if (Array.isArray(message)) {
                options.onMessage(message);
              } else {
                // Otherwise pass the typed data
                options.onMessage(message);
              }
            }
          } else {
            // Handle legacy messages
            if (options.onMessage) options.onMessage(message);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      newSocket.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError(event);
        if (options.onError) options.onError(event);
      };
      
      newSocket.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        if (options.onClose) options.onClose();
        
        // Reconnect if option is enabled
        if (options.reconnectOnClose) {
          const reconnectTime = options.reconnectInterval || 3000;
          console.log(`Attempting to reconnect in ${reconnectTime}ms...`);
          setTimeout(setupWebSocket, reconnectTime);
        }
      };
      
      setSocket(newSocket);
      return newSocket;
    } catch (err) {
      console.error('Failed to setup WebSocket:', err);
      setError(err as any);
      return null;
    }
  }, [options]);

  // Send data through the WebSocket
  const sendMessage = useCallback((data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      console.warn('Cannot send message: WebSocket is not connected');
    }
  }, [socket]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    const ws = setupWebSocket();
    
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [setupWebSocket]);

  return { 
    socket, 
    isConnected, 
    error, 
    sendMessage,
    reconnect: setupWebSocket
  };
}