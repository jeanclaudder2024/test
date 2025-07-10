import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface CreateDealDialogProps {
  onSuccess?: () => void;
}

export default function CreateDealDialog({ onSuccess }: CreateDealDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    dealTitle: '',
    companyName: '',
    dealValue: '',
    oilType: '',
    quantity: '',
    expectedCloseDate: '',
    notes: '',
    status: 'pending' as const,
  });
  const { toast } = useToast();

  const createDealMutation = useMutation({
    mutationFn: async (dealData: typeof formData) => {
      const response = await fetch('/api/broker/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create deal');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/broker/deals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/broker/stats'] });
      setOpen(false);
      setFormData({
        dealTitle: '',
        companyName: '',
        dealValue: '',
        oilType: '',
        quantity: '',
        expectedCloseDate: '',
        notes: '',
        status: 'pending',
      });
      onSuccess?.();
      toast({
        title: "Deal Created",
        description: "Your new deal has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.dealTitle || !formData.companyName || !formData.dealValue) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createDealMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          Create New Deal
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Deal</DialogTitle>
          <DialogDescription className="text-gray-300">
            Add a new deal to your broker portfolio
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dealTitle" className="text-white">Deal Title *</Label>
              <Input
                id="dealTitle"
                value={formData.dealTitle}
                onChange={(e) => setFormData({ ...formData, dealTitle: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter deal title"
                required
              />
            </div>
            <div>
              <Label htmlFor="companyName" className="text-white">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="Enter company name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dealValue" className="text-white">Deal Value *</Label>
              <Input
                id="dealValue"
                value={formData.dealValue}
                onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="$1,000,000"
                required
              />
            </div>
            <div>
              <Label htmlFor="oilType" className="text-white">Oil Type</Label>
              <Select value={formData.oilType} onValueChange={(value) => setFormData({ ...formData, oilType: value })}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select oil type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="crude-oil">Crude Oil</SelectItem>
                  <SelectItem value="brent">Brent</SelectItem>
                  <SelectItem value="wti">WTI</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                  <SelectItem value="heating-oil">Heating Oil</SelectItem>
                  <SelectItem value="jet-fuel">Jet Fuel</SelectItem>
                  <SelectItem value="natural-gas">Natural Gas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity" className="text-white">Quantity</Label>
              <Input
                id="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="100,000 barrels"
              />
            </div>
            <div>
              <Label htmlFor="expectedCloseDate" className="text-white">Expected Close Date</Label>
              <Input
                id="expectedCloseDate"
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status" className="text-white">Initial Status</Label>
            <Select value={formData.status} onValueChange={(value: 'pending' | 'active' | 'completed' | 'cancelled') => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes" className="text-white">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="Add any additional notes or details about this deal..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createDealMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {createDealMutation.isPending ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}