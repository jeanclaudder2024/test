import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Broker } from '@/types';
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { Users, Search, Plus, MoreHorizontal, Mail, Phone, Edit, Trash2 } from 'lucide-react';

export default function Brokers() {
  const { data: brokers = [], isLoading } = useQuery<Broker[]>({
    queryKey: ['/api/brokers'],
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  // Filter brokers based on search term
  const filteredBrokers = brokers.filter(broker => 
    broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broker.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (broker.country && broker.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Function to handle broker deletion
  const handleDelete = (brokerId: number) => {
    toast({
      title: "Not Implemented",
      description: "Broker deletion functionality is not yet implemented.",
      variant: "default"
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="h-8 w-8 mr-2 text-primary" />
            Brokers
          </h1>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading brokers...' : `${brokers.length} brokers in the system`}
          </p>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0">
          <div className="relative">
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
            <Card key={broker.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{broker.name}</CardTitle>
                    <CardDescription>
                      {broker.company}
                    </CardDescription>
                  </div>
                  <Badge variant={broker.active ? "success" : "secondary"}>
                    {broker.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`mailto:${broker.email}`} className="text-primary hover:underline">
                      {broker.email}
                    </a>
                  </div>
                  
                  {broker.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a href={`tel:${broker.phone}`} className="hover:underline">
                        {broker.phone}
                      </a>
                    </div>
                  )}
                  
                  <div className="text-sm pt-1">
                    <span className="text-muted-foreground">Country: </span>
                    <span>{broker.country || 'Not specified'}</span>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        <DropdownMenuItem>Assign Vessel</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(broker.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Broker
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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