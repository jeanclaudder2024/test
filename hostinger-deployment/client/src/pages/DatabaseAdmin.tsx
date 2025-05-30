import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  HardDrive,
  Activity,
  Clock,
  Zap,
  ArrowRight,
  Server
} from 'lucide-react';

interface DatabaseStatus {
  success: boolean;
  status: {
    currentDatabase: 'primary' | 'mysql';
    isFailoverActive: boolean;
    lastHealthCheck: string;
    failoverAttempts: number;
    maxAttempts: number;
  };
  activeDatabase: string;
  testQuery: string;
}

export default function DatabaseAdmin() {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const queryClient = useQueryClient();

  // جلب حالة قاعدة البيانات
  const { data: dbStatus, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/database/status'],
    refetchInterval: 30000, // تحديث كل 30 ثانية
    refetchOnWindowFocus: true
  });

  // تبديل إجباري إلى MySQL
  const forceFailoverMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/database/force-failover', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/database/status'] });
      setLastUpdate(new Date());
    }
  });

  // عودة إجبارية للقاعدة الرئيسية
  const forceRecoveryMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/database/force-recovery', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/database/status'] });
      setLastUpdate(new Date());
    }
  });

  const handleRefresh = () => {
    refetch();
    setLastUpdate(new Date());
  };

  const getStatusBadge = (status: DatabaseStatus) => {
    if (status.status.isFailoverActive) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Failover Active (MySQL)
      </Badge>;
    }
    
    if (status.status.currentDatabase === 'primary') {
      return <Badge variant="default" className="flex items-center gap-1 bg-green-600">
        <CheckCircle className="w-3 h-3" />
        Primary Database
      </Badge>;
    }
    
    return <Badge variant="secondary" className="flex items-center gap-1">
      <Database className="w-3 h-3" />
      MySQL Database
    </Badge>;
  };

  const getHealthStatus = (status: DatabaseStatus) => {
    if (status.testQuery === 'success') {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
        text: 'متصل وعامل',
        variant: 'default' as const
      };
    } else {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
        text: 'مشكلة في الاتصال',
        variant: 'destructive' as const
      };
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2">جاري فحص حالة قاعدة البيانات...</span>
        </div>
      </div>
    );
  }

  if (error || !dbStatus) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            فشل في الاتصال بنظام إدارة قاعدة البيانات. تحقق من اتصال الشبكة.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const healthStatus = getHealthStatus(dbStatus);

  return (
    <div className="p-6 space-y-6">
      {/* العنوان الرئيسي */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-7 h-7 text-blue-600" />
            إدارة قاعدة البيانات
          </h1>
          <p className="text-gray-600 mt-1">
            مراقبة نظام التبديل التلقائي ومتابعة حالة قواعد البيانات
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}
          </span>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
        </div>
      </div>

      {/* حالة قاعدة البيانات الحالية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            حالة النظام الحالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* قاعدة البيانات النشطة */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Server className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">قاعدة البيانات النشطة</p>
                <div className="mt-1">
                  {getStatusBadge(dbStatus)}
                </div>
              </div>
            </div>

            {/* حالة الاتصال */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {healthStatus.icon}
              <div>
                <p className="text-sm text-gray-600">حالة الاتصال</p>
                <p className="font-medium">{healthStatus.text}</p>
              </div>
            </div>

            {/* آخر فحص صحي */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">آخر فحص صحي</p>
                <p className="font-medium">
                  {new Date(dbStatus.status.lastHealthCheck).toLocaleString('ar-SA')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات التبديل التلقائي */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            نظام التبديل التلقائي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* حالة النظام */}
            {dbStatus.status.isFailoverActive && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  نظام التبديل التلقائي نشط! التطبيق يعمل حالياً على قاعدة بيانات MySQL الاحتياطية.
                </AlertDescription>
              </Alert>
            )}

            {!dbStatus.status.isFailoverActive && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  النظام يعمل بشكل طبيعي على قاعدة البيانات الرئيسية.
                </AlertDescription>
              </Alert>
            )}

            {/* إحصائيات التبديل */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">محاولات التبديل</span>
                </div>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {dbStatus.status.failoverAttempts} / {dbStatus.status.maxAttempts}
                </p>
                <p className="text-sm text-gray-600">من الحد الأقصى المسموح</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-green-600" />
                  <span className="font-medium">نوع القاعدة النشطة</span>
                </div>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {dbStatus.status.currentDatabase === 'primary' ? 'PostgreSQL' : 'MySQL'}
                </p>
                <p className="text-sm text-gray-600">قاعدة البيانات المستخدمة حالياً</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* أدوات التحكم */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            أدوات التحكم (للاختبار فقط)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                هذه الأدوات مخصصة للاختبار والصيانة فقط. استخدمها بحذر.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button
                onClick={() => forceFailoverMutation.mutate()}
                disabled={forceFailoverMutation.isPending || dbStatus.status.currentDatabase === 'mysql'}
                variant="destructive"
                className="flex items-center gap-2"
              >
                {forceFailoverMutation.isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
                إجبار التبديل إلى MySQL
              </Button>

              <Button
                onClick={() => forceRecoveryMutation.mutate()}
                disabled={forceRecoveryMutation.isPending || dbStatus.status.currentDatabase === 'primary'}
                variant="default"
                className="flex items-center gap-2"
              >
                {forceRecoveryMutation.isPending && <RefreshCw className="w-4 h-4 animate-spin" />}
                العودة للقاعدة الرئيسية
              </Button>
            </div>

            {/* رسائل النتائج */}
            {forceFailoverMutation.data && (
              <Alert variant={forceFailoverMutation.data.success ? "default" : "destructive"}>
                <AlertDescription>
                  {forceFailoverMutation.data.message}
                </AlertDescription>
              </Alert>
            )}

            {forceRecoveryMutation.data && (
              <Alert variant={forceRecoveryMutation.data.success ? "default" : "destructive"}>
                <AlertDescription>
                  {forceRecoveryMutation.data.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* معلومات تقنية */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">معلومات تقنية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">فترة الفحص الصحي:</span>
              <span className="font-medium">30 ثانية</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">الحد الأقصى لمحاولات التبديل:</span>
              <span className="font-medium">{dbStatus.status.maxAttempts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">نوع قاعدة البيانات الرئيسية:</span>
              <span className="font-medium">PostgreSQL (Neon)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">نوع قاعدة البيانات الاحتياطية:</span>
              <span className="font-medium">MySQL (PlanetScale)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}