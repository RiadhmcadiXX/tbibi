import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Platform } from 'react-native';
import { Doctor } from '@/types';
import { router } from 'expo-router';
import { MapPin, Star } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const navigateToDoctor = () => {
    router.push(`/doctor/${doctor.id}`);
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={navigateToDoctor}
      activeOpacity={0.7}
    >
      <Image source={{ uri: doctor.profile_image_url || 'https://lmlgqzzhbiisgmysaoww.supabase.co/storage/v1/object/public/doctor_photos/0.7094615153837702.jpg' }}
        style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{doctor.first_name} {doctor.last_name}</Text>
        <Text style={styles.specialty}>{doctor.specialty}</Text>
        
        <View style={styles.row}>
          <MapPin size={14} color="#757575" />
          <Text style={styles.location} numberOfLines={1}>{doctor.city}</Text>
        </View>
        
        <View style={styles.row}>
          <Star size={14} color="#FFB700" fill="#FFB700" />
          {/* <Text style={styles.rating}>{doctor.rating.toFixed(1)}</Text> */}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.fee}>
            ${doctor.consultation_fee}
          </Text>
          <View style={styles.bookButton}>
            <Text style={styles.bookButtonText}>See more</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
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
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 16,
    width: '100%',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 30,
    marginRight: 16,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  rating: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
    marginRight: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  fee: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});