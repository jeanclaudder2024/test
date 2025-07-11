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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Image Management</h3>
              <p className="text-gray-600">Manage logos, backgrounds, and visual assets</p>
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

          {/* Images List */}
          <div className="grid gap-4">
            {landingImages && Array.isArray(landingImages) && landingImages.length > 0 ? (
              landingImages
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((image) => {
                  const sectionInfo = getSectionInfo(image.section);
                  return (
                    <Card key={image.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Image className="w-5 h-5 text-gray-500" />
                            <CardTitle className="text-lg">{sectionInfo.label}</CardTitle>
                            <span className="text-sm text-gray-500">#{image.displayOrder}</span>
                            {image.isActive ? (
                              <Eye className="w-4 h-4 text-green-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
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
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium text-gray-600">Image Key:</span>
                                <p className="text-gray-900 font-mono text-sm">{image.imageKey}</p>
                              </div>
                              {image.altText && (
                                <div>
                                  <span className="text-sm font-medium text-gray-600">Alt Text:</span>
                                  <p className="text-gray-700">{image.altText}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            {image.imageUrl && (
                              <div className="space-y-2">
                                <span className="text-sm font-medium text-gray-600">Preview:</span>
                                <div className="border rounded-lg p-2 bg-gray-50">
                                  <img
                                    src={image.imageUrl}
                                    alt={image.altText || "Landing page image"}
                                    className="w-full h-24 object-cover rounded"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23666">No Image</text></svg>';
                                    }}
                                  />
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-600">URL:</span>
                                  <p className="text-gray-700 text-xs truncate">{image.imageUrl}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            ) : (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="text-center py-8">
                  <Image className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No landing page images found. Add your first image.</p>
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