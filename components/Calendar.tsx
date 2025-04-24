import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { format, addDays, isSameDay, isBefore, startOfDay } from 'date-fns';

interface CalendarProps {
  onDateSelect: (date: string) => void;
  selectedDate: string | null;
  availabilities?: string[];
}

export default function Calendar({ onDateSelect, selectedDate, availabilities = [] }: CalendarProps) {
  const [currentDate] = useState(new Date());
  const startDate = startOfDay(currentDate);

  // Generate dates for the next 30 days
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = addDays(startDate, i);
    return {
      date,
      formattedDate: format(date, 'yyyy-MM-dd'),
      displayDate: format(date, 'MMM d'),
      dayOfWeek: format(date, 'EEE'),
    };
  });

  const renderDate = ({ item }: { item: typeof dates[0] }) => {
    const isSelected = selectedDate === item.formattedDate;
    console.log(item.formattedDate);
    const isPast = isBefore(item.date, startDate);

    return (
      <TouchableOpacity
        style={[
          styles.dateContainer,
          isSelected && styles.selectedDate,
          isPast && styles.pastDate,
        ]}
        onPress={() => !isPast && onDateSelect(item.formattedDate)}
        disabled={isPast}
      >
        <Text style={[styles.dayText, isPast && styles.pastDateText]}>
          {item.dayOfWeek}
        </Text>
        <Text style={[styles.dateText, isPast && styles.pastDateText]}>
          {item.displayDate}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderAvailability = (time: string) => {
    return (
      <TouchableOpacity
        key={time}
        style={styles.availabilityCard}
      >
        <Text style={styles.availabilityText}>
          {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <FlatList
          data={dates}
          renderItem={renderDate}
          keyExtractor={(item) => item.formattedDate}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />

        {selectedDate && availabilities.length > 0 && (
          <View style={styles.availabilitiesContainer}>
            <Text style={styles.availabilitiesTitle}>Available Times</Text>
            <View style={styles.availabilitiesGrid}>
              {availabilities.map((time, index) => (
                <View
                  key={time}
                  style={[
                    styles.availabilityCard,
                    index % 4 === 3 && styles.lastInRow
                  ]}
                >
                  <Text style={styles.availabilityText}>
                    {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDate: {
    backgroundColor: '#0CB8B6',
  },
  pastDate: {
    backgroundColor: '#F5F5F5',
  },
  dayText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  pastDateText: {
    color: '#999999',
  },
  availabilitiesContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E9F0',
  },
  availabilitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  availabilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  availabilityCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    width: '23%', // tighten slightly to prevent wrap issues
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lastInRow: {
    marginRight: 0,
  },
  availabilityText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
}); 