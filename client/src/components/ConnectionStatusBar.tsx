import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface ConnectionStatusBarProps {
  error: string | null;
  isConnected: boolean;
  lastUpdated: Date | null;
  onReconnect: () => void;
}

/**
 * A component that displays the current connection status and allows users to manually reconnect
 */
export default function ConnectionStatusBar({ 
  error, 
  isConnected, 
  lastUpdated, 
  onReconnect 
}: ConnectionStatusBarProps) {
  // Only show the component if there's an error or if it's been more than 30 seconds since the last update
  const showAlert = error || (lastUpdated && (Date.now() - lastUpdated.getTime() > 30000));
  
  if (!showAlert) return null;
  
  const getConnectionMessage = () => {
    if (error) {
      return "Connection error: Data stream is currently unavailable";
    }
    
    if (lastUpdated && (Date.now() - lastUpdated.getTime() > 60000)) {
      return "Data stream is stale. Last update was more than 1 minute ago";
    }
    
    if (lastUpdated && (Date.now() - lastUpdated.getTime() > 30000)) {
      return "Data stream may be experiencing delays";
    }
    
    return "";
  };
  
  return (
    <Alert variant={error ? "destructive" : "default"} className="mb-4 mx-4 md:mx-6 border-amber-300 bg-amber-50">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          {error ? (
            <WifiOff className="h-4 w-4 mr-2" />
          ) : (
            <AlertTriangle className="h-4 w-4 mr-2" />
          )}
          <AlertDescription>
            {getConnectionMessage()}
            {lastUpdated && (
              <span className="text-xs ml-2">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </AlertDescription>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onReconnect}
          className="ml-2 flex items-center"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Reconnect
        </Button>
      </div>
    </Alert>
  );
}