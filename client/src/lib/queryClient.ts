import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = getAuthToken();
  // Всегда добавляем Content-Type для всех запросов
  const headers: Record<string, string> = { 
    "Content-Type": "application/json" 
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log(`Sending request to ${url} with token`);
  } else {
    console.log(`Sending request to ${url} without token`);
  }
  
  // Если это запрос на выход, сразу удаляем токен
  if (url === '/api/logout' && method === 'POST') {
    console.log("Logging out - clearing local storage token");
    localStorage.removeItem('auth-token');
    // Обнуляем кэш данных о пользователе
    window.location.href = '/';
    // Полная перезагрузка страницы для сброса всех состояний
    return new Response(JSON.stringify({ success: true }));
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
function getAuthToken(): string | null {
  // Сначала пробуем получить из localStorage (добавлено для авторизации админа)
  const localToken = localStorage.getItem('auth-token');
  if (localToken) {
    return localToken;
  }
  
  // Пробуем получить токен из cookie
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth-token') {
      return value;
    }
  }
  return null;
}

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers
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
