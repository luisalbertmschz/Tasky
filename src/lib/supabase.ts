import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas de Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          long_name: string;
          avatar: string;
          role: string;
          department: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          long_name: string;
          avatar?: string;
          role: string;
          department: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          long_name?: string;
          avatar?: string;
          role?: string;
          department?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: 'todo' | 'in-progress' | 'completed' | 'blocked';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          assignee_id: string;
          week_of: string;
          due_date: string;
          estimated_hours: number;
          actual_hours: number;
          progress: number;
          ticket_number?: string;
          tags: string[];
          created_at: string;
          updated_at: string;
          moved_from_week?: string;
          moved_to_week?: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          status?: 'todo' | 'in-progress' | 'completed' | 'blocked';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assignee_id: string;
          week_of: string;
          due_date: string;
          estimated_hours: number;
          actual_hours?: number;
          progress?: number;
          ticket_number?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
          moved_from_week?: string;
          moved_to_week?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: 'todo' | 'in-progress' | 'completed' | 'blocked';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assignee_id?: string;
          week_of?: string;
          due_date?: string;
          estimated_hours?: number;
          actual_hours?: number;
          progress?: number;
          ticket_number?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
          moved_from_week?: string;
          moved_to_week?: string;
        };
      };
      task_comments: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      weekly_task_lists: {
        Row: {
          id: string;
          week_of: string;
          user_id: string;
          status: 'active' | 'completed' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          week_of: string;
          user_id: string;
          status?: 'active' | 'completed' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          week_of?: string;
          user_id?: string;
          status?: 'active' | 'completed' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
