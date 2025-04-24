import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { LogOut, ChevronRight, User, Bell, ShieldCheck, CircleHelp as HelpCircle, Settings } from 'lucide-react-native';
import useAuth from '@/hooks/useAuth';
import Button from '@/components/Button';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            const { success, error } = await signOut();
            if (success) {
              router.replace('/(auth)/login');
            } else {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error || 'Failed to sign out',
              });
            }
          },
        },
      ]
    );
  };
  
  // Menu items
  const menuItems = [
    {
      icon: <Bell size={24} color="#0CB8B6" />,
      title: 'Notifications',
      subtitle: 'Configure notification settings',
      onPress: () => {},
    },
    {
      icon: <ShieldCheck size={24} color="#0CB8B6" />,
      title: 'Privacy',
      subtitle: 'Manage your data and privacy settings',
      onPress: () => {},
    },
    {
      icon: <HelpCircle size={24} color="#0CB8B6" />,
      title: 'Help & Support',
      subtitle: 'Contact us or read FAQs',
      onPress: () => {},
    },
    {
      icon: <Settings size={24} color="#0CB8B6" />,
      title: 'Settings',
      subtitle: 'App preferences and settings',
      onPress: () => {},
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* User Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {/* Default avatar or user photo */}
          <View style={styles.avatar}>
            <User size={40} color="#FFFFFF" />
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          {user?.phone_number && (
            <Text style={styles.userPhone}>{user.phone_number}</Text>
          )}
        </View>
        
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
      
      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuIcon}>
              {item.icon}
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <ChevronRight size={20} color="#BDBDBD" />
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Logout Button */}
      <Button
        title="Sign Out"
        onPress={handleSignOut}
        variant="outline"
        style={styles.signOutButton}
        textStyle={styles.signOutButtonText}
      />
      
      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0CB8B6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#757575',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E6F7F7',
  },
  editButtonText: {
    color: '#0CB8B6',
    fontSize: 14,
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E6F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  signOutButton: {
    marginBottom: 24,
  },
  signOutButtonText: {
    color: '#F44336',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
});