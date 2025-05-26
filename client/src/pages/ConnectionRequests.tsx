/**
 * صفحة إدارة طلبات التواصل بين الوسطاء والشركات
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Star,
  Calendar,
  Phone,
  Mail,
  Building,
  Ship,
  ArrowRight,
  Filter,
  Search
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface ConnectionRequest {
  id: number;
  brokerId: number;
  companyId: number;
  requestType: string;
  status: string;
  priority: string;
  subject: string;
  message: string;
  requestedServices: string;
  budgetRange: string;
  preferredContactMethod: string;
  adminNotes: string;
  adminResponse: string;
  createdAt: string;
  broker: {
    name: string;
    email: string;
    phone: string;
    company: string;
  };
  company: {
    name: string;
    email: string;
    phone: string;
    website: string;
  };
}

export default function ConnectionRequests() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ConnectionRequest | null>(null);
  const queryClient = useQueryClient();

  // جلب طلبات التواصل
  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/connection-requests", selectedStatus, selectedPriority, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.set("status", selectedStatus);
      if (selectedPriority !== "all") params.set("priority", selectedPriority);
      if (searchTerm) params.set("search", searchTerm);
      
      const response = await fetch(`/api/connection-requests?${params}`);
      return response.json();
    }
  });

  // تحديث حالة الطلب
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status, adminResponse, adminNotes }: {
      id: number;
      status: string;
      adminResponse?: string;
      adminNotes?: string;
    }) => {
      const response = await fetch(`/api/connection-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminResponse, adminNotes })
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تحديث حالة الطلب بنجاح"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/connection-requests"] });
      setSelectedRequest(null);
    }
  });

  // ربط البروكر بالشركة
  const connectMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await fetch(`/api/connection-requests/${requestId}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم الربط",
        description: "تم ربط الوسيط بالشركة بنجاح"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/connection-requests"] });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-blue-100 text-blue-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      case "in_progress": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return <div className="p-6">جاري تحميل طلبات التواصل...</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">طلبات التواصل</h1>
            <p className="text-gray-600">إدارة طلبات التواصل بين الوسطاء والشركات</p>
          </div>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">طلبات معلقة</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {requests?.filter((r: ConnectionRequest) => r.status === 'pending').length || 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">طلبات موافق عليها</p>
                <p className="text-2xl font-bold text-green-600">
                  {requests?.filter((r: ConnectionRequest) => r.status === 'approved').length || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">قيد التنفيذ</p>
                <p className="text-2xl font-bold text-blue-600">
                  {requests?.filter((r: ConnectionRequest) => r.status === 'in_progress').length || 0}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests?.length || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* فلاتر البحث */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="البحث في الطلبات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="approved">موافق عليه</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger>
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأولويات</SelectItem>
                <SelectItem value="urgent">عاجل</SelectItem>
                <SelectItem value="high">عالي</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              فلتر متقدم
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الطلبات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {requests?.map((request: ConnectionRequest) => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{request.subject}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(request.priority)}>
                    {request.priority === 'urgent' ? 'عاجل' :
                     request.priority === 'high' ? 'عالي' :
                     request.priority === 'medium' ? 'متوسط' : 'منخفض'}
                  </Badge>
                  <Badge className={getStatusColor(request.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(request.status)}
                      <span>
                        {request.status === 'pending' ? 'معلق' :
                         request.status === 'approved' ? 'موافق عليه' :
                         request.status === 'rejected' ? 'مرفوض' : 'قيد التنفيذ'}
                      </span>
                    </div>
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* معلومات الوسيط والشركة */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">الوسيط</p>
                  <div className="flex items-center space-x-2">
                    <Ship className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{request.broker?.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">{request.broker?.company}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">الشركة</p>
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{request.company?.name}</span>
                  </div>
                </div>
              </div>

              <ArrowRight className="w-6 h-6 text-gray-400 mx-auto" />

              {/* نوع الطلب */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-600 mb-1">نوع الطلب</p>
                <p className="text-sm">
                  {request.requestType === 'broker_to_company' ? 
                    'وسيط يريد التواصل مع شركة' : 
                    'شركة تريد التواصل مع وسيط'}
                </p>
              </div>

              {/* الرسالة */}
              <div>
                <p className="text-sm text-gray-700 line-clamp-3">{request.message}</p>
              </div>

              {/* معلومات إضافية */}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span>الميزانية: </span>
                  <span className="font-medium">{request.budgetRange || 'غير محدد'}</span>
                </div>
                <div>
                  <span>التواصل المفضل: </span>
                  <span className="font-medium">
                    {request.preferredContactMethod === 'email' ? 'بريد إلكتروني' : 'هاتف'}
                  </span>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-gray-500">
                  {new Date(request.createdAt).toLocaleDateString('ar-SA')}
                </div>

                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        تفاصيل
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>تفاصيل طلب التواصل</DialogTitle>
                      </DialogHeader>
                      {selectedRequest && (
                        <RequestDetailsDialog 
                          request={selectedRequest}
                          onUpdate={updateRequestMutation.mutate}
                          onConnect={connectMutation.mutate}
                        />
                      )}
                    </DialogContent>
                  </Dialog>

                  {request.status === 'pending' && (
                    <>
                      <Button 
                        size="sm"
                        onClick={() => updateRequestMutation.mutate({
                          id: request.id,
                          status: 'approved'
                        })}
                        disabled={updateRequestMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        موافقة
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => updateRequestMutation.mutate({
                          id: request.id,
                          status: 'rejected'
                        })}
                        disabled={updateRequestMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        رفض
                      </Button>
                    </>
                  )}

                  {request.status === 'approved' && (
                    <Button 
                      onClick={() => connectMutation.mutate(request.id)}
                      disabled={connectMutation.isPending}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      ربط
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!requests || requests.length === 0) && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات تواصل</h3>
            <p className="text-gray-500">لم يتم العثور على أي طلبات تواصل بالمعايير المحددة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// مكون تفاصيل الطلب
function RequestDetailsDialog({ 
  request, 
  onUpdate, 
  onConnect 
}: { 
  request: ConnectionRequest;
  onUpdate: any;
  onConnect: any;
}) {
  const [adminResponse, setAdminResponse] = useState(request.adminResponse || "");
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || "");

  return (
    <div className="space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">التفاصيل</TabsTrigger>
          <TabsTrigger value="communication">التواصل</TabsTrigger>
          <TabsTrigger value="admin">إدارة</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* معلومات الوسيط */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Ship className="w-5 h-5 text-blue-600" />
                  <span>معلومات الوسيط</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">الاسم</p>
                  <p className="font-medium">{request.broker?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">الشركة</p>
                  <p className="font-medium">{request.broker?.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                  <p className="font-medium">{request.broker?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">الهاتف</p>
                  <p className="font-medium">{request.broker?.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* معلومات الشركة */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-green-600" />
                  <span>معلومات الشركة</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">اسم الشركة</p>
                  <p className="font-medium">{request.company?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                  <p className="font-medium">{request.company?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">الهاتف</p>
                  <p className="font-medium">{request.company?.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">الموقع الإلكتروني</p>
                  <p className="font-medium">{request.company?.website || 'غير متوفر'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل الطلب */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">الموضوع</p>
                <p className="font-medium">{request.subject}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">الرسالة</p>
                <p className="bg-gray-50 p-3 rounded-lg">{request.message}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">الخدمات المطلوبة</p>
                  <p>{request.requestedServices || 'غير محدد'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">نطاق الميزانية</p>
                  <p>{request.budgetRange || 'غير محدد'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>سجل المراسلات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                لا توجد رسائل بعد
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">رد الإدارة</label>
                <Textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="اكتب رد الإدارة هنا..."
                  rows={4}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">ملاحظات الإدارة</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="ملاحظات داخلية للإدارة..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Button 
                  onClick={() => onUpdate({
                    id: request.id,
                    status: 'approved',
                    adminResponse,
                    adminNotes
                  })}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  موافقة وحفظ
                </Button>
                
                <Button 
                  variant="destructive"
                  onClick={() => onUpdate({
                    id: request.id,
                    status: 'rejected',
                    adminResponse,
                    adminNotes
                  })}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  رفض وحفظ
                </Button>

                {request.status === 'approved' && (
                  <Button 
                    variant="outline"
                    onClick={() => onConnect(request.id)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    ربط الطرفين
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}