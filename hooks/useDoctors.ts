import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Doctor } from '@/types';

export default function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Fetch all doctors
  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      if (data) {
        setDoctors(data as Doctor[]);
        
        // Extract unique specialties and cities for filters
        const uniqueSpecialties = [...new Set(data.map((doc: Doctor) => doc.specialty))];
        const uniqueCities = [...new Set(data.map((doc: Doctor) => doc.city))];
        
        setSpecialties(uniqueSpecialties);
        setCities(uniqueCities);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single doctor by ID
  const fetchDoctorById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      console.log("Doctor data:", data);

      return data as Doctor;
    } catch (error: any) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Filter doctors by specialty and/or city
  const filterDoctors = async (specialty?: string, city?: string) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('doctors').select('*');

      if (specialty) {
        query = query.eq('specialty', specialty);
      }

      if (city) {
        query = query.eq('city', city);
      }

      const { data, error } = await query.order('name');

      if (error) {
        throw error;
      }

      if (data) {
        setDoctors(data as Doctor[]);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  return {
    doctors,
    loading,
    error,
    specialties,
    cities,
    fetchDoctors,
    fetchDoctorById,
    filterDoctors,
  };
}