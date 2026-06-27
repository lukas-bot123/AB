export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      chapter_members: {
        Row: {
          chapter_id: string;
          created_at: string;
          id: string;
          profile_id: string;
          role: "officer" | "member";
        };
        Insert: {
          chapter_id: string;
          created_at?: string;
          id?: string;
          profile_id: string;
          role: "officer" | "member";
        };
        Update: {
          chapter_id?: string;
          created_at?: string;
          id?: string;
          profile_id?: string;
          role?: "officer" | "member";
        };
        Relationships: [];
      };
      chapters: {
        Row: {
          created_at: string;
          id: string;
          invite_code: string;
          name: string;
          university: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          invite_code: string;
          name: string;
          university?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          invite_code?: string;
          name?: string;
          university?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          chapter_id: string;
          checkin_closes_at: string | null;
          checkin_code: string | null;
          checkin_opens_at: string | null;
          created_at: string;
          created_by: string;
          description: string | null;
          ends_at: string | null;
          id: string;
          is_required: boolean;
          location: string | null;
          starts_at: string;
          title: string;
        };
        Insert: {
          chapter_id: string;
          checkin_closes_at?: string | null;
          checkin_code?: string | null;
          checkin_opens_at?: string | null;
          created_at?: string;
          created_by: string;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          is_required?: boolean;
          location?: string | null;
          starts_at: string;
          title: string;
        };
        Update: {
          chapter_id?: string;
          checkin_closes_at?: string | null;
          checkin_code?: string | null;
          checkin_opens_at?: string | null;
          created_at?: string;
          created_by?: string;
          description?: string | null;
          ends_at?: string | null;
          id?: string;
          is_required?: boolean;
          location?: string | null;
          starts_at?: string;
          title?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name: string;
          id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
        };
        Relationships: [];
      };
      rsvps: {
        Row: {
          created_at: string;
          event_id: string;
          id: string;
          profile_id: string;
          status: "yes" | "no" | "maybe";
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          event_id: string;
          id?: string;
          profile_id: string;
          status: "yes" | "no" | "maybe";
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          event_id?: string;
          id?: string;
          profile_id?: string;
          status?: "yes" | "no" | "maybe";
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_chapter_with_membership: {
        Args: {
          p_invite_code: string;
          p_name: string;
          p_university: string | null;
        };
        Returns: {
          chapter_created_at: string;
          chapter_id: string;
          chapter_name: string;
          invite_code: string;
          membership_created_at: string;
          membership_id: string;
          role: "officer" | "member";
          university: string | null;
        }[];
      };
      is_chapter_member: {
        Args: {
          p_chapter_id: string;
        };
        Returns: boolean;
      };
      is_chapter_officer: {
        Args: {
          p_chapter_id: string;
        };
        Returns: boolean;
      };
      join_chapter_by_invite_code: {
        Args: {
          p_invite_code: string;
        };
        Returns: {
          chapter_created_at: string;
          chapter_id: string;
          chapter_name: string;
          invite_code: string;
          membership_created_at: string;
          membership_id: string;
          role: "officer" | "member";
          university: string | null;
        }[];
      };
      shares_chapter_with_profile: {
        Args: {
          p_profile_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
