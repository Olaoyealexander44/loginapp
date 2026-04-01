import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginUser } from '../api/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,

    onSuccess: async (data) => {
      console.log('Login success:', data);

      // store token (React Native way)
      await AsyncStorage.setItem('token', data.token);
      
      // Invalidate current user query if it exists
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      // Navigate to the main app (tabs)
      router.replace('/(tabs)');
    },

    onError: (error: any) => {
      console.error('Login failed:', error.response?.data || error.message);
    },
  });
};