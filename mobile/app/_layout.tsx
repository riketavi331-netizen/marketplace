import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/store/auth.store';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

export default function RootLayout() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => { init(); }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="product/[id]" options={{ headerShown: true, title: 'Товар', headerBackTitle: '' }} />
          <Stack.Screen name="orders/[id]" options={{ headerShown: true, title: 'Заказ', headerBackTitle: '' }} />
          <Stack.Screen name="store/[id]" options={{ headerShown: true, title: 'Магазин', headerBackTitle: '' }} />
          <Stack.Screen name="auth" options={{ headerShown: true, title: 'Войти', headerBackTitle: '' }} />
          <Stack.Screen name="ai" options={{ headerShown: true, title: 'AI-стилист', headerBackTitle: '' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
