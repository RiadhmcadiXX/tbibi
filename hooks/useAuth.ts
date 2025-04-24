import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { Session } from '@supabase/supabase-js';

export default function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setLoading(true);
        
        if (newSession?.user) {
          // Fetch user profile data
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
          
          if (data && !error) {
            setUser(data as User);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Initialize auth state
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      
      if (initialSession?.user) {
        // Fetch user profile data
        supabase
          .from('users')
          .select('*')
          .eq('id', initialSession.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser(data as User);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    // Cleanup
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });
  
      if (authError) throw authError;
  
      if (authData.user) {
        // 2. Create a record in the patients table
        const { error: patientError } = await supabase
          .from('patients')
          .insert([
            {
              user_id: authData.user.id,
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone || null,
            },
          ]);
  
        if (patientError) throw patientError;
  
        return { success: true, error: null };
      }
  
      return { success: false, error: 'User creation failed.' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  };


  const signUp2 = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email,
              full_name: fullName,
              phone_number: phone || null,
            },
          ]);

        if (profileError) {
          throw profileError;
        }
      }

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };


  const signUpPatient = async (formData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });
  
      if (authError) throw authError;
  
      if (authData.user) {
        // 2. Create a record in the patients table
        const { error: patientError } = await supabase
          .from('patients')
          .insert([
            {
              user_id: authData.user.id,
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone || null,
            },
          ]);
  
        if (patientError) throw patientError;
  
        return { success: true, error: null };
      }
  
      return { success: false, error: 'User creation failed.' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unknown error' };
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log("User signed in");

      

      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
}