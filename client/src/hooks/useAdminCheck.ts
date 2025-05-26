/**
 * خطاف للتحقق من الصلاحيات الإدارية
 */

import { useQuery } from "@tanstack/react-query";

export function useAdminCheck() {
  const { data: adminData, isLoading } = useQuery({
    queryKey: ['/api/admin/check'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });

  return {
    isAdmin: adminData?.isAdmin || false,
    isLoading,
    adminData
  };
}