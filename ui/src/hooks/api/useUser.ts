import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserApi } from '@api/user.api';
import type { UpdateUserPlanRequest } from '@/types';

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => UserApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUserPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (plan: UpdateUserPlanRequest) => UserApi.updatePlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => UserApi.deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
      localStorage.removeItem('auth_token');
    },
  });
};