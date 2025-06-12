import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

export default function RegionManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regions Management</CardTitle>
        <CardDescription>
          Manage trading regions and geographic markets
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Region management is currently being updated.</p>
          <p className="text-sm">Oil types management is fully functional in the Filter Management section.</p>
        </div>
      </CardContent>
    </Card>
  );
}