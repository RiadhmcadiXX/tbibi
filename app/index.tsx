import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/constants/colors';
import LottieView from 'lottie-react-native';
import { Ionicons } from '@expo/vector-icons';


export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Tabib </Text>
          <Text style={styles.subtitle}>Your personal health companion</Text>
        </View>

        <View style={styles.imageContainer}>
          <LottieView
            source={require('./assets/animations/landing-animation.json')} // your Lottie file
            autoPlay
            loop
            style={styles.image}
          />
        </View>

        <View style={styles.feature}>
          <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
          <Text style={styles.featureText}>Book appointments with top-rated doctors</Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="locate-outline" size={22} color={COLORS.primary} />
          <Text style={styles.featureText}>Find doctors near you by city or specialty</Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
          <Text style={styles.featureText}>Get reminders and real-time appointment updates</Text>
        </View>

        <View style={styles.feature}>
          <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.primary} />
          <Text style={styles.featureText}>Secure and private medical scheduling</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
  },
  image: {
    width: '100%',
    height: 300,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 10
  },
  featureText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 10,
    flex: 1,
  },
  buttons: {
    marginTop: 30,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});