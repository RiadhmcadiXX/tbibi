import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { RefreshControl, Animated } from 'react-native';

import { Search, MapPin, Filter } from 'lucide-react-native';
import DoctorCard from '@/components/DoctorCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useGlobalContext } from '@/context/GlobalProvider';
import { COLORS } from '@/constants/colors';

export default function HomeScreen() {
  const { userData, doctors, fetchDoctors } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchDoctors(); // call your data reload method
    } finally {
      setRefreshing(false);
    }
  }, []);


  const scrollY = React.useRef(new Animated.Value(0)).current;

  const filtersHeight = scrollY.interpolate({
    inputRange: [0, 500], // increase from 100 to 200
    outputRange: [180, 0],
    extrapolate: 'clamp',
  });

  const filtersOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const filtersTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });





  useEffect(() => {
    fetchDoctors();
    setLoading(false);
  }, []);

  // Filter doctors based on search and selected filters
  useEffect(() => {
    if (doctors.length > 0) {
      let filtered = [...doctors];

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (doctor) =>
            `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(query) ||
            doctor.specialty.toLowerCase().includes(query) ||
            doctor.city.toLowerCase().includes(query)
        );
      }

      // Apply specialty filter
      if (selectedSpecialty) {
        filtered = filtered.filter(
          (doctor) => doctor.specialty === selectedSpecialty
        );
      }

      // Apply city filter
      if (selectedCity) {
        filtered = filtered.filter(
          (doctor) => doctor.city === selectedCity
        );
      }

      setFilteredDoctors(filtered);
    }
  }, [doctors, searchQuery, selectedSpecialty, selectedCity]);

  // Get unique specialties and cities
  const specialties = Array.from(new Set(doctors.map(doctor => doctor.specialty)));
  const cities = Array.from(new Set(doctors.map(doctor => doctor.city)));

  // Handle specialty selection
  const handleSpecialtySelect = (specialty: string) => {
    if (selectedSpecialty === specialty) {
      setSelectedSpecialty(null);
    } else {
      setSelectedSpecialty(specialty);
    }
  };

  // Handle city selection
  const handleCitySelect = (city: string) => {
    if (selectedCity === city) {
      setSelectedCity(null);
    } else {
      setSelectedCity(city);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty(null);
    setSelectedCity(null);
  };

  if (loading) {
    return <LoadingSpinner message="Finding doctors for you..." />;
  }

  return (
    <View style={styles.container}>
      {/* Welcome Message */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.greetingText}>Hello 👋</Text>
          <Text style={styles.userName}>
            {userData?.first_name} {userData?.last_name}
          </Text>
          <Text style={styles.subText}>Find the best doctors near you</Text>

          <View style={styles.searchBar}>
            <Search size={20} color="#9E9E9E" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors, specialties..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9E9E9E"
            />
          </View>
        </View>
      </View>


      {/* Search Bar */}
      {/* <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9E9E9E" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search doctors, specialties..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9E9E9E"
          />
        </View>

        
        <View style={styles.locationContainer}>
          <MapPin size={18} color="#0CB8B6" />
          <Text style={styles.locationText}>
            {selectedCity || 'All Locations'}
          </Text>
        </View>
      </View> */}


      <Animated.View style={[
        styles.filtersWrapper,
        {
          height: filtersHeight,
          opacity: filtersOpacity,
          transform: [{ translateY: filtersTranslateY }],
          overflow: 'hidden',
        }
      ]}>
        {/* Specialty Filter */}
        <View style={styles.filtersSection}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Specialties</Text>
            {(selectedSpecialty || selectedCity) && (
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.resetText}>Reset All</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.specialtiesContainer}
            contentContainerStyle={styles.specialtiesContent}
          >
            {specialties.map((specialty) => (
              <TouchableOpacity
                key={specialty}
                style={[
                  styles.specialtyChip,
                  selectedSpecialty === specialty && styles.selectedChip,
                ]}
                onPress={() => handleSpecialtySelect(specialty)}
              >
                <Text
                  style={[
                    styles.specialtyText,
                    selectedSpecialty === specialty && styles.selectedChipText,
                  ]}
                >
                  {specialty}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* City Filter */}
        <View style={styles.filtersSection}>
          <Text style={styles.filtersTitle}>Cities</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.citiesContainer}
            contentContainerStyle={styles.citiesContent}
          >
            {cities.map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityChip,
                  selectedCity === city && styles.selectedChip,
                ]}
                onPress={() => handleCitySelect(city)}
              >
                <Text
                  style={[
                    styles.cityText,
                    selectedCity === city && styles.selectedChipText,
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>





      {/* Doctors List */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
        </Text>

        <Animated.FlatList
          data={filteredDoctors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DoctorCard doctor={item} />}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No doctors found matching your criteria.
              </Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={resetFilters}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerContainer: {
    padding: 20,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    height: 250
  },

  headerContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  greetingText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },

  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white', // dark slate
    marginTop: 4,
  },

  subText: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  searchContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F0',
  },
  filtersWrapper: {
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  filtersSection: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 1,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filtersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  resetText: {
    fontSize: 14,
    color: '#F44336',
  },
  specialtiesContainer: {
    flexDirection: 'row',
  },
  specialtiesContent: {
    paddingRight: 16,
  },
  specialtyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E9F0',
  },
  specialtyText: {
    fontSize: 14,
    color: 'black',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: '#0CB8B6',
    padding: 15,
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  citiesContainer: {
    flexDirection: 'row',
  },
  citiesContent: {
    paddingRight: 16,
  },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E9F0',

  },
  cityText: {
    fontSize: 14,
    color: '#333',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
  },
  doctorsList: {
    paddingBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});