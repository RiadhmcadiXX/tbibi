import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@/types";
import { Session } from "@supabase/supabase-js";

interface GlobalContextType {
  session: Session | null;
  isSessionLoading: boolean;
  userData: User | null;
  doctors: any[];
  setSession: (session: Session | null) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<{ success: boolean; error: string | null }>;
  registerPatient: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error: string | null }>;
  fetchDoctors: () => Promise<void>;
  fetchDoctorAvailabilities: (doctorId: string, date: string) => Promise<{ data: any[]; error: string | null }>;
  bookAppointment: (
    doctorId: string,
    date: string,
    time: string
  ) => Promise<{ success: boolean; error: string | null }>;
  cancelAppointment: (appointmentId: string) => Promise<{ success: boolean; error?: string }>;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          await fetchUserData(session.user.id);
          await fetchDoctors();
        }
      } catch (error: any) {
        console.error("Error fetching session:", error.message);
      } finally {
        setIsSessionLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await fetchUserData(session.user.id);
        await fetchDoctors();
      } else {
        setUserData(null);
        setDoctors([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user data:", error.message);
        setUserData(null);
        return;
      }

      if (!data) {
        console.log("No user data found for ID:", userId);
        setUserData(null);
        return;
      }

      setUserData(data);
      console.log("User data:", data);
    } catch (error: any) {
      console.error("Error in fetchUserData:", error.message);
      setUserData(null);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDoctors(data || []);
      console.log("Doctors:", data);
    } catch (error: any) {
      console.error("Error fetching doctors:", error.message);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user data returned from signin");

      // 2. Check if the user is a patient
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (patientError) {
        // If not a patient, sign them out
        await supabase.auth.signOut();
        throw new Error("This account is not registered as a patient");
      }

      if (!patientData) {
        // If no patient data found, sign them out
        await supabase.auth.signOut();
        throw new Error("Patient data not found");
      }

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const registerPatient = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      // 1. Check if phone number already exists
      if (phone) {
        const { data: existingPatient, error: checkError } = await supabase
          .from("patients")
          .select("phone")
          .eq("phone", phone)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw checkError;
        }

        if (existingPatient) {
          throw new Error("This phone number is already registered");
        }
      }

      // 2. Sign up the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user data returned from signup");

      // Split full name into first and last name
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      // 3. Create patient record in the patients table
      const { error: patientError } = await supabase
        .from("patients")
        .insert([
          {
            user_id: authData.user.id,
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            created_at: new Date().toISOString(),
          },
        ]);

      if (patientError) {
        // If patient creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw patientError;
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error("Error in registerPatient:", error.message);
      return { success: false, error: error.message };
    }
  };

  const fetchDoctorAvailabilities = async (doctorId: string, date: string) => {
    try {
      const { data, error } = await supabase
        .from('doctor_availabilities')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('available_date', date)
        .order('available_time', { ascending: true });

      if (error) throw error;

      // Get all booked appointments for this doctor on this date
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', date)
        .in('status', ['scheduled', 'confirmed']);

      if (appointmentsError) throw appointmentsError;

      // Create a set of booked times for quick lookup
      const bookedTimes = new Set(appointments?.map(apt => apt.appointment_time) || []);

      // Return availabilities with is_booked flag
      return {
        data: data?.map(availability => ({
          ...availability,
          is_booked: bookedTimes.has(availability.available_time) || availability.is_booked
        })) || [],
        error: null
      };
    } catch (error: any) {
      console.error('Error fetching doctor availabilities:', error);
      return { data: [], error: error.message };
    }
  };

  const bookAppointment = async (
    doctorId: string,
    date: string,
    time: string
  ): Promise<{ success: boolean; error: string | null }> => {
    try {
      if (!userData) {
        return { success: false, error: 'User not authenticated' };
      }

      // 1. Check if the appointment is in the past
      const appointmentDateTime = new Date(`${date}T${time}`);
      if (appointmentDateTime < new Date()) {
        return { success: false, error: 'Cannot book appointments in the past' };
      }

      // 2. Check if the doctor is available at this time
      const { data: availability, error: availabilityError } = await supabase
        .from('doctor_availabilities')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('available_date', date)
        .eq('available_time', time)
        .eq('is_booked', false)
        .single();

      if (availabilityError || !availability) {
        return { success: false, error: 'This time slot is not available' };
      }

      // 3. Check for overlapping appointments
      const { data: existingAppointments, error: overlapError } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', date)
        .eq('appointment_time', time)
        .in('status', ['scheduled', 'confirmed']);

      if (overlapError) {
        return { success: false, error: 'Error checking for overlapping appointments' };
      }

      if (existingAppointments && existingAppointments.length > 0) {
        return { success: false, error: 'This time slot is already booked' };
      }

      // 4. Check for patient's existing appointments
      const { data: patientAppointments, error: patientError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', userData.id)
        .eq('doctor_id', doctorId)
        .eq('appointment_date', date)
        .in('status', ['scheduled', 'confirmed']);

      if (patientError) {
        return { success: false, error: 'Error checking patient appointments' };
      }

      if (patientAppointments && patientAppointments.length > 0) {
        return { success: false, error: 'You already have an appointment with this doctor on this date' };
      }

      // 5. Create the appointment
      const { error: insertError } = await supabase
        .from('appointments')
        .insert([
          {
            patient_id: userData.id,
            doctor_id: doctorId,
            appointment_date: date,
            appointment_time: time,
            status: 'scheduled',
            created_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        return { success: false, error: 'Failed to book appointment' };
      }

      // 6. Update the availability to mark it as booked
      const { error: updateError } = await supabase
        .from('doctor_availabilities')
        .update({ is_booked: true })
        .eq('id', availability.id);

      if (updateError) {
        // If we fail to update availability, we should rollback the appointment
        await supabase
          .from('appointments')
          .delete()
          .eq('patient_id', userData.id)
          .eq('doctor_id', doctorId)
          .eq('appointment_date', date)
          .eq('appointment_time', time);
        
        return { success: false, error: 'Failed to update doctor availability. Please try again.' };
      }

      return { success: true, error: null };
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      return { success: false, error: error.message };
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error cancelling appointment:', error.message);
      return { success: false, error: error.message };
    }
  };

  return (
    <GlobalContext.Provider 
      value={{ 
        session, 
        isSessionLoading, 
        userData, 
        doctors,
        setSession,
        signIn,
        signOut,
        registerPatient,
        fetchDoctors,
        fetchDoctorAvailabilities,
        bookAppointment,
        cancelAppointment,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};

export default GlobalProvider; 