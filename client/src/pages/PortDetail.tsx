import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PortDetailView from '@/components/admin/PortDetailView';

export default function PortDetail() {
  const [match, params] = useRoute('/ports/:id');
  const [port, setPort] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch port data
  useEffect(() => {
    const fetchPort = async () => {
      if (!params?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/ports/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Port data received:', data);
        
        if (!data) {
          throw new Error('No port data received');
        }
        
        setPort(data);
      } catch (error) {
        console.error('Error fetching port:', error);
        toast({
          title: "Error",
          description: "Failed to load port details. Please try again.",
          variant: "destructive",
        });
        setPort(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPort();
  }, [params?.id, toast]);

  return (
    <div className="min-h-screen">
      <div className="p-4">
        <Link href="/ports">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Ports
          </Button>
        </Link>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : port ? (
          <PortDetailView port={port} />
        ) : (
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold mb-2">Port Not Found</h2>
            <p className="text-muted-foreground">
              The requested port could not be found. It may have been removed or the ID is incorrect.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}