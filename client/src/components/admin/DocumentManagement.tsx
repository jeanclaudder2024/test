import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Filter, FileText, Download, Eye, Calendar, User, Building } from 'lucide-react';

interface Document {
  id: number;
  vesselId?: number;
  vesselName?: string;
  documentType: string;
  title: string;
  description?: string;
  content?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  isRequired: boolean;
  expiryDate?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  tags?: string;
  metadata?: string;
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
}

interface FormData {
  vesselId: string;
  documentType: string;
  title: string;
  description: string;
  content: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  isRequired: boolean;
  expiryDate: string;
  createdBy: string;
  tags: string;
  metadata: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  vesselId: '',
  documentType: '',
  title: '',
  description: '',
  content: '',
  version: '1.0',
  status: 'draft',
  isRequired: false,
  expiryDate: '',
  createdBy: '',
  tags: '',
  metadata: '',
  isActive: true,
};

const documentTypes = [
  { value: 'bill_of_lading', label: 'Bill of Lading' },
  { value: 'cargo_manifest', label: 'Cargo Manifest' },
  { value: 'certificate_of_origin', label: 'Certificate of Origin' },
  { value: 'commercial_invoice', label: 'Commercial Invoice' },
  { value: 'packing_list', label: 'Packing List' },
  { value: 'insurance_certificate', label: 'Insurance Certificate' },
  { value: 'charter_party', label: 'Charter Party Agreement' },
  { value: 'delivery_order', label: 'Delivery Order' },
  { value: 'customs_declaration', label: 'Customs Declaration' },
  { value: 'quality_certificate', label: 'Quality Certificate' },
  { value: 'quantity_certificate', label: 'Quantity Certificate' },
  { value: 'vessel_certificate', label: 'Vessel Certificate' },
  { value: 'crew_manifest', label: 'Crew Manifest' },
  { value: 'port_clearance', label: 'Port Clearance' },
  { value: 'safety_certificate', label: 'Safety Certificate' },
  { value: 'environmental_report', label: 'Environmental Report' },
  { value: 'voyage_report', label: 'Voyage Report' },
  { value: 'inspection_report', label: 'Inspection Report' },
  { value: 'maintenance_log', label: 'Maintenance Log' },
  { value: 'fuel_receipt', label: 'Fuel Receipt' },
  { value: 'other', label: 'Other Document' },
];

export default function DocumentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vesselFilter, setVesselFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [page, setPage] = useState(1);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documentsData, isLoading, error } = useQuery({
    queryKey: ['documents', page, searchTerm, vesselFilter, typeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: searchTerm,
        vessel: vesselFilter,
        type: typeFilter,
        status: statusFilter,
      });
      
      const response = await fetch(`/api/documents?${params}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
  });

  // Fetch vessels for dropdown
  const { data: vesselsData } = useQuery({
    queryKey: ['vessels-for-documents'],
    queryFn: async () => {
      const response = await fetch('/api/vessels?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch vessels');
      return response.json();
    },
  });

  // Create document mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<FormData>) => {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          vesselId: data.vesselId ? parseInt(data.vesselId) : null,
        }),
      });
      if (!response.ok) throw new Error('Failed to create document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsDialogOpen(false);
      setFormData(initialFormData);
      toast({ title: 'Document created successfully', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'Failed to create document', variant: 'destructive' });
    },
  });

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<FormData> }) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          vesselId: data.vesselId ? parseInt(data.vesselId) : null,
        }),
      });
      if (!response.ok) throw new Error('Failed to update document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsDialogOpen(false);
      setEditingDocument(null);
      setFormData(initialFormData);
      toast({ title: 'Document updated successfully', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'Failed to update document', variant: 'destructive' });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Document deleted successfully', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'Failed to delete document', variant: 'destructive' });
    },
  });

  // Generate document mutation
  const generateMutation = useMutation({
    mutationFn: async ({ vesselId, documentType }: { vesselId: number; documentType: string }) => {
      const response = await fetch('/api/vessels/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vesselId, documentType }),
      });
      if (!response.ok) throw new Error('Failed to generate document');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Document generated successfully', variant: 'default' });
    },
    onError: () => {
      toast({ title: 'Failed to generate document', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDocument) {
      updateMutation.mutate({ id: editingDocument.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      vesselId: document.vesselId?.toString() || '',
      documentType: document.documentType,
      title: document.title,
      description: document.description || '',
      content: document.content || '',
      version: document.version,
      status: document.status,
      isRequired: document.isRequired,
      expiryDate: document.expiryDate || '',
      createdBy: document.createdBy,
      tags: document.tags || '',
      metadata: document.metadata || '',
      isActive: document.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingDocument(null);
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type);
    return docType ? docType.label : type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-destructive">Failed to load documents</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Document Management</h2>
          <p className="text-muted-foreground">Manage vessel documents, certificates, and maritime paperwork</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDocument ? 'Edit Document' : 'Create New Document'}</DialogTitle>
              <DialogDescription>
                {editingDocument ? 'Update the document information below.' : 'Add a new document to the system with detailed information.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vesselId">Vessel</Label>
                    <Select value={formData.vesselId} onValueChange={(value) => setFormData({ ...formData, vesselId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vessel (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific vessel</SelectItem>
                        {vesselsData?.data?.map((vessel: any) => (
                          <SelectItem key={vessel.id} value={vessel.id.toString()}>
                            {vessel.name} ({vessel.imo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Document Type *</Label>
                    <Select value={formData.documentType} onValueChange={(value) => setFormData({ ...formData, documentType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Document Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter document title"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      placeholder="1.0"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: 'draft' | 'active' | 'archived') => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="createdBy">Created By</Label>
                    <Input
                      id="createdBy"
                      value={formData.createdBy}
                      onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                      placeholder="Creator name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="maritime, cargo, certificate"
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Document description and purpose..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Document Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Document content or template..."
                    rows={8}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="metadata">Metadata (JSON)</Label>
                  <Textarea
                    id="metadata"
                    value={formData.metadata}
                    onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                    placeholder='{"customField": "value"}'
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isRequired"
                    checked={formData.isRequired}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
                  />
                  <Label htmlFor="isRequired">Required Document</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingDocument ? 'Update' : 'Create'} Document
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vessel-filter">Vessel</Label>
              <Select value={vesselFilter} onValueChange={setVesselFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vessels</SelectItem>
                  <SelectItem value="none">No Vessel</SelectItem>
                  {vesselsData?.data?.slice(0, 20).map((vessel: any) => (
                    <SelectItem key={vessel.id} value={vessel.id.toString()}>
                      {vessel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type-filter">Document Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Actions</Label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setVesselFilter('all');
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setPage(1);
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Documents ({documentsData?.pagination?.total || 0})</span>
            <Badge variant="outline">
              Page {documentsData?.pagination?.page || 1} of {documentsData?.pagination?.totalPages || 1}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Vessel</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentsData?.data?.map((document: Document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{document.title}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">v{document.version}</div>
                          {document.isRequired && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              Required
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {document.vesselName ? (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3 text-slate-500" />
                            <span className="text-sm">{document.vesselName}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No vessel</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getDocumentTypeLabel(document.documentType)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(document.status)}>
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {document.createdBy && (
                            <div className="flex items-center gap-1 text-xs">
                              <User className="h-3 w-3 text-green-500" />
                              {document.createdBy}
                            </div>
                          )}
                          {document.expiryDate && (
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3 text-orange-500" />
                              {new Date(document.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                          {document.tags && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {document.tags.split(',').slice(0, 2).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                              {document.tags.split(',').length > 2 && (
                                <span className="text-xs text-muted-foreground">
                                  +{document.tags.split(',').length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(document)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(document.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {documentsData?.pagination?.totalPages || 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page >= (documentsData?.pagination?.totalPages || 1) || isLoading}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}