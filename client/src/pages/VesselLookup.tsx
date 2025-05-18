import { VesselDetailsLookup } from "@/components/vessel/VesselDetailsLookup";

export default function VesselLookup() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vessel Lookup</h1>
        <p className="text-muted-foreground">
          Lookup detailed real-time information about any vessel using its MMSI number via the MyShipTracking API v2.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <VesselDetailsLookup />
        </div>
        
        <div className="space-y-6">
          <div className="p-6 bg-primary/5 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">About This Tool</h2>
            <div className="space-y-4 text-sm">
              <p>
                This tool allows you to fetch extended real-time vessel information 
                from the MyShipTracking API v2.
              </p>
              
              <div>
                <h3 className="font-semibold mb-1">What You Need:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>A MyShipTracking API key</li>
                  <li>The 9-digit MMSI number of the vessel you want to look up</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-1">Information Provided:</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Vessel name</li>
                  <li>Current position (latitude and longitude)</li>
                  <li>Speed and course</li>
                  <li>Navigation status</li>
                  <li>Vessel type</li>
                  <li>Last update timestamp</li>
                </ul>
              </div>
              
              <div className="text-xs text-muted-foreground p-2 bg-background/80 rounded border">
                <strong>Note:</strong> Each extended lookup uses 3 credits from your API quota.
                Only terrestrial AIS data is returned.
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-muted/30 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">How To Use</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Enter your MyShipTracking API key in the field provided</li>
              <li>Input a valid 9-digit MMSI number for the vessel you want to track</li>
              <li>Click the "Lookup" button to fetch vessel details</li>
              <li>View the vessel's current information in the results card</li>
            </ol>
            
            <div className="mt-4 text-xs">
              <p>
                <strong>Common MMSI Examples:</strong><br />
                - 366843000: Example US commercial vessel<br />
                - 538007471: Example Marshall Islands vessel<br />
                - 235095435: Example UK vessel<br />
                <em>(Note: These are example MMSIs and may not be active)</em>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}