import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Simple Oil Type Interface
interface OilType {
  id: number;
  name: string;
  createdAt: string;
}

// Simple Form Schema
interface CreateOilTypeForm {
  name: string;
}

const oilTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export default function SimpleOilTypeManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch oil types
  const { data: oilTypes = [], isLoading } = useQuery<OilType[]>({
    queryKey: ["/api/admin/oil-types"],
    staleTime: 0, // Always fetch fresh data
  });

  // Create oil type mutation
  const createOilTypeMutation = useMutation({
    mutationFn: async (newOilType: CreateOilTypeForm) => {
      console.log("Creating oil type:", newOilType);
      return await apiRequest("/api/admin/oil-types", {
        method: "POST",
        body: JSON.stringify(newOilType)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/oil-types"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Oil type created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create oil type",
        variant: "destructive",
      });
    },
  });

  // Delete oil type mutation
  const deleteOilTypeMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("Deleting oil type:", id);
      return await apiRequest(`/api/admin/oil-types/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/oil-types"] });
      toast({
        title: "Success",
        description: "Oil type deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete oil type",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateOilTypeForm>({
    resolver: zodResolver(oilTypeFormSchema),
    defaultValues: {
      name: "",
    },
  });

  // Filter oil types based on search
  const filteredOilTypes = (oilTypes as OilType[]).filter((oilType: OilType) => {
    return oilType.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const onSubmit = (data: CreateOilTypeForm) => {
    createOilTypeMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this oil type?")) {
      deleteOilTypeMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Oil Type Management</h2>
          <p className="text-muted-foreground">
            Manage oil types in your system
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Oil Type
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Oil Type</DialogTitle>
              <DialogDescription>
                Add a new oil type to the system
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oil Type Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Crude Oil, Diesel, Gasoline" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createOilTypeMutation.isPending}>
                    {createOilTypeMutation.isPending ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Oil Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search by name</Label>
              <Input
                id="search"
                placeholder="Search oil types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oil Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>Oil Types ({filteredOilTypes.length})</CardTitle>
          <CardDescription>
            All oil types in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading oil types...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOilTypes.map((oilType: OilType) => (
                  <TableRow key={oilType.id}>
                    <TableCell className="font-medium">{oilType.name}</TableCell>
                    <TableCell>
                      {new Date(oilType.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(oilType.id)}
                        disabled={deleteOilTypeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOilTypes.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No oil types found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}