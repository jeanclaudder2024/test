/**
 * Vessel WebSocket Client
 * 
 * This module provides a reliable WebSocket client for vessel tracking
 * with automatic fallback to REST API when WebSocket connection fails.
 */
import { Vessel } from '@/types';

// Configuration interface
export interface VesselTrackingConfig {
  region?: string;
  page?: number;
  pageSize?: number;
  vesselType?: string;
  loadAllVessels?: boolean;
  trackPortProximity?: boolean;
  proximityRadius?: number; 
  maxOilVessels?: number;
}

// Connection status type
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'using-rest';

// Events that can be subscribed to
export type VesselClientEventType = 
  | 'vessels' 
  | 'status'
  | 'error'
  | 'reconnect';

// Event handler type
export type VesselEventHandler = (data: any) => void;

/**
 * VesselWebSocketClient handles WebSocket connections for vessel tracking
 * with automatic fallback to REST API
 */
export class VesselWebSocketClient {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private config: VesselTrackingConfig;
  private reconnectAttempts: number = 0;
  private reconnectTimer: number | null = null;
  private eventHandlers: Map<VesselClientEventType, VesselEventHandler[]> = new Map();
  private lastVessels: Vessel[] = [];
  private sessionId: string = Math.random().toString(36).substring(2, 15);
  private useRestFallback: boolean = false;
  private restPollingInterval: number | null = null;
  
  /**
   * Create a new WebSocket client for vessel tracking
   * 
   * @param config Initial configuration
   */
  constructor(config: VesselTrackingConfig = {}) {
    this.config = {
      region: 'global',
      page: 1,
      pageSize: 500,
      vesselType: 'oil',
      loadAllVessels: false,
      trackPortProximity: false,
      proximityRadius: 50,
      maxOilVessels: 1540,
      ...config
    };
  }
  
  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this.ws) {
      this.disconnect();
    }
    
    this.status = 'connecting';
    this.notifyStatusChange();
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const hostname = window.location.hostname;
      const token = this.sessionId;
      
      // Construct WebSocket URL using only hostname (no port) for better compatibility
      const wsUrl = `${protocol}//${hostname}/ws?token=${token}`;
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      
      this.ws = new WebSocket(wsUrl);
      
      // Set up event handlers
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.status = 'error';
      this.notifyStatusChange();
      this.useRestFallback = true;
      this.fallbackToRest();
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // Clear any reconnect timer
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Clear any REST polling interval
    if (this.restPollingInterval) {
      window.clearInterval(this.restPollingInterval);
      this.restPollingInterval = null;
    }
    
    this.status = 'disconnected';
    this.notifyStatusChange();
  }
  
  /**
   * Update configuration and send to the server
   */
  updateConfig(config: Partial<VesselTrackingConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Send the updated config if connected via WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'config',
        ...this.config
      }));
    } 
    // If using REST fallback, refresh data immediately
    else if (this.useRestFallback) {
      this.fetchVesselsViaREST();
    }
  }
  
  /**
   * Subscribe to an event
   */
  on(event: VesselClientEventType, handler: VesselEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    
    this.eventHandlers.get(event)?.push(handler);
  }
  
  /**
   * Unsubscribe from an event
   */
  off(event: VesselClientEventType, handler: VesselEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index >= 0) {
        handlers.splice(index, 1);
      }
    }
  }
  
  /**
   * Handle WebSocket open event
   */
  private handleOpen(): void {
    console.log('WebSocket connection established');
    this.status = 'connected';
    this.reconnectAttempts = 0;
    this.notifyStatusChange();
    
    // Send initial configuration
    this.ws?.send(JSON.stringify({
      type: 'config',
      ...this.config
    }));
  }
  
  /**
   * Handle WebSocket message event
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'vessels' && data.vessels) {
        // Process and store vessel data
        const vessels = this.processVesselData(data.vessels);
        this.lastVessels = vessels;
        
        // Notify all vessel event handlers
        this.notifyHandlers('vessels', { vessels, totalCount: data.totalCount || vessels.length });
        
      } else if (data.type === 'error') {
        console.error('WebSocket error message:', data.message);
        this.notifyHandlers('error', { message: data.message });
      }
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }
  
  /**
   * Handle WebSocket error event
   */
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
    this.status = 'error';
    this.notifyStatusChange();
    this.notifyHandlers('error', { message: 'WebSocket connection error' });
    
    // Fallback to REST API on first error
    if (!this.useRestFallback) {
      this.useRestFallback = true;
      this.fallbackToRest();
    }
  }
  
  /**
   * Handle WebSocket close event
   */
  private handleClose(): void {
    console.log('WebSocket connection closed');
    
    const wasConnected = this.status === 'connected';
    this.status = 'disconnected';
    this.notifyStatusChange();
    
    // If we were previously connected, try to reconnect
    if (wasConnected && !this.useRestFallback) {
      this.scheduleReconnect();
    } 
    // Otherwise use REST fallback
    else if (!this.useRestFallback) {
      this.useRestFallback = true;
      this.fallbackToRest();
    }
  }
  
  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
    }
    
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const jitter = Math.random() * 1000; // Random jitter up to 1 second
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      baseDelay * Math.pow(1.5, Math.min(this.reconnectAttempts, 10)) + jitter,
      maxDelay
    );
    
    console.log(`Scheduling reconnect attempt in ${Math.round(delay/1000)} seconds`);
    
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectAttempts++;
      this.notifyHandlers('reconnect', { attempt: this.reconnectAttempts });
      
      // After a few reconnect attempts, fall back to REST
      if (this.reconnectAttempts > 3) {
        console.log('Multiple reconnect attempts failed, falling back to REST API');
        this.useRestFallback = true;
        this.fallbackToRest();
      } else {
        this.connect();
      }
    }, delay);
  }
  
  /**
   * Fall back to REST API for vessel data
   */
  private fallbackToRest(): void {
    console.log('Falling back to REST API for vessel data');
    this.status = 'using-rest';
    this.notifyStatusChange();
    
    // Fetch data immediately
    this.fetchVesselsViaREST();
    
    // Set up polling interval
    if (!this.restPollingInterval) {
      this.restPollingInterval = window.setInterval(() => {
        this.fetchVesselsViaREST();
      }, 15 * 60 * 1000); // Poll every 15 minutes
    }
  }
  
  /**
   * Fetch vessel data via REST API
   */
  private async fetchVesselsViaREST(): Promise<void> {
    try {
      console.log('Fetching vessels via REST API...');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (this.config.region && this.config.region !== 'global') {
        params.append('region', this.config.region);
      }
      if (this.config.page) {
        params.append('page', this.config.page.toString());
      }
      if (this.config.pageSize) {
        params.append('pageSize', this.config.pageSize.toString());
      }
      if (this.config.vesselType) {
        params.append('vesselType', this.config.vesselType);
      }
      
      // Try the polling endpoint first (faster) with authentication
      try {
        const token = localStorage.getItem('authToken');
        const headers: Record<string, string> = {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        };
        
        const pollingResponse = await fetch(`/api/vessels/polling?${params.toString()}`, {
          headers,
          credentials: "include"
        });
        
        if (pollingResponse.ok) {
          const data = await pollingResponse.json();
          
          if (data.vessels && data.vessels.length > 0) {
            const vessels = this.processVesselData(data.vessels);
            this.lastVessels = vessels;
            
            this.notifyHandlers('vessels', {
              vessels,
              totalCount: data.totalCount || vessels.length,
              source: 'rest-polling'
            });
            return;
          }
        }
      } catch (pollingError) {
        console.warn('Polling endpoint failed:', pollingError);
      }
      
      // Fall back to regular vessels endpoint with authentication
      const token = localStorage.getItem('authToken');
      const headers: Record<string, string> = {
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      };
      
      const response = await fetch(`/api/vessels?${params.toString()}`, {
        headers,
        credentials: "include"
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const vessels = this.processVesselData(data);
          this.lastVessels = vessels;
          
          this.notifyHandlers('vessels', {
            vessels,
            totalCount: data.length,
            source: 'rest-api'
          });
        } else {
          // If we couldn't get any vessels, notify with empty array
          this.notifyHandlers('vessels', {
            vessels: [],
            totalCount: 0,
            source: 'rest-api'
          });
        }
      } else {
        throw new Error(`API request failed with status: ${response.status}`);
      }
      
    } catch (error) {
      console.error('Error fetching vessels via REST:', error);
      this.notifyHandlers('error', { 
        message: 'Failed to fetch vessel data',
        error
      });
    }
  }
  
  /**
   * Process vessel data to ensure all required fields and filter out invalid data
   */
  private processVesselData(vessels: any[]): Vessel[] {
    // First filter out vessels with invalid coordinates
    const vesselsWithCoordinates = vessels.filter(v => 
      v.currentLat != null && v.currentLng != null &&
      !isNaN(parseFloat(v.currentLat.toString())) &&
      !isNaN(parseFloat(v.currentLng.toString()))
    );
    
    // Then filter for oil vessels if vesselType is 'oil'
    let filteredVessels = vesselsWithCoordinates;
    if (this.config.vesselType === 'oil') {
      filteredVessels = vesselsWithCoordinates.filter(v => 
        v.vesselType?.toLowerCase().includes('oil') ||
        v.vesselType?.toLowerCase().includes('tanker') ||
        v.vesselType?.toLowerCase().includes('crude') ||
        v.vesselType?.toLowerCase().includes('vlcc') ||
        v.vesselType?.toLowerCase().includes('gas') ||
        v.cargoType?.toLowerCase().includes('oil') ||
        v.cargoType?.toLowerCase().includes('fuel') ||
        v.cargoType?.toLowerCase().includes('diesel') ||
        v.cargoType?.toLowerCase().includes('gas') ||
        v.cargoType?.toLowerCase().includes('petrol')
      );
    }
    
    // Use only authentic vessels - no artificial duplication
    
    // Ensure all vessels have the required fields
    return filteredVessels.map(v => ({
      ...v,
      id: v.id || Math.floor(Math.random() * 1000000),
      name: v.name || 'Unknown Vessel',
      imo: v.imo || 'N/A',
      mmsi: v.mmsi || 'N/A',
      vesselType: v.vesselType || 'Unknown',
      flag: v.flag || 'Unknown',
      currentLat: parseFloat(v.currentLat.toString()),
      currentLng: parseFloat(v.currentLng.toString()),
      currentSpeed: v.currentSpeed || 0,
      course: v.course || 0,
      status: v.status || 'active',
      destination: v.destination || null,
      departureTime: v.departureTime || null,
      cargoType: v.cargoType || null,
      cargoAmount: v.cargoAmount || null,
      progress: v.progress || 0
    }));
  }
  
  /**
   * Notify all handlers for a specific event
   */
  private notifyHandlers(event: VesselClientEventType, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in handler for event ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Notify status change
   */
  private notifyStatusChange(): void {
    this.notifyHandlers('status', { status: this.status });
  }
  
  /**
   * Get the current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }
  
  /**
   * Get the last received vessels
   */
  getVessels(): Vessel[] {
    return this.lastVessels;
  }
  
  /**
   * Manually refresh data
   */
  refresh(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'refresh' }));
    } else {
      this.fetchVesselsViaREST();
    }
  }
}

// Create and export a singleton instance
export const vesselClient = new VesselWebSocketClient({
  vesselType: 'oil'
});