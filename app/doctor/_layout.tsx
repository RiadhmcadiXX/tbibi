import React from 'react';
import { Stack } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function DoctorLayout() {
  useFrameworkReady();

  return (
    <React.Fragment>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="[id]" 
          options={{ 
            headerShown: false,
            title: 'Doctor Details'
          }} 
        />
      </Stack>
    </React.Fragment>
  );
}