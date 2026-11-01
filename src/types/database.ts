export type RolUsuario = "admin" | "recepcion" | "supervisor" | "operador";
export type PrioridadOT = "baja" | "normal" | "alta" | "urgente";
export type FaseArea = "pre_prensa" | "prensa" | "post_prensa";
export type TipoEspera = "ninguna" | "cliente" | "proveedor" | "secado";

export type EstadoOT =
  | "en_puerta"
  | "en_produccion"
  | "lista_despacho"
  | "despachada"
  | "cancelada"
  | "recibida"      // Retrocompatibilidad
  | "lista_entrega"  // Retrocompatibilidad
  | "entregada";    // Retrocompatibilidad

export type EstadoEtapa =
  | "bloqueada"
  | "en_cola"
  | "en_proceso"
  | "pausada"
  | "esperando_cliente"
  | "esperando_proveedor"
  | "secando"
  | "omitida"
  | "terminada";

export type EstadoAprobacion = "pendiente" | "aprobado" | "cambios_solicitados" | "expirado";
export type TipoModeloEmpaque = "caja_tuck_end" | "caja_pizza" | "bolsa_kraft";
export type TipoHotStamping = "ninguno" | "oro" | "plata" | "cobre";
export type TipoProveedor = "planchas" | "papel" | "otros";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AreaRow = {
  id: string;
  nombre: string;
  slug: string;
  color_hex: string;
  icono_lucide: string;
  orden: number;
  fase: FaseArea;
  tipo_espera: TipoEspera | null;
  requiere_aprobacion_cliente: boolean;
  es_control_calidad: boolean;
  es_despacho: boolean;
  es_condicional: boolean;
  activa: boolean;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  nombre_completo: string;
  usuario: string;
  rol: RolUsuario;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type UsuarioAreaRow = {
  usuario_id: string;
  area_id: string;
  created_at: string;
};

export type ProveedorRow = {
  id: string;
  nombre: string;
  telefono: string | null;
  tipo: TipoProveedor;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type AcabadoRow = {
  id: string;
  nombre: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type OrdenAcabadoRow = {
  orden_id: string;
  acabado_id: string;
  created_at: string;
};

export type RechazoCalidadRow = {
  id: string;
  orden_id: string;
  etapa_qc_id: string;
  area_destino_id: string;
  motivo: string;
  cantidad_afectada: number | null;
  usuario_id: string | null;
  created_at: string;
};

export type IntentoLoginRow = {
  id: string;
  usuario: string;
  exito: boolean;
  ip: string | null;
  created_at: string;
};

export type ClienteRow = {
  id: string;
  nombre: string;
  empresa: string | null;
  telefono: string | null;
  email: string | null;
  notas: string | null;
  created_at: string;
  updated_at: string;
};

export type MotivoPausaRow = {
  id: string;
  texto: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type TipoTrabajoRow = {
  id: string;
  nombre: string;
  descripcion: string | null;
  icono: string;
  ruta: string[]; // UUIDs de áreas
  modelo_empaque_id: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export type OrdenRow = {
  id: string;
  codigo: string;
  cliente_id: string;
  tipo_trabajo_id: string;
  titulo: string;
  descripcion: string | null;
  cantidad: number;
  material: string | null;
  medidas: string | null;
  tintas: string | null;
  acabados: string | null;
  prioridad: PrioridadOT;
  fecha_entrega: string;
  estado: EstadoOT;
  area_actual_id: string | null;
  creada_por: string | null;
  usa_planchas_existentes?: boolean;
  notas_acabado?: string | null;
  liberada_en?: string | null;
  liberada_por?: string | null;
  despachada_en?: string | null;
  despachada_a?: string | null;
  guia_despacho?: string | null;
  entregada_en?: string | null; // Retrocompatibilidad
  entregada_a?: string | null;  // Retrocompatibilidad
  created_at: string;
  updated_at: string;
};

export type OrdenEtapaRow = {
  id: string;
  orden_id: string;
  area_id: string;
  secuencia: number;
  estado: EstadoEtapa;
  operador_id: string | null;
  iniciada_en: string | null;
  terminada_en: string | null;
  motivo_pausa_id: string | null;
  nota_pausa: string | null;
  minutos_trabajados: number;
  proveedor_id?: string | null;
  enviado_proveedor_en?: string | null;
  recibido_proveedor_en?: string | null;
  guia_salida?: string | null;
  guia_retorno?: string | null;
  secado_hasta?: string | null;
  intento?: number;
  omitida_motivo?: string | null;
  created_at: string;
  updated_at: string;
};

export type EventoOrdenRow = {
  id: string;
  orden_id: string;
  etapa_id: string | null;
  usuario_id: string | null;
  tipo: string;
  detalle: Json;
  created_at: string;
};

export type ComentarioRow = {
  id: string;
  orden_id: string;
  autor_id: string | null;
  texto: string;
  created_at: string;
};

export type ArchivoOrdenRow = {
  id: string;
  orden_id: string;
  nombre: string;
  storage_path: string;
  mime: string | null;
  tamano: number | null;
  subido_por: string | null;
  created_at: string;
};

export type MockupEmpaqueRow = {
  id: string;
  orden_id: string;
  modelo_tipo: TipoModeloEmpaque;
  ancho_cm: number;
  alto_cm: number;
  profundidad_cm: number;
  grosor_mm: number;
  textura_arte_url: string | null;
  textura_acabado_url: string | null;
  acabado_barniz_uv: boolean;
  acabado_hot_stamping: TipoHotStamping;
  acabado_relieve: boolean;
  angulo_apertura: number;
  snapshot_url: string | null;
  creado_por: string | null;
  created_at: string;
  updated_at: string;
};

export type AprobacionClienteRow = {
  id: string;
  token: string;
  orden_id: string;
  mockup_id: string;
  estado: EstadoAprobacion;
  fecha_envio: string;
  fecha_respuesta: string | null;
  aprobado_por_nombre: string | null;
  aprobado_por_cargo_dni: string | null;
  comentarios_cliente: string | null;
  ip_cliente: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      areas: {
        Row: AreaRow;
        Insert: Omit<AreaRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AreaRow, "id">>;
        Relationships: [];
      };
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProfileRow, "id">>;
        Relationships: [];
      };
      usuario_areas: {
        Row: UsuarioAreaRow;
        Insert: UsuarioAreaRow;
        Update: Partial<UsuarioAreaRow>;
        Relationships: [];
      };
      proveedores: {
        Row: ProveedorRow;
        Insert: Omit<ProveedorRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProveedorRow, "id">>;
        Relationships: [];
      };
      acabados: {
        Row: AcabadoRow;
        Insert: Omit<AcabadoRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AcabadoRow, "id">>;
        Relationships: [];
      };
      orden_acabados: {
        Row: OrdenAcabadoRow;
        Insert: OrdenAcabadoRow;
        Update: Partial<OrdenAcabadoRow>;
        Relationships: [];
      };
      rechazos_calidad: {
        Row: RechazoCalidadRow;
        Insert: Omit<RechazoCalidadRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<RechazoCalidadRow, "id">>;
        Relationships: [];
      };
      intentos_login: {
        Row: IntentoLoginRow;
        Insert: Omit<IntentoLoginRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<IntentoLoginRow, "id">>;
        Relationships: [];
      };
      clientes: {
        Row: ClienteRow;
        Insert: Omit<ClienteRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ClienteRow, "id">>;
        Relationships: [];
      };
      motivos_pausa: {
        Row: MotivoPausaRow;
        Insert: Omit<MotivoPausaRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<MotivoPausaRow, "id">>;
        Relationships: [];
      };
      tipos_trabajo: {
        Row: TipoTrabajoRow;
        Insert: Omit<TipoTrabajoRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<TipoTrabajoRow, "id">>;
        Relationships: [];
      };
      ordenes: {
        Row: OrdenRow;
        Insert: Omit<OrdenRow, "id" | "codigo" | "created_at" | "updated_at"> & {
          id?: string;
          codigo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<OrdenRow, "id">>;
        Relationships: [];
      };
      orden_etapas: {
        Row: OrdenEtapaRow;
        Insert: Omit<OrdenEtapaRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<OrdenEtapaRow, "id">>;
        Relationships: [];
      };
      eventos_orden: {
        Row: EventoOrdenRow;
        Insert: Omit<EventoOrdenRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<EventoOrdenRow, "id">>;
        Relationships: [];
      };
      comentarios: {
        Row: ComentarioRow;
        Insert: Omit<ComentarioRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ComentarioRow, "id">>;
        Relationships: [];
      };
      archivos_orden: {
        Row: ArchivoOrdenRow;
        Insert: Omit<ArchivoOrdenRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<ArchivoOrdenRow, "id">>;
        Relationships: [];
      };
      mockups_empaque: {
        Row: MockupEmpaqueRow;
        Insert: Omit<MockupEmpaqueRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<MockupEmpaqueRow, "id">>;
        Relationships: [];
      };
      aprobaciones_cliente: {
        Row: AprobacionClienteRow;
        Insert: Omit<AprobacionClienteRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AprobacionClienteRow, "id">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      auth_rol: {
        Args: Record<string, never>;
        Returns: RolUsuario | null;
      };
      auth_areas: {
        Args: Record<string, never>;
        Returns: string[];
      };
      auth_area: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      verificar_bloqueo_login: {
        Args: {
          p_usuario: string;
        };
        Returns: Json;
      };
      registrar_intento_login: {
        Args: {
          p_usuario: string;
          p_exito: boolean;
          p_ip?: string | null;
        };
        Returns: undefined;
      };
      crear_orden: {
        Args: {
          p_cliente_id: string;
          p_tipo_trabajo_id: string;
          p_titulo: string;
          p_descripcion?: string | null;
          p_cantidad: number;
          p_material?: string | null;
          p_medidas?: string | null;
          p_tintas?: string | null;
          p_acabados?: string | null;
          p_prioridad: PrioridadOT;
          p_fecha_entrega: string;
          p_ruta?: string[] | null;
          p_acabados_ids?: string[] | null;
          p_usa_planchas_existentes?: boolean;
          p_notas_acabado?: string | null;
        };
        Returns: Json;
      };
      liberar_orden: {
        Args: {
          p_orden_id: string;
        };
        Returns: Json;
      };
      iniciar_etapa: {
        Args: {
          p_etapa_id: string;
        };
        Returns: Json;
      };
      pausar_etapa: {
        Args: {
          p_etapa_id: string;
          p_motivo_id: string;
          p_nota?: string | null;
        };
        Returns: Json;
      };
      reanudar_etapa: {
        Args: {
          p_etapa_id: string;
        };
        Returns: Json;
      };
      enviar_a_proveedor: {
        Args: {
          p_etapa_id: string;
          p_proveedor_id: string;
        };
        Returns: Json;
      };
      recibir_de_proveedor: {
        Args: {
          p_etapa_id: string;
        };
        Returns: Json;
      };
      iniciar_secado: {
        Args: {
          p_etapa_id: string;
          p_horas: number;
        };
        Returns: Json;
      };
      terminar_etapa: {
        Args: {
          p_etapa_id: string;
        };
        Returns: Json;
      };
      omitir_etapa: {
        Args: {
          p_etapa_id: string;
          p_motivo: string;
        };
        Returns: Json;
      };
      aprobar_calidad: {
        Args: {
          p_etapa_id: string;
        };
        Returns: Json;
      };
      rechazar_calidad: {
        Args: {
          p_etapa_id: string;
          p_area_destino_id: string;
          p_motivo: string;
          p_cantidad?: number | null;
        };
        Returns: Json;
      };
      despachar: {
        Args: {
          p_orden_id: string;
          p_despachada_a: string;
          p_guia?: string | null;
        };
        Returns: Json;
      };
      marcar_entregada: {
        Args: {
          p_orden_id: string;
          p_entregada_a: string;
        };
        Returns: Json;
      };
      generar_token_aprobacion: {
        Args: {
          p_orden_id: string;
          p_mockup_id: string;
        };
        Returns: Json;
      };
      aprobar_arte_cliente: {
        Args: {
          p_token: string;
          p_nombre: string;
          p_cargo_dni?: string | null;
          p_ip?: string | null;
          p_user_agent?: string | null;
        };
        Returns: Json;
      };
      solicitar_cambios_cliente: {
        Args: {
          p_token: string;
          p_nombre: string;
          p_comentarios: string;
          p_ip?: string | null;
          p_user_agent?: string | null;
        };
        Returns: Json;
      };
    };
    Enums: {
      rol_usuario: RolUsuario;
      prioridad_ot: PrioridadOT;
      fase_area: FaseArea;
      tipo_espera: TipoEspera;
      estado_ot: EstadoOT;
      estado_etapa: EstadoEtapa;
      estado_aprobacion: EstadoAprobacion;
    };
    CompositeTypes: Record<string, never>;
  };
};
