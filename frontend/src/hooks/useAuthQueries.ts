import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi,  } from '../services/api';
import {type User} from "@/types/user"
import { authKeys } from '../contexts/AuthContext';

// Хук для получения профиля пользователя
export const useUserProfile = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.getMe,
    select: (data) => data.user,
  });
};

// Хук для проверки авторизации
export const useIsAuthenticated = () => {
  const { data } = useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.getMe,
  });
  
  return data?.authenticated ?? false;
};

// Хук для обновления профиля (пример)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      // Ваш API для обновления профиля
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return response.json();
    },
    onSuccess: (updatedUser) => {
      // Обновляем кэш с новыми данными
      queryClient.setQueryData(authKeys.user(), {
        authenticated: true,
        user: updatedUser,
      });
    },
  });
};
