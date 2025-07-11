import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Plus, FileText, Layout, Type, Sparkles, Eye, EyeOff, Image, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { LandingPageContent, InsertLandingPageContent, LandingPageImage, InsertLandingPageImage } from "@shared/schema";

// Content section definitions matching the actual landing page structure
const CONTENT_SECTIONS = [
  { value: "hero", label: "Hero Section", icon: Type },
  { value: "industry", label: "Industry Showcase Section", icon: Layout },
  { value: "why-us", label: "Why PetroDealHub Section", icon: Sparkles },
  { value: "features", label: "Platform Features Section", icon: Layout },
  { value: "how-it-works", label: "How It Works Section", icon: FileText },
  { value: "results", label: "Results & Testimonials Section", icon: Sparkles },
  { value: "cta", label: "Call to Action Section", icon: Type },
  { value: "pricing", label: "Subscription Plans Section", icon: Layout },
];

// Image management interfaces now imported from schema

export default function LandingPageManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<LandingPageContent | null>(null);
  const [formData, setFormData] = useState<Partial<InsertLandingPageContent>>({
    section: "",
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    displayOrder: 1,
    isActive: true,
  });

  // Image management state
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isEditImageDialogOpen, setIsEditImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<LandingPageImage | null>(null);
  const [imageFormData, setImageFormData] = useState<Partial<InsertLandingPageImage>>({
    section: "",
    imageKey: "",
    imageUrl: "",
    altText: "",
    displayOrder: 1,
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch landing page content
  const { data: landingContent, isLoading } = useQuery({
    queryKey: ["/api/admin/landing-content"],
    staleTime: 0,
  });

  // Fetch landing page images
  const { data: landingImages, isLoading: imagesLoading } = useQuery({
    queryKey: ["/api/admin/landing-images"],
    staleTime: 0,
  });

  // Create content mutation
  const createContentMutation = useMutation({
    mutationFn: (data: InsertLandingPageContent) => 
      apiRequest("POST", "/api/admin/landing-content", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/landing-content"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Landing page content created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create content",
        variant: "destructive",
      });
    },
  });

  // Update content mutation
  const updateContentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertLandingPageContent> }) =>
      apiRequest("PUT", `/api/admin/landing-content/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/landing-content"] });
      setIsEditDialogOpen(false);
      setSelectedContent(null);
      resetForm();
      toast({
        title: "Success",
        description: "Landing page content updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update content",
        variant: "destructive",
      });
    },
  });

  // Delete content mutation
  const deleteContentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/landing-content/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/landing-content"] });
      toast({
        title: "Success",
        description: "Landing page content deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete content",
        variant: "destructive",
      });
    },
  });

  // Image management mutations
  const createImageMutation = useMutation({
    mutationFn: (data: InsertLandingPageImage) => 
      apiRequest("POST", "/api/admin/landing-images", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/landing-images"] });
      setIsImageDialogOpen(false);
      resetImageForm();
      toast({
        title: "Success",
        description: "Landing page image created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create image",
        variant: "destructive",
      });
    },
  });

  const updateImageMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertLandingPageImage> }) =>
      apiRequest("PUT", `/api/admin/landing-images/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/landing-images"] });
      setIsEditImageDialogOpen(false);
      resetImageForm();
      toast({
        title: "Success",
        description: "Landing page image updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update image",
        variant: "destructive",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/landing-images/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/landing-images"] });
      toast({
        title: "Success",
        description: "Landing page image deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      section: "",
      title: "",
      subtitle: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      displayOrder: 1,
      isActive: true,
    });
  };

  const resetImageForm = () => {
    setImageFormData({
      section: "",
      imageKey: "",
      imageUrl: "",
      altText: "",
      displayOrder: 1,
      isActive: true,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.section || !formData.title) {
      toast({
        title: "Error",
        description: "Please fill in section and title fields",
        variant: "destructive",
      });
      return;
    }
    createContentMutation.mutate(formData as InsertLandingPageContent);
  };

  const handleEdit = (content: LandingPageContent) => {
    setSelectedContent(content);
    setFormData({
      section: content.section,
      title: content.title || "",
      subtitle: content.subtitle || "",
      description: content.description || "",
      buttonText: content.buttonText || "",
      buttonLink: content.buttonLink || "",
      displayOrder: content.displayOrder || 1,
      isActive: content.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContent || !formData.section || !formData.title) {
      toast({
        title: "Error",
        description: "Please fill in section and title fields",
        variant: "destructive",
      });
      return;
    }
    updateContentMutation.mutate({
      id: selectedContent.id,
      data: formData as Partial<InsertLandingPageContent>,
    });
  };

  const getSectionInfo = (section: string) => {
    return CONTENT_SECTIONS.find(s => s.value === section) || { 
      label: section, 
      icon: FileText 
    };
  };

  // Image management handlers
  const handleCreateImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFormData.section || !imageFormData.imageKey || !imageFormData.imageUrl) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    createImageMutation.mutate(imageFormData as InsertLandingPageImage);
  };

  const handleEditImage = (image: LandingPageImage) => {
    setSelectedImage(image);
    setImageFormData({
      section: image.section,
      imageKey: image.imageKey,
      imageUrl: image.imageUrl,
      altText: image.altText,
      displayOrder: image.displayOrder,
      isActive: image.isActive,
    });
    setIsEditImageDialogOpen(true);
  };

  const handleUpdateImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) return;
    updateImageMutation.mutate({
      id: selectedImage.id,
      data: imageFormData,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Landing Page Manager</h2>
          <p className="text-gray-600">Manage text content and images on the landing page</p>
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Text Content
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Images & Media
          </TabsTrigger>
        </TabsList>

        {/* Content Management Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Text Content Management</h3>
              <p className="text-gray-600">Manage titles, descriptions, and button text</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Landing Page Content</DialogTitle>
              <DialogDescription>
                Add new content section to the landing page
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Section *</label>
                  <Select 
                    value={formData.section} 
                    onValueChange={(value) => setFormData({ ...formData, section: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_SECTIONS.map((section) => (
                        <SelectItem key={section.value} value={section.value}>
                          <div className="flex items-center gap-2">
                            <section.icon className="w-4 h-4" />
                            {section.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Display Order</label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    min="1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter section title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Enter section subtitle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter section description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Button Text</label>
                  <Input
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Enter button text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Button Link</label>
                  <Input
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="Enter button link (e.g. /register)"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active</label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createContentMutation.isPending}>
                  {createContentMutation.isPending ? "Creating..." : "Create Content"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content List */}
      <div className="grid gap-4">
        {landingContent && Array.isArray(landingContent) && landingContent.length > 0 ? (
          landingContent
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            .map((content) => {
              const sectionInfo = getSectionInfo(content.section);
              return (
                <div key={content.id} className="bg-white border rounded-lg p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <sectionInfo.icon className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">{sectionInfo.label}</h3>
                        <span className="text-sm text-gray-500">#{content.displayOrder}</span>
                        {content.isActive ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-2">
                        {content.title && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Title:</span>
                            <p className="text-gray-900">{content.title}</p>
                          </div>
                        )}
                        {content.subtitle && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Subtitle:</span>
                            <p className="text-gray-700">{content.subtitle}</p>
                          </div>
                        )}
                        {content.description && (
                          <div>
                            <span className="text-sm font-medium text-gray-600">Description:</span>
                            <p className="text-gray-700">{content.description}</p>
                          </div>
                        )}
                        {content.buttonText && (
                          <div className="flex items-center gap-4">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Button:</span>
                              <span className="ml-2 text-gray-900">{content.buttonText}</span>
                            </div>
                            {content.buttonLink && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Link:</span>
                                <span className="ml-2 text-blue-600">{content.buttonLink}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(content)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteContentMutation.mutate(content.id)}
                        disabled={deleteContentMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No landing page content found. Create your first content section.</p>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Landing Page Content</DialogTitle>
            <DialogDescription>
              Update the content section details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Section *</label>
                <Select 
                  value={formData.section} 
                  onValueChange={(value) => setFormData({ ...formData, section: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_SECTIONS.map((section) => (
                      <SelectItem key={section.value} value={section.value}>
                        <div className="flex items-center gap-2">
                          <section.icon className="w-4 h-4" />
                          {section.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Display Order</label>
                <Input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter section title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Enter section subtitle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter section description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Button Text</label>
                <Input
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  placeholder="Enter button text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Button Link</label>
                <Input
                  value={formData.buttonLink}
                  onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                  placeholder="Enter button link (e.g. /register)"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="editIsActive" className="text-sm font-medium">Active</label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateContentMutation.isPending}>
                {updateContentMutation.isPending ? "Updating..." : "Update Content"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
        </TabsContent>

        {/* Image Management Tab */}
        <TabsContent value="images" className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-800 mb-2">How to Use Image Management</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Add Image:</strong> Click "Add Image" button to upload images for different sections of your landing page</p>
              <p>• <strong>Sections:</strong> Choose from 8 different sections (Hero, Industry, Features, etc.)</p>
              <p>• <strong>Image Key:</strong> Give each image a unique name (e.g., "hero-background", "company-logo")</p>
              <p>• <strong>URL:</strong> Paste image URL from Unsplash, your server, or any public image link</p>
              <p>• <strong>Display Order:</strong> Control which image appears first (1 = first, 2 = second, etc.)</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Landing Page Images</h3>
              <p className="text-gray-600">Organize by sections: {landingImages?.length || 0} images total</p>
            </div>
            <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetImageForm()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Landing Page Image</DialogTitle>
                  <DialogDescription>
                    Upload or link a new image for the landing page
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateImage} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Section *</label>
                      <Select 
                        value={imageFormData.section} 
                        onValueChange={(value) => setImageFormData({ ...imageFormData, section: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTENT_SECTIONS.map((section) => (
                            <SelectItem key={section.value} value={section.value}>
                              <div className="flex items-center gap-2">
                                <section.icon className="w-4 h-4" />
                                {section.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Display Order</label>
                      <Input
                        type="number"
                        value={imageFormData.displayOrder}
                        onChange={(e) => setImageFormData({ ...imageFormData, displayOrder: parseInt(e.target.value) || 1 })}
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Image Key *</label>
                    <Input
                      value={imageFormData.imageKey}
                      onChange={(e) => setImageFormData({ ...imageFormData, imageKey: e.target.value })}
                      placeholder="e.g. hero-background, company-logo, feature-icon"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Image URL *</label>
                    <Input
                      value={imageFormData.imageUrl}
                      onChange={(e) => setImageFormData({ ...imageFormData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="mb-1"><strong>Sample URLs you can use:</strong></p>
                      <div className="space-y-1 font-mono text-xs">
                        <p>• Maritime: https://images.unsplash.com/photo-1578662996442-48f60103fc96</p>
                        <p>• Oil Refinery: https://images.unsplash.com/photo-1518709268805-4e9042af2176</p>
                        <p>• Technology: https://images.unsplash.com/photo-1544551763-46a013bb70d5</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Alt Text</label>
                    <Input
                      value={imageFormData.altText}
                      onChange={(e) => setImageFormData({ ...imageFormData, altText: e.target.value })}
                      placeholder="Enter descriptive alt text for accessibility"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="imageIsActive"
                      checked={imageFormData.isActive}
                      onChange={(e) => setImageFormData({ ...imageFormData, isActive: e.target.checked })}
                    />
                    <label htmlFor="imageIsActive" className="text-sm font-medium">Active</label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createImageMutation.isPending}>
                      {createImageMutation.isPending ? "Adding..." : "Add Image"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Images List - Organized by Sections */}
          <div className="space-y-6">
            {landingImages && Array.isArray(landingImages) && landingImages.length > 0 ? (
              CONTENT_SECTIONS.map((section) => {
                const sectionImages = landingImages
                  .filter(img => img.section === section.value)
                  .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
                
                return (
                  <div key={section.value} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <section.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{section.label}</h4>
                          <p className="text-sm text-gray-600">
                            {sectionImages.length} image{sectionImages.length !== 1 ? 's' : ''} 
                            {sectionImages.length === 0 ? ' - Add your first image for this section' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {sectionImages.length > 0 ? (
                      <div className="p-4 space-y-3">
                        {sectionImages.map((image) => (
                          <div key={image.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-blue-600">#{image.displayOrder}</span>
                                <span className="text-sm font-mono bg-white px-2 py-1 rounded border">{image.imageKey}</span>
                                {image.isActive ? (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                                ) : (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Inactive</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditImage(image)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteImageMutation.mutate(image.id)}
                                  disabled={deleteImageMutation.isPending}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <div className="lg:col-span-1">
                                {image.imageUrl && (
                                  <div className="space-y-2">
                                    <div className="border rounded-lg overflow-hidden bg-white">
                                      <img
                                        src={image.imageUrl}
                                        alt={image.altText || "Landing page image"}
                                        className="w-full h-32 object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23666">No Image</text></svg>';
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="lg:col-span-2 space-y-2">
                                {image.altText && (
                                  <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Alt Text:</span>
                                    <p className="text-sm text-gray-700">{image.altText}</p>
                                  </div>
                                )}
                                <div>
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Image URL:</span>
                                  <p className="text-xs text-gray-600 break-all font-mono bg-white px-2 py-1 rounded border">{image.imageUrl}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <Image className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No images in this section yet</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="text-center py-8">
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No Images Found</h4>
                  <p className="text-gray-500 mb-4">Start by adding your first landing page image.</p>
                  <p className="text-sm text-gray-400">Images will be organized by sections for easy management.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Edit Image Dialog */}
          <Dialog open={isEditImageDialogOpen} onOpenChange={setIsEditImageDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Landing Page Image</DialogTitle>
                <DialogDescription>
                  Update the image details and settings
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateImage} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Section *</label>
                    <Select 
                      value={imageFormData.section} 
                      onValueChange={(value) => setImageFormData({ ...imageFormData, section: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_SECTIONS.map((section) => (
                          <SelectItem key={section.value} value={section.value}>
                            <div className="flex items-center gap-2">
                              <section.icon className="w-4 h-4" />
                              {section.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Display Order</label>
                    <Input
                      type="number"
                      value={imageFormData.displayOrder}
                      onChange={(e) => setImageFormData({ ...imageFormData, displayOrder: parseInt(e.target.value) || 1 })}
                      min="1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image Key *</label>
                  <Input
                    value={imageFormData.imageKey}
                    onChange={(e) => setImageFormData({ ...imageFormData, imageKey: e.target.value })}
                    placeholder="e.g. hero-background, company-logo, feature-icon"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL *</label>
                  <Input
                    value={imageFormData.imageUrl}
                    onChange={(e) => setImageFormData({ ...imageFormData, imageUrl: e.target.value })}
                    placeholder="Enter image URL or upload path"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Alt Text</label>
                  <Input
                    value={imageFormData.altText}
                    onChange={(e) => setImageFormData({ ...imageFormData, altText: e.target.value })}
                    placeholder="Enter descriptive alt text for accessibility"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editImageIsActive"
                    checked={imageFormData.isActive}
                    onChange={(e) => setImageFormData({ ...imageFormData, isActive: e.target.checked })}
                  />
                  <label htmlFor="editImageIsActive" className="text-sm font-medium">Active</label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditImageDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateImageMutation.isPending}>
                    {updateImageMutation.isPending ? "Updating..." : "Update Image"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}