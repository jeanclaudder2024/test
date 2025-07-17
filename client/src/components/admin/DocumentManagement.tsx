import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  FileCheck, 
  Ship, 
  Building, 
  Shield,
  Search,
  Filter,
  Calendar,
  Users,
  Activity,
  Star,
  Archive
} from 'lucide-react';

// Schema for article template form
const articleTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  category: z.enum(['technical', 'commercial', 'inspection', 'cargo', 'compliance', 'general']),
  prompt: z.string().min(50, 'Prompt must be at least 50 characters').max(2000, 'Prompt too long'),
  isActive: z.boolean().default(true),
  // Access Control Fields
  adminOnly: z.boolean().default(false),
  brokerOnly: z.boolean().default(false),
  basicAccess: z.boolean().default(true),
  professionalAccess: z.boolean().default(true),
  enterpriseAccess: z.boolean().default(true)
});

type ArticleTemplateForm = z.infer<typeof articleTemplateSchema>;

interface ArticleTemplate {
  id: number;
  title: string;
  description: string;
  category: string;
  prompt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  // Access Control Fields
  adminOnly?: boolean;
  brokerOnly?: boolean;
  basicAccess?: boolean;
  professionalAccess?: boolean;
  enterpriseAccess?: boolean;
}

interface GeneratedArticle {
  id: number;
  templateId: number;
  vesselId: number;
  vesselName: string;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  createdBy: number;
  templateTitle: string;
}

const CATEGORY_CONFIG = {
  technical: { label: 'Technical Certificate', icon: FileCheck, color: 'bg-blue-100 text-blue-800' },
  commercial: { label: 'Commercial Analysis', icon: Building, color: 'bg-green-100 text-green-800' },
  inspection: { label: 'Inspection Report', icon: Shield, color: 'bg-orange-100 text-orange-800' },
  cargo: { label: 'Cargo Manifest', icon: Ship, color: 'bg-purple-100 text-purple-800' },
  compliance: { label: 'Compliance Document', icon: FileText, color: 'bg-red-100 text-red-800' },
  general: { label: 'General Document', icon: FileText, color: 'bg-slate-100 text-slate-800' }
};

export default function DocumentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('templates');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ArticleTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch article templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/admin/article-templates'],
    staleTime: 0
  });

  // Fetch generated articles
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['/api/admin/generated-articles'],
    staleTime: 0
  });

  // Form for creating/editing templates
  const form = useForm<ArticleTemplateForm>({
    resolver: zodResolver(articleTemplateSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'technical',
      prompt: '',
      isActive: true,
      adminOnly: false,
      brokerOnly: false,
      basicAccess: true,
      professionalAccess: true,
      enterpriseAccess: true
    }
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: ArticleTemplateForm) => {
      return await apiRequest('POST', '/api/admin/article-templates', data);
    },
    onSuccess: () => {
      toast({
        title: 'Template Created',
        description: 'Article template has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/article-templates'] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Creation Failed',
        description: error.message || 'Failed to create template.',
        variant: 'destructive',
      });
    }
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ArticleTemplateForm }) => {
      return await apiRequest('PUT', `/api/admin/article-templates/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Template Updated',
        description: 'Article template has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/article-templates'] });
      setEditingTemplate(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update template.',
        variant: 'destructive',
      });
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/article-templates/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Template Deleted',
        description: 'Article template has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/article-templates'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete template.',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (data: ArticleTemplateForm) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const handleEdit = (template: ArticleTemplate) => {
    setEditingTemplate(template);
    form.reset({
      title: template.title,
      description: template.description,
      category: template.category as any,
      prompt: template.prompt,
      isActive: template.isActive,
      adminOnly: template.adminOnly || false,
      brokerOnly: template.brokerOnly || false,
      basicAccess: template.basicAccess !== false,
      professionalAccess: template.professionalAccess !== false,
      enterpriseAccess: template.enterpriseAccess !== false
    });
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingTemplate(null);
    form.reset();
  };

  // Filter templates
  const filteredTemplates = templates?.filter((template: ArticleTemplate) => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  // Filter articles
  const filteredArticles = articles?.filter((article: GeneratedArticle) => {
    return article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           article.vesselName.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-900 to-slate-800 bg-clip-text text-transparent">
            Document Management
          </h2>
          <p className="text-slate-600 mt-2">
            Manage document templates and generated documents
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTemplate(null)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Templates</p>
                <p className="text-2xl font-bold">{templates?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active Templates</p>
                <p className="text-2xl font-bold">
                  {templates?.filter((t: ArticleTemplate) => t.isActive).length || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Generated Articles</p>
                <p className="text-2xl font-bold">{articles?.length || 0}</p>
              </div>
              <FileCheck className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total Usage</p>
                <p className="text-2xl font-bold">
                  {templates?.reduce((sum: number, t: ArticleTemplate) => sum + (t.usageCount || 0), 0) || 0}
                </p>
              </div>
              <Star className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Article Templates
          </TabsTrigger>
          <TabsTrigger value="generated" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Generated Articles
          </TabsTrigger>
        </TabsList>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search templates and articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-full mb-4"></div>
                    <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template: ArticleTemplate) => {
                const config = CATEGORY_CONFIG[template.category as keyof typeof CATEGORY_CONFIG];
                const IconComponent = config?.icon || FileText;
                
                return (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-blue-600" />
                          <div>
                            <CardTitle className="text-lg line-clamp-1">{template.title}</CardTitle>
                            <Badge className={`text-xs ${config?.color || 'bg-slate-100 text-slate-800'}`}>
                              {config?.label || template.category}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="line-clamp-2 mb-4">
                        {template.description}
                      </CardDescription>
                      
                      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                        <span>Used {template.usageCount || 0} times</span>
                        <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTemplateMutation.mutate(template.id)}
                          disabled={deleteTemplateMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Generated Articles Tab */}
        <TabsContent value="generated" className="space-y-4">
          {articlesLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4 mb-4"></div>
                    <div className="h-2 bg-slate-200 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article: GeneratedArticle) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Ship className="h-4 w-4 text-blue-600" />
                          <h3 className="font-semibold text-lg">{article.title}</h3>
                        </div>
                        <p className="text-slate-600 mb-3">
                          Vessel: <span className="font-medium">{article.vesselName}</span>
                        </p>
                        <p className="text-sm text-slate-500 mb-3">
                          Template: {article.templateTitle}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.createdAt).toLocaleDateString()}
                          </span>
                          <Badge variant="outline">{article.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Article Template' : 'Create Article Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate 
                ? 'Update the article template details and AI prompt.' 
                : 'Create a new professional article template with custom AI prompts.'
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Technical Safety Certificate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of what this template generates..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This description helps users understand what type of document will be generated.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Generation Prompt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Write a detailed prompt for AI to generate professional maritime documents. Use {vesselName} as placeholder for vessel name..."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This prompt will be sent to AI along with vessel data. Use {'{vesselName}'} as a placeholder for the vessel name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Access Control Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">Template Access Control</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Control which subscription plans can generate documents from this template:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Admin Only Option */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="adminOnly"
                      {...form.register('adminOnly')}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor="adminOnly" className="text-sm font-medium text-red-700">
                      🔒 Admin Only
                    </label>
                  </div>

                  {/* Broker Only Option */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="brokerOnly"
                      {...form.register('brokerOnly')}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor="brokerOnly" className="text-sm font-medium text-orange-700">
                      📈 Broker Members
                    </label>
                  </div>

                  {/* Basic Plan Access */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="basicAccess"
                      {...form.register('basicAccess')}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor="basicAccess" className="text-sm font-medium text-green-700">
                      🧪 Basic Plan
                    </label>
                  </div>

                  {/* Professional Plan Access */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="professionalAccess"
                      {...form.register('professionalAccess')}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor="professionalAccess" className="text-sm font-medium text-blue-700">
                      📈 Professional Plan
                    </label>
                  </div>

                  {/* Enterprise Plan Access */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enterpriseAccess"
                      {...form.register('enterpriseAccess')}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor="enterpriseAccess" className="text-sm font-medium text-purple-700">
                      🏢 Enterprise Plan
                    </label>
                  </div>

                  {/* Active Template */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...form.register('isActive')}
                      className="rounded border-slate-300"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      ✅ Active Template
                    </label>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-blue-600">
                  <p>• <strong>Admin Only:</strong> Only admin users can generate documents</p>
                  <p>• <strong>Broker Members:</strong> Only verified broker members can access</p>
                  <p>• <strong>Plan Access:</strong> Check which subscription plans have access</p>
                </div>
              </div>

              <div className="flex items-center justify-end">
                
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}