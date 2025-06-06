import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["auth", "user"],
    retry: false,
    staleTime: 30 * 60 * 1000, // 30 minutes - longer cache for OAuth
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    enabled: true,
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (response.status === 401) {
          return null;
        }
        
        if (!response.ok) {
          return null;
        }
        
        const userData = await response.json();
        return userData;
      } catch (error) {
        console.error("Auth check failed:", error);
        return null;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      return await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      return await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/auth/logout", {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.clear();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isTrialExpired: user ? new Date() > new Date(user.trialEndDate || 0) : false,
    hasActiveSubscription: user?.subscriptionStatus === "active",
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
  };
}