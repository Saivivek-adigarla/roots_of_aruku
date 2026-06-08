const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

// Token management
export const tokenManager = {
  getAccessToken: () => localStorage.getItem('access_token'),
  setAccessToken: (token: string) => localStorage.setItem('access_token', token),
  getRefreshToken: () => localStorage.getItem('refresh_token'),
  setRefreshToken: (token: string) => localStorage.setItem('refresh_token', token),
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// API client with auto token refresh
export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = tokenManager.getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Try to refresh token if 401
    if (response.status === 401) {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            tokenManager.setAccessToken(refreshData.data.accessToken);
            tokenManager.setRefreshToken(refreshData.data.refreshToken);

            // Retry original request
            const retryHeaders: HeadersInit = {
              'Content-Type': 'application/json',
              ...options.headers,
              'Authorization': `Bearer ${refreshData.data.accessToken}`,
            };

            response = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers: retryHeaders,
            });
          } else {
            tokenManager.clear();
          }
        } catch (error) {
          tokenManager.clear();
        }
      } else {
        tokenManager.clear();
      }
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        status: 'error',
        error: data.message || 'An error occurred',
        statusCode: response.status,
      };
    }

    return data;
  } catch (error: any) {
    return {
      status: 'error',
      error: error.message || 'Network error',
      statusCode: 0,
    };
  }
};

// API Endpoints
export const endpoints = {
  // Auth
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refreshToken: '/auth/refresh-token',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },

  // Products
  products: {
    list: '/products',
    detail: (id: string) => `/products/${id}`,
    featured: '/products/featured/list',
    search: '/products/search',
  },

  // Users
  users: {
    profile: '/users/profile',
    addresses: '/users/addresses',
    addressDetail: (id: string) => `/users/addresses/${id}`,
  },

  // Orders
  orders: {
    list: '/orders',
    create: '/orders',
    detail: (id: string) => `/orders/${id}`,
    cancel: (id: string) => `/orders/${id}/cancel`,
  },

  // Admin
  admin: {
    products: {
      create: '/admin/products',
      update: (id: string) => `/admin/products/${id}`,
      delete: (id: string) => `/admin/products/${id}`,
    },
    orders: {
      list: '/admin/orders',
      update: (id: string) => `/admin/orders/${id}`,
    },
    analytics: {
      dashboard: '/admin/analytics/dashboard',
    },
  },
};
