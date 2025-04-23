import { WebSocketServer, WebSocket } from 'ws';
import { Vessel, Refinery } from '@shared/schema';

// Maintain a list of connected clients
let connectedClients: WebSocket[] = [];

/**
 * Set up WebSocket event handlers
 * @param wss WebSocket server instance
 */
export function setupEvents(wss: WebSocketServer): void {
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    connectedClients.push(ws);

    // Setup disconnect handler
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      connectedClients = connectedClients.filter(client => client !== ws);
    });

    // Send initial connection acknowledgment
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to vessel tracking WebSocket server',
      timestamp: new Date().toISOString()
    }));
  });
}

/**
 * Broadcast a vessel update to all connected clients
 * @param vessel The updated vessel data
 */
export function broadcastVesselUpdate(vessel: Vessel): void {
  const message = JSON.stringify({
    type: 'vessel_update',
    data: {
      id: vessel.id,
      name: vessel.name,
      imo: vessel.imo, 
      currentLat: vessel.currentLat,
      currentLng: vessel.currentLng,
      currentRegion: vessel.currentRegion,
      updated: new Date().toISOString()
    }
  });

  sendToAllClients(message);
}

/**
 * Broadcast a refinery update to all connected clients
 * @param refinery The updated refinery data
 */
export function broadcastRefineryUpdate(refinery: Refinery): void {
  const message = JSON.stringify({
    type: 'refinery_update',
    data: {
      id: refinery.id,
      name: refinery.name,
      status: refinery.status,
      capacity: refinery.capacity,
      updated: new Date().toISOString()
    }
  });

  sendToAllClients(message);
}

/**
 * Send a message to all connected clients
 * @param message The message to send
 */
function sendToAllClients(message: string): void {
  connectedClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}