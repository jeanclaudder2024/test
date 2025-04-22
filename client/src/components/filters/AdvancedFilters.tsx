import { useState, useEffect } from 'react';
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { Loader2, Settings, Lock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter 
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { VESSEL_TYPES, OIL_PRODUCT_TYPES } from "@shared/constants";
import { Link } from "wouter";

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export interface FilterOptions {
  vesselType?: string;
  cargoType?: string;
  minCapacity?: number;
  maxCapacity?: number;
  flag?: string;
}

export function AdvancedFilters({ onFilterChange, initialFilters = {} }: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const { hasAccess, isLoading } = useFeatureAccess();
  const [canUseAdvancedFilters, setCanUseAdvancedFilters] = useState(false);
  
  // Check access to advanced filtering feature
  useEffect(() => {
    setCanUseAdvancedFilters(hasAccess('advanced_filtering'));
  }, [hasAccess]);
  
  // Update parent component when filters change
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
  };
  
  // Apply filters
  const applyFilters = () => {
    onFilterChange(filters);
    setOpen(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    const emptyFilters = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };
  
  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }
  
  // Feature is restricted and user doesn't have access
  if (!canUseAdvancedFilters) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5 text-amber-500" />
              Premium Feature
            </SheetTitle>
            <SheetDescription>
              Advanced filtering requires a Standard or Premium subscription.
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6 flex flex-col items-center justify-center h-[70%]">
            <Lock className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Feature Locked</h3>
            <p className="text-muted-foreground text-center mb-4">
              Subscribe to a Standard or Premium plan to access advanced vessel and cargo filtering.
            </p>
            <Button asChild>
              <Link href="/subscription-plans">View Subscription Plans</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your vessel search with advanced filtering options.
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid gap-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="vesselType">Vessel Type</Label>
            <Select
              value={filters.vesselType || ''}
              onValueChange={(value) => handleFilterChange('vesselType', value)}
            >
              <SelectTrigger id="vesselType">
                <SelectValue placeholder="Select vessel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Vessel Types</SelectItem>
                {VESSEL_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cargoType">Cargo Type</Label>
            <Select
              value={filters.cargoType || ''}
              onValueChange={(value) => handleFilterChange('cargoType', value)}
            >
              <SelectTrigger id="cargoType">
                <SelectValue placeholder="Select cargo type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cargo Types</SelectItem>
                {OIL_PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Cargo Capacity (tons)</Label>
            <div className="pt-4 px-2">
              <Slider
                defaultValue={[filters.minCapacity || 0, filters.maxCapacity || 1000000]}
                max={1000000}
                step={10000}
                onValueChange={([min, max]) => {
                  handleFilterChange('minCapacity', min);
                  handleFilterChange('maxCapacity', max);
                }}
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{filters.minCapacity || 0} tons</span>
                <span>{filters.maxCapacity || 1000000} tons</span>
              </div>
            </div>
          </div>
          
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertTitle>Premium Filters</AlertTitle>
            <AlertDescription>
              You have access to all advanced filtering options with your subscription.
            </AlertDescription>
          </Alert>
        </div>
        
        <SheetFooter>
          <Button variant="outline" onClick={resetFilters}>Reset</Button>
          <Button onClick={applyFilters}>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}