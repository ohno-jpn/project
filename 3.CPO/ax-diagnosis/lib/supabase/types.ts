export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string;
          axis: string;
          depth: string;
          area: string | null;
          keyword: string;
          text: string;
          format: string;
          respondent: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["questions"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["questions"]["Insert"]>;
      };
      question_choices: {
        Row: {
          id: number;
          question_id: string;
          label: string;
          text: string;
          is_correct: boolean;
          sort_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["question_choices"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["question_choices"]["Insert"]>;
      };
      hook_levels: {
        Row: { id: string; axis: string; axis_label: string; title: string; sort_order: number };
        Insert: Database["public"]["Tables"]["hook_levels"]["Row"];
        Update: Partial<Database["public"]["Tables"]["hook_levels"]["Row"]>;
      };
      hook_level_items: {
        Row: { id: number; hook_id: string; level: number; keyword: string; description: string };
        Insert: Omit<Database["public"]["Tables"]["hook_level_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["hook_level_items"]["Insert"]>;
      };
      checkup_levels: {
        Row: { id: string; axis: string; axis_label: string; title: string; sort_order: number };
        Insert: Database["public"]["Tables"]["checkup_levels"]["Row"];
        Update: Partial<Database["public"]["Tables"]["checkup_levels"]["Row"]>;
      };
      checkup_level_items: {
        Row: { id: number; checkup_id: string; level: number; keyword: string; description: string };
        Insert: Omit<Database["public"]["Tables"]["checkup_level_items"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["checkup_level_items"]["Insert"]>;
      };
      diagnoses: {
        Row: {
          id: string;
          clerk_user_id: string;
          depth: string;
          oh_score: number | null;
          os_score: number | null;
          ph_score: number | null;
          ps_score: number | null;
          total_score: number | null;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["diagnoses"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["diagnoses"]["Insert"]>;
      };
      diagnosis_answers: {
        Row: {
          id: string;
          diagnosis_id: string;
          question_id: string;
          answer: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["diagnosis_answers"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["diagnosis_answers"]["Insert"]>;
      };
    };
  };
}
