/**
 * مكون حماية عام لجميع الصفحات - يمنع الوصول بدون تسجيل دخول
 */

import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Home, LogIn } from "lucide-react";

interface AuthProtectionProps {
  children: React.ReactNode;
  requireAuth?: boolean; // إذا كانت الصفحة تتطلب تسجيل دخول
}

export function AuthProtection({ children, requireAuth = true }: AuthProtectionProps) {
  const [_, navigate] = useLocation();
  
  // للآن سنتحقق من وجود معرف المستخدم في localStorage
  // يمكن تطوير هذا لاحقاً ليصبح أكثر تعقيداً
  const isAuthenticated = () => {
    return localStorage.getItem('isLoggedIn') === 'true';
  };

  useEffect(() => {
    // إذا كانت الصفحة تتطلب تسجيل دخول والمستخدم غير مسجل
    if (requireAuth && !isAuthenticated()) {
      // إعادة توجيه إلى صفحة تسجيل الدخول بعد ثانيتين
      const timer = setTimeout(() => {
        navigate('/auth');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [requireAuth, navigate]);

  // إذا كانت الصفحة لا تتطلب حماية، اعرض المحتوى مباشرة
  if (!requireAuth) {
    return <>{children}</>;
  }

  // إذا كان المستخدم مسجل الدخول، اعرض المحتوى
  if (isAuthenticated()) {
    return <>{children}</>;
  }

  // إذا لم يكن مسجل الدخول، اعرض رسالة الحماية
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <Card className="w-full max-w-md border-orange-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-orange-800">تسجيل الدخول مطلوب</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-orange-100 rounded-lg">
            <p className="text-orange-800 font-medium">
              يجب تسجيل الدخول للوصول إلى هذه الصفحة
            </p>
          </div>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p>هذه المنصة محمية وتتطلب تسجيل دخول صحيح.</p>
            <p>سيتم توجيهك تلقائياً إلى صفحة تسجيل الدخول...</p>
          </div>

          <div className="pt-4 space-y-2">
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full"
              variant="default"
            >
              <LogIn className="w-4 h-4 mr-2" />
              تسجيل الدخول الآن
            </Button>
            
            <Button 
              onClick={() => navigate("/")}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              العودة إلى الصفحة الرئيسية
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              🔒 منصة البحرية البترولية - محمية بالكامل
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}