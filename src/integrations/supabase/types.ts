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
      ausencias: {
        Row: {
          creado_por: string | null
          created_at: string
          desde: string
          hasta: string
          id: string
          motivo: string
          profesional_id: string
        }
        Insert: {
          creado_por?: string | null
          created_at?: string
          desde: string
          hasta: string
          id?: string
          motivo?: string
          profesional_id: string
        }
        Update: {
          creado_por?: string | null
          created_at?: string
          desde?: string
          hasta?: string
          id?: string
          motivo?: string
          profesional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ausencias_profesional_id_fkey"
            columns: ["profesional_id"]
            isOneToOne: false
            referencedRelation: "profesionales"
            referencedColumns: ["id"]
          },
        ]
      }
      cupos: {
        Row: {
          asistencia: string | null
          estado: string
          fecha: string
          hora: string
          id: string
          modalidad: string
          paciente_id: string | null
          profesional_id: string
          reasignada: boolean
          updated_at: string
        }
        Insert: {
          asistencia?: string | null
          estado?: string
          fecha: string
          hora: string
          id?: string
          modalidad?: string
          paciente_id?: string | null
          profesional_id: string
          reasignada?: boolean
          updated_at?: string
        }
        Update: {
          asistencia?: string | null
          estado?: string
          fecha?: string
          hora?: string
          id?: string
          modalidad?: string
          paciente_id?: string | null
          profesional_id?: string
          reasignada?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cupos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cupos_profesional_id_fkey"
            columns: ["profesional_id"]
            isOneToOne: false
            referencedRelation: "profesionales"
            referencedColumns: ["id"]
          },
        ]
      }
      especialidades: {
        Row: {
          establecimiento_id: string
          id: string
          nombre: string
        }
        Insert: {
          establecimiento_id: string
          id?: string
          nombre: string
        }
        Update: {
          establecimiento_id?: string
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "especialidades_establecimiento_id_fkey"
            columns: ["establecimiento_id"]
            isOneToOne: false
            referencedRelation: "establecimientos"
            referencedColumns: ["id"]
          },
        ]
      }
      establecimientos: {
        Row: {
          comuna: string
          created_at: string
          es_ficticio: boolean
          id: string
          nombre: string
        }
        Insert: {
          comuna: string
          created_at?: string
          es_ficticio?: boolean
          id?: string
          nombre: string
        }
        Update: {
          comuna?: string
          created_at?: string
          es_ficticio?: boolean
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      notificaciones: {
        Row: {
          created_at: string
          fecha: string
          id: string
          paciente_id: string
          texto: string
          tipo: string
        }
        Insert: {
          created_at?: string
          fecha?: string
          id?: string
          paciente_id: string
          texto: string
          tipo?: string
        }
        Update: {
          created_at?: string
          fecha?: string
          id?: string
          paciente_id?: string
          texto?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          created_at: string
          diagnostico: string
          direccion: string
          edad: number
          email: string
          en_espera_desde: string
          es_ficticio: boolean
          establecimiento_id: string | null
          estado_espera: string
          id: string
          nombre: string
          prioridad: string
          rut: string
          telefono: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          diagnostico?: string
          direccion?: string
          edad?: number
          email?: string
          en_espera_desde?: string
          es_ficticio?: boolean
          establecimiento_id?: string | null
          estado_espera?: string
          id?: string
          nombre: string
          prioridad?: string
          rut: string
          telefono?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          diagnostico?: string
          direccion?: string
          edad?: number
          email?: string
          en_espera_desde?: string
          es_ficticio?: boolean
          establecimiento_id?: string | null
          estado_espera?: string
          id?: string
          nombre?: string
          prioridad?: string
          rut?: string
          telefono?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_establecimiento_id_fkey"
            columns: ["establecimiento_id"]
            isOneToOne: false
            referencedRelation: "establecimientos"
            referencedColumns: ["id"]
          },
        ]
      }
      profesionales: {
        Row: {
          activo: boolean
          area: string
          codigo: string
          color: string
          especialidad_id: string
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          area: string
          codigo: string
          color?: string
          especialidad_id: string
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean
          area?: string
          codigo?: string
          color?: string
          especialidad_id?: string
          id?: string
          nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "profesionales_especialidad_id_fkey"
            columns: ["especialidad_id"]
            isOneToOne: false
            referencedRelation: "especialidades"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string
          id: string
          nombre?: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      registro_auditoria: {
        Row: {
          accion: string
          created_at: string
          detalle: Json
          entidad: string
          entidad_id: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          accion: string
          created_at?: string
          detalle?: Json
          entidad: string
          entidad_id?: string | null
          id?: never
          user_id?: string | null
        }
        Update: {
          accion?: string
          created_at?: string
          detalle?: Json
          entidad?: string
          entidad_id?: string | null
          id?: never
          user_id?: string | null
        }
        Relationships: []
      }
      solicitudes_telemedicina: {
        Row: {
          creada: string
          cupo_id: string | null
          estado: string
          id: string
          motivo: string
          nota: string | null
          paciente_id: string
        }
        Insert: {
          creada?: string
          cupo_id?: string | null
          estado?: string
          id?: string
          motivo: string
          nota?: string | null
          paciente_id: string
        }
        Update: {
          creada?: string
          cupo_id?: string | null
          estado?: string
          id?: string
          motivo?: string
          nota?: string | null
          paciente_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_telemedicina_cupo_id_fkey"
            columns: ["cupo_id"]
            isOneToOne: false
            referencedRelation: "cupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solicitudes_telemedicina_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _audit: {
        Args: {
          _accion: string
          _detalle?: Json
          _entidad: string
          _id: string
        }
        Returns: undefined
      }
      _generar_agenda_demo: { Args: never; Returns: undefined }
      _notify: {
        Args: { _paciente: string; _texto: string; _tipo?: string }
        Returns: undefined
      }
      _slot_label: { Args: { _cupo: string }; Returns: string }
      actualizar_mis_datos: {
        Args: { _direccion: string; _email: string; _telefono: string }
        Returns: undefined
      }
      actualizar_paciente: {
        Args: {
          _email: string
          _estado: string
          _id: string
          _prioridad: string
          _telefono: string
        }
        Returns: undefined
      }
      cancelar_cita: { Args: { _cupo: string }; Returns: undefined }
      decidir_telemedicina: {
        Args: { _aprobar: boolean; _cupo?: string; _id: string; _nota?: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: never; Returns: boolean }
      marcar_asistencia: {
        Args: { _cupo: string; _valor: string }
        Returns: undefined
      }
      mi_posicion_espera: {
        Args: never
        Returns: {
          posicion: number
          total: number
        }[]
      }
      mover_cita: {
        Args: { _desde: string; _hacia: string }
        Returns: undefined
      }
      my_patient_id: { Args: never; Returns: string }
      quitar_ausencia: { Args: { _id: string }; Returns: undefined }
      registrar_ausencia: {
        Args: { _desde: string; _hasta: string; _motivo: string; _prof: string }
        Returns: string
      }
      reiniciar_demo: { Args: never; Returns: undefined }
      reservar_cupo: {
        Args: { _cupo: string; _paciente?: string; _reasignada?: boolean }
        Returns: undefined
      }
      solicitar_telemedicina: { Args: { _motivo: string }; Returns: undefined }
    }
    Enums: {
      app_role: "paciente" | "funcionario" | "administrador"
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
      app_role: ["paciente", "funcionario", "administrador"],
    },
  },
} as const
