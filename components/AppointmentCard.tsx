import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { AppointmentWithDoctor } from '@/types';
import { Calendar, Clock, MapPin } from 'lucide-react-native';

interface AppointmentCardProps {
  appointment: AppointmentWithDoctor;
  onCancel: (id: string) => void;
}

export default function AppointmentCard({ appointment, onCancel }: AppointmentCardProps) {
  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Format time from 24h to 12h format
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const meridiem = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${meridiem}`;
  };

  // Get status color
  const getStatusColor = () => {
    switch (appointment.status) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      case 'cancelled':
        return '#F44336';
      case 'completed':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text 
          style={[styles.status, { color: getStatusColor() }]}
        >
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </Text>
      </View>
      
      <View style={styles.doctorInfo}>
        <Image 
          source={{ uri: appointment.doctor.profile_image_url }} 
          style={styles.doctorImage} 
        />
        <View style={styles.doctorDetails}>
          <Text style={styles.doctorName}>{appointment.doctor.first_name} {appointment.doctor.last_name}</Text>
          <Text style={styles.specialty}>{appointment.doctor.specialty}</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Calendar size={18} color="#757575" />
          <Text style={styles.detailText}>{formatDate(appointment.date)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={18} />
          <Text style={styles.detailText}>
            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin size={18} color="#757575" />
          <Text style={styles.detailText}>{appointment.doctor.address}</Text>
        </View>
      </View>
      
      {appointment.status === 'confirmed' && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => onCancel(appointment.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  doctorDetails: {
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
    color: '#0CB8B6',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E9F0',
    marginBottom: 16,
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E5E9F0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
  },
});