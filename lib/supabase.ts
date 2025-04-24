import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Use environment variables in a real project
const supabaseUrl = 'https://lmlgqzzhbiisgmysaoww.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbGdxenpoYmlpc2dteXNhb3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NzgxMjAsImV4cCI6MjA1NzU1NDEyMH0.vWGssonsYSw0NDR9MMVd_isXWt5u2hQNsXqHRiK7lDo';

// Custom storage adapter that handles large data by splitting it
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      // Try to get the main item
      const mainItem = await SecureStore.getItemAsync(key);
      if (!mainItem) return null;

      // If the item is a reference to chunks, get all chunks
      if (mainItem.startsWith('chunked:')) {
        const chunkCount = parseInt(mainItem.split(':')[1], 10);
        const chunks = await Promise.all(
          Array.from({ length: chunkCount }, (_, i) =>
            SecureStore.getItemAsync(`${key}_chunk_${i}`)
          )
        );
        return chunks.join('');
      }

      return mainItem;
    } catch (error) {
      console.error('Error reading from SecureStore:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // If the value is too large, split it into chunks
      if (value.length > 2000) {
        const chunkSize = 2000;
        const chunks = [];
        for (let i = 0; i < value.length; i += chunkSize) {
          chunks.push(value.slice(i, i + chunkSize));
        }

        // Store chunk count
        await SecureStore.setItemAsync(key, `chunked:${chunks.length}`);

        // Store each chunk
        await Promise.all(
          chunks.map((chunk, index) =>
            SecureStore.setItemAsync(`${key}_chunk_${index}`, chunk)
          )
        );
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Error writing to SecureStore:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      // Get the main item to check if it's chunked
      const mainItem = await SecureStore.getItemAsync(key);
      
      if (mainItem?.startsWith('chunked:')) {
        const chunkCount = parseInt(mainItem.split(':')[1], 10);
        // Remove all chunks
        await Promise.all(
          Array.from({ length: chunkCount }, (_, i) =>
            SecureStore.deleteItemAsync(`${key}_chunk_${i}`)
          )
        );
      }
      
      // Remove the main item
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing from SecureStore:', error);
    }
  },
};

// Fallback to memory storage for web environments
const WebStorage = {
  getItem: (key: string) => {
    if (typeof window !== 'undefined') {
      return Promise.resolve(window.localStorage.getItem(key));
    }
    return Promise.resolve(null);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
    return Promise.resolve();
  },
};

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? WebStorage : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});