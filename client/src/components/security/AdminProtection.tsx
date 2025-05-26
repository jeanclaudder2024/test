/**
 * مكون حماية صفحة الإدارة - يسمح للمديرين فقط بالوصول
 */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, AlertTriangle, Home } from "lucide-react";
import { useLocation } from "wouter";

interface AdminProtectionProps {
  children: React.ReactNode;
}

export function AdminProtection({ children }: AdminProtectionProps) {
  const [_, navigate] = useLocation();
  const [securityCheck, setSecurityCheck] = useState<{
    isAdmin: boolean;
    isAuthenticated: boolean;
    loading: boolean;
  }>({
    isAdmin: false,
    isAuthenticated: false,
    loading: true
  });

  // التحقق من الصلاحيات مع طلب محمي
  const { data: adminCheck, isLoading, error } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    retry: false,
    staleTime: 0, // عدم استخدام cache للتحقق الأمني
    cacheTime: 0,
  });

  useEffect(() => {
    if (!isLoading) {
      if (error) {
        // فشل في التحقق = عدم وجود صلاحيات
        setSecurityCheck({
          isAdmin: false,
          isAuthenticated: false,
          loading: false
        });
      } else if (adminCheck?.success) {
        // نجح التحقق = صلاحيات إدارية صحيحة
        setSecurityCheck({
          isAdmin: true,
          isAuthenticated: true,
          loading: false
        });
      }
    }
  }, [isLoading, error, adminCheck]);

  // عرض شاشة التحميل
  if (securityCheck.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <CardTitle>التحقق من الصلاحيات الإدارية</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-600">
                جارٍ التحقق من صلاحياتك للوصول إلى لوحة الإدارة...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // عرض رسالة منع الوصول
  if (!securityCheck.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-red-800">وصول مرفوض</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-red-800 font-medium">
                لا تملك الصلاحيات اللازمة للوصول إلى لوحة الإدارة
              </p>
            </div>
            
            <div className="text-sm text-gray-600 space-y-2">
              <p>هذه الصفحة محمية ومخصصة للمديرين فقط.</p>
              <p>إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الإدارة.</p>
            </div>

            <div className="pt-4 space-y-2">
              <Button 
                onClick={() => navigate("/")}
                className="w-full"
                variant="default"
              >
                <Home className="w-4 h-4 mr-2" />
                العودة إلى الصفحة الرئيسية
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                إعادة المحاولة
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                🔒 تم تسجيل هذه المحاولة لأغراض الأمان
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // عرض المحتوى الإداري للمديرين المصرح لهم
  return (
    <div className="admin-protected">
      {/* شريط أمان علوي */}
      <div className="bg-green-600 text-white px-4 py-2 text-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>وضع الإدارة المحمي - تم التحقق من الصلاحيات</span>
          </div>
          <div className="text-xs opacity-90">
            الجلسة محمية ومشفرة
          </div>
        </div>
      </div>
      
      {/* المحتوى الإداري */}
      {children}
    </div>
  );
}