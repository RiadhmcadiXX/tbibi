import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, Pressable, SafeAreaView, Platform, StatusBar, RefreshControl } from 'react-native';
import { useLocalSearchParams, router, useRouter, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '@/context/GlobalProvider';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfDay, parseISO } from 'date-fns';
import Toast from 'react-native-toast-message';
import { COLORS } from '@/constants/colors';
import MapView, { Marker } from 'react-native-maps';
import { findNodeHandle } from 'react-native';
import { ReviewBar } from '@/components/ProgressBar';
import ReviewStars from '@/components/StarRatingComponent';


interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  profile_image?: string;
  email: string;
  phone: string;
  address: string;
  bio?: string;
}

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  doctor: Doctor | null;
  selectedDate: string | null;
  selectedTime: string | null;
}

interface Availability {
  id: string;
  doctor_id: string;
  available_date: string;
  available_time: string;
  is_booked: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  doctor,
  selectedDate,
  selectedTime
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Confirm Appointment</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.confirmationText}>
              Are you sure you want to book an appointment with Dr. {doctor?.first_name} {doctor?.last_name}?
            </Text>

            <View style={styles.appointmentDetails}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  {selectedDate && format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  {selectedTime && format(new Date(`2000-01-01T${selectedTime}`), 'h:mm a')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function DoctorProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { userData, fetchDoctorAvailabilities, bookAppointment, doctors } = useGlobalContext();
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfDay(new Date()));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const [aboutPositionY, setAboutPositionY] = useState(0);

  const scrollToAbout = () => {
    scrollViewRef.current?.scrollTo({ y: aboutPositionY, animated: true });
  };


  const reviews = [
    { label: 'Excellent', percent: 75 },
    { label: 'Good', percent: 60 },
    { label: 'Average', percent: 45 },
    { label: 'Poor', percent: 20 },
    { label: 'Terrible', percent: 10 },
  ];

  const doctor = doctors.find(d => d.id === id);
  if (!doctor) return null;

  // Fetch availabilities when date changes
  useEffect(() => {
    const fetchAvailabilities = async () => {
      if (!selectedDate) return;

      setFetchingSlots(true);
      setError(null);
      try {
        // Ensure we're using the date in local timezone
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const { data, error } = await fetchDoctorAvailabilities(id as string, formattedDate);
        if (error) throw new Error(error);
        setAvailabilities(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setFetchingSlots(false);
      }
    };

    fetchAvailabilities();
  }, [selectedDate, id]);

  const formatTimeSlot = (time: string) => {
    try {
      // Ensure the time string is in the correct format (HH:mm:ss)
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      date.setSeconds(0);
      return format(date, 'h:mm a');
    } catch (err) {
      console.error('Error formatting time:', err);
      return time; // Return original time if formatting fails
    }
  };

  const handleDateSelect = (date: Date) => {
    if (isBefore(startOfDay(date), startOfDay(new Date()))) {
      return; // Don't allow selecting past dates
    }
    // Ensure we're using the start of day in local timezone
    setSelectedDate(startOfDay(date));
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const confirmBooking = async () => {
    if (!selectedDate || !selectedTime || !userData) return;

    setShowConfirmationModal(false);
    setLoading(true);
    setError(null);
    try {
      // Ensure we're using the date in local timezone
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const { success, error } = await bookAppointment(
        id as string,
        formattedDate,
        selectedTime
      );

      if (!success && error) {
        throw new Error(error);
      }

      Toast.show({
        type: 'success',
        text1: 'Appointment Booked',
        text2: 'Your appointment has been successfully booked.',
      });

      setSelectedDate(startOfDay(new Date()));
      setSelectedTime(null);
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Refetch doctor availabilities
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const { data, error } = await fetchDoctorAvailabilities(id as string, formattedDate);
      if (error) throw new Error(error);
      setAvailabilities(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }, [selectedDate, id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading doctor details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.replace('/(tabs)' as const)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={{ backgroundColor: COLORS.primary }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doctor Profile</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          ref={scrollViewRef}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          <View style={styles.profileSection}>
            <Image
              source={{ uri: doctor.profile_image_url || 'https://lmlgqzzhbiisgmysaoww.supabase.co/storage/v1/object/public/doctor_photos/0.7094615153837702.jpg' }}
              style={styles.profileImage}
            />
            <Text style={styles.doctorName}>{doctor.first_name} {doctor.last_name}</Text>
            <Text style={styles.specialty}>{doctor.specialty}</Text>
            <Text style={styles.location}>{doctor.address}</Text>

            <View style={styles.ratingContainer}>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingText}>Rating: 4.5</Text>
                <Text style={styles.experienceText}>• 6 yrs exp</Text>
              </View>
            </View>

            <View style={styles.feeContainer}>
              <Text style={styles.feeAmount}>$7937.93</Text>
              <Text style={styles.feeLabel}>Consultation Fee</Text>
            </View>

            <View style={styles.feeContainer}>

              <TouchableOpacity onPress={scrollToAbout} style={styles.moreDetailsWrapper}>
                <View style={styles.moreDetailsButton}>
                  <Ionicons name="chevron-down" size={18} color={COLORS.primary} style={styles.icon} />
                  <Text style={styles.moreDetailsText}>More details</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Appointment Date</Text>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCurrentMonth(prev => subMonths(prev, 1))}>
                <Ionicons name="chevron-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.monthText}>{format(currentMonth, 'MMMM yyyy')}</Text>
              <TouchableOpacity onPress={() => setCurrentMonth(prev => addMonths(prev, 1))}>
                <Ionicons name="chevron-forward" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDaysContainer}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.weekDay}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysContainer}>
              {Array(startOfMonth(currentMonth).getDay()).fill(null).map((_, index) => (
                <View key={`blank-${index}`} style={styles.dayButton} />
              ))}
              {eachDayOfInterval({
                start: startOfMonth(currentMonth),
                end: endOfMonth(currentMonth)
              }).map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[
                      styles.dayButton,
                      isSelected && styles.selectedDay,
                      isPast && styles.pastDay,
                    ]}
                    onPress={() => !isPast && handleDateSelect(date)}
                    disabled={isPast}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.selectedDayText,
                        isToday(date) && styles.todayText,
                        isPast && styles.pastDayText,
                      ]}
                    >
                      {format(date, 'd')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Time Slots</Text>
            {fetchingSlots ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#0CB8B6" />
                <Text style={styles.loadingText}>Loading available slots...</Text>
              </View>
            ) : availabilities.length > 0 ? (
              <View style={styles.timeSlotsContainer}>
                {availabilities
                  .filter(slot => !slot.is_booked)
                  .map((slot) => (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.timeSlot,
                        selectedTime === slot.available_time && styles.selectedTimeSlot,
                      ]}
                      onPress={() => handleTimeSelect(slot.available_time)}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          selectedTime === slot.available_time && styles.selectedTimeSlotText,
                        ]}
                      >
                        {formatTimeSlot(slot.available_time)}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            ) : (
              <View style={styles.noSlotsContainer}>
                <Text style={styles.noSlotsText}>No available time slots for this date.</Text>
                <Text style={styles.selectAnotherText}>Please select another date.</Text>
              </View>
            )}
          </View>

          {selectedDate && selectedTime && (
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => setShowConfirmationModal(true)}
            >
              <Text style={styles.bookButtonText}>Book Appointment</Text>
            </TouchableOpacity>
          )}

          <View style={styles.section} onLayout={(event) => {
            const { y } = event.nativeEvent.layout;
            setAboutPositionY(y);
          }}>

            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              Dr. {doctor.first_name} {doctor.last_name} is a highly qualified {doctor.specialty.toLowerCase()} specialist with 6 years of experience.
            </Text>
          </View>

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 36.7525, // Replace with actual doctor latitude
                longitude: 3.042, // Replace with actual doctor longitude
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{ latitude: 36.7525, longitude: 3.042 }}
                title="Doctor's Clinic"
                description="Test location for doctor"
              />
            </MapView>
          </View>

          {/* <View style={{ marginVertical: 20 }}>
            <ReviewStars />
          </View> */}
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(tabs)' as const)}>
            <Ionicons name="home-outline" size={24} color="#666" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(tabs)/appointments' as const)}>
            <Ionicons name="calendar-outline" size={24} color="#666" />
            <Text style={styles.navText}>Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.replace('/(tabs)/profile' as const)}>
            <Ionicons name="person-outline" size={24} color="#000" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
        </View>

        <ConfirmationModal
          visible={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={confirmBooking}
          doctor={doctor}
          selectedDate={format(selectedDate, 'yyyy-MM-dd')}
          selectedTime={selectedTime}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: -5
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
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0CB8B6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  profileSection: {
    alignItems: 'center',
    backgroundColor: COLORS.primary, // light blue background
    padding: 20,
    borderBottomEndRadius: 40,
    borderBottomStartRadius: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white', // healthcare primary blue
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white', // blue
    marginBottom: 4,
  },
  specialty: {
    fontSize: 16,
    color: 'white', // slate gray
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: 'black', // light slate
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  ratingBox: {
    backgroundColor: '#E8F0FE', // lighter blue box
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 6,
  },
  experienceText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  feeContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  feeAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  feeLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    color: '#666',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },

  dayButton: {
    width: '13.5%', // tighter but consistent spacing
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 12,

  },

  selectedDay: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937', // near-black for visibility
  },

  selectedDayText: {
    color: '#fff',
  },
  noSlotsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noSlotsText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  selectAnotherText: {
    fontSize: 14,
    color: '#999',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.16)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    marginBottom: 25,
  },
  confirmationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  appointmentDetails: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 25,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  pastDay: {
    opacity: 0.5,
  },
  pastDayText: {
    color: '#999',
  },
  todayText: {
    fontWeight: '700',
    color: '#0CB8B6',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 16,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: '#F5F7FA',
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: 14,
    color: '#666',
  },
  selectedTimeSlotText: {
    color: '#FFFFFF',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  bookButton: {
    margin: 20,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  moreDetailsWrapper: {
    alignItems: 'center',
    marginTop: 12,
  },

  moreDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f1f4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
  },

  icon: {
    marginRight: 8,
  },

  moreDetailsText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },

  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },


  mapContainer: {
    height: 220,
    borderRadius: 16,
    margin: 16,
    overflow: 'hidden',
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },

  map: {
    flex: 1,
  },
});