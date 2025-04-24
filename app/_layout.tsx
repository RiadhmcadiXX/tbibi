import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useGlobalContext, GlobalProvider } from '@/context/GlobalProvider';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutContent() {
  useFrameworkReady();
  const { session, isSessionLoading } = useGlobalContext();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isSessionLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isIndexPage = segments[0] === undefined;
    
    if (!session && !inAuthGroup && !isIndexPage) {
      // Redirect to index page if not authenticated
      router.replace('/');
    } else if (session && inAuthGroup) {
      // Redirect to home if authenticated and trying to access auth screens
      router.replace('/(tabs)/home');
    }
  }, [session, isSessionLoading, segments]);

  if (isSessionLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0CB8B6" />
      </View>
    );
  }

  return (
    <React.Fragment>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="doctor" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
      </Stack>
      <StatusBar style="auto" />
    </React.Fragment>
  );
}

export default function RootLayout() {
  return (
    <GlobalProvider>
      <RootLayoutContent />
    </GlobalProvider>
  );
}