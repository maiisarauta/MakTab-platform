/**
 * Database Configuration for MakTab Platform
 * 
 * IMPORTANT: This file contains commented-out database configuration.
 * Currently, the app uses localStorage for data persistence.
 * Uncomment and configure when ready to integrate with a database.
 */

// =============================================================================
// SUPABASE CONFIGURATION (Recommended for production)
// =============================================================================

/*
import { createClient } from '@supabase/supabase-js';

// Environment variables - add these to your .env file:
// VITE_SUPABASE_URL=your-project-url
// VITE_SUPABASE_ANON_KEY=your-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Tables Schema:
// 
// CREATE TABLE users (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     email VARCHAR(255) UNIQUE NOT NULL,
//     phone VARCHAR(20),
//     name VARCHAR(255) NOT NULL,
//     role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
//     avatar_url TEXT,
//     halaqa VARCHAR(100),
//     teacher_id UUID REFERENCES users(id),
//     settings JSONB DEFAULT '{}',
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
// 
// CREATE TABLE recordings (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//     audio_url TEXT NOT NULL,
//     duration INTEGER NOT NULL,
//     surah_name VARCHAR(100),
//     surah_number INTEGER,
//     type VARCHAR(20) CHECK (type IN ('memorization', 'revision', 'recitation')),
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
// 
// CREATE TABLE practice_logs (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//     date DATE NOT NULL,
//     duration INTEGER NOT NULL,
//     surah_name VARCHAR(100) NOT NULL,
//     surah_number INTEGER NOT NULL,
//     ayah_start INTEGER,
//     ayah_end INTEGER,
//     type VARCHAR(20) NOT NULL,
//     recording_id UUID REFERENCES recordings(id),
//     notes TEXT,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
// 
// CREATE TABLE bookmarks (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//     surah_number INTEGER NOT NULL,
//     surah_name VARCHAR(100) NOT NULL,
//     ayah_number INTEGER NOT NULL,
//     note TEXT,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
// 
// CREATE TABLE notifications (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
//     title VARCHAR(255) NOT NULL,
//     message TEXT NOT NULL,
//     type VARCHAR(20) NOT NULL,
//     read BOOLEAN DEFAULT FALSE,
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
// 
// CREATE TABLE feedback (
//     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//     student_id UUID REFERENCES users(id) ON DELETE CASCADE,
//     teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
//     message TEXT NOT NULL,
//     audio_url TEXT,
//     recording_id UUID REFERENCES recordings(id),
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );
*/

// =============================================================================
// FIREBASE CONFIGURATION (Alternative option)
// =============================================================================

/*
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Environment variables - add these to your .env file:
// VITE_FIREBASE_API_KEY=your-api-key
// VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
// VITE_FIREBASE_PROJECT_ID=your-project-id
// VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
// VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
// VITE_FIREBASE_APP_ID=your-app-id

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Firestore Collections Structure:
// 
// /users/{userId}
//   - email: string
//   - phone: string
//   - name: string
//   - role: 'student' | 'teacher' | 'admin'
//   - avatarUrl: string
//   - halaqa: string
//   - teacherId: string (reference)
//   - settings: { notifications, darkMode, language, prayerReminders }
//   - createdAt: Timestamp
// 
// /users/{userId}/recordings/{recordingId}
//   - audioUrl: string
//   - duration: number
//   - surahName: string
//   - surahNumber: number
//   - type: string
//   - createdAt: Timestamp
// 
// /users/{userId}/practiceLogs/{logId}
//   - date: Timestamp
//   - duration: number
//   - surahName: string
//   - surahNumber: number
//   - ayahStart: number
//   - ayahEnd: number
//   - type: string
//   - recordingId: string (reference)
//   - notes: string
//   - createdAt: Timestamp
// 
// /users/{userId}/bookmarks/{bookmarkId}
//   - surahNumber: number
//   - surahName: string
//   - ayahNumber: number
//   - note: string
//   - createdAt: Timestamp
*/

// =============================================================================
// CURRENT IMPLEMENTATION: LocalStorage
// =============================================================================

// The app currently uses localStorage for data persistence.
// See: src/services/storageService.ts

export const DB_STATUS = 'localStorage' as const;

// Placeholder export to prevent import errors
export const dbConfig = {
    status: DB_STATUS,
    message: 'Using localStorage. Database configuration is prepared but commented out.',
};
