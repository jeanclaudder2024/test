/**
 * صفحة مراقبة قواعد البيانات والتبديل التلقائي
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Activity,
  AlertTriangle,
  Settings
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

interface DatabaseStatus {
  type: string;
  connected: boolean;
  lastChecked: string;
  responseTime: number;
  isActive: boolean;
}

export default function DatabaseMonitor() {
  const queryClient = useQueryClient();

  // جلب حالة قواعد البيانات
  const { data: dbStatus, isLoading } = useQuery({
    queryKey: ["/api/database-status"],
    refetchInterval: 10000, // تحديث كل 10 ثوان
  });

  // إعادة الاتصال بقاعدة البيانات
  const reconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/database-reconnect', {
        method: 'POST'
      });
      if (!response.ok) throw new Error('فشل في إعادة الاتصال');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم إعادة الاتصال بقاعدة البيانات"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/database-status"] });
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إعادة الاتصال",
        variant: "destructive"
      });
    }
  });

  // تبديل قاعدة البيانات يدوياً
  const switchDbMutation = useMutation({
    mutationFn: async (dbType: string) => {
      const response = await fetch('/api/database-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbType })
      });
      if (!response.ok) throw new Error('فشل في التبديل');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم التبديل",
        description: `تم التبديل إلى ${data.dbType}`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/database-status"] });
    }
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>جاري تحميل حالة قواعد البيانات...</span>
        </div>
      </div>
    );
  }

  const databases = dbStatus?.databases || [];
  const activeDb = databases.find((db: DatabaseStatus) => db.isActive);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">مراقب قواعد البيانات</h1>
            <p className="text-gray-600">نظام التبديل التلقائي والاحتياطي</p>
          </div>
        </div>
        
        <Button 
          onClick={() => reconnectMutation.mutate()}
          disabled={reconnectMutation.isPending}
          variant="outline"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${reconnectMutation.isPending ? 'animate-spin' : ''}`} />
          إعادة الاتصال
        </Button>
      </div>

      {/* الحالة العامة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>الحالة العامة</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {databases.filter((db: DatabaseStatus) => db.connected).length}
              </div>
              <div className="text-sm text-gray-600">قواعد بيانات متصلة</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activeDb?.type || 'غير محدد'}
              </div>
              <div className="text-sm text-gray-600">قاعدة البيانات النشطة</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {activeDb?.responseTime || 0}ms
              </div>
              <div className="text-sm text-gray-600">زمن الاستجابة</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تفاصيل قواعد البيانات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {databases.map((database: DatabaseStatus, index: number) => (
          <Card key={index} className={database.isActive ? 'border-green-200 bg-green-50' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className={`w-5 h-5 ${database.connected ? 'text-green-600' : 'text-red-600'}`} />
                  <span className="capitalize">{database.type}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {database.isActive && (
                    <Badge variant="default" className="bg-green-600">
                      نشط
                    </Badge>
                  )}
                  
                  {database.connected ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">الحالة:</span>
                  <div className={`font-medium ${database.connected ? 'text-green-600' : 'text-red-600'}`}>
                    {database.connected ? 'متصل' : 'غير متصل'}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600">آخر فحص:</span>
                  <div className="font-medium">
                    {new Date(database.lastChecked).toLocaleTimeString('ar-SA')}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600">زمن الاستجابة:</span>
                  <div className="font-medium">
                    {database.responseTime}ms
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-600">النوع:</span>
                  <div className="font-medium capitalize">
                    {database.type === 'postgresql' ? 'PostgreSQL' : 
                     database.type === 'mysql' ? 'MySQL' : database.type}
                  </div>
                </div>
              </div>

              {database.connected && !database.isActive && (
                <Button 
                  onClick={() => switchDbMutation.mutate(database.type)}
                  disabled={switchDbMutation.isPending}
                  variant="outline" 
                  size="sm"
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  التبديل إلى هذه القاعدة
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* تحذيرات */}
      {databases.filter((db: DatabaseStatus) => !db.connected).length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            يوجد {databases.filter((db: DatabaseStatus) => !db.connected).length} قاعدة بيانات غير متصلة. 
            النظام سيتبديل تلقائياً في حالة تعطل القاعدة النشطة.
          </AlertDescription>
        </Alert>
      )}

      {/* معلومات النظام */}
      <Card>
        <CardHeader>
          <CardTitle>معلومات النظام</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <h4>كيف يعمل نظام التبديل التلقائي؟</h4>
            <ul>
              <li>النظام يفحص حالة قاعدة البيانات النشطة كل 30 ثانية</li>
              <li>في حالة انقطاع الاتصال، يتم التبديل تلقائياً إلى MySQL</li>
              <li>عند عودة PostgreSQL، يمكن العودة إليها يدوياً أو تلقائياً</li>
              <li>جميع البيانات محفوظة ومتزامنة بين القواعد</li>
            </ul>
            
            <h4>متطلبات MySQL:</h4>
            <ul>
              <li>MYSQL_HOST - عنوان الخادم</li>
              <li>MYSQL_PORT - رقم المنفذ (افتراضي: 3306)</li>
              <li>MYSQL_USER - اسم المستخدم</li>
              <li>MYSQL_PASSWORD - كلمة المرور</li>
              <li>MYSQL_DATABASE - اسم قاعدة البيانات</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}