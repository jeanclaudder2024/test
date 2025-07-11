import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  FileText, 
  Edit, 
  Trash2, 
  Plus, 
  Eye,
  Settings,
  Layout,
  Type,
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import type { LandingPageContent, InsertLandingPageContent } from "@shared/schema";

const CONTENT_SECTIONS = [
  { value: "hero_title", label: "Hero Section - Main Title", icon: Type },
  { value: "hero_subtitle", label: "Hero Section - Subtitle", icon: Type },
  { value: "hero_description", label: "Hero Section - Description", icon: FileText },
  { value: "features_title", label: "Features Section - Title", icon: Layout },
  { value: "features_description", label: "Features Section - Description", icon: FileText },
  { value: "pricing_title", label: "Pricing Section - Title", icon: Layout },
  { value: "pricing_description", label: "Pricing Section - Description", icon: FileText },
  { value: "testimonials_title", label: "Testimonials Section - Title", icon: Layout },
  { value: "cta_title", label: "Call to Action - Title", icon: Sparkles },
  { value: "cta_description", label: "Call to Action - Description", icon: FileText },
  { value: "footer_company_description", label: "Footer - Company Description", icon: FileText },
];

const CONTENT_TYPES = [
  { value: "text", label: "Text Content" },
  { value: "html", label: "HTML Content" },
  { value: "image_url", label: "Image URL" },
  { value: "button_text", label: "Button Text" },
  { value: "link_url", label: "Link URL" },
];

export default function LandingPageManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<LandingPageContent | null>(null);
  const [formData, setFormData] = useState<Partial<InsertLandingPageContent>>({
    section: "",
    contentType: "text",
    title: "",
    content: "",
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

  const resetForm = () => {
    setFormData({
      section: "",
      contentType: "text",
      title: "",
      content: "",
      displayOrder: 1,
      isActive: true,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.section || !formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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
      contentType: content.contentType,
      title: content.title,
      content: content.content,
      displayOrder: content.displayOrder,
      isActive: content.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContent || !formData.section || !formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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
          <h2 className="text-2xl font-bold text-gray-900">Landing Page Content</h2>
          <p className="text-gray-600">Manage all text content and sections on the landing page</p>
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
                  <label className="block text-sm font-medium mb-2">Content Type</label>
                  <Select 
                    value={formData.contentType} 
                    onValueChange={(value) => setFormData({ ...formData, contentType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={formData.title || ""}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Content title for identification"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content *</label>
                <Textarea
                  value={formData.content || ""}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the actual content text"
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Display Order</label>
                  <Input
                    type="number"
                    value={formData.displayOrder || 1}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">Active</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createContentMutation.isPending}
                >
                  {createContentMutation.isPending ? "Creating..." : "Create Content"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content List */}
      <div className="grid gap-4">
        {landingContent?.map((content: LandingPageContent) => {
          const sectionInfo = getSectionInfo(content.section);
          const IconComponent = sectionInfo.icon;
          
          return (
            <Card key={content.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{content.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {sectionInfo.label}
                        <Badge variant={content.isActive ? "default" : "secondary"}>
                          {content.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">
                          {content.contentType}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                  {content.content.length > 200 
                    ? `${content.content.substring(0, 200)}...` 
                    : content.content
                  }
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>Order: {content.displayOrder}</span>
                  <span>Section: {content.section}</span>
                  <span>Updated: {new Date(content.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Landing Page Content</DialogTitle>
            <DialogDescription>
              Update the content for this landing page section
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
                <label className="block text-sm font-medium mb-2">Content Type</label>
                <Select 
                  value={formData.contentType} 
                  onValueChange={(value) => setFormData({ ...formData, contentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Content title for identification"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Content *</label>
              <Textarea
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter the actual content text"
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Order</label>
                <Input
                  type="number"
                  value={formData.displayOrder || 1}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="editIsActive" className="text-sm font-medium">Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateContentMutation.isPending}
              >
                {updateContentMutation.isPending ? "Updating..." : "Update Content"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Empty State */}
      {landingContent?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Start by creating content sections for your landing page
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Content
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}