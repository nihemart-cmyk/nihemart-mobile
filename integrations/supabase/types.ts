// Minimal Database type for Supabase client generics in this project.
// Replace with your real generated types when you have them (e.g. from supabase-js CLI or pg-to-ts).

export type Json =
   | string
   | number
   | boolean
   | null
   | { [key: string]: Json }
   | Json[];

export type Database = any;
