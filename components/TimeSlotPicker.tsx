import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { TimeSlot } from '@/types';
import { COLORS } from '@/constants/colors';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

export default function TimeSlotPicker({ 
  slots, 
  selectedSlot, 
  onSelectSlot 
}: TimeSlotPickerProps) {
  
  // Format time from 24h to 12h format
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const meridiem = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${meridiem}`;
  };

  // Group slots by morning, afternoon, evening
  const morningSlots = slots.filter(
    slot => parseInt(slot.startTime.split(':')[0]) < 12
  );
  
  const afternoonSlots = slots.filter(
    slot => parseInt(slot.startTime.split(':')[0]) >= 12 && 
            parseInt(slot.startTime.split(':')[0]) < 17
  );
  
  const eveningSlots = slots.filter(
    slot => parseInt(slot.startTime.split(':')[0]) >= 17
  );

  // Render a time slot group
  const renderSlotGroup = (title: string, groupSlots: TimeSlot[]) => {
    if (groupSlots.length === 0) return null;
    
    return (
      <View style={styles.slotGroup}>
        <Text style={styles.groupTitle}>{title}</Text>
        <View style={styles.slotsContainer}>
          {groupSlots.map(slot => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.slot,
                !slot.isAvailable && styles.disabledSlot,
                selectedSlot?.id === slot.id && styles.selectedSlot
              ]}
              onPress={() => slot.isAvailable && onSelectSlot(slot)}
              disabled={!slot.isAvailable}
              activeOpacity={0.7}
            >
              <Text 
                style={[
                  styles.slotText,
                  !slot.isAvailable && styles.disabledSlotText,
                  selectedSlot?.id === slot.id && styles.selectedSlotText
                ]}
              >
                {formatTime(slot.startTime)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {slots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No available time slots for this date
          </Text>
        </View>
      ) : (
        <>
          {renderSlotGroup('Morning', morningSlots)}
          {renderSlotGroup('Afternoon', afternoonSlots)}
          {renderSlotGroup('Evening', eveningSlots)}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  slotGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slot: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E9F0',
  },
  slotText: {
    fontSize: 14,
    color: '#333',
  },
  disabledSlot: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  disabledSlotText: {
    color: '#BDBDBD',
  },
  selectedSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectedSlotText: {
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
});