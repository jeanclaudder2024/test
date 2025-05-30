import { Card, CardContent } from "@/components/ui/card";
import { ProgressEvent } from "@/types";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface ProgressTimelineProps {
  events: ProgressEvent[];
  isLoading?: boolean;
}

export default function ProgressTimeline({ events, isLoading = false }: ProgressTimelineProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden h-full">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-heading font-medium text-gray-800">Progress</h3>
        </div>
        <CardContent className="p-4">
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                </div>
                <div className="ml-4 w-full">
                  <div className="h-5 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (events.length === 0) {
    return (
      <Card className="overflow-hidden h-full">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-heading font-medium text-gray-800">Progress</h3>
        </div>
        <CardContent className="p-4">
          <div className="text-center text-gray-500 py-8">
            No progress events available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden h-full">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-heading font-medium text-gray-800">Progress</h3>
      </div>
      <CardContent className="p-4">
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="h-3 w-3 bg-secondary rounded-full"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(new Date(event.date))}
                </p>
                <p className="text-sm text-gray-600">{event.event}</p>
                {event.location && (
                  <p className="text-xs text-gray-500">{event.location}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <Button variant="link" className="mt-4 text-primary text-sm p-0 h-auto">
          View Full Journey History
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
