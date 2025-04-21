import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  urlOrOptions: string | { 
    url: string; 
    method?: string; 
    body?: any; 
  },
  options?: { 
    method?: string; 
    body?: any; 
  }
): Promise<Response> {
  let url: string;
  let fetchOptions: { 
    method: string; 
    headers: Record<string, string>; 
    body?: string; 
    credentials: RequestCredentials;
  };

  // Handle the new object-based API
  if (typeof urlOrOptions === 'object') {
    url = urlOrOptions.url;
    const method = urlOrOptions.method || 'GET';
    const body = urlOrOptions.body ? JSON.stringify(urlOrOptions.body) : undefined;
    
    fetchOptions = {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body,
      credentials: "include",
    };
  } 
  // Handle the original string-based API (for backward compatibility)
  else {
    url = urlOrOptions;
    const method = options?.method || 'GET';
    const bodyStr = options?.body ? 
      (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : 
      undefined;
    
    fetchOptions = {
      method,
      headers: bodyStr ? { "Content-Type": "application/json" } : {},
      body: bodyStr,
      credentials: "include",
    };
  }

  const res = await fetch(url, fetchOptions);
  await throwIfResNotOk(res);
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
