import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { useFeatureAccess } from "@/hooks/use-feature-access";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { REGIONS } from "@shared/constants";

interface RegionFilterProps {
  selectedRegion: string;
  onChange: (region: string) => void;
}

export function RegionFilter({ selectedRegion, onChange }: RegionFilterProps) {
  const [open, setOpen] = useState(false);
  const { hasAccess } = useFeatureAccess();
  const [canUseFilter, setCanUseFilter] = useState(false);
  
  useEffect(() => {
    // Check if user has access to region filtering feature
    setCanUseFilter(hasAccess('region_filtering'));
  }, [hasAccess]);
  
  if (!canUseFilter) {
    return null; // Don't render the component if user doesn't have access
  }
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-w-[200px] justify-between"
        >
          {selectedRegion
            ? REGIONS.find(region => region.id === selectedRegion)?.name || selectedRegion
            : "Select Region"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Search region..." />
          <CommandEmpty>No region found.</CommandEmpty>
          <CommandGroup>
            {REGIONS.map((region) => (
              <CommandItem
                key={region.id}
                value={region.id}
                onSelect={(currentValue) => {
                  onChange(currentValue === selectedRegion ? "" : currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedRegion === region.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {region.name}
                {region.nameAr && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    {region.nameAr}
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}