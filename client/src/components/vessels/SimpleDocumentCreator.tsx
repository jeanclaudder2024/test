import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Plus, Sparkles, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface Vessel {
  id: number;
  name: string;
  imo: string;
  mmsi: string;
  vesselType: string;
  flag: string;
  built: number | null;
  deadweight: number | null;
  currentLat: string | null;
  currentLng: string | null;
}

interface CreatedDocument {
  id: string;
  title: string;
  description: string;
  content: string;
  createdAt: string;
  vesselId: number;
}

interface SimpleDocumentCreatorProps {
  vessel: Vessel;
}

export default function SimpleDocumentCreator({ vessel }: SimpleDocumentCreatorProps) {
  const [documents, setDocuments] = useState<CreatedDocument[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<CreatedDocument | null>(null);
  const [viewingDocument, setViewingDocument] = useState<CreatedDocument | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  // Load documents from localStorage on component mount
  useEffect(() => {
    const storageKey = `vessel_documents_${vessel.id}`;
    const savedDocuments = localStorage.getItem(storageKey);
    if (savedDocuments) {
      try {
        setDocuments(JSON.parse(savedDocuments));
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    }
  }, [vessel.id]);

  // Save documents to localStorage whenever documents change
  const saveDocuments = (newDocuments: CreatedDocument[]) => {
    const storageKey = `vessel_documents_${vessel.id}`;
    localStorage.setItem(storageKey, JSON.stringify(newDocuments));
    setDocuments(newDocuments);
  };

  const createDocument = () => {
    if (!title.trim() || !description.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide title, description, and content for the document.",
        variant: "destructive"
      });
      return;
    }

    const newDocument: CreatedDocument = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      vesselId: vessel.id
    };

    const updatedDocuments = [...documents, newDocument];
    saveDocuments(updatedDocuments);

    toast({
      title: "Document Generated",
      description: `"${title}" has been generated successfully.`
    });

    // Reset form
    setTitle("");
    setDescription("");
    setContent("");
    setShowCreateDialog(false);
  };

  const updateDocument = () => {
    if (!editingDocument || !title.trim() || !description.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide title, description, and content for the document.",
        variant: "destructive"
      });
      return;
    }

    const updatedDocuments = documents.map(doc => 
      doc.id === editingDocument.id 
        ? { ...doc, title: title.trim(), description: description.trim(), content: content.trim() }
        : doc
    );
    saveDocuments(updatedDocuments);

    toast({
      title: "Document Updated",
      description: `"${title}" has been updated successfully.`
    });

    // Reset form
    setTitle("");
    setDescription("");
    setContent("");
    setEditingDocument(null);
  };

  const deleteDocument = (id: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== id);
    saveDocuments(updatedDocuments);

    toast({
      title: "Document Deleted",
      description: "Document has been deleted successfully."
    });
  };

  const downloadDocument = (document: CreatedDocument) => {
    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${vessel.name}_${document.title.replace(/\s+/g, '_')}.txt`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Document Downloaded",
      description: `"${document.title}" has been downloaded successfully.`
    });
  };

  const startEdit = (document: CreatedDocument) => {
    setEditingDocument(document);
    setTitle(document.title);
    setDescription(document.description);
    setContent(document.content);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setContent("");
    setEditingDocument(null);
    setShowCreateDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FileText className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
        </div>
        <p className="text-gray-600">Get and manage documents for {vessel.name}</p>
      </div>

      {/* Get Document Button */}
      <div>
        <Button 
          onClick={() => setShowCreateDialog(true)} 
          className="w-full"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Get New Document
        </Button>
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Your Documents ({documents.length})
          </h3>
          
          <div className="space-y-4">
            {documents.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{document.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{document.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          {new Date(document.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingDocument(document)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(document)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadDocument(document)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDocument(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Documents Message */}
      {documents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first document to get started with professional articles for {vessel.name}.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Document Dialog */}
      <Dialog open={showCreateDialog || editingDocument !== null} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? 'Edit Document' : 'Create New Document'}
            </DialogTitle>
            <DialogDescription>
              {editingDocument ? 'Modify the existing document details and content' : 'Create a new professional document for this vessel'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title..."
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the document..."
              />
            </div>
            <div>
              <Label htmlFor="content">Document Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your document content here..."
                rows={12}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button 
                onClick={editingDocument ? updateDocument : createDocument} 
                className="flex-1"
              >
                {editingDocument ? 'Update Document' : 'Get Document'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={viewingDocument !== null} onOpenChange={(open) => !open && setViewingDocument(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingDocument?.title}</DialogTitle>
            <DialogDescription>
              View the complete content of this document
            </DialogDescription>
          </DialogHeader>
          {viewingDocument && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">{viewingDocument.description}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {viewingDocument.content}
                </pre>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setViewingDocument(null)}>
                  Close
                </Button>
                <Button onClick={() => downloadDocument(viewingDocument)} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}