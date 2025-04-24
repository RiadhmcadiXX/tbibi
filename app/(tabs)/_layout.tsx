import React from 'react';
import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Home as HomeIcon, Calendar, User } from 'lucide-react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import useAuth from '@/hooks/useAuth';
import Toast from 'react-native-toast-message';
import { COLORS } from '@/constants/colors';

export default function TabLayout() {
  useFrameworkReady();
  const { user } = useAuth();

  return (
    <React.Fragment>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#0CB8B6',
          tabBarInactiveTintColor: '#9E9E9E',
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarStyle: styles.tabBar,
          headerStyle: styles.header,
          headerTitleStyle: styles.headerTitle,
        }}
        initialRouteName="home"
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Find Doctors',
            tabBarLabel: 'Home',
            headerShown: false,
            
            tabBarIcon: ({ color, size }) => (
              <HomeIcon color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="appointments"
          options={{
            title: 'My Appointments',
            tabBarIcon: ({ color, size }) => (
              <Calendar color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'My Profile',
            tabBarIcon: ({ color, size }) => (
              <User color={color} size={size} />
            ),
          }}
        />
      </Tabs>
      <Toast />
    </React.Fragment>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: '#E5E9F0',
    height: 80,
    paddingBottom: 10,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  header: {
    backgroundColor: COLORS.primary,
    shadowOpacity: 0,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});