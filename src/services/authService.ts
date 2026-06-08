import { apiClient, endpoints, tokenManager, ApiResponse } from '../config/api.js';
import { User } from '../types';

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    role: 'customer' | 'admin';
  };
  accessToken: string;
  refreshToken: string;
}

const mapApiUserToAppUser = (apiUser: AuthResponse['user']): User => {
  return {
    uid: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    isAdmin: apiUser.role === 'admin',
  };
};

export const authService = {
  // Register with Email & Password
  registerWithEmail: async (
    email: string,
    password: string,
    name: string,
    phone: string
  ): Promise<User> => {
    const response = await apiClient<AuthResponse>(endpoints.auth.register, {
      method: 'POST',
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password,
        name,
        phone,
      }),
    });

    if (response.status === 'error') {
      throw new Error(response.error || 'Registration failed');
    }

    const authData = response.data!;
    tokenManager.setAccessToken(authData.accessToken);
    tokenManager.setRefreshToken(authData.refreshToken);

    return mapApiUserToAppUser(authData.user);
  },

  // Login with Email & Password
  loginWithEmail: async (email: string, password: string): Promise<User> => {
    const response = await apiClient<AuthResponse>(endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password,
      }),
    });

    if (response.status === 'error') {
      throw new Error(response.error || 'Login failed');
    }

    const authData = response.data!;
    tokenManager.setAccessToken(authData.accessToken);
    tokenManager.setRefreshToken(authData.refreshToken);

    return mapApiUserToAppUser(authData.user);
  },

  // Get Current User
  getCurrentUser: async (): Promise<User | null> => {
    const token = tokenManager.getAccessToken();
    if (!token) return null;

    try {
      const response = await apiClient<{ user: AuthResponse['user'] }>(
        endpoints.auth.me,
        {
          method: 'GET',
        }
      );

      if (response.status === 'error' || !response.data) {
        tokenManager.clear();
        return null;
      }

      return mapApiUserToAppUser(response.data.user);
    } catch (error) {
      tokenManager.clear();
      return null;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient(endpoints.auth.logout, {
        method: 'POST',
      });
    } catch (error) {
      // Continue logout even if API call fails
    } finally {
      tokenManager.clear();
    }
  },

  // Forgot Password
  forgotPassword: async (email: string): Promise<void> => {
    const response = await apiClient(endpoints.auth.forgotPassword, {
      method: 'POST',
      body: JSON.stringify({ email: email.toLowerCase().trim() }),
    });

    if (response.status === 'error') {
      throw new Error(response.error || 'Failed to send reset email');
    }
  },

  // Reset Password
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    const response = await apiClient(endpoints.auth.resetPassword, {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });

    if (response.status === 'error') {
      throw new Error(response.error || 'Failed to reset password');
    }
  },

  // Refresh Token (called automatically by apiClient)
  refreshAccessToken: async (): Promise<boolean> => {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await apiClient<{ accessToken: string; refreshToken: string }>(
        endpoints.auth.refreshToken,
        {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (response.status === 'error') {
        tokenManager.clear();
        return false;
      }

      tokenManager.setAccessToken(response.data!.accessToken);
      tokenManager.setRefreshToken(response.data!.refreshToken);
      return true;
    } catch (error) {
      tokenManager.clear();
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },

  // Get stored tokens
  getTokens: () => ({
    accessToken: tokenManager.getAccessToken(),
    refreshToken: tokenManager.getRefreshToken(),
  }),
};
