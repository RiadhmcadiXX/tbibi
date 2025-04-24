/*
  # Doctor Appointment Booking Database Schema

  1. New Tables
    - `users` - User profiles
    - `doctors` - Doctor information
    - `doctor_availabilities` - Doctor availability slots
    - `appointments` - Appointment bookings

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  consultation_fee DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  rating DECIMAL(3, 1) NOT NULL,
  languages TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Doctor Availabilities Table
CREATE TABLE IF NOT EXISTS doctor_availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0-6 for Sunday to Saturday
  start_time TEXT NOT NULL, -- Format: HH:MM
  end_time TEXT NOT NULL, -- Format: HH:MM
  duration INTEGER NOT NULL, -- Duration in minutes
  is_available BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- Format: YYYY-MM-DD
  start_time TEXT NOT NULL, -- Format: HH:MM
  end_time TEXT NOT NULL, -- Format: HH:MM
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row-Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Set up RLS policies for Users
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Set up RLS policies for Doctors (public read-only)
CREATE POLICY "Anyone can read doctors"
  ON doctors
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Set up RLS policies for Doctor Availabilities (public read-only)
CREATE POLICY "Anyone can read doctor availabilities"
  ON doctor_availabilities
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Set up RLS policies for Appointments
CREATE POLICY "Users can read own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample data for doctors
INSERT INTO doctors (id, name, specialty, photo_url, city, address, consultation_fee, description, experience_years, rating, languages)
VALUES
  ('7d7c4c9a-7e3b-4b9a-8f1a-b2e3c4d5e6f7', 'Dr. Sarah Johnson', 'Dermatologist', 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg', 'Algiers', '123 Main St, Algiers', 75.00, 'Dr. Sarah Johnson is a board-certified dermatologist with over 10 years of experience treating various skin conditions. She specializes in cosmetic dermatology and skin cancer treatments.', 10, 4.8, ARRAY['English', 'French', 'Arabic']),
  
  ('8e8d5d0a-8f4c-5c0a-9g2b-c3f4e5d6f7g8', 'Dr. Mohammed Ali', 'Cardiologist', 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg', 'Tunis', '456 Heart Ave, Tunis', 120.00, 'Dr. Mohammed Ali is a highly respected cardiologist who has been practicing for 15 years. He focuses on preventive cardiology and treatment of complex heart conditions.', 15, 4.9, ARRAY['Arabic', 'French', 'English']),
  
  ('9f9e6e1b-9g5d-6d1b-0h3c-d4g5f6e7h8i9', 'Dr. Amina Benali', 'Pediatrician', 'https://images.pexels.com/photos/5214959/pexels-photo-5214959.jpeg', 'Algiers', '789 Children St, Algiers', 85.00, 'Dr. Amina Benali is a compassionate pediatrician with 8 years of experience caring for children from newborns to adolescents. She is known for her gentle approach and thorough evaluations.', 8, 4.7, ARRAY['Arabic', 'French']),
  
  ('0g0f7f2c-0h6e-7e2c-1i4d-e5h6g7f8i9j0', 'Dr. Karim Mansour', 'Orthopedic Surgeon', 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg', 'Tunis', '101 Bone Blvd, Tunis', 150.00, 'Dr. Karim Mansour is an orthopedic surgeon specializing in sports injuries and joint replacements. With 12 years of practice, he has helped numerous athletes return to their peak performance.', 12, 4.6, ARRAY['Arabic', 'French', 'English']),
  
  ('1h1g8g3d-1i7f-8f3d-2j5e-f6i7h8g9j0k1', 'Dr. Leila Zidane', 'Psychiatrist', 'https://images.pexels.com/photos/5407206/pexels-photo-5407206.jpeg', 'Algiers', '202 Mind St, Algiers', 110.00, 'Dr. Leila Zidane is a psychiatrist with 14 years of experience treating mental health disorders. She takes a holistic approach to treatment, combining medication management with therapy.', 14, 4.8, ARRAY['Arabic', 'French', 'English']),
  
  ('2i2h9h4e-2j8g-9g4e-3k6f-g7j8i9h0k1l2', 'Dr. Youssef Tounsi', 'Ophthalmologist', 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg', 'Tunis', '303 Vision Ave, Tunis', 95.00, 'Dr. Youssef Tounsi is an ophthalmologist with 9 years of experience diagnosing and treating eye conditions. He specializes in LASIK surgery and cataract treatments.', 9, 4.5, ARRAY['Arabic', 'French']),
  
  ('3j3i0i5f-3k9h-0h5f-4l7g-h8k9j0i1l2m3', 'Dr. Fatima Berrada', 'Gynecologist', 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg', 'Algiers', '404 Women\'s Health Rd, Algiers', 100.00, 'Dr. Fatima Berrada is a gynecologist with 11 years of experience in women\'s health. She specializes in reproductive health, prenatal care, and minimally invasive surgical procedures.', 11, 4.9, ARRAY['Arabic', 'French']),
  
  ('4k4j1j6g-4l0i-1i6g-5m8h-i9l0k1j2m3n4', 'Dr. Hassan Benabdallah', 'Neurologist', 'https://images.pexels.com/photos/5215016/pexels-photo-5215016.jpeg', 'Tunis', '505 Brain Blvd, Tunis', 130.00, 'Dr. Hassan Benabdallah is a neurologist with 16 years of experience treating neurological disorders. He has extensive training in headache disorders, epilepsy, and stroke management.', 16, 4.7, ARRAY['Arabic', 'French', 'English'])
;

-- Insert sample doctor availabilities
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, duration, is_available)
VALUES
  -- Dr. Sarah Johnson's availabilities
  ('7d7c4c9a-7e3b-4b9a-8f1a-b2e3c4d5e6f7', 1, '09:00', '13:00', 30, TRUE),
  ('7d7c4c9a-7e3b-4b9a-8f1a-b2e3c4d5e6f7', 3, '14:00', '18:00', 30, TRUE),
  ('7d7c4c9a-7e3b-4b9a-8f1a-b2e3c4d5e6f7', 5, '10:00', '15:00', 30, TRUE),
  
  -- Dr. Mohammed Ali's availabilities
  ('8e8d5d0a-8f4c-5c0a-9g2b-c3f4e5d6f7g8', 2, '08:00', '12:00', 45, TRUE),
  ('8e8d5d0a-8f4c-5c0a-9g2b-c3f4e5d6f7g8', 4, '13:00', '17:00', 45, TRUE),
  
  -- Dr. Amina Benali's availabilities
  ('9f9e6e1b-9g5d-6d1b-0h3c-d4g5f6e7h8i9', 1, '14:00', '18:00', 30, TRUE),
  ('9f9e6e1b-9g5d-6d1b-0h3c-d4g5f6e7h8i9', 3, '09:00', '13:00', 30, TRUE),
  ('9f9e6e1b-9g5d-6d1b-0h3c-d4g5f6e7h8i9', 5, '10:00', '16:00', 30, TRUE),
  
  -- Dr. Karim Mansour's availabilities
  ('0g0f7f2c-0h6e-7e2c-1i4d-e5h6g7f8i9j0', 2, '09:00', '14:00', 60, TRUE),
  ('0g0f7f2c-0h6e-7e2c-1i4d-e5h6g7f8i9j0', 4, '14:00', '18:00', 60, TRUE),
  
  -- Dr. Leila Zidane's availabilities
  ('1h1g8g3d-1i7f-8f3d-2j5e-f6i7h8g9j0k1', 1, '10:00', '16:00', 45, TRUE),
  ('1h1g8g3d-1i7f-8f3d-2j5e-f6i7h8g9j0k1', 3, '14:00', '18:00', 45, TRUE),
  
  -- Dr. Youssef Tounsi's availabilities
  ('2i2h9h4e-2j8g-9g4e-3k6f-g7j8i9h0k1l2', 2, '08:00', '13:00', 30, TRUE),
  ('2i2h9h4e-2j8g-9g4e-3k6f-g7j8i9h0k1l2', 4, '14:00', '17:00', 30, TRUE),
  ('2i2h9h4e-2j8g-9g4e-3k6f-g7j8i9h0k1l2', 6, '09:00', '12:00', 30, TRUE),
  
  -- Dr. Fatima Berrada's availabilities
  ('3j3i0i5f-3k9h-0h5f-4l7g-h8k9j0i1l2m3', 1, '09:00', '13:00', 45, TRUE),
  ('3j3i0i5f-3k9h-0h5f-4l7g-h8k9j0i1l2m3', 3, '14:00', '18:00', 45, TRUE),
  ('3j3i0i5f-3k9h-0h5f-4l7g-h8k9j0i1l2m3', 5, '10:00', '15:00', 45, TRUE),
  
  -- Dr. Hassan Benabdallah's availabilities
  ('4k4j1j6g-4l0i-1i6g-5m8h-i9l0k1j2m3n4', 2, '10:00', '15:00', 60, TRUE),
  ('4k4j1j6g-4l0i-1i6g-5m8h-i9l0k1j2m3n4', 4, '13:00', '18:00', 60, TRUE)
;