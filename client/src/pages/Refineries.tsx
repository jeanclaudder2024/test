import { useState } from 'react';
import { useDataStream } from '@/hooks/useDataStream';
import { Refinery } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Factory, Search, Plus } from 'lucide-react';

export default function Refineries() {
  const { refineries, loading } = useDataStream();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter refineries based on search term
  const filteredRefineries = refineries.filter(refinery => 
    refinery.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    refinery.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    refinery.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let variant = "default";
    
    switch(status.toLowerCase()) {
      case 'operational':
        variant = "success";
        break;
      case 'maintenance':
        variant = "warning";
        break;
      case 'offline':
        variant = "destructive";
        break;
      default:
        variant = "secondary";
    }
    
    return <Badge variant={variant as any}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Factory className="h-8 w-8 mr-2 text-primary" />
            Refineries
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading refineries...' : `${refineries.length} refineries in the system`}
          </p>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search refineries..."
              className="pl-8 w-full md:w-[260px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Refinery
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredRefineries.length === 0 ? (
        <div className="text-center py-12">
          <Factory className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No refineries found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? `No refineries matching "${searchTerm}"` : 'No refineries available in the system.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRefineries.map((refinery) => (
            <Card key={refinery.id} className="overflow-hidden">
              <div className="relative">
                {/* Background image based on refinery region */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-15 h-32"
                  style={{ 
                    backgroundImage: `url(${
                      refinery.region?.includes("Middle East") ? "https://images.unsplash.com/photo-1605023040084-89c87644e368?w=600&auto=format" : 
                      refinery.region?.includes("Asia") ? "https://images.unsplash.com/photo-1500477967233-53333be64072?w=600&auto=format" : 
                      refinery.region?.includes("Europe") ? "https://images.unsplash.com/photo-1552128427-2e5de3b3d614?w=600&auto=format" : 
                      refinery.region?.includes("North America") ? "https://images.unsplash.com/photo-1532408840957-031d8034aeef?w=600&auto=format" : 
                      refinery.region?.includes("Africa") ? "https://images.unsplash.com/photo-1504439904031-93ded9f93e4e?w=600&auto=format" :
                      refinery.region?.includes("South America") ? "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&auto=format" :
                      "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=600&auto=format"
                    })`
                  }}
                />
                <CardHeader className="pb-2 relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {/* Icon based on region/country */}
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center mr-2 ${
                          refinery.status?.toLowerCase().includes('active') ? 'bg-green-100 text-green-600' :
                          refinery.status?.toLowerCase().includes('maintenance') ? 'bg-orange-100 text-orange-600' :
                          refinery.status?.toLowerCase().includes('planned') ? 'bg-blue-100 text-blue-600' :
                          refinery.status?.toLowerCase().includes('shutdown') ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <Factory className="h-4 w-4" />
                        </div>
                        {refinery.name}
                      </CardTitle>
                      <CardDescription>
                        {refinery.country}, {refinery.region}
                      </CardDescription>
                    </div>
                    {renderStatusBadge(refinery.status || 'Unknown')}
                  </div>
                </CardHeader>
              </div>
              <CardContent>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Capacity:</span>
                      <span className="font-medium">
                        {refinery.capacity ? `${refinery.capacity.toLocaleString()} barrels/day` : 'Unknown'}
                      </span>
                    </div>
                    {refinery.capacity && (
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            refinery.capacity > 500000 ? 'bg-primary' : 
                            refinery.capacity > 300000 ? 'bg-amber-500' : 
                            refinery.capacity > 100000 ? 'bg-orange-500' : 
                            'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, (refinery.capacity / 600000) * 100)}%` 
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span className="font-medium">
                      {refinery.lat}, {refinery.lng}
                    </span>
                  </div>
                  <div className="pt-4">
                    <Link href={`/refineries/${refinery.id}`}>
                      <Button 
                        variant="outline" 
                        className="w-full group hover:border-primary hover:bg-primary/5"
                      >
                        View Details 
                        <span className="ml-1 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0">→</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}