import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

export default function AppointmentBooking() {
  const { id, date, time } = useLocalSearchParams();
  const { userData, bookAppointment } = useGlobalContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBookAppointment = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate the appointment date/time
      const appointmentDateTime = new Date(`${date}T${time}`);
      if (appointmentDateTime < new Date()) {
        setError('Cannot book appointments in the past');
        return;
      }

      const { success, error: bookingError } = await bookAppointment(
        id as string,
        date as string,
        time as string
      );

      if (!success) {
        setError(bookingError || 'Failed to book appointment');
        return;
      }

      Alert.alert(
        'Appointment Booked',
        'Your appointment has been successfully scheduled.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/appointments'),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Appointment</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.detailText}>
              {format(new Date(date as string), 'MMMM d, yyyy')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.detailText}>
              {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={styles.detailText}>
              {userData?.first_name} {userData?.last_name}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{userData?.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.detailText}>{userData?.phone || 'Not provided'}</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={20} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.bookButton, loading && styles.bookButtonDisabled]}
          onPress={handleBookAppointment}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.bookButtonText}>Booking...</Text>
          ) : (
            <Text style={styles.bookButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 12,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginLeft: 8,
  },
  bookButton: {
    backgroundColor: '#0CB8B6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 