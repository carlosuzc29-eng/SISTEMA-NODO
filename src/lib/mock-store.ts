import {
  ClienteRow,
  TipoTrabajoRow,
  MotivoPausaRow,
  OrdenRow,
  OrdenEtapaRow,
  EventoOrdenRow,
  ComentarioRow,
  AreaRow,
  ProfileRow,
  MockupEmpaqueRow,
  AprobacionClienteRow,
  ProveedorRow,
  AcabadoRow,
  OrdenAcabadoRow,
  UsuarioAreaRow,
  RechazoCalidadRow,
} from "@/types/database";

// 11 Áreas del flujo real de imprenta (Fase 4)
export const INITIAL_AREAS: AreaRow[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    nombre: "Diseño gráfico / Arte final",
    slug: "diseno-arte-final",
    color_hex: "#8B5CF6",
    icono_lucide: "Palette",
    orden: 1,
    fase: "pre_prensa",
    tipo_espera: null,
    requiere_aprobacion_cliente: true,
    es_condicional: false,
    es_control_calidad: false,
    es_despacho: false,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111105",
    nombre: "Planchas",
    slug: "planchas",
    color_hex: "#6366F1",
    icono_lucide: "Layers",
    orden: 2,
    fase: "pre_prensa",
    tipo_espera: null,
    requiere_aprobacion_cliente: false,
    es_condicional: true,
    es_control_calidad: false,
    es_despacho: false,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111106",
    nombre: "Preparación de materiales",
    slug: "preparacion-materiales",
    color_hex: "#0EA5E9",
    icono_lucide: "Box",
    orden: 3,
    fase: "pre_prensa",
    tipo_espera: null,
    requiere_aprobacion_cliente: false,
    es_condicional: false,
    es_control_calidad: false,
    es_despacho: false,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    nombre: "Impresión / Secado",
    slug: "impresion-secado",
    color_hex: "#3B82F6",
    icono_lucide: "Printer",
    orden: 4,
    fase: "prensa",
    tipo_espera: "secado",
    requiere_aprobacion_cliente: false,
    es_condicional: false,
    es_control_calidad: false,
    es_despacho: false,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111107",
    nombre: "Acabado",
    slug: "acabado",
    color_hex: "#EC4899",
    icono_lucide: "Sparkles",
    orden: 5,
    fase: "post_prensa",
    tipo_espera: "proveedor",
    requiere_aprobacion_cliente: false,
    es_condicional: true,
    es_control_calidad: false,
    es_despacho: false,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    nombre: "Troquelado",
    slug: "troquelado",
    color_hex: "#F59E0B",
    icono_lucide: "Scissors",
    orden: 6,
    fase: "post_prensa",
    tipo_espera: null,
    requiere_aprobacion_cliente: false,
    es_condicional: false,
    es_control_calidad: false,
    es_despacho: false,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    nombre: "Corte y refile / Esquineado",
    slug: "corte-refile",
    color_hex: "#10B981",
    icono_lucide: "Layers",
    orden: 7,
    fase: "post_prensa",
    tipo_espera: null,
    requiere_aprobacion_cliente: false,
    es_condicional: false,
    es_control_calidad: false,
    es_despacho: false,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111108",
    nombre: "Encuadernación / Trabajo manual",
    slug: "encuadernacion-manual",
    color_hex: "#84CC16",
    icono_lucide: "BookOpen",
    orden: 8,
    fase: "post_prensa",
    tipo_espera: null,
    requiere_aprobacion_cliente: false,
    es_condicional: true,
    es_control_calidad: false,
    es_despacho: false,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111109",
    nombre: "Revisión y control de calidad",
    slug: "control-calidad",
    color_hex: "#06B6D4",
    icono_lucide: "CheckCircle2",
    orden: 9,
    fase: "post_prensa",
    tipo_espera: null,
    requiere_aprobacion_cliente: false,
    es_condicional: false,
    es_control_calidad: true,
    es_despacho: false,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111110",
    nombre: "Embalaje",
    slug: "embalaje",
    color_hex: "#EAB308",
    icono_lucide: "PackageCheck",
    orden: 10,
    fase: "post_prensa",
    tipo_espera: null,
    requiere_aprobacion_cliente: false,
    es_condicional: false,
    es_control_calidad: false,
    es_despacho: false,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111111",
    nombre: "Despacho",
    slug: "despacho",
    color_hex: "#14B8A6",
    icono_lucide: "Truck",
    orden: 11,
    fase: "post_prensa",
    tipo_espera: null,
    requiere_aprobacion_cliente: false,
    es_condicional: false,
    es_control_calidad: false,
    es_despacho: true,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
];

// Acabados de catálogo
export const INITIAL_ACABADOS: AcabadoRow[] = [
  { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001", nombre: "Plastificado Mate", activo: true, created_at: "2026-10-14T00:00:00Z", updated_at: "2026-10-14T00:00:00Z" },
  { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0002", nombre: "Plastificado Brillante", activo: true, created_at: "2026-10-14T00:00:00Z", updated_at: "2026-10-14T00:00:00Z" },
  { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0003", nombre: "Barniz UV Total", activo: true, created_at: "2026-10-14T00:00:00Z", updated_at: "2026-10-14T00:00:00Z" },
  { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004", nombre: "Barniz UV Sectorizado", activo: true, created_at: "2026-10-14T00:00:00Z", updated_at: "2026-10-14T00:00:00Z" },
  { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0005", nombre: "Hot Stamping Dorado", activo: true, created_at: "2026-10-14T00:00:00Z", updated_at: "2026-10-14T00:00:00Z" },
  { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0006", nombre: "Hot Stamping Plateado", activo: true, created_at: "2026-10-14T00:00:00Z", updated_at: "2026-10-14T00:00:00Z" },
  { id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0007", nombre: "Relieve / Repujado", activo: true, created_at: "2026-10-14T00:00:00Z", updated_at: "2026-10-14T00:00:00Z" },
];

// Proveedores externos
export const INITIAL_PROVEEDORES: ProveedorRow[] = [
  { id: "cccccccc-cccc-cccc-cccc-cccccccc0001", nombre: "Laminados & Barnices del Centro C.A.", telefono: "+58 412 111-2233", tipo: "otros", activo: true, created_at: "2026-10-14T00:00:00Z", updated_at: "2026-10-14T00:00:00Z" },
  { id: "cccccccc-cccc-cccc-cccc-cccccccc0002", nombre: "Stamping & Foil Express", telefono: "+58 414 444-5566", tipo: "otros", activo: true, created_at: "2026-10-14T00:00:00Z", updated_at: "2026-10-14T00:00:00Z" },
  { id: "cccccccc-cccc-cccc-cccc-cccccccc0003", nombre: "Planchas CTP Digital C.A.", telefono: "+58 416 777-8899", tipo: "planchas", activo: true, created_at: "2026-10-14T00:00:00Z", updated_at: "2026-10-14T00:00:00Z" },
];

// Asignaciones usuario_areas (multi-área)
export const INITIAL_USUARIO_AREAS: UsuarioAreaRow[] = [
  { usuario_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004", area_id: "11111111-1111-1111-1111-111111111101", created_at: "2026-10-14T00:00:00Z" }, // op_diseno -> Diseño
  { usuario_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005", area_id: "11111111-1111-1111-1111-111111111102", created_at: "2026-10-14T00:00:00Z" }, // op_impresion -> Impresión/Secado
  { usuario_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006", area_id: "11111111-1111-1111-1111-111111111103", created_at: "2026-10-14T00:00:00Z" }, // op_troquelado -> Troquelado
  { usuario_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007", area_id: "11111111-1111-1111-1111-111111111104", created_at: "2026-10-14T00:00:00Z" }, // op_corte -> Corte/Refile
  { usuario_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0008", area_id: "11111111-1111-1111-1111-111111111110", created_at: "2026-10-14T00:00:00Z" }, // op_logistica -> Embalaje
  { usuario_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0008", area_id: "11111111-1111-1111-1111-111111111111", created_at: "2026-10-14T00:00:00Z" }, // op_logistica -> Despacho
];

// Motivos de pausa iniciales
export const INITIAL_MOTIVOS_PAUSA: MotivoPausaRow[] = [
  {
    id: "22222222-2222-2222-2222-222222222201",
    texto: "Falta de material o insumos",
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222202",
    texto: "Máquina en mantenimiento o calibración",
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222203",
    texto: "Esperando aprobación del cliente",
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222204",
    texto: "Error o corrección en archivo de arte",
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222205",
    texto: "Otro motivo operativo",
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
];

// Clientes iniciales
export const INITIAL_CLIENTES: ClienteRow[] = [
  {
    id: "33333333-3333-3333-3333-333333333301",
    nombre: "Carlos Mendoza",
    empresa: "Farmacéutica Nova Salud",
    telefono: "+584121234567",
    email: "cmendoza@novasalud.com",
    notas: "Cliente corporativo de empaques médicos",
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "33333333-3333-3333-3333-333333333302",
    nombre: "Elena Rivas",
    empresa: "Chocolates Artesanales CacaoReal",
    telefono: "+584149876543",
    email: "contacto@cacaoreal.ve",
    notas: "Exige papel kraft con acabado satinado",
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "33333333-3333-3333-3333-333333333303",
    nombre: "Marcos Delgado",
    empresa: "Agencia Creativa Zenith",
    telefono: "+584165551122",
    email: "marcos@zenith.design",
    notas: "Campañas publicitarias frecuentes y urgentes",
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
];

// Tipos de trabajo iniciales con rutas completas
export const INITIAL_TIPOS_TRABAJO: TipoTrabajoRow[] = [
  {
    id: "44444444-4444-4444-4444-444444444401",
    nombre: "Caja Plegadiza (Tuck End)",
    descripcion: "Empaque plegadizo con solapas para cosmética, farmacia o alimentos",
    icono: "Box",
    ruta: [
      "11111111-1111-1111-1111-111111111101", // 1. Diseño gráfico / Arte final
      "11111111-1111-1111-1111-111111111105", // 2. Planchas
      "11111111-1111-1111-1111-111111111106", // 3. Preparación de materiales
      "11111111-1111-1111-1111-111111111102", // 4. Impresión / Secado
      "11111111-1111-1111-1111-111111111107", // 5. Acabado
      "11111111-1111-1111-1111-111111111103", // 6. Troquelado
      "11111111-1111-1111-1111-111111111104", // 7. Corte y refile / Esquineado
      "11111111-1111-1111-1111-111111111109", // 9. Revisión y control de calidad
      "11111111-1111-1111-1111-111111111110", // 10. Embalaje
      "11111111-1111-1111-1111-111111111111", // 11. Despacho
    ],
    modelo_empaque_id: null,
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "44444444-4444-4444-4444-444444444402",
    nombre: "Folleto Publicitario Tríptico",
    descripcion: "Folleto promocional en papel glasé con doble pliegue",
    icono: "FileText",
    ruta: [
      "11111111-1111-1111-1111-111111111101", // 1. Diseño gráfico / Arte final
      "11111111-1111-1111-1111-111111111105", // 2. Planchas
      "11111111-1111-1111-1111-111111111106", // 3. Preparación de materiales
      "11111111-1111-1111-1111-111111111102", // 4. Impresión / Secado
      "11111111-1111-1111-1111-111111111107", // 5. Acabado
      "11111111-1111-1111-1111-111111111104", // 7. Corte y refile / Esquineado
      "11111111-1111-1111-1111-111111111108", // 8. Encuadernación / Trabajo manual
      "11111111-1111-1111-1111-111111111109", // 9. Revisión y control de calidad
      "11111111-1111-1111-1111-111111111110", // 10. Embalaje
      "11111111-1111-1111-1111-111111111111", // 11. Despacho
    ],
    modelo_empaque_id: null,
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "44444444-4444-4444-4444-444444444403",
    nombre: "Etiqueta Troquelada Adhesiva",
    descripcion: "Stickers y etiquetas en vinil adhesivo o papel con forma troquelada",
    icono: "Tag",
    ruta: [
      "11111111-1111-1111-1111-111111111101", // 1. Diseño gráfico / Arte final
      "11111111-1111-1111-1111-111111111105", // 2. Planchas
      "11111111-1111-1111-1111-111111111106", // 3. Preparación de materiales
      "11111111-1111-1111-1111-111111111102", // 4. Impresión / Secado
      "11111111-1111-1111-1111-111111111107", // 5. Acabado
      "11111111-1111-1111-1111-111111111103", // 6. Troquelado
      "11111111-1111-1111-1111-111111111104", // 7. Corte y refile / Esquineado
      "11111111-1111-1111-1111-111111111109", // 9. Revisión y control de calidad
      "11111111-1111-1111-1111-111111111110", // 10. Embalaje
      "11111111-1111-1111-1111-111111111111", // 11. Despacho
    ],
    modelo_empaque_id: null,
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
];

// Órdenes de prueba iniciales
export const INITIAL_ORDENES: OrdenRow[] = [
  {
    id: "55555555-5555-5555-5555-555555555501",
    codigo: "OT-0001",
    cliente_id: "33333333-3333-3333-3333-333333333301",
    tipo_trabajo_id: "44444444-4444-4444-4444-444444444401",
    titulo: "Cajas Jarabe Tos Infantil 120ml",
    descripcion: "Impresión a 4 tintas CMYK + barniz UV localizado. Cartulina sulfatada 14 pts.",
    cantidad: 5000,
    material: "Cartulina SBS 300g",
    medidas: "60 x 60 x 140 mm",
    tintas: "4/0 (CMYK)",
    acabados: "Barniz UV brillante en logo",
    prioridad: "alta",
    fecha_entrega: "2026-10-16",
    estado: "en_puerta",
    area_actual_id: null,
    creada_por: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002",
    usa_planchas_existentes: false,
    notas_acabado: "Barniz UV brillante en logo",
    liberada_en: null,
    liberada_por: null,
    despachada_en: null,
    despachada_a: null,
    guia_despacho: null,
    created_at: "2026-10-14T10:00:00Z",
    updated_at: "2026-10-14T10:00:00Z",
  },
  {
    id: "55555555-5555-5555-5555-555555555502",
    codigo: "OT-0002",
    cliente_id: "33333333-3333-3333-3333-333333333302",
    tipo_trabajo_id: "44444444-4444-4444-4444-444444444401",
    titulo: "Cajas Bombones Gourmet Selección",
    descripcion: "Cartulina kraft liner virgen con ventana troquelada.",
    cantidad: 2000,
    material: "Kraft liner 350g",
    medidas: "120 x 80 x 40 mm",
    tintas: "2/0 (Negro + Dorado)",
    acabados: "Hot stamping dorado",
    prioridad: "urgente",
    fecha_entrega: "2026-10-15",
    estado: "en_produccion",
    area_actual_id: "11111111-1111-1111-1111-111111111102", // Impresión / Secado
    creada_por: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002",
    usa_planchas_existentes: false,
    notas_acabado: "Hot stamping dorado",
    liberada_en: "2026-10-14T08:35:00Z",
    liberada_por: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002",
    despachada_en: null,
    despachada_a: null,
    guia_despacho: null,
    created_at: "2026-10-14T08:30:00Z",
    updated_at: "2026-10-14T09:15:00Z",
  },
  {
    id: "55555555-5555-5555-5555-555555555503",
    codigo: "OT-0003",
    cliente_id: "33333333-3333-3333-3333-333333333303",
    tipo_trabajo_id: "44444444-4444-4444-4444-444444444402",
    titulo: "Trípticos Lanzamiento Inmobiliario",
    descripcion: "Papel glasé 150g brillo con doble pliegue envolvente.",
    cantidad: 3000,
    material: "Glasé brillante 150g",
    medidas: "Carta abierto (21.5 x 28 cm)",
    tintas: "4/4 (Ambas caras CMYK)",
    acabados: "Pliegue tríptico envolvente",
    prioridad: "normal",
    fecha_entrega: "2026-10-18",
    estado: "lista_despacho",
    area_actual_id: "11111111-1111-1111-1111-111111111111", // Despacho
    creada_por: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001",
    usa_planchas_existentes: true,
    notas_acabado: null,
    liberada_en: "2026-10-13T14:05:00Z",
    liberada_por: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001",
    despachada_en: null,
    despachada_a: null,
    guia_despacho: null,
    created_at: "2026-10-13T14:00:00Z",
    updated_at: "2026-10-14T11:00:00Z",
  },
];

// Etapas de las órdenes iniciales
export const INITIAL_ETAPAS: OrdenEtapaRow[] = [
  // OT-0001 (En Puerta - todas bloqueadas hasta que se libere)
  {
    id: "66666666-6666-6666-6666-666666666601",
    orden_id: "55555555-5555-5555-5555-555555555501",
    area_id: "11111111-1111-1111-1111-111111111101", // Diseño
    secuencia: 1,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T10:00:00Z",
    updated_at: "2026-10-14T10:00:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666602",
    orden_id: "55555555-5555-5555-5555-555555555501",
    area_id: "11111111-1111-1111-1111-111111111105", // Planchas
    secuencia: 2,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T10:00:00Z",
    updated_at: "2026-10-14T10:00:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666603",
    orden_id: "55555555-5555-5555-5555-555555555501",
    area_id: "11111111-1111-1111-1111-111111111106", // Prep. materiales
    secuencia: 3,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T10:00:00Z",
    updated_at: "2026-10-14T10:00:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666604",
    orden_id: "55555555-5555-5555-5555-555555555501",
    area_id: "11111111-1111-1111-1111-111111111102", // Impresión/Secado
    secuencia: 4,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T10:00:00Z",
    updated_at: "2026-10-14T10:00:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666612",
    orden_id: "55555555-5555-5555-5555-555555555501",
    area_id: "11111111-1111-1111-1111-111111111107", // Acabado
    secuencia: 5,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T10:00:00Z",
    updated_at: "2026-10-14T10:00:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666613",
    orden_id: "55555555-5555-5555-5555-555555555501",
    area_id: "11111111-1111-1111-1111-111111111103", // Troquelado
    secuencia: 6,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T10:00:00Z",
    updated_at: "2026-10-14T10:00:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666614",
    orden_id: "55555555-5555-5555-5555-555555555501",
    area_id: "11111111-1111-1111-1111-111111111104", // Corte/Refile
    secuencia: 7,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T10:00:00Z",
    updated_at: "2026-10-14T10:00:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666615",
    orden_id: "55555555-5555-5555-5555-555555555501",
    area_id: "11111111-1111-1111-1111-111111111109", // Control de calidad
    secuencia: 8,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T10:00:00Z",
    updated_at: "2026-10-14T10:00:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666616",
    orden_id: "55555555-5555-5555-5555-555555555501",
    area_id: "11111111-1111-1111-1111-111111111110", // Embalaje
    secuencia: 9,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T10:00:00Z",
    updated_at: "2026-10-14T10:00:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666617",
    orden_id: "55555555-5555-5555-5555-555555555501",
    area_id: "11111111-1111-1111-1111-111111111111", // Despacho
    secuencia: 10,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T10:00:00Z",
    updated_at: "2026-10-14T10:00:00Z",
  },

  // OT-0002 (En Impresión / Secado)
  {
    id: "66666666-6666-6666-6666-666666666605",
    orden_id: "55555555-5555-5555-5555-555555555502",
    area_id: "11111111-1111-1111-1111-111111111101", // Diseño
    secuencia: 1,
    estado: "terminada",
    operador_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004",
    iniciada_en: "2026-10-14T08:35:00Z",
    terminada_en: "2026-10-14T09:10:00Z",
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 35,
    created_at: "2026-10-14T08:30:00Z",
    updated_at: "2026-10-14T09:10:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666618",
    orden_id: "55555555-5555-5555-5555-555555555502",
    area_id: "11111111-1111-1111-1111-111111111105", // Planchas
    secuencia: 2,
    estado: "terminada",
    operador_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004",
    iniciada_en: "2026-10-14T09:10:00Z",
    terminada_en: "2026-10-14T09:20:00Z",
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 10,
    created_at: "2026-10-14T08:30:00Z",
    updated_at: "2026-10-14T09:20:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666619",
    orden_id: "55555555-5555-5555-5555-555555555502",
    area_id: "11111111-1111-1111-1111-111111111106", // Prep. materiales
    secuencia: 3,
    estado: "terminada",
    operador_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    iniciada_en: "2026-10-14T09:20:00Z",
    terminada_en: "2026-10-14T09:30:00Z",
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 10,
    created_at: "2026-10-14T08:30:00Z",
    updated_at: "2026-10-14T09:30:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666606",
    orden_id: "55555555-5555-5555-5555-555555555502",
    area_id: "11111111-1111-1111-1111-111111111102", // Impresión/Secado
    secuencia: 4,
    estado: "en_proceso",
    operador_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    iniciada_en: "2026-10-14T09:30:00Z",
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T08:30:00Z",
    updated_at: "2026-10-14T09:30:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666620",
    orden_id: "55555555-5555-5555-5555-555555555502",
    area_id: "11111111-1111-1111-1111-111111111107", // Acabado
    secuencia: 5,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T08:30:00Z",
    updated_at: "2026-10-14T08:30:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666607",
    orden_id: "55555555-5555-5555-5555-555555555502",
    area_id: "11111111-1111-1111-1111-111111111103", // Troquelado
    secuencia: 6,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T08:30:00Z",
    updated_at: "2026-10-14T08:30:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666608",
    orden_id: "55555555-5555-5555-5555-555555555502",
    area_id: "11111111-1111-1111-1111-111111111104", // Corte
    secuencia: 7,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T08:30:00Z",
    updated_at: "2026-10-14T08:30:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666621",
    orden_id: "55555555-5555-5555-5555-555555555502",
    area_id: "11111111-1111-1111-1111-111111111109", // Control de calidad
    secuencia: 8,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T08:30:00Z",
    updated_at: "2026-10-14T08:30:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666622",
    orden_id: "55555555-5555-5555-5555-555555555502",
    area_id: "11111111-1111-1111-1111-111111111110", // Embalaje
    secuencia: 9,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T08:30:00Z",
    updated_at: "2026-10-14T08:30:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666623",
    orden_id: "55555555-5555-5555-5555-555555555502",
    area_id: "11111111-1111-1111-1111-111111111111", // Despacho
    secuencia: 10,
    estado: "bloqueada",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T08:30:00Z",
    updated_at: "2026-10-14T08:30:00Z",
  },

  // OT-0003 (En Lista de Despacho)
  {
    id: "66666666-6666-6666-6666-666666666609",
    orden_id: "55555555-5555-5555-5555-555555555503",
    area_id: "11111111-1111-1111-1111-111111111101", // Diseño
    secuencia: 1,
    estado: "terminada",
    operador_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004",
    iniciada_en: "2026-10-13T14:10:00Z",
    terminada_en: "2026-10-13T15:00:00Z",
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 50,
    created_at: "2026-10-13T14:00:00Z",
    updated_at: "2026-10-13T15:00:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666624",
    orden_id: "55555555-5555-5555-5555-555555555503",
    area_id: "11111111-1111-1111-1111-111111111105", // Planchas
    secuencia: 2,
    estado: "omitida",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    omitida_motivo: "Usa planchas existentes",
    created_at: "2026-10-13T14:00:00Z",
    updated_at: "2026-10-13T14:05:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666625",
    orden_id: "55555555-5555-5555-5555-555555555503",
    area_id: "11111111-1111-1111-1111-111111111106", // Prep. materiales
    secuencia: 3,
    estado: "terminada",
    operador_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    iniciada_en: "2026-10-13T15:00:00Z",
    terminada_en: "2026-10-13T15:15:00Z",
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 15,
    created_at: "2026-10-13T14:00:00Z",
    updated_at: "2026-10-13T15:15:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666610",
    orden_id: "55555555-5555-5555-5555-555555555503",
    area_id: "11111111-1111-1111-1111-111111111102", // Impresión/Secado
    secuencia: 4,
    estado: "terminada",
    operador_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    iniciada_en: "2026-10-13T15:15:00Z",
    terminada_en: "2026-10-13T17:45:00Z",
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 150,
    created_at: "2026-10-13T14:00:00Z",
    updated_at: "2026-10-13T17:45:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666626",
    orden_id: "55555555-5555-5555-5555-555555555503",
    area_id: "11111111-1111-1111-1111-111111111107", // Acabado (omitido)
    secuencia: 5,
    estado: "omitida",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    omitida_motivo: "Sin acabados especiales",
    created_at: "2026-10-13T14:00:00Z",
    updated_at: "2026-10-13T14:05:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666611",
    orden_id: "55555555-5555-5555-5555-555555555503",
    area_id: "11111111-1111-1111-1111-111111111104", // Corte/Refile
    secuencia: 6,
    estado: "terminada",
    operador_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007",
    iniciada_en: "2026-10-14T08:00:00Z",
    terminada_en: "2026-10-14T09:00:00Z",
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 60,
    created_at: "2026-10-13T14:00:00Z",
    updated_at: "2026-10-14T09:00:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666627",
    orden_id: "55555555-5555-5555-5555-555555555503",
    area_id: "11111111-1111-1111-1111-111111111108", // Encuadernación/Manual
    secuencia: 7,
    estado: "terminada",
    operador_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007",
    iniciada_en: "2026-10-14T09:00:00Z",
    terminada_en: "2026-10-14T10:00:00Z",
    minutos_trabajados: 60,
    motivo_pausa_id: null,
    nota_pausa: null,
    created_at: "2026-10-13T14:00:00Z",
    updated_at: "2026-10-14T10:00:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666628",
    orden_id: "55555555-5555-5555-5555-555555555503",
    area_id: "11111111-1111-1111-1111-111111111109", // Control de calidad
    secuencia: 8,
    estado: "terminada",
    operador_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003",
    iniciada_en: "2026-10-14T10:00:00Z",
    terminada_en: "2026-10-14T10:20:00Z",
    minutos_trabajados: 20,
    motivo_pausa_id: null,
    nota_pausa: null,
    created_at: "2026-10-13T14:00:00Z",
    updated_at: "2026-10-14T10:20:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666629",
    orden_id: "55555555-5555-5555-5555-555555555503",
    area_id: "11111111-1111-1111-1111-111111111110", // Embalaje
    secuencia: 9,
    estado: "terminada",
    operador_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0008",
    iniciada_en: "2026-10-14T10:20:00Z",
    terminada_en: "2026-10-14T10:50:00Z",
    minutos_trabajados: 30,
    motivo_pausa_id: null,
    nota_pausa: null,
    created_at: "2026-10-13T14:00:00Z",
    updated_at: "2026-10-14T10:50:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666630",
    orden_id: "55555555-5555-5555-5555-555555555503",
    area_id: "11111111-1111-1111-1111-111111111111", // Despacho
    secuencia: 10,
    estado: "en_cola",
    operador_id: null,
    iniciada_en: null,
    terminada_en: null,
    minutos_trabajados: 0,
    motivo_pausa_id: null,
    nota_pausa: null,
    created_at: "2026-10-13T14:00:00Z",
    updated_at: "2026-10-14T10:50:00Z",
  },
];

// Eventos iniciales
export const INITIAL_EVENTOS: EventoOrdenRow[] = [
  {
    id: "77777777-7777-7777-7777-777777777701",
    orden_id: "55555555-5555-5555-5555-555555555501",
    etapa_id: null,
    usuario_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002",
    tipo: "creada",
    detalle: { codigo: "OT-0001", titulo: "Cajas Jarabe Tos Infantil 120ml", cantidad: 5000 },
    created_at: "2026-10-14T10:00:00Z",
  },
  {
    id: "77777777-7777-7777-7777-777777777702",
    orden_id: "55555555-5555-5555-5555-555555555502",
    etapa_id: null,
    usuario_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002",
    tipo: "creada",
    detalle: { codigo: "OT-0002", titulo: "Cajas Bombones Gourmet Selección", cantidad: 2000 },
    created_at: "2026-10-14T08:30:00Z",
  },
  {
    id: "77777777-7777-7777-7777-777777777703",
    orden_id: "55555555-5555-5555-5555-555555555502",
    etapa_id: "66666666-6666-6666-6666-666666666605",
    usuario_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004",
    tipo: "iniciada",
    detalle: { area: "Diseño" },
    created_at: "2026-10-14T08:35:00Z",
  },
  {
    id: "77777777-7777-7777-7777-777777777704",
    orden_id: "55555555-5555-5555-5555-555555555502",
    etapa_id: "66666666-6666-6666-6666-666666666605",
    usuario_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004",
    tipo: "terminada",
    detalle: { area: "Diseño", minutos_trabajados: 35 },
    created_at: "2026-10-14T09:10:00Z",
  },
  {
    id: "77777777-7777-7777-7777-777777777705",
    orden_id: "55555555-5555-5555-5555-555555555502",
    etapa_id: "66666666-6666-6666-6666-666666666606",
    usuario_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    tipo: "iniciada",
    detalle: { area: "Impresión" },
    created_at: "2026-10-14T09:15:00Z",
  },
];

// Comentarios iniciales
export const INITIAL_COMENTARIOS: ComentarioRow[] = [
  {
    id: "88888888-8888-8888-8888-888888888801",
    orden_id: "55555555-5555-5555-5555-555555555501",
    autor_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002",
    texto: "El cliente solicitó enviar muestra digital para aprobación antes de troquelar.",
    created_at: "2026-10-14T10:05:00Z",
  },
  {
    id: "88888888-8888-8888-8888-888888888802",
    orden_id: "55555555-5555-5555-5555-555555555502",
    autor_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    texto: "Papel recibido conforme. Prensas listas.",
    created_at: "2026-10-14T09:20:00Z",
  },
];

export const INITIAL_PROFILES: ProfileRow[] = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001",
    nombre_completo: "Administrador General",
    usuario: "admin",
    rol: "admin",
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002",
    nombre_completo: "Atención y Recepción",
    usuario: "recepcion",
    rol: "recepcion",
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0003",
    nombre_completo: "Supervisor de Planta",
    usuario: "supervisor",
    rol: "supervisor",
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004",
    nombre_completo: "Operador de Diseño",
    usuario: "op_diseno",
    rol: "operador",
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    nombre_completo: "Operador de Impresión",
    usuario: "op_impresion",
    rol: "operador",
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0006",
    nombre_completo: "Operador de Troquelado",
    usuario: "op_troquelado",
    rol: "operador",
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007",
    nombre_completo: "Operador de Corte",
    usuario: "op_corte",
    rol: "operador",
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0008",
    nombre_completo: "Operador de Logística y Despacho",
    usuario: "op_logistica",
    rol: "operador",
    activo: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
];

// Estado mutable global en memoria para desarrollo
class DataStore {
  areas: AreaRow[] = [...INITIAL_AREAS];
  perfiles: ProfileRow[] = [...INITIAL_PROFILES];
  motivosPausa: MotivoPausaRow[] = [...INITIAL_MOTIVOS_PAUSA];
  clientes: ClienteRow[] = [...INITIAL_CLIENTES];
  tiposTrabajo: TipoTrabajoRow[] = [...INITIAL_TIPOS_TRABAJO];
  ordenes: OrdenRow[] = [...INITIAL_ORDENES];
  etapas: OrdenEtapaRow[] = [...INITIAL_ETAPAS];
  eventos: EventoOrdenRow[] = [...INITIAL_EVENTOS];
  comentarios: ComentarioRow[] = [...INITIAL_COMENTARIOS];
  acabados: AcabadoRow[] = [...INITIAL_ACABADOS];
  proveedores: ProveedorRow[] = [...INITIAL_PROVEEDORES];
  usuarioAreas: UsuarioAreaRow[] = [...INITIAL_USUARIO_AREAS];
  ordenAcabados: OrdenAcabadoRow[] = [
    { orden_id: "55555555-5555-5555-5555-555555555501", acabado_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0004", created_at: "2026-10-14T10:00:00Z" }, // Barniz UV Sectorizado
    { orden_id: "55555555-5555-5555-5555-555555555502", acabado_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0005", created_at: "2026-10-14T08:30:00Z" }, // Hot Stamping Dorado
  ];
  rechazosCalidad: RechazoCalidadRow[] = [];
  mockups: MockupEmpaqueRow[] = [
    {
      id: "99999999-9999-9999-9999-999999999901",
      orden_id: "55555555-5555-5555-5555-555555555501", // OT-0001
      modelo_tipo: "caja_tuck_end",
      ancho_cm: 15,
      alto_cm: 20,
      profundidad_cm: 8,
      grosor_mm: 0.5,
      textura_arte_url: null,
      textura_acabado_url: null,
      acabado_barniz_uv: true,
      acabado_hot_stamping: "oro",
      acabado_relieve: false,
      angulo_apertura: 0,
      snapshot_url: null,
      creado_por: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0004",
      created_at: "2026-10-14T00:00:00Z",
      updated_at: "2026-10-14T00:00:00Z",
    },
  ];
  aprobaciones: AprobacionClienteRow[] = [
    {
      id: "88888888-8888-8888-8888-888888888801",
      token: "demo-aprobacion-ot0001",
      orden_id: "55555555-5555-5555-5555-555555555501",
      mockup_id: "99999999-9999-9999-9999-999999999901",
      estado: "pendiente",
      fecha_envio: "2026-10-14T00:00:00Z",
      fecha_respuesta: null,
      aprobado_por_nombre: null,
      aprobado_por_cargo_dni: null,
      comentarios_cliente: null,
      ip_cliente: null,
      user_agent: null,
      created_at: "2026-10-14T00:00:00Z",
      updated_at: "2026-10-14T00:00:00Z",
    },
  ];
  nextOtNum = 4;

  crearOrden(data: {
    cliente_id: string;
    tipo_trabajo_id: string;
    titulo: string;
    descripcion?: string | null;
    cantidad: number;
    material?: string | null;
    medidas?: string | null;
    tintas?: string | null;
    acabados?: string | null;
    prioridad: OrdenRow["prioridad"];
    fecha_entrega: string;
    ruta?: string[] | null;
    creada_por?: string | null;
    usa_planchas_existentes?: boolean;
    acabado_ids?: string[];
    notas_acabado?: string | null;
  }) {
    const codigo = `OT-${String(this.nextOtNum++).padStart(4, "0")}`;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    let ruta = data.ruta;
    if (!ruta || ruta.length === 0) {
      const tt = this.tiposTrabajo.find((t) => t.id === data.tipo_trabajo_id);
      ruta = tt ? tt.ruta : this.areas.map((a) => a.id);
    }

    const nuevaOrden: OrdenRow = {
      id,
      codigo,
      cliente_id: data.cliente_id,
      tipo_trabajo_id: data.tipo_trabajo_id,
      titulo: data.titulo,
      descripcion: data.descripcion || null,
      cantidad: data.cantidad,
      material: data.material || null,
      medidas: data.medidas || null,
      tintas: data.tintas || null,
      acabados: data.acabados || null,
      prioridad: data.prioridad,
      fecha_entrega: data.fecha_entrega,
      estado: "en_puerta", // Fase 4: nace en_puerta
      area_actual_id: null,
      creada_por: data.creada_por || null,
      usa_planchas_existentes: data.usa_planchas_existentes ?? false,
      notas_acabado: data.notas_acabado || null,
      liberada_en: null,
      liberada_por: null,
      despachada_en: null,
      despachada_a: null,
      guia_despacho: null,
      created_at: now,
      updated_at: now,
    };

    this.ordenes.unshift(nuevaOrden);

    // Relación de acabados
    if (data.acabado_ids && data.acabado_ids.length > 0) {
      data.acabado_ids.forEach((acabadoId) => {
        this.ordenAcabados.push({
          orden_id: id,
          acabado_id: acabadoId,
          created_at: now,
        });
      });
    }

    // Crear etapas
    ruta.forEach((areaId, idx) => {
      const area = this.areas.find((a) => a.id === areaId);
      let estado: OrdenEtapaRow["estado"] = "bloqueada";
      let omitidaMotivo: string | null = null;

      // Auto-omisión de etapas condicionales si aplica
      if (area?.slug === "planchas" && data.usa_planchas_existentes) {
        estado = "omitida";
        omitidaMotivo = "Usa planchas existentes";
      } else if (area?.slug === "acabado" && (!data.acabado_ids || data.acabado_ids.length === 0)) {
        estado = "omitida";
        omitidaMotivo = "Sin acabados seleccionados";
      }

      this.etapas.push({
        id: crypto.randomUUID(),
        orden_id: id,
        area_id: areaId,
        secuencia: idx + 1,
        estado,
        operador_id: null,
        iniciada_en: null,
        terminada_en: null,
        motivo_pausa_id: null,
        nota_pausa: null,
        minutos_trabajados: 0,
        omitida_motivo: omitidaMotivo,
        intento: 1,
        created_at: now,
        updated_at: now,
      });
    });

    // Registrar evento de creación
    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: id,
      etapa_id: null,
      usuario_id: data.creada_por || null,
      tipo: "creada",
      detalle: { codigo, titulo: data.titulo, cantidad: data.cantidad },
      created_at: now,
    });

    return { ok: true, id, codigo };
  }

  liberarOrden(ordenId: string, usuarioId?: string | null) {
    const orden = this.ordenes.find((o) => o.id === ordenId);
    if (!orden) throw new Error("Orden no encontrada");
    if (orden.estado !== "en_puerta") throw new Error("La orden ya está en proceso o no está en puerta");

    const now = new Date().toISOString();
    const etapasOrden = this.etapas
      .filter((e) => e.orden_id === ordenId)
      .sort((a, b) => a.secuencia - b.secuencia);

    // Encontrar la primera etapa no omitida
    const primeraEtapa = etapasOrden.find((e) => e.estado !== "omitida");
    if (!primeraEtapa) throw new Error("No hay etapas disponibles para iniciar");

    primeraEtapa.estado = "en_cola";
    primeraEtapa.updated_at = now;

    orden.estado = "en_produccion";
    orden.area_actual_id = primeraEtapa.area_id;
    orden.liberada_en = now;
    orden.liberada_por = usuarioId || null;
    orden.updated_at = now;

    const area = this.areas.find((a) => a.id === primeraEtapa.area_id);
    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: ordenId,
      etapa_id: primeraEtapa.id,
      usuario_id: usuarioId || null,
      tipo: "liberada",
      detalle: { area_inicial: area?.nombre, mensaje: "Orden liberada a planta" },
      created_at: now,
    });

    return { ok: true };
  }

  iniciarEtapa(etapaId: string, operadorId?: string | null) {
    const etapa = this.etapas.find((e) => e.id === etapaId);
    if (!etapa) throw new Error("Etapa no encontrada");

    const now = new Date().toISOString();
    etapa.estado = "en_proceso";
    etapa.iniciada_en = etapa.iniciada_en || now;
    etapa.operador_id = operadorId || etapa.operador_id;
    etapa.updated_at = now;

    const orden = this.ordenes.find((o) => o.id === etapa.orden_id);
    if (orden) {
      orden.area_actual_id = etapa.area_id;
      orden.estado = "en_produccion";
      orden.updated_at = now;
    }

    const area = this.areas.find((a) => a.id === etapa.area_id);
    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: etapa.orden_id,
      etapa_id: etapaId,
      usuario_id: operadorId || null,
      tipo: "iniciada",
      detalle: { area: area?.nombre || "Área", secuencia: etapa.secuencia },
      created_at: now,
    });

    return { ok: true };
  }

  pausarEtapa(etapaId: string, motivoId: string, nota?: string | null, usuarioId?: string | null) {
    const etapa = this.etapas.find((e) => e.id === etapaId);
    if (!etapa) throw new Error("Etapa no encontrada");

    const now = new Date().toISOString();
    etapa.estado = "pausada";
    etapa.motivo_pausa_id = motivoId;
    etapa.nota_pausa = nota || null;
    etapa.updated_at = now;

    const motivo = this.motivosPausa.find((m) => m.id === motivoId);
    const area = this.areas.find((a) => a.id === etapa.area_id);

    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: etapa.orden_id,
      etapa_id: etapaId,
      usuario_id: usuarioId || null,
      tipo: "pausada",
      detalle: {
        motivo: motivo?.texto || "Pausa operativa",
        nota,
        area: area?.nombre,
      },
      created_at: now,
    });

    return { ok: true };
  }

  reanudarEtapa(etapaId: string, usuarioId?: string | null) {
    const etapa = this.etapas.find((e) => e.id === etapaId);
    if (!etapa) throw new Error("Etapa no encontrada");

    const now = new Date().toISOString();
    etapa.estado = "en_proceso";
    etapa.motivo_pausa_id = null;
    etapa.nota_pausa = null;
    etapa.updated_at = now;

    const area = this.areas.find((a) => a.id === etapa.area_id);

    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: etapa.orden_id,
      etapa_id: etapaId,
      usuario_id: usuarioId || null,
      tipo: "reanudada",
      detalle: { area: area?.nombre },
      created_at: now,
    });

    return { ok: true };
  }

  terminarEtapa(etapaId: string, usuarioId?: string | null) {
    const etapa = this.etapas.find((e) => e.id === etapaId);
    if (!etapa) throw new Error("Etapa no encontrada");

    const now = new Date();
    let minutos = 15;
    if (etapa.iniciada_en) {
      minutos = Math.max(1, Math.round((now.getTime() - new Date(etapa.iniciada_en).getTime()) / 60000));
    }

    etapa.estado = "terminada";
    etapa.terminada_en = now.toISOString();
    etapa.minutos_trabajados = (etapa.minutos_trabajados || 0) + minutos;
    etapa.updated_at = now.toISOString();

    // Siguiente etapa no omitida
    const siguientes = this.etapas
      .filter((e) => e.orden_id === etapa.orden_id && e.secuencia > etapa.secuencia && e.estado !== "omitida")
      .sort((a, b) => a.secuencia - b.secuencia);

    const siguiente = siguientes[0];
    const siguienteArea = siguiente ? this.areas.find((a) => a.id === siguiente.area_id) : null;
    const orden = this.ordenes.find((o) => o.id === etapa.orden_id);
    const area = this.areas.find((a) => a.id === etapa.area_id);
    const esFinalODespacho = !siguiente || !!siguienteArea?.es_despacho;

    if (siguiente) {
      siguiente.estado = "en_cola";
      siguiente.updated_at = now.toISOString();
    }

    if (orden) {
      if (esFinalODespacho) {
        orden.estado = "lista_despacho";
        const areaDespacho = siguienteArea || this.areas.find((a) => a.es_despacho);
        orden.area_actual_id = areaDespacho?.id || null;
      } else if (siguiente) {
        orden.area_actual_id = siguiente.area_id;
      }
      orden.updated_at = now.toISOString();
    }

    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: etapa.orden_id,
      etapa_id: etapaId,
      usuario_id: usuarioId || null,
      tipo: "terminada",
      detalle: {
        area: area?.nombre,
        minutos_trabajados: minutos,
        es_final: esFinalODespacho,
      },
      created_at: now.toISOString(),
    });

    return { ok: true, es_final: esFinalODespacho };
  }

  enviarAProveedor(
    etapaId: string,
    proveedorId: string,
    usuarioId?: string | null,
    guiaSalida?: string | null
  ) {
    const etapa = this.etapas.find((e) => e.id === etapaId);
    if (!etapa) throw new Error("Etapa no encontrada");

    const now = new Date().toISOString();
    etapa.estado = "esperando_proveedor";
    etapa.proveedor_id = proveedorId;
    if (guiaSalida) etapa.guia_salida = guiaSalida;
    etapa.enviado_proveedor_en = now;
    etapa.updated_at = now;

    const proveedor = this.proveedores.find((p) => p.id === proveedorId);
    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: etapa.orden_id,
      etapa_id: etapaId,
      usuario_id: usuarioId || null,
      tipo: "enviado_proveedor",
      detalle: {
        proveedor: proveedor?.nombre || "Proveedor externo",
        guia_salida: guiaSalida || null,
        fecha: now,
      },
      created_at: now,
    });

    return { ok: true };
  }

  salidaProveedor(
    etapaId: string,
    proveedorId: string,
    guiaSalida?: string | null,
    usuarioId?: string | null
  ) {
    return this.enviarAProveedor(etapaId, proveedorId, usuarioId, guiaSalida);
  }

  recibirDeProveedor(
    etapaId: string,
    usuarioId?: string | null,
    guiaRetorno?: string | null
  ) {
    const etapa = this.etapas.find((e) => e.id === etapaId);
    if (!etapa) throw new Error("Etapa no encontrada");

    const now = new Date().toISOString();
    etapa.estado = "en_proceso";
    etapa.recibido_proveedor_en = now;
    if (guiaRetorno) etapa.guia_retorno = guiaRetorno;
    etapa.updated_at = now;

    const proveedor = this.proveedores.find((p) => p.id === etapa.proveedor_id);
    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: etapa.orden_id,
      etapa_id: etapaId,
      usuario_id: usuarioId || null,
      tipo: "recibido_proveedor",
      detalle: {
        proveedor: proveedor?.nombre,
        guia_retorno: guiaRetorno || null,
        fecha: now,
      },
      created_at: now,
    });

    return { ok: true };
  }

  retornoProveedor(
    etapaId: string,
    guiaRetorno?: string | null,
    usuarioId?: string | null
  ) {
    return this.recibirDeProveedor(etapaId, usuarioId, guiaRetorno);
  }

  iniciarSecado(etapaId: string, horas: number = 4, usuarioId?: string | null) {
    const etapa = this.etapas.find((e) => e.id === etapaId);
    if (!etapa) throw new Error("Etapa no encontrada");

    const now = new Date();
    const secadoHasta = new Date(now.getTime() + horas * 3600000).toISOString();

    etapa.estado = "secando";
    etapa.secado_hasta = secadoHasta;
    etapa.updated_at = now.toISOString();

    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: etapa.orden_id,
      etapa_id: etapaId,
      usuario_id: usuarioId || null,
      tipo: "secando",
      detalle: { horas, secado_hasta: secadoHasta },
      created_at: now.toISOString(),
    });

    return { ok: true, secado_hasta: secadoHasta };
  }

  completarSecado(etapaId: string, forzar: boolean = false, usuarioId?: string | null) {
    const etapa = this.etapas.find((e) => e.id === etapaId);
    if (!etapa) throw new Error("Etapa no encontrada");

    if (etapa.estado === "secando" && etapa.secado_hasta && !forzar) {
      if (new Date() < new Date(etapa.secado_hasta)) {
        throw new Error("El tiempo de secado programado aún no concluye");
      }
    }

    return this.terminarEtapa(etapaId, usuarioId);
  }

  omitirEtapa(etapaId: string, motivo: string, usuarioId?: string | null) {
    const etapa = this.etapas.find((e) => e.id === etapaId);
    if (!etapa) throw new Error("Etapa no encontrada");

    const now = new Date().toISOString();
    etapa.estado = "omitida";
    etapa.omitida_motivo = motivo;
    etapa.updated_at = now;

    // Encontrar siguiente etapa
    const siguientes = this.etapas
      .filter((e) => e.orden_id === etapa.orden_id && e.secuencia > etapa.secuencia && e.estado !== "omitida")
      .sort((a, b) => a.secuencia - b.secuencia);

    const siguiente = siguientes[0];
    const orden = this.ordenes.find((o) => o.id === etapa.orden_id);
    if (siguiente) {
      siguiente.estado = "en_cola";
      siguiente.updated_at = now;
      if (orden) {
        orden.area_actual_id = siguiente.area_id;
        orden.updated_at = now;
      }
    }

    const area = this.areas.find((a) => a.id === etapa.area_id);
    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: etapa.orden_id,
      etapa_id: etapaId,
      usuario_id: usuarioId || null,
      tipo: "omitida",
      detalle: { area: area?.nombre, motivo },
      created_at: now,
    });

    return { ok: true };
  }

  aprobarCalidad(etapaId: string, usuarioId?: string | null) {
    return this.terminarEtapa(etapaId, usuarioId);
  }

  rechazarCalidad(
    etapaId: string,
    areaDestinoId: string,
    motivo: string,
    cantidadAfectada?: number | null,
    usuarioId?: string | null
  ) {
    const etapa = this.etapas.find((e) => e.id === etapaId);
    if (!etapa) throw new Error("Etapa no encontrada");

    const now = new Date().toISOString();
    etapa.intento = (etapa.intento || 1) + 1;
    etapa.updated_at = now;

    const rechazo: RechazoCalidadRow = {
      id: crypto.randomUUID(),
      orden_id: etapa.orden_id,
      etapa_qc_id: etapaId,
      area_destino_id: areaDestinoId,
      motivo,
      cantidad_afectada: cantidadAfectada || null,
      usuario_id: usuarioId || null,
      created_at: now,
    };
    this.rechazosCalidad.unshift(rechazo);

    // Encontrar la secuencia destino
    const etapaDestino = this.etapas.find(
      (e) => e.orden_id === etapa.orden_id && e.area_id === areaDestinoId
    );
    if (!etapaDestino) throw new Error("Área destino no encontrada en la ruta de la orden");

    // Reiniciar etapas desde la destino hasta la QC
    this.etapas.forEach((e) => {
      if (e.orden_id === etapa.orden_id && e.secuencia >= etapaDestino.secuencia && e.secuencia <= etapa.secuencia) {
        if (e.secuencia === etapaDestino.secuencia) {
          e.estado = "en_cola";
          e.intento = (e.intento || 1) + 1;
        } else if (e.estado !== "omitida") {
          e.estado = "bloqueada";
        }
        e.updated_at = now;
      }
    });

    const orden = this.ordenes.find((o) => o.id === etapa.orden_id);
    if (orden) {
      orden.area_actual_id = areaDestinoId;
      orden.estado = "en_produccion";
      orden.updated_at = now;
    }

    const areaDest = this.areas.find((a) => a.id === areaDestinoId);
    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: etapa.orden_id,
      etapa_id: etapaId,
      usuario_id: usuarioId || null,
      tipo: "rechazo_calidad",
      detalle: {
        motivo,
        area_destino: areaDest?.nombre,
        cantidad_afectada: cantidadAfectada,
        intento: etapa.intento,
      },
      created_at: now,
    });

    return { ok: true, rechazo };
  }

  despachar(ordenId: string, guiaDespacho?: string | null, despachadaA?: string | null, usuarioId?: string | null) {
    const orden = this.ordenes.find((o) => o.id === ordenId);
    if (!orden) throw new Error("Orden no encontrada");

    const now = new Date().toISOString();
    orden.estado = "despachada";
    orden.despachada_en = now;
    orden.despachada_a = despachadaA || null;
    orden.guia_despacho = guiaDespacho || null;
    orden.entregada_en = now;
    orden.entregada_a = despachadaA || null;
    orden.area_actual_id = null;
    orden.updated_at = now;

    // Terminar etapa de despacho si existe
    const etapaDespacho = this.etapas.find(
      (e) => e.orden_id === ordenId && this.areas.find((a) => a.id === e.area_id)?.es_despacho
    );
    if (etapaDespacho) {
      etapaDespacho.estado = "terminada";
      etapaDespacho.terminada_en = now;
      etapaDespacho.updated_at = now;
    }

    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: ordenId,
      etapa_id: etapaDespacho?.id || null,
      usuario_id: usuarioId || null,
      tipo: "despachada",
      detalle: { guia_despacho: guiaDespacho, despachada_a: despachadaA, fecha: now },
      created_at: now,
    });

    return { ok: true };
  }

  marcarEntregada(ordenId: string, entregadaA: string, usuarioId?: string | null) {
    return this.despachar(ordenId, null, entregadaA, usuarioId);
  }

  agregarComentario(ordenId: string, texto: string, autorId?: string | null) {
    const comentario: ComentarioRow = {
      id: crypto.randomUUID(),
      orden_id: ordenId,
      autor_id: autorId || null,
      texto,
      created_at: new Date().toISOString(),
    };
    this.comentarios.unshift(comentario);
    return { ok: true, comentario };
  }

  guardarMockup(data: {
    orden_id: string;
    modelo_tipo?: MockupEmpaqueRow["modelo_tipo"];
    ancho_cm?: number;
    alto_cm?: number;
    profundidad_cm?: number;
    grosor_mm?: number;
    textura_arte_url?: string | null;
    textura_acabado_url?: string | null;
    acabado_barniz_uv?: boolean;
    acabado_hot_stamping?: MockupEmpaqueRow["acabado_hot_stamping"];
    acabado_relieve?: boolean;
    angulo_apertura?: number;
    snapshot_url?: string | null;
    creado_por?: string | null;
  }) {
    let mockup = this.mockups.find((m) => m.orden_id === data.orden_id);
    const now = new Date().toISOString();
    if (mockup) {
      Object.assign(mockup, {
        ...data,
        updated_at: now,
      });
    } else {
      mockup = {
        id: crypto.randomUUID(),
        orden_id: data.orden_id,
        modelo_tipo: data.modelo_tipo || "caja_tuck_end",
        ancho_cm: data.ancho_cm ?? 15,
        alto_cm: data.alto_cm ?? 20,
        profundidad_cm: data.profundidad_cm ?? 8,
        grosor_mm: data.grosor_mm ?? 0.5,
        textura_arte_url: data.textura_arte_url || null,
        textura_acabado_url: data.textura_acabado_url || null,
        acabado_barniz_uv: data.acabado_barniz_uv ?? false,
        acabado_hot_stamping: data.acabado_hot_stamping || "ninguno",
        acabado_relieve: data.acabado_relieve ?? false,
        angulo_apertura: data.angulo_apertura ?? 0,
        snapshot_url: data.snapshot_url || null,
        creado_por: data.creado_por || null,
        created_at: now,
        updated_at: now,
      };
      this.mockups.push(mockup);
    }
    return mockup;
  }

  obtenerMockupPorOrden(ordenId: string): MockupEmpaqueRow | null {
    return this.mockups.find((m) => m.orden_id === ordenId) || null;
  }

  generarTokenAprobacion(ordenId: string, mockupId: string) {
    const token = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    const now = new Date().toISOString();
    const aprobacion: AprobacionClienteRow = {
      id: crypto.randomUUID(),
      token,
      orden_id: ordenId,
      mockup_id: mockupId,
      estado: "pendiente",
      fecha_envio: now,
      fecha_respuesta: null,
      aprobado_por_nombre: null,
      aprobado_por_cargo_dni: null,
      comentarios_cliente: null,
      ip_cliente: null,
      user_agent: null,
      created_at: now,
      updated_at: now,
    };
    this.aprobaciones.push(aprobacion);

    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: ordenId,
      etapa_id: null,
      usuario_id: null,
      tipo: "comentario",
      detalle: { mensaje: "Se generó enlace de aprobación 3D para el cliente", token },
      created_at: now,
    });

    return { ok: true, token, aprobacion };
  }

  obtenerAprobacionPorToken(token: string): {
    aprobacion: AprobacionClienteRow;
    orden: OrdenRow;
    mockup: MockupEmpaqueRow;
    cliente: ClienteRow;
  } | null {
    const aprobacion = this.aprobaciones.find((a) => a.token === token);
    if (!aprobacion) return null;

    const orden = this.ordenes.find((o) => o.id === aprobacion.orden_id);
    if (!orden) return null;

    const mockup = this.mockups.find((m) => m.id === aprobacion.mockup_id) || {
      id: aprobacion.mockup_id,
      orden_id: orden.id,
      modelo_tipo: "caja_tuck_end",
      ancho_cm: 15,
      alto_cm: 20,
      profundidad_cm: 8,
      grosor_mm: 0.5,
      textura_arte_url: null,
      textura_acabado_url: null,
      acabado_barniz_uv: false,
      acabado_hot_stamping: "ninguno",
      acabado_relieve: false,
      angulo_apertura: 0,
      snapshot_url: null,
      creado_por: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const cliente = this.clientes.find((c) => c.id === orden.cliente_id) || {
      id: orden.cliente_id,
      nombre: "Cliente General",
      empresa: null,
      telefono: null,
      email: null,
      notas: null,
      created_at: "",
      updated_at: "",
    };

    return { aprobacion, orden, mockup, cliente };
  }

  aprobarArteCliente(
    token: string,
    nombre: string,
    cargoDni?: string | null,
    ip?: string | null,
    userAgent?: string | null
  ) {
    const aprobacion = this.aprobaciones.find((a) => a.token === token);
    if (!aprobacion) throw new Error("Enlace de aprobación no encontrado");
    if (aprobacion.estado !== "pendiente") throw new Error("Este enlace ya fue procesado");

    const now = new Date().toISOString();
    aprobacion.estado = "aprobado";
    aprobacion.fecha_respuesta = now;
    aprobacion.aprobado_por_nombre = nombre.trim();
    aprobacion.aprobado_por_cargo_dni = cargoDni?.trim() || null;
    aprobacion.ip_cliente = ip || null;
    aprobacion.user_agent = userAgent || null;
    aprobacion.updated_at = now;

    // Buscar etapa con requiere_aprobacion_cliente = true
    const disenoArea = this.areas.find((a) => a.requiere_aprobacion_cliente);
    if (disenoArea) {
      const etapaDiseno = this.etapas.find(
        (e) => e.orden_id === aprobacion.orden_id && e.area_id === disenoArea.id
      );
      if (etapaDiseno && etapaDiseno.estado !== "terminada") {
        etapaDiseno.estado = "terminada";
        etapaDiseno.terminada_en = now;
        etapaDiseno.updated_at = now;

        // Activar siguiente etapa activa
        const siguiente = this.etapas
          .filter((e) => e.orden_id === aprobacion.orden_id && e.secuencia > etapaDiseno.secuencia && e.estado !== "omitida")
          .sort((a, b) => a.secuencia - b.secuencia)[0];

        if (siguiente) {
          siguiente.estado = "en_cola";
          siguiente.updated_at = now;
          const orden = this.ordenes.find((o) => o.id === aprobacion.orden_id);
          if (orden) {
            orden.area_actual_id = siguiente.area_id;
            orden.updated_at = now;
          }
        }
      }
    }

    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: aprobacion.orden_id,
      etapa_id: null,
      usuario_id: null,
      tipo: "cambio_estado",
      detalle: {
        descripcion: `Arte 3D APROBADO por el cliente: ${nombre}`,
        aprobado_por: nombre,
        cargo_dni: cargoDni,
      },
      created_at: now,
    });

    return { ok: true };
  }

  solicitarCambiosCliente(
    token: string,
    nombre: string,
    comentarios: string,
    ip?: string | null,
    userAgent?: string | null
  ) {
    const aprobacion = this.aprobaciones.find((a) => a.token === token);
    if (!aprobacion) throw new Error("Enlace de aprobación no válido");
    if (aprobacion.estado !== "pendiente") throw new Error("Este enlace ya fue procesado");

    const now = new Date().toISOString();
    aprobacion.estado = "cambios_solicitados";
    aprobacion.fecha_respuesta = now;
    aprobacion.aprobado_por_nombre = nombre.trim();
    aprobacion.comentarios_cliente = comentarios.trim();
    aprobacion.ip_cliente = ip || null;
    aprobacion.user_agent = userAgent || null;
    aprobacion.updated_at = now;

    // Pausar etapa con requiere_aprobacion_cliente = true
    const disenoArea = this.areas.find((a) => a.requiere_aprobacion_cliente);
    const motivoCliente =
      this.motivosPausa.find(
        (m) =>
          m.texto.toLowerCase().includes("aprobación") ||
          m.texto.toLowerCase().includes("cliente")
      ) || this.motivosPausa[0];

    if (disenoArea) {
      const etapaDiseno = this.etapas.find(
        (e) => e.orden_id === aprobacion.orden_id && e.area_id === disenoArea.id
      );
      if (etapaDiseno) {
        etapaDiseno.estado = "pausada";
        etapaDiseno.motivo_pausa_id = motivoCliente ? motivoCliente.id : null;
        etapaDiseno.nota_pausa = comentarios;
        etapaDiseno.updated_at = now;
      }
    }

    this.agregarComentario(
      aprobacion.orden_id,
      `SOLICITUD DE CAMBIOS DE CLIENTE (${nombre}): ${comentarios}`,
      null
    );

    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: aprobacion.orden_id,
      etapa_id: null,
      usuario_id: null,
      tipo: "pausa",
      detalle: {
        descripcion: `Cliente solicitó ajustes al diseño: ${comentarios}`,
        solicitado_por: nombre,
        comentarios,
      },
      created_at: now,
    });

    return { ok: true };
  }

  actualizarAreaFlags(
    areaId: string,
    flags: {
      tipo_espera?: AreaRow["tipo_espera"];
      requiere_aprobacion_cliente?: boolean;
      es_condicional?: boolean;
      es_control_calidad?: boolean;
      es_despacho?: boolean;
    }
  ) {
    const area = this.areas.find((a) => a.id === areaId);
    if (!area) throw new Error("Área no encontrada");
    Object.assign(area, flags, { updated_at: new Date().toISOString() });
    return { ok: true, area };
  }

  asignarAreasUsuario(usuarioId: string, areaIds: string[]) {
    const now = new Date().toISOString();
    // Eliminar asignaciones actuales
    this.usuarioAreas = this.usuarioAreas.filter((ua) => ua.usuario_id !== usuarioId);
    // Insertar nuevas
    areaIds.forEach((areaId) => {
      this.usuarioAreas.push({
        usuario_id: usuarioId,
        area_id: areaId,
        created_at: now,
      });
    });

    // Actualizar timestamp en profile si existe
    const profile = this.perfiles.find((p) => p.id === usuarioId);
    if (profile) {
      profile.updated_at = now;
    }

    return { ok: true };
  }

  crearAcabado(data: { nombre: string }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const nuevo: AcabadoRow = {
      id,
      nombre: data.nombre,
      activo: true,
      created_at: now,
      updated_at: now,
    };
    this.acabados.push(nuevo);
    return { ok: true, acabado: nuevo };
  }

  actualizarAcabado(id: string, data: Partial<AcabadoRow>) {
    const item = this.acabados.find((a) => a.id === id);
    if (!item) throw new Error("Acabado no encontrado");
    Object.assign(item, data, { updated_at: new Date().toISOString() });
    return { ok: true, acabado: item };
  }

  crearProveedor(data: {
    nombre: string;
    telefono?: string | null;
    tipo?: ProveedorRow["tipo"];
  }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const nuevo: ProveedorRow = {
      id,
      nombre: data.nombre,
      telefono: data.telefono || null,
      tipo: data.tipo || "otros",
      activo: true,
      created_at: now,
      updated_at: now,
    };
    this.proveedores.push(nuevo);
    return { ok: true, proveedor: nuevo };
  }

  actualizarProveedor(id: string, data: Partial<ProveedorRow>) {
    const item = this.proveedores.find((p) => p.id === id);
    if (!item) throw new Error("Proveedor no encontrado");
    Object.assign(item, data, { updated_at: new Date().toISOString() });
    return { ok: true, proveedor: item };
  }
}

// Instancia singleton para desarrollo
const globalForStore = global as unknown as { mockStore?: DataStore };
export const mockStore =
  globalForStore.mockStore && typeof globalForStore.mockStore.obtenerAprobacionPorToken === "function"
    ? globalForStore.mockStore
    : (globalForStore.mockStore = new DataStore());
if (process.env.NODE_ENV !== "production") globalForStore.mockStore = mockStore;
