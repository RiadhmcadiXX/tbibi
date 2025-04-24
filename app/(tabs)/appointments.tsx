import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, RefreshControl } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { Ionicons } from '@expo/vector-icons';
import { format, isPast, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { COLORS } from '@/constants/colors';
import LoadingSpinner from '@/components/LoadingSpinner';

type TabType = 'upcoming' | 'past';

interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

export default function AppointmentsScreen() {
  const { userData, cancelAppointment, doctors } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [userData]);

  const fetchAppointments = async () => {
    if (!userData) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', userData.id)
        .order('appointment_date', { ascending: true });

      if (fetchError) throw fetchError;
      setAppointments(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentStatus = (appointment: Appointment) => {
    const appointmentDate = parseISO(appointment.appointment_date);
    if (appointment.status === 'cancelled') return 'Cancelled';
    return isPast(appointmentDate) ? 'Completed' : 'Upcoming';
  };

  const filteredAppointments = appointments.filter(appointment => {
    const status = getAppointmentStatus(appointment);
    if (activeTab === 'upcoming') {
      return status === 'Upcoming';
    } else {
      return status === 'Completed' || status === 'Cancelled';
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming':
        return COLORS.primary;
      case 'Completed':
        return '#4CAF50';
      case 'Cancelled':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      const { success, error } = await cancelAppointment(appointmentId);
      
      if (!success) {
        throw new Error(error || 'Failed to cancel appointment');
      }
      
      // Refresh appointments after cancellation
      await fetchAppointments();
      
      Toast.show({
        type: 'success',
        text1: 'Appointment Cancelled',
        text2: 'Your appointment has been successfully cancelled.',
      });
    } catch (err: any) {
      setError(err.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = (appointmentId: string) => {
    // Navigate to doctor selection screen for rescheduling
    router.push('/doctors' as any);
  };

  const renderAppointmentCard = ({ item: appointment }: { item: any }) => {
    const doctor = doctors.find(d => d.id === appointment.doctor_id);
    if (!doctor) return null;

    const status = getAppointmentStatus(appointment);
    const statusColor = getStatusColor(status);

    return (
      <TouchableOpacity
        style={styles.appointmentCard}
        onPress={() => router.push(`/doctor/${doctor.id}`)}
      >
        <Image
          source={{ uri: doctor.profile_image_url || 'https://lmlgqzzhbiisgmysaoww.supabase.co/storage/v1/object/public/doctor_photos/0.7094615153837702.jpg' }}
          style={styles.doctorImage}
        />
        <View style={styles.appointmentInfo}>
          <Text style={styles.doctorName}>Dr. {doctor.first_name} {doctor.last_name}</Text>
          <Text style={styles.specialty}>{doctor.specialty}</Text>
          <View style={styles.appointmentDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {format(parseISO(appointment.appointment_date), 'MMM dd, yyyy')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.detailText}>
                {format(parseISO(`2000-01-01T${appointment.appointment_time}`), 'hh:mm a')}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAppointments();
    } finally {
      setRefreshing(false);
    }
  }, [userData]);

  if (loading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner message="Loading appointments..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchAppointments}
        >
          <Text style={styles.retryButtonText}>Retry now</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
            Past & Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {filteredAppointments.length > 0 ? (
        <FlatList
          data={filteredAppointments}
          renderItem={renderAppointmentCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No {activeTab} appointments</Text>
        </View>
      )}
    </View>
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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  appointmentCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  appointmentInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  appointmentDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});