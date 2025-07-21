import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Ship, Search, Filter, Download, Upload, MapPin, Calendar, Anchor, Zap, Sparkles, RefreshCw, CalendarIcon } from "lucide-react";
import MapSelector from "@/components/MapSelector";

interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built: number | null;
  deadweight: number | null;
  currentLat: string | null;
  currentLng: string | null;
  departurePort: string | null;
  departureDate: string | null;
  departureLat: string | null;
  departureLng: string | null;
  destinationPort: string | null;
  destinationLat: string | null;
  destinationLng: string | null;
  eta: string | null;
  cargoType: string | null;
  cargoCapacity: number | null;
  currentRegion: string | null;
  status: string | null;
  speed: string | null;
  buyerName: string | null;
  sellerName: string | null;
  ownerName: string | null;
  operatorName: string | null;
  oilSource: string | null;
  metadata: string | null;
  lastUpdated: string | null;
}

interface Port {
  id: number;
  name: string;
  country: string;
  region: string;
  type: string;
}

interface VesselFormData {
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built: string;
  deadweight: string;
  currentLat: string;
  currentLng: string;
  departurePort: string;
  departureDate: string;
  departureLat: string;
  departureLng: string;
  destinationPort: string;
  destinationLat: string;
  destinationLng: string;
  eta: string;
  cargoType: string;
  cargoCapacity: string;
  currentRegion: string;
  status: string;
  speed: string;
  buyerName: string;
  sellerName: string;
  ownerName: string;
  operatorName: string;
  oilSource: string;
  
  // Deal Information
  oilType: string;
  quantity: string;
  dealValue: string;
  loadingPort: string;
  price: string;
  marketPrice: string;
  sourceCompany: string;
  targetRefinery: string;
  shippingType: string;
  routeDistance: string;
  
  // Technical Specifications
  callsign: string;
  course: string;
  navStatus: string;
  draught: string;
  length: string;
  width: string;
  enginePower: string;
  fuelConsumption: string;
  crewSize: string;
  grossTonnage: string;
}

const vesselTypes = [
  "Oil Tanker",
  "Chemical Tanker", 
  "LNG Carrier",
  "LPG Carrier",
  "Product Tanker",
  "Crude Oil Tanker",
  "Bulk Carrier",
  "Container Ship",
  "General Cargo"
];

const vesselStatuses = [
  "underway",
  "at anchor",
  "moored",
  "at port",
  "near refinery",
  "loading",
  "discharging",
  "idle",
  "not under command",
  "restricted manoeuvrability"
];

const regions = [
  "north-atlantic",
  "south-atlantic", 
  "north-pacific",
  "south-pacific",
  "indian-ocean",
  "mediterranean",
  "baltic-sea",
  "north-sea",
  "persian-gulf",
  "red-sea",
  "caribbean",
  "asia-pacific",
  "black-sea",
  "south-china-sea"
];

const cargoTypes = [
  "Crude Oil",
  "Gasoline",
  "Diesel",
  "Fuel Oil",
  "Kerosene",
  "Naphtha",
  "LNG",
  "LPG",
  "Chemicals",
  "Refined Products"
];

const defaultFormData: VesselFormData = {
  name: "",
  imo: "",
  mmsi: "",
  vesselType: "",
  flag: "",
  built: "",
  deadweight: "",
  currentLat: "",
  currentLng: "",
  departurePort: "",
  departureDate: "",
  departureLat: "",
  departureLng: "",
  destinationPort: "",
  destinationLat: "",
  destinationLng: "",
  eta: "",
  cargoType: "",
  cargoCapacity: "",
  currentRegion: "",
  status: "underway",
  speed: "",
  buyerName: "",
  sellerName: "",
  ownerName: "",
  operatorName: "",
  oilSource: "",
  
  // Deal Information
  oilType: "",
  quantity: "",
  dealValue: "",
  loadingPort: "",
  price: "",
  marketPrice: "",
  sourceCompany: "",
  targetRefinery: "",
  shippingType: "",
  routeDistance: "",
  
  // Technical Specifications
  callsign: "",
  course: "",
  navStatus: "",
  draught: "",
  length: "",
  width: "",
  enginePower: "",
  fuelConsumption: "",
  crewSize: "",
  grossTonnage: ""
};

export default function VesselManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);
  const [formData, setFormData] = useState<VesselFormData>(defaultFormData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showMapSelector, setShowMapSelector] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch vessels
  const { data: vessels, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/vessels"],
    staleTime: 0, // Always fetch fresh data
    refetchInterval: 0, // Disable automatic refetch
    queryFn: async () => {
      const response = await fetch("/api/admin/vessels", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch vessels");
      return response.json();
    }
  });

  // Fetch refineries for connection options
  const { data: refineries } = useQuery({
    queryKey: ["/api/admin/refineries"],
    staleTime: 0,
    queryFn: async () => {
      const response = await fetch("/api/admin/refineries", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch refineries");
      return response.json();
    }
  });

  // Fetch ports for departure and destination options
  const { data: ports } = useQuery({
    queryKey: ["/api/admin/ports"],
    staleTime: 0,
    queryFn: async () => {
      const response = await fetch("/api/admin/ports");
      if (!response.ok) throw new Error("Failed to fetch ports");
      return response.json();
    }
  });

  // Fetch oil types for dynamic vessel type filtering
  const { data: oilTypes } = useQuery({
    queryKey: ["/api/admin/oil-types"],
    staleTime: 0,
    queryFn: async () => {
      const response = await fetch("/api/admin/oil-types", {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch oil types");
      return response.json();
    }
  });

  // Create vessel mutation
  const createVesselMutation = useMutation({
    mutationFn: async (vesselData: VesselFormData) => {
      // Log the form data to debug validation issues
      console.log("Form data being submitted:", vesselData);
      
      // Validate required fields on client side
      const requiredFields: (keyof VesselFormData)[] = ['name', 'imo', 'mmsi', 'vesselType', 'flag'];
      const missingFields = requiredFields.filter(field => !vesselData[field] || vesselData[field].trim() === '');
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }
      
      const processedData: any = {
        name: vesselData.name?.trim() || "",
        imo: vesselData.imo?.trim() || "",
        mmsi: vesselData.mmsi?.trim() || "",
        vesselType: vesselData.vesselType || "",
        flag: vesselData.flag?.trim() || "",
        built: vesselData.built ? (isNaN(parseInt(vesselData.built)) ? null : parseInt(vesselData.built)) : null,
        deadweight: vesselData.deadweight ? (isNaN(parseInt(vesselData.deadweight)) ? null : parseInt(vesselData.deadweight)) : null,
        currentLat: vesselData.currentLat || null,
        currentLng: vesselData.currentLng || null,
        departurePort: vesselData.departurePort ? parseInt(vesselData.departurePort) : null,
        departureDate: vesselData.departureDate ? new Date(vesselData.departureDate).toISOString() : null,
        departureLat: vesselData.departureLat || null,
        departureLng: vesselData.departureLng || null,
        destinationPort: vesselData.destinationPort ? parseInt(vesselData.destinationPort) : null,
        destinationLat: vesselData.destinationLat || null,
        destinationLng: vesselData.destinationLng || null,
        eta: vesselData.eta ? new Date(vesselData.eta).toISOString() : null,
        cargoType: vesselData.cargoType?.trim() || null,
        cargoCapacity: vesselData.cargoCapacity ? (isNaN(parseInt(vesselData.cargoCapacity)) ? null : parseInt(vesselData.cargoCapacity)) : null,
        currentRegion: vesselData.currentRegion || null,
        status: vesselData.status || "underway",
        speed: vesselData.speed?.trim() || null,
        buyerName: vesselData.buyerName?.trim() || null,
        sellerName: vesselData.sellerName?.trim() || null,
        ownerName: vesselData.ownerName?.trim() || null,
        operatorName: vesselData.operatorName?.trim() || null,
        oilSource: vesselData.oilSource?.trim() || null,
        
        // Deal Information
        oilType: vesselData.oilType?.trim() || null,
        quantity: vesselData.quantity ? vesselData.quantity.toString() : null,
        dealValue: vesselData.dealValue ? vesselData.dealValue.toString() : null,
        loadingPort: vesselData.loadingPort?.trim() || null,
        price: vesselData.price ? vesselData.price.toString() : null,
        marketPrice: vesselData.marketPrice ? vesselData.marketPrice.toString() : null,
        sourceCompany: vesselData.sourceCompany?.trim() || null,
        targetRefinery: vesselData.targetRefinery?.trim() || null,
        shippingType: vesselData.shippingType?.trim() || null,
        routeDistance: vesselData.routeDistance ? vesselData.routeDistance.toString() : null,
        
        // Technical Specifications
        callsign: vesselData.callsign?.trim() || null,
        course: vesselData.course ? (isNaN(parseInt(vesselData.course)) ? null : parseInt(vesselData.course)) : null,
        navStatus: vesselData.navStatus?.trim() || null,
        draught: vesselData.draught ? vesselData.draught.toString() : null,
        length: vesselData.length ? vesselData.length.toString() : null,
        width: vesselData.width ? vesselData.width.toString() : null,
        enginePower: vesselData.enginePower ? (isNaN(parseInt(vesselData.enginePower)) ? null : parseInt(vesselData.enginePower)) : null,
        fuelConsumption: vesselData.fuelConsumption ? vesselData.fuelConsumption.toString() : null,
        crewSize: vesselData.crewSize ? (isNaN(parseInt(vesselData.crewSize)) ? null : parseInt(vesselData.crewSize)) : null,
        grossTonnage: vesselData.grossTonnage ? (isNaN(parseInt(vesselData.grossTonnage)) ? null : parseInt(vesselData.grossTonnage)) : null
      };

      // Remove undefined values to prevent database errors
      Object.keys(processedData).forEach(key => {
        if (processedData[key] === undefined) {
          delete processedData[key];
        }
      });

      const response = await fetch("/api/admin/vessels", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(processedData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create vessel");
      }
      return response.json();
    },
    onSuccess: () => {
      // Force immediate refresh of ALL vessel-related data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vessels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vessels/polling"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vessel-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      
      // Force refetch of all vessel endpoints
      queryClient.refetchQueries({ queryKey: ["/api/admin/vessels"] });
      queryClient.refetchQueries({ queryKey: ["/api/vessels/polling"] });
      queryClient.refetchQueries({ queryKey: ["/api/vessel-dashboard"] });
      queryClient.refetchQueries({ queryKey: ["/api/vessels"] });
      
      // Reset form and close dialog
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      setEditingVessel(null);
      
      toast({ 
        title: "Success", 
        description: "Vessel created successfully - refreshing all vessel data..." 
      });
      
      // Force a second refresh after a short delay to ensure data appears everywhere
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ["/api/admin/vessels"] });
        queryClient.refetchQueries({ queryKey: ["/api/vessels/polling"] });
        queryClient.refetchQueries({ queryKey: ["/api/vessel-dashboard"] });
        queryClient.refetchQueries({ queryKey: ["/api/vessels"] });
      }, 1000);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update vessel mutation
  const updateVesselMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: VesselFormData }) => {
      // Only include fields that exist in the database schema
      const processedData: any = {
        name: data.name?.trim() || "",
        imo: data.imo?.trim() || "",
        mmsi: data.mmsi?.trim() || "",
        vesselType: data.vesselType || "",
        flag: data.flag?.trim() || "",
        built: data.built ? (isNaN(parseInt(data.built)) ? null : parseInt(data.built)) : null,
        deadweight: data.deadweight ? (isNaN(parseInt(data.deadweight)) ? null : parseInt(data.deadweight)) : null,
        currentLat: data.currentLat || null,
        currentLng: data.currentLng || null,
        departurePort: data.departurePort ? parseInt(data.departurePort) : null,
        departureDate: data.departureDate ? new Date(data.departureDate).toISOString() : null,
        departureLat: data.departureLat || null,
        departureLng: data.departureLng || null,
        destinationPort: data.destinationPort ? parseInt(data.destinationPort) : null,
        destinationLat: data.destinationLat || null,
        destinationLng: data.destinationLng || null,
        eta: data.eta ? new Date(data.eta).toISOString() : null,
        cargoType: data.cargoType?.trim() || null,
        cargoCapacity: data.cargoCapacity ? (isNaN(parseInt(data.cargoCapacity)) ? null : parseInt(data.cargoCapacity)) : null,
        currentRegion: data.currentRegion || null,
        status: data.status || "underway",
        speed: data.speed?.trim() || null,
        buyerName: data.buyerName?.trim() || null,
        sellerName: data.sellerName?.trim() || null,
        ownerName: data.ownerName?.trim() || null,
        operatorName: data.operatorName?.trim() || null,
        oilSource: data.oilSource?.trim() || null,
        
        // Deal Information
        oilType: data.oilType?.trim() || null,
        quantity: data.quantity ? data.quantity.toString() : null,
        dealValue: data.dealValue ? data.dealValue.toString() : null,
        loadingPort: data.loadingPort?.trim() || null,
        price: data.price ? data.price.toString() : null,
        marketPrice: data.marketPrice ? data.marketPrice.toString() : null,
        sourceCompany: data.sourceCompany?.trim() || null,
        targetRefinery: data.targetRefinery?.trim() || null,
        shippingType: data.shippingType?.trim() || null,
        routeDistance: data.routeDistance ? data.routeDistance.toString() : null,
        
        // Technical Specifications
        callsign: data.callsign?.trim() || null,
        course: data.course ? (isNaN(parseInt(data.course)) ? null : parseInt(data.course)) : null,
        navStatus: data.navStatus?.trim() || null,
        draught: data.draught ? data.draught.toString() : null,
        length: data.length ? data.length.toString() : null,
        width: data.width ? data.width.toString() : null,
        enginePower: data.enginePower ? (isNaN(parseInt(data.enginePower)) ? null : parseInt(data.enginePower)) : null,
        fuelConsumption: data.fuelConsumption ? data.fuelConsumption.toString() : null,
        crewSize: data.crewSize ? (isNaN(parseInt(data.crewSize)) ? null : parseInt(data.crewSize)) : null,
        grossTonnage: data.grossTonnage ? (isNaN(parseInt(data.grossTonnage)) ? null : parseInt(data.grossTonnage)) : null
      };

      // Remove undefined values to prevent database errors
      Object.keys(processedData).forEach(key => {
        if (processedData[key] === undefined) {
          delete processedData[key];
        }
      });

      const response = await fetch(`/api/admin/vessels/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(processedData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update vessel");
      }
      return response.json();
    },
    onSuccess: () => {
      // Force refresh of ALL vessel-related data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vessels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vessels/polling"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vessel-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      
      queryClient.refetchQueries({ queryKey: ["/api/admin/vessels"] });
      queryClient.refetchQueries({ queryKey: ["/api/vessels/polling"] });
      queryClient.refetchQueries({ queryKey: ["/api/vessel-dashboard"] });
      queryClient.refetchQueries({ queryKey: ["/api/vessels"] });
      
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      setEditingVessel(null);
      toast({ title: "Success", description: "Vessel updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete vessel mutation
  const deleteVesselMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/vessels/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) throw new Error("Failed to delete vessel");
      return response.json();
    },
    onSuccess: () => {
      // Force refresh of ALL vessel-related data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vessels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vessels/polling"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vessel-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      
      queryClient.refetchQueries({ queryKey: ["/api/admin/vessels"] });
      queryClient.refetchQueries({ queryKey: ["/api/vessels/polling"] });
      queryClient.refetchQueries({ queryKey: ["/api/vessel-dashboard"] });
      queryClient.refetchQueries({ queryKey: ["/api/vessels"] });
      
      toast({ title: "Success", description: "Vessel deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Update vessel deals mutation
  const updateVesselDealsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/update-vessel-deals", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update vessel deals");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Force refresh of ALL vessel-related data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vessels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vessels/polling"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vessel-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vessels"] });
      
      queryClient.refetchQueries({ queryKey: ["/api/admin/vessels"] });
      queryClient.refetchQueries({ queryKey: ["/api/vessels/polling"] });
      queryClient.refetchQueries({ queryKey: ["/api/vessel-dashboard"] });
      queryClient.refetchQueries({ queryKey: ["/api/vessels"] });
      
      toast({ 
        title: "Deal Information Updated", 
        description: `Successfully updated ${data.updatedCount} vessels with complete deal information`
      });
    },
    onError: (error) => {
      toast({ 
        title: "Update Failed", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Generate AI vessel data mutation
  const generateAIDataMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/vessels/generate-ai", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate AI vessel data");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        name: data.name || "",
        imo: data.imo || "",
        mmsi: data.mmsi || "",
        vesselType: data.vesselType || "",
        flag: data.flag || "",
        built: data.built?.toString() || "",
        deadweight: data.deadweight?.toString() || "",
        currentLat: data.currentLat || "",
        currentLng: data.currentLng || "",
        cargoType: data.cargoType || "",
        cargoCapacity: data.cargoCapacity?.toString() || "",
        speed: data.speed || "",
        currentRegion: data.currentRegion || "",
        ownerName: data.ownerName || "",
        operatorName: data.operatorName || "",
        buyerName: data.buyerName || "",
        sellerName: data.sellerName || "",
        oilSource: data.oilSource || "",
        
        // Deal Information - populate with realistic AI generated data
        oilType: (() => {
          const oilTypes = ["Crude Oil", "Light Sweet Crude", "Heavy Crude", "Brent Crude", "WTI Crude", "Diesel", "Gasoline", "Jet Fuel"];
          return data.oilType || oilTypes[Math.floor(Math.random() * oilTypes.length)];
        })(),
        quantity: (() => {
          const baseQuantity = Math.floor(Math.random() * 1000000) + 500000; // 500K-1.5M barrels
          return data.quantity?.toString() || baseQuantity.toString();
        })(),
        dealValue: (() => {
          const pricePerBarrel = 65 + Math.random() * 20; // $65-85 per barrel
          const quantity = Math.floor(Math.random() * 1000000) + 500000;
          const totalValue = Math.floor(pricePerBarrel * quantity);
          return data.dealValue?.toString() || totalValue.toString();
        })(),
        loadingPort: (() => {
          const loadingPorts = ["Ras Tanura", "Kharg Island", "Basra Oil Terminal", "Kuwait Oil Pier", "Fujairah", "Rotterdam"];
          return data.loadingPort || loadingPorts[Math.floor(Math.random() * loadingPorts.length)];
        })(),
        price: (() => {
          const price = (65 + Math.random() * 20).toFixed(2); // $65-85 per barrel
          return data.price?.toString() || price;
        })(),
        marketPrice: (() => {
          const basePrice = 65 + Math.random() * 20;
          const marketPrice = (basePrice + Math.random() * 4 - 2).toFixed(2); // Slightly above/below spot price
          return data.marketPrice?.toString() || marketPrice;
        })(),
        sourceCompany: (() => {
          const sourceCompanies = ["Saudi Aramco", "National Iranian Oil Company", "Iraq Oil Ministry", "Kuwait Petroleum", "ADNOC", "Shell", "BP"];
          return data.sourceCompany || sourceCompanies[Math.floor(Math.random() * sourceCompanies.length)];
        })(),
        targetRefinery: (() => {
          if (refineries && refineries.length > 0) {
            const randomRefinery = refineries[Math.floor(Math.random() * refineries.length)];
            return randomRefinery.name;
          }
          return data.targetRefinery || "Rotterdam Refinery";
        })(),
        shippingType: (() => {
          const shippingTypes = ["FOB", "CIF", "CFR", "EXW", "DDP"];
          return data.shippingType || shippingTypes[Math.floor(Math.random() * shippingTypes.length)];
        })(),
        routeDistance: (() => {
          const distance = Math.floor(Math.random() * 12000) + 3000; // 3,000-15,000 nautical miles
          return data.routeDistance?.toString() || distance.toString();
        })(),
        
        // Generate departure and destination ports from available ports
        departurePort: (() => {
          if (ports && ports.length > 0) {
            const randomDepartureIndex = Math.floor(Math.random() * ports.length);
            return ports[randomDepartureIndex].name;
          }
          return data.departurePort || "Port of Houston";
        })(),
        destinationPort: (() => {
          if (ports && ports.length > 0) {
            const randomDestinationIndex = Math.floor(Math.random() * ports.length);
            return ports[randomDestinationIndex].name;
          }
          return data.destinationPort || "Port of Rotterdam";
        })(),
        
        // Generate realistic voyage dates
        departureDate: (() => {
          const departureDate = new Date();
          departureDate.setDate(departureDate.getDate() - Math.floor(Math.random() * 10 + 1)); // 1-10 days ago
          return departureDate.toISOString().split('T')[0];
        })(),
        eta: (() => {
          const etaDate = new Date();
          etaDate.setDate(etaDate.getDate() + Math.floor(Math.random() * 20 + 5)); // 5-25 days from now
          return etaDate.toISOString().split('T')[0];
        })(),
        
        // Generate departure and destination coordinates from port data
        departureLat: (() => {
          if (ports && ports.length > 0) {
            const randomPort = ports[Math.floor(Math.random() * ports.length)];
            return randomPort.lat;
          }
          return data.departureLat || "29.7604";
        })(),
        departureLng: (() => {
          if (ports && ports.length > 0) {
            const randomPort = ports[Math.floor(Math.random() * ports.length)];
            return randomPort.lng;
          }
          return data.departureLng || "-95.3698";
        })(),
        destinationLat: (() => {
          if (ports && ports.length > 0) {
            const randomPort = ports[Math.floor(Math.random() * ports.length)];
            return randomPort.lat;
          }
          return data.destinationLat || "51.9225";
        })(),
        destinationLng: (() => {
          if (ports && ports.length > 0) {
            const randomPort = ports[Math.floor(Math.random() * ports.length)];
            return randomPort.lng;
          }
          return data.destinationLng || "4.4792";
        })(),
        
        // Technical Specifications - populate with AI generated data
        callsign: data.callsign || "9V" + Math.random().toString(36).substr(2, 4).toUpperCase(),
        course: data.course?.toString() || Math.floor(Math.random() * 360).toString(),
        navStatus: data.navStatus || "Under way using engine",
        draught: data.draught?.toString() || (12 + Math.random() * 8).toFixed(1),
        length: data.length?.toString() || (250 + Math.random() * 100).toFixed(1),
        width: data.width?.toString() || (40 + Math.random() * 20).toFixed(1),
        enginePower: data.enginePower?.toString() || (20000 + Math.random() * 15000).toFixed(0),
        fuelConsumption: data.fuelConsumption?.toString() || (80 + Math.random() * 40).toFixed(1),
        crewSize: data.crewSize?.toString() || (18 + Math.random() * 12).toFixed(0),
        grossTonnage: data.grossTonnage?.toString() || (75000 + Math.random() * 25000).toFixed(0)
      }));
      toast({ 
        title: "AI Data Generated", 
        description: "Realistic vessel data has been generated and filled in the form" 
      });
    },
    onError: (error) => {
      toast({ 
        title: "AI Generation Failed", 
        description: "Could not generate vessel data. Please ensure OpenAI API access is configured.", 
        variant: "destructive" 
      });
    }
  });

  const handleEdit = (vessel: Vessel) => {
    setEditingVessel(vessel);
    setIsDialogOpen(true); // Open the dialog
    setFormData({
      name: vessel.name || "",
      imo: vessel.imo || "",
      mmsi: vessel.mmsi || "",
      vesselType: vessel.vesselType || "",
      flag: vessel.flag || "",
      built: vessel.built?.toString() || "",
      deadweight: vessel.deadweight?.toString() || "",
      currentLat: vessel.currentLat || "",
      currentLng: vessel.currentLng || "",
      departurePort: vessel.departurePort ? vessel.departurePort.toString() : "",
      departureDate: vessel.departureDate ? vessel.departureDate.split('T')[0] : "",
      departureLat: vessel.departureLat || "",
      departureLng: vessel.departureLng || "",
      destinationPort: vessel.destinationPort ? vessel.destinationPort.toString() : "",
      destinationLat: vessel.destinationLat || "",
      destinationLng: vessel.destinationLng || "",
      eta: vessel.eta ? vessel.eta.split('T')[0] : "",
      cargoType: vessel.cargoType || "",
      cargoCapacity: vessel.cargoCapacity?.toString() || "",
      currentRegion: vessel.currentRegion || "",
      status: vessel.status || "underway",
      speed: vessel.speed || "",
      buyerName: vessel.buyerName || "",
      sellerName: vessel.sellerName || "",
      ownerName: vessel.ownerName || "",
      operatorName: vessel.operatorName || "",
      oilSource: vessel.oilSource || "",
      
      // Deal Information
      oilType: (vessel as any).oilType || "",
      quantity: (vessel as any).quantity?.toString() || "",
      dealValue: (vessel as any).dealValue?.toString() || "",
      loadingPort: (vessel as any).loadingPort || "",
      price: (vessel as any).price?.toString() || "",
      marketPrice: (vessel as any).marketPrice?.toString() || "",
      sourceCompany: (vessel as any).sourceCompany || "",
      targetRefinery: (vessel as any).targetRefinery || "",
      shippingType: (vessel as any).shippingType || "",
      routeDistance: (vessel as any).routeDistance?.toString() || "",
      
      // Technical Specifications
      callsign: (vessel as any).callsign || "",
      course: (vessel as any).course?.toString() || "",
      navStatus: (vessel as any).navStatus || "",
      draught: (vessel as any).draught?.toString() || "",
      length: (vessel as any).length?.toString() || "",
      width: (vessel as any).width?.toString() || "",
      enginePower: (vessel as any).enginePower?.toString() || "",
      fuelConsumption: (vessel as any).fuelConsumption?.toString() || "",
      crewSize: (vessel as any).crewSize?.toString() || "",
      grossTonnage: (vessel as any).grossTonnage?.toString() || ""
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.imo || !formData.mmsi || !formData.vesselType || !formData.flag) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (name, IMO, MMSI, vessel type, flag)",
        variant: "destructive"
      });
      return;
    }

    if (editingVessel) {
      updateVesselMutation.mutate({ id: editingVessel.id, data: formData });
    } else {
      createVesselMutation.mutate(formData);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingVessel(null);
    setIsDialogOpen(false);
  };

  // Generate realistic vessel data without AI
  const handleQuickFill = () => {
    const vesselNames = [
      "Gulf Navigator", "Arabian Star", "Petroleum Express", "Ocean Pioneer", 
      "Maritime Glory", "Atlantic Voyager", "Persian Carrier", "Energy Trader",
      "Crude Explorer", "Tanker Supreme", "Oil Guardian", "Sea Transporter"
    ];
    
    const flags = ["Panama", "Liberia", "Marshall Islands", "Singapore", "Malta", "Cyprus"];
    const vesselTypesList = ["Oil Tanker", "Chemical Tanker", "Product Tanker", "Crude Oil Tanker"];
    const cargoTypesList = ["Crude Oil", "Gasoline", "Diesel", "Fuel Oil", "Kerosene", "Naphtha"];
    const regions = ["persian-gulf", "north-sea", "mediterranean", "caribbean", "asia-pacific"];
    const oilCompanies = [
      "Saudi Aramco", "ExxonMobil", "Shell", "BP", "Chevron", "TotalEnergies", 
      "Petrobras", "Equinor", "ConocoPhillips", "Eni"
    ];
    
    const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomCoordinate = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(6);
    
    const generatedData = {
      name: `${randomItem(vesselNames)} ${randomNumber(1, 999)}`,
      imo: `IMO${randomNumber(1000000, 9999999)}`,
      mmsi: randomNumber(100000000, 999999999).toString(),
      vesselType: randomItem(vesselTypesList),
      flag: randomItem(flags),
      built: randomNumber(2005, 2024).toString(),
      deadweight: randomNumber(30000, 150000).toString(),
      currentLat: randomCoordinate(20, 40),
      currentLng: randomCoordinate(40, 70),
      cargoType: randomItem(cargoTypesList),
      cargoCapacity: randomNumber(25000, 120000).toString(),
      speed: (Math.random() * 10 + 8).toFixed(1),
      currentRegion: randomItem(regions),
      ownerName: randomItem(oilCompanies),
      operatorName: randomItem(oilCompanies),
      buyerName: randomItem(oilCompanies),
      sellerName: randomItem(oilCompanies),
      oilSource: `${randomItem(["Ghawar", "Safaniya", "North", "Forties", "Brent"])} Oil Field`
    };
    
    setFormData(prev => ({
      ...prev,
      ...generatedData
    }));
    
    toast({ 
      title: "Quick Fill Complete", 
      description: "Realistic vessel data has been generated and filled in the form" 
    });
  };

  // Handle map location selection
  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      currentLat: lat.toFixed(6),
      currentLng: lng.toFixed(6)
    }));
    setShowMapSelector(false);
    toast({
      title: "Location Selected",
      description: `Coordinates set to ${lat.toFixed(6)}, ${lng.toFixed(6)}`
    });
  };

  // Filter vessels based on search and filters
  const filteredVessels = vessels?.filter((vessel: Vessel) => {
    const matchesSearch = !searchTerm || 
      vessel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.imo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vessel.mmsi.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === "all" || vessel.status === statusFilter;
    const matchesType = !typeFilter || typeFilter === "all" || vessel.vesselType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status) {
      case "underway": return "default";
      case "at port": return "secondary";
      case "loading": return "destructive";
      case "discharging": return "destructive";
      case "at anchor": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Ship className="h-8 w-8 text-blue-600" />
            Vessel Fleet Management
          </h2>
          <p className="text-gray-600 mt-1">Comprehensive vessel tracking and management system</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => refetch()}
            disabled={isLoading}
            variant="outline"
            className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Loading..." : "Refresh List"}
          </Button>
          
          <Button 
            onClick={() => updateVesselDealsMutation.mutate()}
            disabled={updateVesselDealsMutation.isPending}
            variant="outline"
            className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${updateVesselDealsMutation.isPending ? 'animate-spin' : ''}`} />
            {updateVesselDealsMutation.isPending ? "Updating..." : "Fix Deal Info"}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add New Vessel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle className="text-xl font-semibold">
                  {editingVessel ? "Edit Vessel" : "Add New Vessel"}
                </DialogTitle>
                {!editingVessel && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => generateAIDataMutation.mutate()}
                      disabled={generateAIDataMutation.isPending}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {generateAIDataMutation.isPending ? "Generating..." : "AI Auto-Fill"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleQuickFill}
                      className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white border-0"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Quick Fill
                    </Button>
                  </div>
                )}
              </div>
              <DialogDescription>
                {editingVessel ? 'Update vessel information and tracking details' : 'Add a new vessel with comprehensive maritime and cargo information'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="voyage">Voyage</TabsTrigger>
                  <TabsTrigger value="ports">Port Connections</TabsTrigger>
                  <TabsTrigger value="technical">Technical</TabsTrigger>
                  <TabsTrigger value="deal">Deal Info</TabsTrigger>
                  <TabsTrigger value="commercial">Commercial</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Ship className="h-5 w-5" />
                        Basic Vessel Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Vessel Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter vessel name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="imo">IMO Number *</Label>
                        <Input
                          id="imo"
                          value={formData.imo}
                          onChange={(e) => setFormData(prev => ({ ...prev, imo: e.target.value }))}
                          placeholder="IMO1234567"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="mmsi">MMSI Number *</Label>
                        <Input
                          id="mmsi"
                          value={formData.mmsi}
                          onChange={(e) => setFormData(prev => ({ ...prev, mmsi: e.target.value }))}
                          placeholder="123456789"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="vesselType">Vessel Type *</Label>
                        <Select value={formData.vesselType} onValueChange={(value) => setFormData(prev => ({ ...prev, vesselType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vessel type" />
                          </SelectTrigger>
                          <SelectContent>
                            {oilTypes && oilTypes.length > 0 ? (
                              oilTypes.map((oilType: any) => (
                                <SelectItem key={oilType.id} value={oilType.name}>{oilType.displayName || oilType.name}</SelectItem>
                              ))
                            ) : (
                              vesselTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="flag">Flag State *</Label>
                        <Input
                          id="flag"
                          value={formData.flag}
                          onChange={(e) => setFormData(prev => ({ ...prev, flag: e.target.value }))}
                          placeholder="e.g., Panama, Liberia, Marshall Islands"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="built">Year Built</Label>
                        <Input
                          id="built"
                          type="number"
                          value={formData.built}
                          onChange={(e) => setFormData(prev => ({ ...prev, built: e.target.value }))}
                          placeholder="2020"
                          min="1900"
                          max="2030"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="technical" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Technical Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deadweight">Deadweight (tons)</Label>
                        <Input
                          id="deadweight"
                          type="number"
                          value={formData.deadweight}
                          onChange={(e) => setFormData(prev => ({ ...prev, deadweight: e.target.value }))}
                          placeholder="50000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cargoCapacity">Cargo Capacity (tons)</Label>
                        <Input
                          id="cargoCapacity"
                          type="number"
                          value={formData.cargoCapacity}
                          onChange={(e) => setFormData(prev => ({ ...prev, cargoCapacity: e.target.value }))}
                          placeholder="45000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cargoType">Cargo Type</Label>
                        <Select value={formData.cargoType} onValueChange={(value) => setFormData(prev => ({ ...prev, cargoType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select cargo type" />
                          </SelectTrigger>
                          <SelectContent>
                            {cargoTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="speed">Current Speed (knots)</Label>
                        <Input
                          id="speed"
                          value={formData.speed}
                          onChange={(e) => setFormData(prev => ({ ...prev, speed: e.target.value }))}
                          placeholder="12.5"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="voyage" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Current Position & Voyage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label>Current Position</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowMapSelector(true)}
                              className="flex items-center gap-2"
                            >
                              <MapPin className="h-4 w-4" />
                              Select on Map
                            </Button>
                            {formData.currentLat && formData.currentLng && (
                              <div className="text-sm text-muted-foreground">
                                {formData.currentLat}, {formData.currentLng}
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Latitude"
                              value={formData.currentLat}
                              onChange={(e) => setFormData(prev => ({ ...prev, currentLat: e.target.value }))}
                            />
                            <Input
                              placeholder="Longitude"
                              value={formData.currentLng}
                              onChange={(e) => setFormData(prev => ({ ...prev, currentLng: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="currentRegion">Current Region</Label>
                        <Select value={formData.currentRegion} onValueChange={(value) => setFormData(prev => ({ ...prev, currentRegion: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map(region => (
                              <SelectItem key={region} value={region}>
                                {region.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="status">Vessel Status</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {vesselStatuses.map(status => (
                              <SelectItem key={status} value={status}>
                                {status.replace(/\b\w/g, l => l.toUpperCase())}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="departurePort">Departure Port</Label>
                        <Select value={formData.departurePort} onValueChange={(value) => setFormData(prev => ({ ...prev, departurePort: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select departure port" />
                          </SelectTrigger>
                          <SelectContent>
                            {ports?.map((port: Port) => (
                              <SelectItem key={port.id} value={port.id.toString()}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{port.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {port.country} • {port.type}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="destinationPort">Destination Port</Label>
                        <Select value={formData.destinationPort} onValueChange={(value) => setFormData(prev => ({ ...prev, destinationPort: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination port" />
                          </SelectTrigger>
                          <SelectContent>
                            {ports?.map((port: Port) => (
                              <SelectItem key={port.id} value={port.id.toString()}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{port.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {port.country} • {port.type}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="departureDate">Departure Date</Label>
                        <Input
                          id="departureDate"
                          type="date"
                          value={formData.departureDate || ""}
                          onChange={(e) => {
                            console.log("Date changed:", e.target.value);
                            setFormData(prev => ({ ...prev, departureDate: e.target.value }));
                          }}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label htmlFor="eta">Estimated Arrival</Label>
                        <Input
                          id="eta"
                          type="date"
                          value={formData.eta || ""}
                          onChange={(e) => {
                            console.log("ETA changed:", e.target.value);
                            setFormData(prev => ({ ...prev, eta: e.target.value }));
                          }}
                          className="w-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ports" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Anchor className="h-5 w-5" />
                        Port Connections
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="departurePort">Departure Port</Label>
                          <Select value={formData.departurePort} onValueChange={(value) => setFormData(prev => ({ ...prev, departurePort: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select departure port" />
                            </SelectTrigger>
                            <SelectContent>
                              {ports?.map((port: Port) => (
                                <SelectItem key={port.id} value={port.id.toString()}>
                                  {port.name} - {port.country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="destinationPort">Destination Port</Label>
                          <Select value={formData.destinationPort} onValueChange={(value) => setFormData(prev => ({ ...prev, destinationPort: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination port" />
                            </SelectTrigger>
                            <SelectContent>
                              {ports?.map((port: Port) => (
                                <SelectItem key={port.id} value={port.id.toString()}>
                                  {port.name} - {port.country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                          <Anchor className="h-4 w-4" />
                          Port Connection Benefits
                        </h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                          <li>• Automatic position updates when vessel reaches ports</li>
                          <li>• Real-time port availability and status tracking</li>
                          <li>• Integrated voyage planning with port schedules</li>
                          <li>• Enhanced logistics coordination</li>
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="loadingPort">Loading Port (if different)</Label>
                          <Select value={formData.loadingPort} onValueChange={(value) => setFormData(prev => ({ ...prev, loadingPort: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select loading port" />
                            </SelectTrigger>
                            <SelectContent>
                              {ports?.map((port: Port) => (
                                <SelectItem key={port.id} value={port.id.toString()}>
                                  {port.name} - {port.country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="targetRefinery">Target Refinery</Label>
                          <Input
                            id="targetRefinery"
                            value={formData.targetRefinery}
                            onChange={(e) => setFormData(prev => ({ ...prev, targetRefinery: e.target.value }))}
                            placeholder="Refinery name or facility"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="commercial" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Commercial Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ownerName">Owner/Oil Company</Label>
                        <Input
                          id="ownerName"
                          value={formData.ownerName}
                          onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                          placeholder="Saudi Aramco, ExxonMobil, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="operatorName">Operator</Label>
                        <Input
                          id="operatorName"
                          value={formData.operatorName}
                          onChange={(e) => setFormData(prev => ({ ...prev, operatorName: e.target.value }))}
                          placeholder="Operating company"
                        />
                      </div>
                      <div>
                        <Label htmlFor="buyerName">Buyer</Label>
                        <Input
                          id="buyerName"
                          value={formData.buyerName}
                          onChange={(e) => setFormData(prev => ({ ...prev, buyerName: e.target.value }))}
                          placeholder="Purchasing company"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sellerName">Seller</Label>
                        <Input
                          id="sellerName"
                          value={formData.sellerName}
                          onChange={(e) => setFormData(prev => ({ ...prev, sellerName: e.target.value }))}
                          placeholder="Selling company"
                        />
                      </div>
                      <div>
                        <Label htmlFor="oilSource">Oil Source</Label>
                        <Input
                          id="oilSource"
                          value={formData.oilSource}
                          onChange={(e) => setFormData(prev => ({ ...prev, oilSource: e.target.value }))}
                          placeholder="Source refinery or field"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Technical Specifications Tab */}
                <TabsContent value="technical" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Technical Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="callsign">Radio Callsign</Label>
                        <Input
                          id="callsign"
                          value={formData.callsign}
                          onChange={(e) => setFormData(prev => ({ ...prev, callsign: e.target.value }))}
                          placeholder="e.g., 9V7890"
                        />
                      </div>
                      <div>
                        <Label htmlFor="course">Course/Heading (degrees)</Label>
                        <Input
                          id="course"
                          type="number"
                          min="0"
                          max="360"
                          value={formData.course}
                          onChange={(e) => setFormData(prev => ({ ...prev, course: e.target.value }))}
                          placeholder="0-360 degrees"
                        />
                      </div>
                      <div>
                        <Label htmlFor="navStatus">Navigation Status</Label>
                        <Select value={formData.navStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, navStatus: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select navigation status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Under way using engine">Under way using engine</SelectItem>
                            <SelectItem value="At anchor">At anchor</SelectItem>
                            <SelectItem value="Not under command">Not under command</SelectItem>
                            <SelectItem value="Restricted manoeuvrability">Restricted manoeuvrability</SelectItem>
                            <SelectItem value="Moored">Moored</SelectItem>
                            <SelectItem value="Aground">Aground</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="draught">Current Draught (meters)</Label>
                        <Input
                          id="draught"
                          type="number"
                          step="0.1"
                          value={formData.draught}
                          onChange={(e) => setFormData(prev => ({ ...prev, draught: e.target.value }))}
                          placeholder="e.g., 14.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="length">Length (meters)</Label>
                        <Input
                          id="length"
                          type="number"
                          step="0.1"
                          value={formData.length}
                          onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                          placeholder="e.g., 280.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="width">Width/Beam (meters)</Label>
                        <Input
                          id="width"
                          type="number"
                          step="0.1"
                          value={formData.width}
                          onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                          placeholder="e.g., 45.2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="enginePower">Engine Power (HP)</Label>
                        <Input
                          id="enginePower"
                          type="number"
                          value={formData.enginePower}
                          onChange={(e) => setFormData(prev => ({ ...prev, enginePower: e.target.value }))}
                          placeholder="e.g., 25000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fuelConsumption">Fuel Consumption (tons/day)</Label>
                        <Input
                          id="fuelConsumption"
                          type="number"
                          step="0.1"
                          value={formData.fuelConsumption}
                          onChange={(e) => setFormData(prev => ({ ...prev, fuelConsumption: e.target.value }))}
                          placeholder="e.g., 85.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="crewSize">Crew Size</Label>
                        <Input
                          id="crewSize"
                          type="number"
                          value={formData.crewSize}
                          onChange={(e) => setFormData(prev => ({ ...prev, crewSize: e.target.value }))}
                          placeholder="e.g., 22"
                        />
                      </div>
                      <div>
                        <Label htmlFor="grossTonnage">Gross Tonnage</Label>
                        <Input
                          id="grossTonnage"
                          type="number"
                          value={formData.grossTonnage}
                          onChange={(e) => setFormData(prev => ({ ...prev, grossTonnage: e.target.value }))}
                          placeholder="e.g., 85000"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Deal Information Tab */}
                <TabsContent value="deal" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Deal & Cargo Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="oilType">🛢️ Oil/Cargo Type</Label>
                        <Select value={formData.oilType} onValueChange={(value) => setFormData(prev => ({ ...prev, oilType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select oil type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Crude Oil">Crude Oil</SelectItem>
                            <SelectItem value="Brent Crude">Brent Crude</SelectItem>
                            <SelectItem value="WTI Crude">WTI Crude</SelectItem>
                            <SelectItem value="Heavy Fuel Oil">Heavy Fuel Oil</SelectItem>
                            <SelectItem value="Marine Gas Oil">Marine Gas Oil</SelectItem>
                            <SelectItem value="Jet Fuel">Jet Fuel</SelectItem>
                            <SelectItem value="Gasoline">Gasoline</SelectItem>
                            <SelectItem value="Diesel">Diesel</SelectItem>
                            <SelectItem value="Naphtha">Naphtha</SelectItem>
                            <SelectItem value="LPG">LPG</SelectItem>
                            <SelectItem value="LNG">LNG</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">📊 Quantity (barrels/tons)</Label>
                        <Input
                          id="quantity"
                          type="number"
                          step="0.01"
                          value={formData.quantity}
                          onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                          placeholder="e.g., 750000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dealValue">💰 Deal Value (USD)</Label>
                        <Input
                          id="dealValue"
                          type="number"
                          step="0.01"
                          value={formData.dealValue}
                          onChange={(e) => setFormData(prev => ({ ...prev, dealValue: e.target.value }))}
                          placeholder="e.g., 45000000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">➕ Price per Unit (USD)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="e.g., 72.50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="marketPrice">📈 Current Market Price (USD)</Label>
                        <Input
                          id="marketPrice"
                          type="number"
                          step="0.01"
                          value={formData.marketPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, marketPrice: e.target.value }))}
                          placeholder="e.g., 74.20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="loadingPort">⚓ Loading Port</Label>
                        <Input
                          id="loadingPort"
                          value={formData.loadingPort}
                          onChange={(e) => setFormData(prev => ({ ...prev, loadingPort: e.target.value }))}
                          placeholder="e.g., Ras Tanura"
                        />
                      </div>
                      <div>
                        <Label htmlFor="sourceCompany">🏢 Source Company (اسم الشركة)</Label>
                        <Input
                          id="sourceCompany"
                          value={formData.sourceCompany}
                          onChange={(e) => setFormData(prev => ({ ...prev, sourceCompany: e.target.value }))}
                          placeholder="e.g., Saudi Aramco"
                        />
                      </div>
                      <div>
                        <Label htmlFor="targetRefinery">🏭 Target Refinery</Label>
                        <Input
                          id="targetRefinery"
                          value={formData.targetRefinery}
                          onChange={(e) => setFormData(prev => ({ ...prev, targetRefinery: e.target.value }))}
                          placeholder="e.g., Rotterdam Refinery"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shippingType">Shipping Terms</Label>
                        <Select value={formData.shippingType} onValueChange={(value) => setFormData(prev => ({ ...prev, shippingType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shipping terms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FOB">FOB (Free on Board)</SelectItem>
                            <SelectItem value="CIF">CIF (Cost, Insurance, Freight)</SelectItem>
                            <SelectItem value="CFR">CFR (Cost and Freight)</SelectItem>
                            <SelectItem value="In Tank">In Tank</SelectItem>
                            <SelectItem value="Ex Ship">Ex Ship</SelectItem>
                            <SelectItem value="DES">DES (Delivered Ex Ship)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="routeDistance">Route Distance (nautical miles)</Label>
                        <Input
                          id="routeDistance"
                          type="number"
                          step="0.1"
                          value={formData.routeDistance}
                          onChange={(e) => setFormData(prev => ({ ...prev, routeDistance: e.target.value }))}
                          placeholder="e.g., 8450.5"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createVesselMutation.isPending || updateVesselMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createVesselMutation.isPending || updateVesselMutation.isPending 
                    ? "Saving..." 
                    : editingVessel ? "Update Vessel" : "Create Vessel"
                  }
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>

        {/* Map Selector Dialog */}
        <Dialog open={showMapSelector} onOpenChange={setShowMapSelector}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Select Vessel Position</DialogTitle>
              <DialogDescription>
                Click on the map to set the vessel's current geographic coordinates
              </DialogDescription>
            </DialogHeader>
            <div className="h-full">
              <MapSelector
                onLocationSelect={handleLocationSelect}
                initialLat={formData.currentLat ? parseFloat(formData.currentLat) : 25.276987}
                initialLng={formData.currentLng ? parseFloat(formData.currentLng) : 55.296249}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by vessel name, IMO, or MMSI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {vesselStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {oilTypes && oilTypes.length > 0 ? (
                    oilTypes.map((oilType: any) => (
                      <SelectItem key={oilType.id} value={oilType.name}>{oilType.displayName || oilType.name}</SelectItem>
                    ))
                  ) : (
                    vesselTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vessels Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Fleet Overview ({filteredVessels.length} vessels)
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading vessels...</p>
            </div>
          ) : filteredVessels.length === 0 ? (
            <div className="text-center py-12">
              <Ship className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vessels found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter || typeFilter 
                  ? "No vessels match your current filters."
                  : "Get started by adding your first vessel to the fleet."
                }
              </p>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Vessel
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vessel</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Flag</TableHead>
                    <TableHead>Current Position</TableHead>
                    <TableHead>Owner/Operator</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVessels.map((vessel: Vessel) => (
                    <TableRow key={vessel.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vessel.name}</div>
                          <div className="text-sm text-gray-500">IMO: {vessel.imo}</div>
                        </div>
                      </TableCell>
                      <TableCell>{vessel.vesselType}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(vessel.status)}>
                          {vessel.status || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{vessel.flag}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {vessel.currentLat && vessel.currentLng ? (
                            <div>
                              <div>Lat: {vessel.currentLat}</div>
                              <div>Lng: {vessel.currentLng}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Position unknown</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {vessel.ownerName && (
                            <div className="font-medium">{vessel.ownerName}</div>
                          )}
                          {vessel.operatorName && (
                            <div className="text-gray-500">{vessel.operatorName}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {vessel.lastUpdated 
                            ? new Date(vessel.lastUpdated).toLocaleDateString()
                            : "Never"
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(vessel)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => deleteVesselMutation.mutate(vessel.id)}
                            disabled={deleteVesselMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}