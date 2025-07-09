import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Globe, 
  Fuel, 
  Ship, 
  MapPin, 
  Calendar,
  Star,
  Eye,
  CheckCircle,
  Clock,
  Search,
  Filter
} from "lucide-react";

interface Deal {
  id: number;
  dealCode: string;
  oilType: string;
  commoditySpec?: string;
  originCountry: string;
  destinationPorts: string;
  quantityBarrels: number;
  quantityMts: number;
  dealValueUsd: number;
  pricePerBarrel: number;
  marketPrice: number;
  contractType: string;
  deliveryTerms: string;
  sourceCompany: string;
  targetRefinery?: string;
  dealStatus: string;
  isVerified: boolean;
  customerRating?: number;
  totalReviews: number;
  dealDate: string;
  vesselId?: number;
}

export default function Deals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const { data: deals = [], isLoading } = useQuery<Deal[]>({
    queryKey: ['/api/deals'],
    staleTime: 0,
  });

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.dealCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.oilType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.sourceCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deal.dealStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">🔵 Open</Badge>;
      case 'reserved':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">🔒 Reserved</Badge>;
      case 'closed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">✅ Closed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">❌ Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">⚪ Unknown</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return `$${price?.toFixed(2) || '0.00'}`;
  };

  const formatQuantity = (barrels: number, mts: number) => {
    return `${barrels?.toLocaleString() || '0'} barrels / ${mts?.toLocaleString() || '0'} MTs`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Oil Trading Deals</h1>
          <p className="text-gray-600 dark:text-gray-300">Comprehensive cargo trading information</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <BarChart3 className="w-4 h-4 mr-2" />
            {filteredDeals.length} Active Deals
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by deal code, oil type, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open Deals</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => (
          <Card key={deal.id} className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {deal.dealCode}
                </CardTitle>
                {getStatusBadge(deal.dealStatus)}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(deal.dealDate).toLocaleDateString()}
                {deal.isVerified && (
                  <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Oil Type & Commodity */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 rounded-lg">
                <div className="flex items-center mb-2">
                  <Fuel className="w-4 h-4 mr-2 text-amber-600" />
                  <span className="font-medium text-sm">Oil Type / Commodity</span>
                </div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200">{deal.oilType}</p>
                {deal.commoditySpec && (
                  <p className="text-xs text-amber-600 dark:text-amber-300">{deal.commoditySpec}</p>
                )}
              </div>

              {/* Geographic Information */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center mb-1">
                    <Globe className="w-3 h-3 mr-1 text-green-600" />
                    <span className="text-xs text-gray-500">Origin</span>
                  </div>
                  <p className="text-sm font-medium">{deal.originCountry}</p>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <MapPin className="w-3 h-3 mr-1 text-blue-600" />
                    <span className="text-xs text-gray-500">Destinations</span>
                  </div>
                  <p className="text-sm font-medium truncate">{deal.destinationPorts}</p>
                </div>
              </div>

              {/* Quantity & Pricing */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg">
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500">Quantity</span>
                    <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
                      {formatQuantity(deal.quantityBarrels, deal.quantityMts)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Deal Value</span>
                      <p className="font-bold text-green-600">
                        ${deal.dealValueUsd?.toLocaleString() || '0'} USD
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Price/Barrel</span>
                      <p className="font-bold">{formatPrice(deal.pricePerBarrel)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Information */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Contract Type:</span>
                  <span className="font-medium">{deal.contractType}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Delivery Terms:</span>
                  <span className="font-medium">{deal.deliveryTerms}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Source Company:</span>
                  <span className="font-medium truncate">{deal.sourceCompany}</span>
                </div>
              </div>

              {/* Customer Rating */}
              {deal.customerRating && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Customer Rating:</span>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-500 fill-current mr-1" />
                    <span className="font-medium">{deal.customerRating}/5</span>
                    <span className="text-gray-400 ml-1">({deal.totalReviews} reviews)</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => setSelectedDeal(deal)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Deal Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <Fuel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No deals found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Deal Detail Modal would go here */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{selectedDeal.dealCode}</h2>
                <Button variant="ghost" onClick={() => setSelectedDeal(null)}>✕</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Comprehensive deal details would go here */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Oil Type & Commodity Information</h3>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <p><strong>Oil Type:</strong> {selectedDeal.oilType}</p>
                    {selectedDeal.commoditySpec && (
                      <p><strong>Specification:</strong> {selectedDeal.commoditySpec}</p>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg">Geographic Information</h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p><strong>Origin:</strong> {selectedDeal.originCountry}</p>
                    <p><strong>Destination Ports:</strong> {selectedDeal.destinationPorts}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Quantity & Pricing</h3>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p><strong>Quantity:</strong> {formatQuantity(selectedDeal.quantityBarrels, selectedDeal.quantityMts)}</p>
                    <p><strong>Deal Value:</strong> ${selectedDeal.dealValueUsd?.toLocaleString()} USD</p>
                    <p><strong>Price per Barrel:</strong> {formatPrice(selectedDeal.pricePerBarrel)}</p>
                    <p><strong>Market Price:</strong> {formatPrice(selectedDeal.marketPrice)}</p>
                  </div>
                  
                  <h3 className="font-bold text-lg">Contract Information</h3>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p><strong>Contract Type:</strong> {selectedDeal.contractType}</p>
                    <p><strong>Delivery Terms:</strong> {selectedDeal.deliveryTerms}</p>
                    <p><strong>Source Company:</strong> {selectedDeal.sourceCompany}</p>
                    {selectedDeal.targetRefinery && (
                      <p><strong>Target Refinery:</strong> {selectedDeal.targetRefinery}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}