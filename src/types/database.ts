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
      members: {
        Row: {
          id: string;
          auth_user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          status: string;
          note: string | null;
          agreed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          status?: string;
          note?: string | null;
          agreed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          name?: string;
          email?: string;
          phone?: string | null;
          status?: string;
          note?: string | null;
          agreed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      plans: {
        Row: {
          id: string;
          name: string;
          tickets_per_month: number;
          price: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          tickets_per_month: number;
          price?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          tickets_per_month?: number;
          price?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      member_plans: {
        Row: {
          id: string;
          member_id: string;
          plan_id: string;
          status: string;
          started_at: string;
          cancelled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          plan_id: string;
          status?: string;
          started_at: string;
          cancelled_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          plan_id?: string;
          status?: string;
          started_at?: string;
          cancelled_at?: string | null;
          created_at?: string;
        };
      };
      slots: {
        Row: {
          id: string;
          start_at: string;
          end_at: string;
          status: string;
          google_calendar_event_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          start_at: string;
          end_at: string;
          status?: string;
          google_calendar_event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          start_at?: string;
          end_at?: string;
          status?: string;
          google_calendar_event_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          slot_id: string;
          member_id: string | null;
          type: string;
          status: string;
          guest_name: string | null;
          guest_email: string | null;
          guest_note: string | null;
          member_note: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slot_id: string;
          member_id?: string | null;
          type: string;
          status?: string;
          guest_name?: string | null;
          guest_email?: string | null;
          guest_note?: string | null;
          member_note?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slot_id?: string;
          member_id?: string | null;
          type?: string;
          status?: string;
          guest_name?: string | null;
          guest_email?: string | null;
          guest_note?: string | null;
          member_note?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ticket_logs: {
        Row: {
          id: string;
          member_id: string;
          type: string;
          amount: number;
          reason: string | null;
          reservation_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          type: string;
          amount: number;
          reason?: string | null;
          reservation_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          type?: string;
          amount?: number;
          reason?: string | null;
          reservation_id?: string | null;
          created_at?: string;
        };
      };
      member_invitations: {
        Row: {
          id: string;
          email: string;
          token: string;
          status: 'pending' | 'accepted' | 'expired';
          expires_at: string;
          invited_by: string | null;
          accepted_at: string | null;
          member_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          token: string;
          status?: 'pending' | 'accepted' | 'expired';
          expires_at: string;
          invited_by?: string | null;
          accepted_at?: string | null;
          member_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          token?: string;
          status?: 'pending' | 'accepted' | 'expired';
          expires_at?: string;
          invited_by?: string | null;
          accepted_at?: string | null;
          member_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      member_ticket_balance: {
        Row: {
          member_id: string;
          balance: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

// 便利な型エイリアス
export type Member = Database['public']['Tables']['members']['Row'];
export type Plan = Database['public']['Tables']['plans']['Row'];
export type MemberPlan = Database['public']['Tables']['member_plans']['Row'];
export type Slot = Database['public']['Tables']['slots']['Row'];
export type Reservation = Database['public']['Tables']['reservations']['Row'];
export type TicketLog = Database['public']['Tables']['ticket_logs']['Row'];
export type MemberInvitation = Database['public']['Tables']['member_invitations']['Row'];
export type MemberTicketBalance = Database['public']['Views']['member_ticket_balance']['Row'];

// 挿入用の型
export type MemberInsert = Database['public']['Tables']['members']['Insert'];
export type PlanInsert = Database['public']['Tables']['plans']['Insert'];
export type SlotInsert = Database['public']['Tables']['slots']['Insert'];
export type ReservationInsert = Database['public']['Tables']['reservations']['Insert'];
export type TicketLogInsert = Database['public']['Tables']['ticket_logs']['Insert'];
export type MemberInvitationInsert = Database['public']['Tables']['member_invitations']['Insert'];
