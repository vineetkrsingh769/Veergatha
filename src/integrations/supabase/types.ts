export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      award_gazette_leads: {
        Row: {
          award_id: string
          created_at: string
          gazette_ref: string
          id: string
          origin: string
          reason: string
        }
        Insert: {
          award_id: string
          created_at?: string
          gazette_ref: string
          id?: string
          origin: string
          reason: string
        }
        Update: {
          award_id?: string
          created_at?: string
          gazette_ref?: string
          id?: string
          origin?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "award_gazette_leads_award_id_fkey"
            columns: ["award_id"]
            isOneToOne: false
            referencedRelation: "awards"
            referencedColumns: ["id"]
          },
        ]
      }
      awards: {
        Row: {
          citation: string | null
          citation_verbatim: boolean
          created_at: string
          gazette_ref: string | null
          id: string
          martyr_id: string
          name: string
          posthumous: boolean
          year: number | null
        }
        Insert: {
          citation?: string | null
          citation_verbatim?: boolean
          created_at?: string
          gazette_ref?: string | null
          id?: string
          martyr_id: string
          name: string
          posthumous?: boolean
          year?: number | null
        }
        Update: {
          citation?: string | null
          citation_verbatim?: boolean
          created_at?: string
          gazette_ref?: string | null
          id?: string
          martyr_id?: string
          name?: string
          posthumous?: boolean
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "awards_martyr_id_fkey"
            columns: ["martyr_id"]
            isOneToOne: false
            referencedRelation: "martyrs"
            referencedColumns: ["id"]
          },
        ]
      }
      corrections: {
        Row: {
          created_at: string
          details: string
          editor_notes: string | null
          email: string | null
          field: string
          id: string
          record_slug: string | null
          record_type: string
          source_url: string | null
          status: Database["public"]["Enums"]["correction_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          details: string
          editor_notes?: string | null
          email?: string | null
          field?: string
          id?: string
          record_slug?: string | null
          record_type?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string
          editor_notes?: string | null
          email?: string | null
          field?: string
          id?: string
          record_slug?: string | null
          record_type?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["correction_status"]
          updated_at?: string
        }
        Relationships: []
      }
      martyr_memorials: {
        Row: {
          martyr_id: string
          memorial_id: string
        }
        Insert: {
          martyr_id: string
          memorial_id: string
        }
        Update: {
          martyr_id?: string
          memorial_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "martyr_memorials_martyr_id_fkey"
            columns: ["martyr_id"]
            isOneToOne: false
            referencedRelation: "martyrs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "martyr_memorials_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
        ]
      }
      martyrs: {
        Row: {
          biography: string | null
          birth_district: string | null
          birth_state: string | null
          birth_village: string | null
          created_at: string
          date_of_action: string | null
          date_of_birth: string | null
          editor_notes: string | null
          full_name: string
          id: string
          operation: string | null
          place_of_action: string | null
          portrait_media_id: string | null
          rank: string | null
          regiment: string | null
          service_branch: string
          service_number: string | null
          slug: string
          sources: Json
          status: Database["public"]["Enums"]["record_status"]
          unit: string | null
          updated_at: string
          verification: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          war_id: string | null
        }
        Insert: {
          biography?: string | null
          birth_district?: string | null
          birth_state?: string | null
          birth_village?: string | null
          created_at?: string
          date_of_action?: string | null
          date_of_birth?: string | null
          editor_notes?: string | null
          full_name: string
          id?: string
          operation?: string | null
          place_of_action?: string | null
          portrait_media_id?: string | null
          rank?: string | null
          regiment?: string | null
          service_branch?: string
          service_number?: string | null
          slug: string
          sources?: Json
          status: Database["public"]["Enums"]["record_status"]
          unit?: string | null
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          war_id?: string | null
        }
        Update: {
          biography?: string | null
          birth_district?: string | null
          birth_state?: string | null
          birth_village?: string | null
          created_at?: string
          date_of_action?: string | null
          date_of_birth?: string | null
          editor_notes?: string | null
          full_name?: string
          id?: string
          operation?: string | null
          place_of_action?: string | null
          portrait_media_id?: string | null
          rank?: string | null
          regiment?: string | null
          service_branch?: string
          service_number?: string | null
          slug?: string
          sources?: Json
          status?: Database["public"]["Enums"]["record_status"]
          unit?: string | null
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          war_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "martyrs_portrait_media_fk"
            columns: ["portrait_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "martyrs_war_id_fkey"
            columns: ["war_id"]
            isOneToOne: false
            referencedRelation: "wars"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          created_at: string
          credit: string | null
          description: string | null
          height: number | null
          id: string
          kind: string
          license: Database["public"]["Enums"]["media_license"]
          license_detail: string | null
          martyr_id: string | null
          memorial_id: string | null
          source_url: string | null
          storage_path: string | null
          title: string
          updated_at: string
          url: string
          verification: Database["public"]["Enums"]["verification_status"]
          war_id: string | null
          width: number | null
        }
        Insert: {
          created_at?: string
          credit?: string | null
          description?: string | null
          height?: number | null
          id?: string
          kind?: string
          license?: Database["public"]["Enums"]["media_license"]
          license_detail?: string | null
          martyr_id?: string | null
          memorial_id?: string | null
          source_url?: string | null
          storage_path?: string | null
          title: string
          updated_at?: string
          url: string
          verification?: Database["public"]["Enums"]["verification_status"]
          war_id?: string | null
          width?: number | null
        }
        Update: {
          created_at?: string
          credit?: string | null
          description?: string | null
          height?: number | null
          id?: string
          kind?: string
          license?: Database["public"]["Enums"]["media_license"]
          license_detail?: string | null
          martyr_id?: string | null
          memorial_id?: string | null
          source_url?: string | null
          storage_path?: string | null
          title?: string
          updated_at?: string
          url?: string
          verification?: Database["public"]["Enums"]["verification_status"]
          war_id?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_martyr_id_fkey"
            columns: ["martyr_id"]
            isOneToOne: false
            referencedRelation: "martyrs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_memorial_id_fkey"
            columns: ["memorial_id"]
            isOneToOne: false
            referencedRelation: "memorials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_war_id_fkey"
            columns: ["war_id"]
            isOneToOne: false
            referencedRelation: "wars"
            referencedColumns: ["id"]
          },
        ]
      }
      memorials: {
        Row: {
          city: string | null
          coords_approximate: boolean
          created_at: string
          description: string | null
          district: string | null
          editor_notes: string | null
          hero_media_id: string | null
          id: string
          inaugurated_year: number | null
          latitude: number | null
          longitude: number | null
          managed_by: string | null
          name: string
          significance: string | null
          slug: string
          sources: Json
          state: string | null
          updated_at: string
          verification: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
        }
        Insert: {
          city?: string | null
          coords_approximate?: boolean
          created_at?: string
          description?: string | null
          district?: string | null
          editor_notes?: string | null
          hero_media_id?: string | null
          id?: string
          inaugurated_year?: number | null
          latitude?: number | null
          longitude?: number | null
          managed_by?: string | null
          name: string
          significance?: string | null
          slug: string
          sources?: Json
          state?: string | null
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
        }
        Update: {
          city?: string | null
          coords_approximate?: boolean
          created_at?: string
          description?: string | null
          district?: string | null
          editor_notes?: string | null
          hero_media_id?: string | null
          id?: string
          inaugurated_year?: number | null
          latitude?: number | null
          longitude?: number | null
          managed_by?: string | null
          name?: string
          significance?: string | null
          slug?: string
          sources?: Json
          state?: string | null
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memorials_hero_media_fk"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          path: string
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      search_logs: {
        Row: {
          created_at: string
          filters: Json
          id: string
          query: string
          results: number
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          query: string
          results?: number
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          query?: string
          results?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wars: {
        Row: {
          created_at: string
          description: string | null
          editor_notes: string | null
          end_date: string | null
          hero_media_id: string | null
          id: string
          key_events: Json
          name: string
          period_label: string | null
          slug: string
          sources: Json
          start_date: string | null
          summary: string | null
          theatre: string | null
          type: Database["public"]["Enums"]["conflict_type"]
          updated_at: string
          verification: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          editor_notes?: string | null
          end_date?: string | null
          hero_media_id?: string | null
          id?: string
          key_events?: Json
          name: string
          period_label?: string | null
          slug: string
          sources?: Json
          start_date?: string | null
          summary?: string | null
          theatre?: string | null
          type?: Database["public"]["Enums"]["conflict_type"]
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          editor_notes?: string | null
          end_date?: string | null
          hero_media_id?: string | null
          id?: string
          key_events?: Json
          name?: string
          period_label?: string | null
          slug?: string
          sources?: Json
          start_date?: string | null
          summary?: string | null
          theatre?: string | null
          type?: Database["public"]["Enums"]["conflict_type"]
          updated_at?: string
          verification?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wars_hero_media_fk"
            columns: ["hero_media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_editor: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor"
      conflict_type: "war" | "operation" | "counter-insurgency" | "peacekeeping"
      correction_status: "new" | "reviewing" | "resolved" | "rejected"
      media_license:
        | "GODL-India"
        | "CC-BY"
        | "CC-BY-SA"
        | "CC0"
        | "public-domain"
        | "permission-granted"
        | "unverified"
      record_status: "fell-in-action" | "survived"
      verification_status: "draft" | "in-review" | "verified"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor"],
      conflict_type: ["war", "operation", "counter-insurgency", "peacekeeping"],
      correction_status: ["new", "reviewing", "resolved", "rejected"],
      media_license: [
        "GODL-India",
        "CC-BY",
        "CC-BY-SA",
        "CC0",
        "public-domain",
        "permission-granted",
        "unverified",
      ],
      record_status: ["fell-in-action", "survived"],
      verification_status: ["draft", "in-review", "verified"],
    },
  },
} as const
