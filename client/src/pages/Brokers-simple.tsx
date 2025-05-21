import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Plus, 
  Star,
  ArrowRight,
  FileText,
  Building2
} from 'lucide-react';

// Local Broker type
type Broker = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone?: string;
  country?: string;
  active: boolean;
  eliteMember?: boolean;
};

export default function Brokers() {
  const [searchTerm, setSearchTerm] = useState('');

  // Query to get brokers
  const { data: brokers = [], isLoading } = useQuery<Broker[]>({
    queryKey: ['/api/brokers'],
  });
  
  // Filter brokers based on search term
  const filteredBrokers = brokers.filter(broker => 
    broker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broker.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (broker.country && broker.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Users className="h-8 w-8 mr-2 text-primary" />
              Oil Broker Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage brokers and connect with oil shipping companies
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Broker Directory</h2>
            <p className="text-muted-foreground">
              {isLoading ? 'Loading brokers...' : `${brokers.length} brokers in the system`}
            </p>
          </div>
          
          <div className="flex gap-4 mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search brokers..."
                className="pl-8 w-full md:w-[260px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Broker
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredBrokers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No brokers found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? `No brokers matching "${searchTerm}"` : 'No brokers available in the system.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBrokers.map((broker) => (
              <Card key={broker.id} className="overflow-hidden border">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {broker.name}
                        {broker.eliteMember && (
                          <Badge className="ml-2 bg-amber-500 text-white">
                            <Star className="h-3 w-3 mr-1" /> Elite
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {broker.company}
                      </CardDescription>
                    </div>
                    <Badge variant={broker.active ? "default" : "secondary"} className={broker.active ? "bg-green-500" : ""}>
                      {broker.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {broker.email && (
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{broker.email}</span>
                      </div>
                    )}
                    {broker.phone && (
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{broker.phone}</span>
                      </div>
                    )}
                    {broker.country && (
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{broker.country}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => window.location.href = '/broker-dashboard'}
                  >
                    Access Broker Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        <div className="flex justify-center mt-8">
          <Button 
            size="lg"
            onClick={() => window.location.href = '/broker-dashboard'}
          >
            Go to Advanced Broker Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}