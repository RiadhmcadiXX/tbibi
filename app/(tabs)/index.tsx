import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ScrollView, RefreshControl, Animated } from 'react-native';
import { useGlobalContext } from '@/context/GlobalProvider';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

// TypeScript interface for Doctor
interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialty: string;
  address: string;
  profile_image_url: string | null;
}

// Specialties data
const specialties = ['All', 'Cardiologist', 'Dermatologist', 'Pediatricia'];

export default function HomeScreen() {
  const { doctors, fetchDoctors } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDoctors();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredDoctors = doctors.filter((doctor: Doctor) => {
    const matchesSearch = 
      doctor.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty = 
      selectedSpecialty === 'All' || 
      doctor.specialty === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  const handleDoctorPress = (doctorId: string) => {
    router.push(`/doctor/${doctorId}`);
  };

  const renderDoctorCard = ({ item: doctor }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.doctorCard}
      onPress={() => handleDoctorPress(doctor.id)}
    >
      <Image
        source={{ uri: doctor.profile_image_url || 'https://lmlgqzzhbiisgmysaoww.supabase.co/storage/v1/object/public/doctor_photos/0.7094615153837702.jpg' }}
        style={styles.doctorImage}
      />
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>
          {doctor.first_name} {doctor.last_name}
        </Text>
        <Text style={styles.specialty}>{doctor.specialty}</Text>
        <Text style={styles.location}>{doctor.address}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>4.5</Text>
          <Text style={styles.price}>${(Math.random() * 200 + 100).toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSpecialtyChip = (specialty: string) => (
    <TouchableOpacity
      key={specialty}
      style={[
        styles.specialtyChip,
        selectedSpecialty === specialty && styles.selectedSpecialtyChip,
      ]}
      onPress={() => setSelectedSpecialty(specialty)}
    >
      <Text
        style={[
          styles.specialtyChipText,
          selectedSpecialty === specialty && styles.selectedSpecialtyChipText,
        ]}
      >
        {specialty}
      </Text>
    </TouchableOpacity>
  );

  const specialtiesHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [80, 0], // Approximate height of specialties container
    extrapolate: 'clamp'
  });

  const specialtiesOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctors, specialties, locations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Animated.View style={[
        styles.specialtiesContainer,
        {
          height: specialtiesHeight,
          opacity: specialtiesOpacity,
          overflow: 'hidden'
        }
      ]}>
        <FlatList
          data={specialties}
          renderItem={({ item }) => renderSpecialtyChip(item)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.specialtiesList}
        />
      </Animated.View>

      <Animated.FlatList
        data={filteredDoctors}
        renderItem={renderDoctorCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.doctorsList}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  specialtiesContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
  },
  specialtiesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  specialtyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    marginRight: 8,
  },
  selectedSpecialtyChip: {
    backgroundColor: '#0CB8B6',
  },
  specialtyChipText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  selectedSpecialtyChipText: {
    color: '#FFFFFF',
  },
  doctorsList: {
    padding: 16,
    gap: 16,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
    marginRight: 12,
  },
  price: {
    fontSize: 16,
    color: '#0CB8B6',
    fontWeight: '600',
  },
}); 