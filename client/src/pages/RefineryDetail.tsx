import { useQuery } from '@tanstack/react-query';
import { Link, useRoute } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RefineryDetailView from '@/components/admin/RefineryDetailView';
import type { Refinery } from '@shared/schema';

export default function RefineryDetail() {
  const [, params] = useRoute('/refineries/:id');
  const refineryId = params?.id ? parseInt(params.id) : null;
  
  // Direct query for refineries - no hooks chaining to prevent loops
  const { data: refineries = [], isLoading, error } = useQuery<Refinery[]>({
    queryKey: ['/api/refineries'],
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
  });

  // Find the specific refinery
  const refinery = refineries.find(r => r.id === refineryId);

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Link href="/refineries">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Refineries
          </Button>
        </Link>
        <div className="py-12">
          <h3 className="mt-4 text-lg font-medium text-red-600">Error Loading Refinery</h3>
          <p className="text-muted-foreground">Failed to load refinery data</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Link href="/refineries">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Refineries
          </Button>
        </Link>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!refinery) {
    return (
      <div className="container mx-auto p-4 text-center">
        <Link href="/refineries">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Refineries
          </Button>
        </Link>
        <div className="py-12">
          <h3 className="mt-4 text-lg font-medium">Refinery not found</h3>
          <p className="text-muted-foreground">The refinery you're looking for could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Back button overlay */}
      <div className="fixed top-4 left-4 z-50">
        <Link href="/refineries">
          <Button variant="ghost" className="bg-white/90 backdrop-blur-sm shadow-md hover:bg-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Refineries
          </Button>
        </Link>
      </div>
      
      {/* Refinery Detail View */}
      <RefineryDetailView 
        refinery={{
          id: refinery.id,
          name: refinery.name || 'Unknown Refinery',
          country: refinery.country || 'Unknown',
          region: refinery.region || 'Unknown',
          capacity: refinery.capacity,
          status: refinery.status || 'Unknown',
          latitude: refinery.lat || '0',
          longitude: refinery.lng || '0',
          lastUpdated: refinery.last_updated || new Date(),
          city: refinery.city || null,
          type: refinery.type || null,
          description: refinery.description || null,
          operator: refinery.operator || null,
          owner: refinery.owner || null,
          products: refinery.products || null,
          year_built: refinery.year_built || null,
          email: refinery.email || null,
          phone: refinery.phone || null,
          website: refinery.website || null,
          address: refinery.address || null,
          technical_specs: refinery.technical_specs || null,
          utilization: refinery.utilization || null,
          complexity: refinery.complexity || null
        }}
      />
    </div>
  );
}