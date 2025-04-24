import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Appointment, AppointmentWithDoctor, TimeSlot } from '@/types';

export default function useAppointments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get available time slots for a doctor on a specific date
  const getAvailableTimeSlots = async (doctorId: string, date: string) => {
    try {
      setLoading(true);
      setError(null);

      // Get the day of week (0-6) from the date
      const dayOfWeek = new Date(date).getDay();

      // Get doctor's availability for that day
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('doctor_availabilities')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true);

      if (availabilityError) {
        throw availabilityError;
      }

      if (!availabilityData || availabilityData.length === 0) {
        return [];
      }

      // Get booked appointments for that day and doctor
      const { data: bookedData, error: bookedError } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('date', date)
        .not('status', 'eq', 'cancelled');

      if (bookedError) {
        throw bookedError;
      }

      // Generate time slots based on doctor's availability
      const allTimeSlots: TimeSlot[] = [];

      availabilityData.forEach((availability) => {
        const { start_time, end_time, duration } = availability;
        
        // Convert HH:MM to minutes since midnight
        const startMinutes = parseInt(start_time.split(':')[0]) * 60 + 
                            parseInt(start_time.split(':')[1]);
        const endMinutes = parseInt(end_time.split(':')[0]) * 60 + 
                          parseInt(end_time.split(':')[1]);
        
        // Generate slots
        for (let time = startMinutes; time < endMinutes; time += duration) {
          const startHour = Math.floor(time / 60);
          const startMin = time % 60;
          const endHour = Math.floor((time + duration) / 60);
          const endMin = (time + duration) % 60;
          
          const startTimeFormatted = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
          const endTimeFormatted = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
          
          // Check if the slot is already booked
          const isBooked = bookedData ? bookedData.some(
            (booking) => booking.start_time === startTimeFormatted
          ) : false;
          
          allTimeSlots.push({
            id: `${date}-${startTimeFormatted}`,
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
            isAvailable: !isBooked,
          });
        }
      });

      return allTimeSlots;
    } catch (error: any) {
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Book an appointment
  const bookAppointment = async (
    userId: string,
    doctorId: string,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Check if slot is still available (avoid double booking)
      const { data: existingBookings, error: checkError } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('date', date)
        .eq('start_time', startTime)
        .not('status', 'eq', 'cancelled');

      if (checkError) {
        throw checkError;
      }

      if (existingBookings && existingBookings.length > 0) {
        throw new Error('This time slot is no longer available');
      }

      // Create the appointment
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            user_id: userId,
            doctor_id: doctorId,
            date,
            start_time: startTime,
            end_time: endTime,
            status: 'confirmed',
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Appointment;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get user's appointments
  const getUserAppointments = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctors(*)
        `)
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        throw error;
      }

      return data as AppointmentWithDoctor[];
    } catch (error: any) {
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Cancel an appointment
  const cancelAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Appointment;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAvailableTimeSlots,
    bookAppointment,
    getUserAppointments,
    cancelAppointment,
  };
}