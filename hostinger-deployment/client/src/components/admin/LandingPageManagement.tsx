import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Save, Globe } from "lucide-react";
import type { LandingPageContent } from "@shared/schema";

const contentSchema = z.object({
  section: z.string().min(1, "Section is required"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  buttonLink: z.string().optional(),
  imageUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  content: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

type ContentFormData = z.infer<typeof contentSchema>;

export function LandingPageManagement() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const form = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      section: "",
      title: "",
      subtitle: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      imageUrl: "",
      videoUrl: "",
      content: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  // Fetch landing page content
  const { data: contentItems = [], isLoading } = useQuery<LandingPageContent[]>({
    queryKey: ['/api/landing-content'],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: ContentFormData) =>
      apiRequest('/api/landing-content', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/landing-content'] });
      toast({
        title: "Success",
        description: "Content section created successfully",
      });
      setShowAddForm(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create content section",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ContentFormData }) =>
      apiRequest(`/api/landing-content/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/landing-content'] });
      toast({
        title: "Success",
        description: "Content section updated successfully",
      });
      setEditingId(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update content section",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/landing-content/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/landing-content'] });
      toast({
        title: "Success",
        description: "Content section deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete content section",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContentFormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEditing = (item: LandingPageContent) => {
    setEditingId(item.id);
    form.reset({
      section: item.section,
      title: item.title || "",
      subtitle: item.subtitle || "",
      description: item.description || "",
      buttonText: item.buttonText || "",
      buttonLink: item.buttonLink || "",
      imageUrl: item.imageUrl || "",
      videoUrl: item.videoUrl || "",
      content: item.content || "",
      isActive: item.isActive ?? true,
      sortOrder: item.sortOrder ?? 0,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setShowAddForm(false);
    form.reset();
  };

  const toggleActive = (item: LandingPageContent) => {
    updateMutation.mutate({
      id: item.id,
      data: {
        section: item.section,
        title: item.title || undefined,
        subtitle: item.subtitle || undefined,
        description: item.description || undefined,
        buttonText: item.buttonText || undefined,
        buttonLink: item.buttonLink || undefined,
        imageUrl: item.imageUrl || undefined,
        videoUrl: item.videoUrl || undefined,
        content: item.content || undefined,
        isActive: !item.isActive,
        sortOrder: item.sortOrder ?? 0,
      },
    });
  };

  const sectionTypes = [
    { value: "hero", label: "Hero Section" },
    { value: "features", label: "Features" },
    { value: "why-us", label: "Why Choose Us" },
    { value: "how-it-works", label: "How It Works" },
    { value: "results", label: "Results & Testimonials" },
    { value: "pricing", label: "Pricing" },
    { value: "contact", label: "Contact" },
    { value: "footer", label: "Footer" },
    { value: "custom", label: "Custom Section" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Landing Page Content Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage and customize your landing page sections
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Content Section
        </Button>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">Content Sections</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {/* Add/Edit Form */}
          {(showAddForm || editingId) && (
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Content Section" : "Add New Content Section"}</CardTitle>
                <CardDescription>
                  Configure the content for your landing page section
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="section"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Section Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select section type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sectionTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sortOrder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sort Order</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Section title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtitle</FormLabel>
                          <FormControl>
                            <Input placeholder="Section subtitle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Section description"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="buttonText"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Text</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Get Started" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="buttonLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Link</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., /auth" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="videoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://youtube.com/watch?v=..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Content (JSON)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder='{"features": ["Feature 1", "Feature 2"], "stats": {"users": 1000}}'
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Active</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Show this section on the landing page
                            </div>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                      >
                        {(createMutation.isPending || updateMutation.isPending) && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        <Save className="h-4 w-4 mr-2" />
                        {editingId ? "Update" : "Create"}
                      </Button>
                      <Button type="button" variant="outline" onClick={cancelEditing}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Content List */}
          <div className="grid gap-4">
            {contentItems.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Content Sections</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first content section to get started
                    </p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Content Section
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              contentItems
                .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                .map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {item.title || `${item.section} Section`}
                            <Badge variant={item.isActive ? "default" : "secondary"}>
                              {item.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Section: {item.section} • Order: {item.sortOrder}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleActive(item)}
                          >
                            {item.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditing(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMutation.mutate(item.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {item.subtitle && (
                          <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                        )}
                        {item.description && (
                          <p className="text-sm">{item.description}</p>
                        )}
                        {item.buttonText && (
                          <Badge variant="outline" className="mr-2">
                            Button: {item.buttonText}
                          </Badge>
                        )}
                        {item.imageUrl && (
                          <Badge variant="outline" className="mr-2">
                            Has Image
                          </Badge>
                        )}
                        {item.videoUrl && (
                          <Badge variant="outline">
                            Has Video
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Landing Page Preview</CardTitle>
              <CardDescription>
                See how your content will appear on the landing page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 border rounded-lg">
                <p className="text-muted-foreground">
                  Landing page preview will be implemented here
                </p>
                <Button variant="outline" className="mt-4">
                  View Live Landing Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}