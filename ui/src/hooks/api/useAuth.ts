import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthApi } from '@api/auth.api';
import { ApiClient } from '@api/client';
import { useAuthStore } from '@store/auth.store';
import { SentryLogger } from '@lib/logger/sentry';
import type { AuthResponse, LoginCredentials, RegisterData } from '@/types';


export const useLogin = () => {
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => AuthApi.login(credentials),
    onSuccess: (data: AuthResponse) => {
      setUser(data.user);
      setToken(data.token);
      ApiClient.setAuthToken(data.token);
      SentryLogger.setUser({
        id: data.user.userId,
        email: data.user.email,
        username: data.user.username,
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const { setUser, setToken } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterData) => AuthApi.register(data),
    onSuccess: (data: AuthResponse) => {
      setUser(data.user);
      setToken(data.token);
      ApiClient.setAuthToken(data.token);
      SentryLogger.setUser({
        id: data.user.userId,
        email: data.user.email,
        username: data.user.username,
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: () => AuthApi.logout(),
    onSuccess: () => {
      clearAuth();
      ApiClient.setAuthToken(null);
      SentryLogger.setUser(null);
      queryClient.clear();
    },
  });
};
