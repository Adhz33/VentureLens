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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      data_sources: {
        Row: {
          content: string | null
          created_at: string
          id: string
          metadata: Json | null
          source_type: Database["public"]["Enums"]["source_type"]
          title: string | null
          updated_at: string
          url: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          source_type?: Database["public"]["Enums"]["source_type"]
          title?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          source_type?: Database["public"]["Enums"]["source_type"]
          title?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      embeddings: {
        Row: {
          chunk_index: number
          content_chunk: string
          created_at: string
          embedding_data: Json | null
          id: string
          metadata: Json | null
          source_id: string | null
        }
        Insert: {
          chunk_index?: number
          content_chunk: string
          created_at?: string
          embedding_data?: Json | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
        }
        Update: {
          chunk_index?: number
          content_chunk?: string
          created_at?: string
          embedding_data?: Json | null
          id?: string
          metadata?: Json | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "embeddings_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_data: {
        Row: {
          created_at: string
          funding_amount: number | null
          funding_date: string | null
          funding_round: string | null
          id: string
          investor_name: string | null
          location: string | null
          metadata: Json | null
          sector: string | null
          source_id: string | null
          startup_name: string
        }
        Insert: {
          created_at?: string
          funding_amount?: number | null
          funding_date?: string | null
          funding_round?: string | null
          id?: string
          investor_name?: string | null
          location?: string | null
          metadata?: Json | null
          sector?: string | null
          source_id?: string | null
          startup_name: string
        }
        Update: {
          created_at?: string
          funding_amount?: number | null
          funding_date?: string | null
          funding_round?: string | null
          id?: string
          investor_name?: string | null
          location?: string | null
          metadata?: Json | null
          sector?: string | null
          source_id?: string | null
          startup_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_data_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      investors: {
        Row: {
          created_at: string
          id: string
          investor_type: string | null
          location: string | null
          metadata: Json | null
          name: string
          notable_investments: string[] | null
          portfolio_focus: string[] | null
          total_investments: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          investor_type?: string | null
          location?: string | null
          metadata?: Json | null
          name: string
          notable_investments?: string[] | null
          portfolio_focus?: string[] | null
          total_investments?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          investor_type?: string | null
          location?: string | null
          metadata?: Json | null
          name?: string
          notable_investments?: string[] | null
          portfolio_focus?: string[] | null
          total_investments?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      policies: {
        Row: {
          application_process: string | null
          benefits: string | null
          created_at: string
          deadline: string | null
          description: string | null
          eligibility_criteria: string | null
          id: string
          issuing_body: string | null
          metadata: Json | null
          policy_name: string
          source_url: string | null
        }
        Insert: {
          application_process?: string | null
          benefits?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          id?: string
          issuing_body?: string | null
          metadata?: Json | null
          policy_name: string
          source_url?: string | null
        }
        Update: {
          application_process?: string | null
          benefits?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          eligibility_criteria?: string | null
          id?: string
          issuing_body?: string | null
          metadata?: Json | null
          policy_name?: string
          source_url?: string | null
        }
        Relationships: []
      }
      query_history: {
        Row: {
          created_at: string
          id: string
          language: Database["public"]["Enums"]["supported_language"]
          metadata: Json | null
          query: string
          response: string | null
          sources: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          language?: Database["public"]["Enums"]["supported_language"]
          metadata?: Json | null
          query: string
          response?: string | null
          sources?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          language?: Database["public"]["Enums"]["supported_language"]
          metadata?: Json | null
          query?: string
          response?: string | null
          sources?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      source_type: "web" | "pdf" | "table" | "report" | "api"
      supported_language:
        | "en"
        | "hi"
        | "ta"
        | "te"
        | "bn"
        | "mr"
        | "gu"
        | "kn"
        | "ml"
        | "pa"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      source_type: ["web", "pdf", "table", "report", "api"],
      supported_language: [
        "en",
        "hi",
        "ta",
        "te",
        "bn",
        "mr",
        "gu",
        "kn",
        "ml",
        "pa",
      ],
    },
  },
} as const
