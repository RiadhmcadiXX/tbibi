// User-related types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  created_at: string;
}

// Doctor-related types
export interface Doctor {
  first_name: string;
  last_name: string;
  id: string;
  specialty: string;
  profile_image_url: string;
  city: string;
  address: string;
  consultation_fee: number;
  description: string;
  experience_years: number;
  rating: number;
  languages: string[];
  created_at: string;
}

// Availability-related types
export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0-6 for Sunday to Saturday
  start_time: string; // Format: HH:MM
  end_time: string; // Format: HH:MM
  duration: number; // Duration in minutes
  is_available: boolean;
}

// Appointment-related types
export interface Appointment {
  id: string;
  user_id: string;
  doctor_id: string;
  date: string; // Format: YYYY-MM-DD
  start_time: string; // Format: HH:MM
  end_time: string; // Format: HH:MM
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
}

// Appointment with doctor information
export interface AppointmentWithDoctor extends Appointment {
  doctor: Doctor;
}

// Time slot for booking
export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Auth form types
export interface AuthForm {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}