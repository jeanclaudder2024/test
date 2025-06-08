import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Plus, 
  Clock, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Save,
  Layout,
  Settings
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface LandingPageSection {
  id: number;
  sectionKey: string;
  sectionName: string;
  isEnabled: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface LandingPageContent {
  id: number;
  sectionId: number;
  contentKey: string;
  contentType: string;
  contentValue: string;
  placeholderText: string;
  createdAt: string;
  updatedAt: string;
}

interface LandingPageImage {
  id: number;
  sectionId: number;
  imageKey: string;
  imageUrl: string;
  altText: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface LandingPageBlock {
  id: number;
  sectionId: number;
  blockType: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  linkText: string;
  metadata: string;
  displayOrder: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LandingPageManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sections");
  const [selectedSection, setSelectedSection] = useState<LandingPageSection | null>(null);
  
  // Sample data - in real implementation this would come from API
  const [sections, setSections] = useState<LandingPageSection[]>([
    {
      id: 1,
      sectionKey: "hero",
      sectionName: "Hero Section",
      isEnabled: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      sectionKey: "services",
      sectionName: "Services Section", 
      isEnabled: true,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      sectionKey: "features",
      sectionName: "Features Section",
      isEnabled: true,
      displayOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      sectionKey: "gallery",
      sectionName: "Gallery Section",
      isEnabled: false,
      displayOrder: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 5,
      sectionKey: "subscriptions",
      sectionName: "Subscription Plans",
      isEnabled: true,
      displayOrder: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 6,
      sectionKey: "footer",
      sectionName: "Footer Section",
      isEnabled: true,
      displayOrder: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [content, setContent] = useState<LandingPageContent[]>([
    {
      id: 1,
      sectionId: 1,
      contentKey: "title",
      contentType: "text",
      contentValue: "Navigate Global Energy Markets with Confidence",
      placeholderText: "Main hero title",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      sectionId: 1,
      contentKey: "subtitle",
      contentType: "text",
      contentValue: "Advanced maritime intelligence platform for oil vessel tracking, market analysis, and strategic decision-making in the global energy sector.",
      placeholderText: "Hero subtitle description",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      sectionId: 1,
      contentKey: "primary_button",
      contentType: "text",
      contentValue: "Start Free Trial",
      placeholderText: "Primary button text",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      sectionId: 1,
      contentKey: "secondary_button",
      contentType: "text",
      contentValue: "View Pricing",
      placeholderText: "Secondary button text",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [images, setImages] = useState<LandingPageImage[]>([
    {
      id: 1,
      sectionId: 1,
      imageKey: "background",
      imageUrl: "/images/hero-bg.jpg",
      altText: "Maritime operations background",
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      sectionId: 4,
      imageKey: "gallery_1",
      imageUrl: "/images/gallery-1.jpg",
      altText: "Oil tanker at sea",
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [blocks, setBlocks] = useState<LandingPageBlock[]>([
    {
      id: 1,
      sectionId: 2,
      blockType: "service_card",
      title: "Real-Time Vessel Tracking",
      description: "Monitor oil tankers and cargo vessels worldwide with live position updates and route optimization.",
      imageUrl: "/images/service-tracking.svg",
      linkUrl: "/vessels",
      linkText: "Learn More",
      metadata: "{}",
      displayOrder: 1,
      isEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      sectionId: 2,
      blockType: "service_card",
      title: "Market Intelligence",
      description: "Access comprehensive market data, pricing trends, and trading opportunities in the global oil market.",
      imageUrl: "/images/service-intelligence.svg",
      linkUrl: "/trading",
      linkText: "Explore",
      metadata: "{}",
      displayOrder: 2,
      isEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const handleToggleSection = (sectionId: number) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isEnabled: !section.isEnabled, updatedAt: new Date().toISOString() }
        : section
    ));
    toast({
      title: "Section Updated",
      description: "Section visibility has been changed",
    });
  };

  const handleUpdateContent = (contentId: number, newValue: string) => {
    setContent(prev => prev.map(item =>
      item.id === contentId
        ? { ...item, contentValue: newValue, updatedAt: new Date().toISOString() }
        : item
    ));
  };

  const handleSaveContent = () => {
    toast({
      title: "Content Saved",
      description: "All landing page content has been saved successfully",
    });
  };

  const getContentForSection = (sectionId: number) => {
    return content.filter(item => item.sectionId === sectionId);
  };

  const getImagesForSection = (sectionId: number) => {
    return images.filter(item => item.sectionId === sectionId);
  };

  const getBlocksForSection = (sectionId: number) => {
    return blocks.filter(item => item.sectionId === sectionId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Landing Page Content Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all aspects of your landing page content, images, and layout
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSaveContent} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Text Content
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="blocks" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Content Blocks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Section Management</CardTitle>
              <CardDescription>
                Control which sections appear on your landing page and their order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sections.sort((a, b) => a.displayOrder - b.displayOrder).map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <ArrowUp className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                        <ArrowDown className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{section.sectionName}</h3>
                        <p className="text-sm text-muted-foreground">Key: {section.sectionKey}</p>
                        <p className="text-xs text-muted-foreground">
                          Last updated: {formatDate(section.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={section.isEnabled ? "default" : "secondary"}>
                        Order: {section.displayOrder}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={section.isEnabled}
                          onCheckedChange={() => handleToggleSection(section.id)}
                        />
                        {section.isEnabled ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {sections.filter(s => s.isEnabled).map((section) => {
            const sectionContent = getContentForSection(section.id);
            if (sectionContent.length === 0) return null;

            return (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle>{section.sectionName} - Text Content</CardTitle>
                  <CardDescription>
                    Edit all text content for the {section.sectionName.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {sectionContent.map((item) => (
                      <div key={item.id} className="space-y-2">
                        <Label htmlFor={`content-${item.id}`} className="text-sm font-medium">
                          {item.contentKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Label>
                        <div className="text-xs text-muted-foreground mb-1">
                          {item.placeholderText}
                        </div>
                        {item.contentType === 'text' && item.contentKey.includes('description') ? (
                          <Textarea
                            id={`content-${item.id}`}
                            value={item.contentValue}
                            onChange={(e) => handleUpdateContent(item.id, e.target.value)}
                            placeholder={item.placeholderText}
                            rows={3}
                            className="w-full"
                          />
                        ) : (
                          <Input
                            id={`content-${item.id}`}
                            value={item.contentValue}
                            onChange={(e) => handleUpdateContent(item.id, e.target.value)}
                            placeholder={item.placeholderText}
                            className="w-full"
                          />
                        )}
                        <div className="text-xs text-muted-foreground">
                          Last updated: {formatDate(item.updatedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          {sections.filter(s => s.isEnabled).map((section) => {
            const sectionImages = getImagesForSection(section.id);
            
            return (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle>{section.sectionName} - Images</CardTitle>
                  <CardDescription>
                    Manage images for the {section.sectionName.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sectionImages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No images configured for this section</p>
                      <Button variant="outline" className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sectionImages.map((image) => (
                        <div key={image.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                            {image.imageUrl ? (
                              <img 
                                src={image.imageUrl} 
                                alt={image.altText}
                                className="w-full h-full object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label>Image URL</Label>
                            <Input
                              value={image.imageUrl}
                              onChange={(e) => {
                                setImages(prev => prev.map(img =>
                                  img.id === image.id
                                    ? { ...img, imageUrl: e.target.value, updatedAt: new Date().toISOString() }
                                    : img
                                ));
                              }}
                              placeholder="Enter image URL or upload path"
                            />
                            <Label>Alt Text</Label>
                            <Input
                              value={image.altText}
                              onChange={(e) => {
                                setImages(prev => prev.map(img =>
                                  img.id === image.id
                                    ? { ...img, altText: e.target.value, updatedAt: new Date().toISOString() }
                                    : img
                                ));
                              }}
                              placeholder="Describe the image for accessibility"
                            />
                            <div className="text-xs text-muted-foreground">
                              Key: {image.imageKey} | Updated: {formatDate(image.updatedAt)}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="blocks" className="space-y-6">
          {sections.filter(s => s.isEnabled).map((section) => {
            const sectionBlocks = getBlocksForSection(section.id);
            
            return (
              <Card key={section.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{section.sectionName} - Content Blocks</CardTitle>
                      <CardDescription>
                        Manage repeatable content blocks like service cards, features, etc.
                      </CardDescription>
                    </div>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Block
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {sectionBlocks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No content blocks configured for this section</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sectionBlocks.map((block) => (
                        <div key={block.id} className="p-4 border rounded-lg space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{block.blockType}</Badge>
                              <Switch
                                checked={block.isEnabled}
                                onCheckedChange={(checked) => {
                                  setBlocks(prev => prev.map(b =>
                                    b.id === block.id
                                      ? { ...b, isEnabled: checked, updatedAt: new Date().toISOString() }
                                      : b
                                  ));
                                }}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <ArrowUp className="h-4 w-4 cursor-pointer hover:text-foreground" />
                              <ArrowDown className="h-4 w-4 cursor-pointer hover:text-foreground" />
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Title</Label>
                              <Input
                                value={block.title}
                                onChange={(e) => {
                                  setBlocks(prev => prev.map(b =>
                                    b.id === block.id
                                      ? { ...b, title: e.target.value, updatedAt: new Date().toISOString() }
                                      : b
                                  ));
                                }}
                                placeholder="Block title"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Link URL</Label>
                              <Input
                                value={block.linkUrl}
                                onChange={(e) => {
                                  setBlocks(prev => prev.map(b =>
                                    b.id === block.id
                                      ? { ...b, linkUrl: e.target.value, updatedAt: new Date().toISOString() }
                                      : b
                                  ));
                                }}
                                placeholder="Optional link URL"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={block.description}
                              onChange={(e) => {
                                setBlocks(prev => prev.map(b =>
                                  b.id === block.id
                                    ? { ...b, description: e.target.value, updatedAt: new Date().toISOString() }
                                    : b
                                ));
                              }}
                              placeholder="Block description"
                              rows={2}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Image URL</Label>
                              <Input
                                value={block.imageUrl}
                                onChange={(e) => {
                                  setBlocks(prev => prev.map(b =>
                                    b.id === block.id
                                      ? { ...b, imageUrl: e.target.value, updatedAt: new Date().toISOString() }
                                      : b
                                  ));
                                }}
                                placeholder="Optional image URL"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Link Text</Label>
                              <Input
                                value={block.linkText}
                                onChange={(e) => {
                                  setBlocks(prev => prev.map(b =>
                                    b.id === block.id
                                      ? { ...b, linkText: e.target.value, updatedAt: new Date().toISOString() }
                                      : b
                                  ));
                                }}
                                placeholder="Link button text"
                              />
                            </div>
                          </div>
                          
                          <div className="text-xs text-muted-foreground">
                            Order: {block.displayOrder} | Updated: {formatDate(block.updatedAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}