export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categorias: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      demandas: {
        Row: {
          categoria_id: string
          cidade: string
          created_at: string | null
          email: string
          estado: string
          id: string
          nome: string
          observacao: string | null
          status: string | null
          subcategoria_id: string
          updated_at: string | null
          urgencia: string
          whatsapp: string
        }
        Insert: {
          categoria_id: string
          cidade: string
          created_at?: string | null
          email: string
          estado: string
          id?: string
          nome: string
          observacao?: string | null
          status?: string | null
          subcategoria_id: string
          updated_at?: string | null
          urgencia: string
          whatsapp: string
        }
        Update: {
          categoria_id?: string
          cidade?: string
          created_at?: string | null
          email?: string
          estado?: string
          id?: string
          nome?: string
          observacao?: string | null
          status?: string | null
          subcategoria_id?: string
          updated_at?: string | null
          urgencia?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_categoria"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subcategoria"
            columns: ["subcategoria_id"]
            isOneToOne: false
            referencedRelation: "subcategorias"
            referencedColumns: ["id"]
          },
        ]
      }
      equipamentos: {
        Row: {
          categoria: string
          descrição: string
          foto: string
          id: string
          nome: string
        }
        Insert: {
          categoria: string
          descrição: string
          foto: string
          id?: string
          nome: string
        }
        Update: {
          categoria?: string
          descrição?: string
          foto?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          aceita_diaria: boolean | null
          bairro: string | null
          cep: string | null
          cidade: string | null
          cpf_cnpj: string
          crea: string | null
          creci: string | null
          desativado: boolean | null
          email: string | null
          estado: string | null
          estrelas: number | null
          foto_perfil: string | null
          id: number
          nacionalidade: string | null
          nome: string
          numero: string | null
          receber_msm: boolean | null
          rua: string | null
          saldo: number | null
          termos: string | null
          valor_diaria: number | null
          whatsapp: string
        }
        Insert: {
          aceita_diaria?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf_cnpj: string
          crea?: string | null
          creci?: string | null
          desativado?: boolean | null
          email?: string | null
          estado?: string | null
          estrelas?: number | null
          foto_perfil?: string | null
          id?: number
          nacionalidade?: string | null
          nome: string
          numero?: string | null
          receber_msm?: boolean | null
          rua?: string | null
          saldo?: number | null
          termos?: string | null
          valor_diaria?: number | null
          whatsapp: string
        }
        Update: {
          aceita_diaria?: boolean | null
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string
          crea?: string | null
          creci?: string | null
          desativado?: boolean | null
          email?: string | null
          estado?: string | null
          estrelas?: number | null
          foto_perfil?: string | null
          id?: number
          nacionalidade?: string | null
          nome?: string
          numero?: string | null
          receber_msm?: boolean | null
          rua?: string | null
          saldo?: number | null
          termos?: string | null
          valor_diaria?: number | null
          whatsapp?: string
        }
        Relationships: []
      }
      profissional_categorias: {
        Row: {
          categoria_id: string
          cidade: string | null
          created_at: string | null
          estado: string | null
          id: number
          profissional_id: number
          whatsapp: string | null
        }
        Insert: {
          categoria_id: string
          cidade?: string | null
          created_at?: string | null
          estado?: string | null
          id?: number
          profissional_id: number
          whatsapp?: string | null
        }
        Update: {
          categoria_id?: string
          cidade?: string | null
          created_at?: string | null
          estado?: string | null
          id?: number
          profissional_id?: number
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profissional_categorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profissional_categorias_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategorias: {
        Row: {
          ativo: boolean | null
          categoria_id: string
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_id: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategorias_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
