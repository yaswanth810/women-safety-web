import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone_number: string | null;
          role: 'user' | 'moderator' | 'admin';
          profile_picture: string | null;
          emergency_contacts: Array<{ name: string; email: string; phone: string }>;
          created_at: string;
          updated_at: string;
        };
      };
      sos_alerts: {
        Row: {
          id: string;
          user_id: string;
          latitude: number;
          longitude: number;
          location_name: string | null;
          status: 'active' | 'resolved' | 'dismissed';
          activated_at: string;
          resolved_at: string | null;
          notes: string | null;
          created_at: string;
        };
      };
      incidents: {
        Row: {
          id: string;
          user_id: string;
          incident_type: string;
          title: string;
          description: string;
          latitude: number | null;
          longitude: number | null;
          location_name: string | null;
          status: 'new' | 'in_progress' | 'resolved';
          is_anonymous: boolean;
          evidence_files: Array<{ name: string; url: string }>;
          created_at: string;
          updated_at: string;
        };
      };
      forum_posts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          upvotes: number;
          created_at: string;
          updated_at: string;
        };
      };
      forum_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
      };
      legal_resources: {
        Row: {
          id: string;
          category: string;
          title: string;
          content: string;
          order: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
