import { WebSocketServer, WebSocket } from 'ws';
import { Vessel, Refinery } from '@shared/schema';

// Cliente WebSocket conectado
type ConnectedClient = {
  ws: any; // Using 'any' here to avoid type conflicts
  userId?: number;
};

// Clientes conectados
let connectedClients: ConnectedClient[] = [];

/**
 * Set up WebSocket event handlers
 * @param wss WebSocket server instance
 */
export function setupEvents(wss: WebSocketServer): void {
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    connectedClients.push({ ws });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication
        if (data.type === 'authenticate' && data.userId) {
          const clientIndex = connectedClients.findIndex(c => c.ws === ws);
          if (clientIndex >= 0) {
            connectedClients[clientIndex].userId = data.userId;
            console.log(`User ${data.userId} authenticated`);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      connectedClients = connectedClients.filter(client => client.ws !== ws);
    });
  });
}

/**
 * Broadcast a vessel update to all connected clients
 * @param vessel The updated vessel data
 */
export function broadcastVesselUpdate(vessel: Vessel): void {
  sendToAllClients(JSON.stringify({
    type: 'vessel_update',
    data: vessel
  }));
}

/**
 * Broadcast a refinery update to all connected clients
 * @param refinery The updated refinery data
 */
export function broadcastRefineryUpdate(refinery: Refinery): void {
  sendToAllClients(JSON.stringify({
    type: 'refinery_update',
    data: refinery
  }));
}

/**
 * Send a message to all connected clients
 * @param message The message to send
 */
function sendToAllClients(message: string): void {
  connectedClients.forEach(client => {
    try {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  });
}