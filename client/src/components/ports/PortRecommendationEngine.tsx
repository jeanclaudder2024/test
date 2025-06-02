import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  MapPin, 
  Ship, 
  DollarSign, 
  Clock, 
  Fuel,
  Shield,
  TrendingUp,
  Star,
  AlertTriangle,
  CheckCircle,
  Route,
  Anchor,
  Building2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface VesselRequirements {
  vesselType: string;
  cargoType: string;
  cargoVolume: number;
  vesselLength: number;
  vesselBeam: number;
  vesselDraught: number;
  departurePort?: string;
  preferredRegions: string[];
  timeline: string;
  specialRequirements: string[];
}

interface PortRecommendation {
  port: {
    id: number;
    name: string;
    country: string;
    region: string;
    lat: string;
    lng: string;
    type: string;
    status: string;
    capacity: number;
  };
  suitabilityScore: number;
  matchReasons: string[];
  advantages: string[];
  considerations: string[];
  estimatedCosts: {
    portCharges: number;
    pilotage: number;
    tugboat: number;
    berthage: number;
    total: number;
  };
  logistics: {
    distanceFromDeparture: number;
    estimatedTransitTime: string;
    fuelConsumption: number;
    weatherRisk: string;
  };
  availability: {
    berthAvailability: string;
    waitingTime: string;
    nextAvailableSlot: string;
  };
  services: string[];
  certifications: string[];
}

function RecommendationCard({ recommendation }: { recommendation: PortRecommendation }) {
  const getSuitabilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getSuitabilityLabel = (score: number) => {
    if (score >= 90) return 'Excellent Match';
    if (score >= 75) return 'Good Match';
    if (score >= 60) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{recommendation.port.name}</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {recommendation.port.country}, {recommendation.port.region}
            </p>
          </div>
          <div className="text-right">
            <Badge className={getSuitabilityColor(recommendation.suitabilityScore)}>
              {recommendation.suitabilityScore}% {getSuitabilityLabel(recommendation.suitabilityScore)}
            </Badge>
            <div className="flex items-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(recommendation.suitabilityScore / 20)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Match Reasons */}
        <div>
          <h5 className="text-sm font-medium mb-2">Why This Port Matches:</h5>
          <div className="space-y-1">
            {recommendation.matchReasons.map((reason, index) => (
              <div key={index} className="flex items-center text-sm">
                <CheckCircle className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                {reason}
              </div>
            ))}
          </div>
        </div>

        {/* Key Advantages */}
        <div>
          <h5 className="text-sm font-medium mb-2">Key Advantages:</h5>
          <div className="flex flex-wrap gap-1">
            {recommendation.advantages.map((advantage, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-green-50">
                {advantage}
              </Badge>
            ))}
          </div>
        </div>

        {/* Logistics Overview */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Distance:</span>
              <span className="font-medium">{recommendation.logistics.distanceFromDeparture} nm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transit Time:</span>
              <span className="font-medium">{recommendation.logistics.estimatedTransitTime}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Cost:</span>
              <span className="font-medium">${recommendation.estimatedCosts.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Availability:</span>
              <span className="font-medium">{recommendation.availability.berthAvailability}</span>
            </div>
          </div>
        </div>

        {/* Considerations */}
        {recommendation.considerations.length > 0 && (
          <div>
            <h5 className="text-sm font-medium mb-2 flex items-center">
              <AlertTriangle className="h-3 w-3 text-orange-600 mr-1" />
              Considerations:
            </h5>
            <div className="space-y-1">
              {recommendation.considerations.map((consideration, index) => (
                <div key={index} className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
                  {consideration}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services Available */}
        <div>
          <h5 className="text-sm font-medium mb-2">Available Services:</h5>
          <div className="flex flex-wrap gap-1">
            {recommendation.services.map((service, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {service}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button size="sm" className="flex-1">
            <Route className="h-3 w-3 mr-1" />
            Plan Route
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Building2 className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PortRecommendationEngine() {
  const [requirements, setRequirements] = useState<VesselRequirements>({
    vesselType: '',
    cargoType: '',
    cargoVolume: 0,
    vesselLength: 0,
    vesselBeam: 0,
    vesselDraught: 0,
    departurePort: '',
    preferredRegions: [],
    timeline: '',
    specialRequirements: []
  });

  const [showRecommendations, setShowRecommendations] = useState(false);

  const recommendationMutation = useMutation({
    mutationFn: async (reqs: VesselRequirements) => {
      return apiRequest('/api/ports/recommendations', {
        method: 'POST',
        body: JSON.stringify(reqs)
      });
    },
    onSuccess: () => {
      setShowRecommendations(true);
    }
  });

  const handleGetRecommendations = () => {
    recommendationMutation.mutate(requirements);
  };

  const updateRequirement = (key: keyof VesselRequirements, value: any) => {
    setRequirements(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
            AI Port Recommendation Engine
          </CardTitle>
          <CardDescription>
            Get intelligent port recommendations based on your vessel requirements, cargo type, and operational preferences
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Vessel Information */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <Ship className="h-4 w-4 mr-2" />
              Vessel Information
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Vessel Type</Label>
                <Select value={requirements.vesselType} onValueChange={(value) => updateRequirement('vesselType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vessel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oil-tanker">Oil Tanker</SelectItem>
                    <SelectItem value="container">Container Ship</SelectItem>
                    <SelectItem value="bulk-carrier">Bulk Carrier</SelectItem>
                    <SelectItem value="lng-carrier">LNG Carrier</SelectItem>
                    <SelectItem value="general-cargo">General Cargo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cargo Type</Label>
                <Select value={requirements.cargoType} onValueChange={(value) => updateRequirement('cargoType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cargo type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="crude-oil">Crude Oil</SelectItem>
                    <SelectItem value="refined-petroleum">Refined Petroleum</SelectItem>
                    <SelectItem value="lng">LNG</SelectItem>
                    <SelectItem value="lpg">LPG</SelectItem>
                    <SelectItem value="chemicals">Chemicals</SelectItem>
                    <SelectItem value="containers">Containers</SelectItem>
                    <SelectItem value="dry-bulk">Dry Bulk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Vessel Length (m)</Label>
                <Input
                  type="number"
                  placeholder="300"
                  value={requirements.vesselLength || ''}
                  onChange={(e) => updateRequirement('vesselLength', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Vessel Beam (m)</Label>
                <Input
                  type="number"
                  placeholder="45"
                  value={requirements.vesselBeam || ''}
                  onChange={(e) => updateRequirement('vesselBeam', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Vessel Draught (m)</Label>
                <Input
                  type="number"
                  placeholder="15.5"
                  value={requirements.vesselDraught || ''}
                  onChange={(e) => updateRequirement('vesselDraught', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div>
              <Label>Cargo Volume (tonnes)</Label>
              <Input
                type="number"
                placeholder="75000"
                value={requirements.cargoVolume || ''}
                onChange={(e) => updateRequirement('cargoVolume', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Operational Requirements */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Operational Requirements
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Departure Port (Optional)</Label>
                <Input
                  placeholder="Port of origin"
                  value={requirements.departurePort}
                  onChange={(e) => updateRequirement('departurePort', e.target.value)}
                />
              </div>
              <div>
                <Label>Timeline</Label>
                <Select value={requirements.timeline} onValueChange={(value) => updateRequirement('timeline', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent (within 24 hours)</SelectItem>
                    <SelectItem value="immediate">Immediate (within 3 days)</SelectItem>
                    <SelectItem value="flexible">Flexible (within 1 week)</SelectItem>
                    <SelectItem value="planned">Planned (more than 1 week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Special Requirements</Label>
              <Textarea
                placeholder="Any special requirements, certifications needed, or operational constraints..."
                value={requirements.specialRequirements.join('\n')}
                onChange={(e) => updateRequirement('specialRequirements', e.target.value.split('\n').filter(Boolean))}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <Button 
            onClick={handleGetRecommendations}
            disabled={recommendationMutation.isPending || !requirements.vesselType || !requirements.cargoType}
            size="lg"
            className="w-full"
          >
            {recommendationMutation.isPending ? 'Analyzing Ports...' : 'Get AI Recommendations'}
            <Lightbulb className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Recommendations Results */}
      {showRecommendations && recommendationMutation.data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recommended Ports</h3>
            <Badge variant="outline">
              {recommendationMutation.data.length} ports found
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendationMutation.data.map((recommendation: PortRecommendation, index: number) => (
              <RecommendationCard key={index} recommendation={recommendation} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}