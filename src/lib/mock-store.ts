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
} from "@/types/database";

// Áreas base
export const INITIAL_AREAS: AreaRow[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    nombre: "Diseño",
    slug: "diseno",
    color_hex: "#8B5CF6",
    icono_lucide: "Palette",
    orden: 1,
    requiere_aprobacion_cliente: true,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    nombre: "Impresión",
    slug: "impresion",
    color_hex: "#3B82F6",
    icono_lucide: "Printer",
    orden: 2,
    requiere_aprobacion_cliente: false,
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
    orden: 3,
    requiere_aprobacion_cliente: false,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
  {
    id: "11111111-1111-1111-1111-111111111104",
    nombre: "Corte",
    slug: "corte",
    color_hex: "#10B981",
    icono_lucide: "Layers",
    orden: 4,
    requiere_aprobacion_cliente: false,
    activa: true,
    created_at: "2026-10-14T00:00:00Z",
    updated_at: "2026-10-14T00:00:00Z",
  },
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

// Tipos de trabajo iniciales
export const INITIAL_TIPOS_TRABAJO: TipoTrabajoRow[] = [
  {
    id: "44444444-4444-4444-4444-444444444401",
    nombre: "Caja Plegadiza (Tuck End)",
    descripcion: "Empaque plegadizo con solapas para cosmética, farmacia o alimentos",
    icono: "Box",
    ruta: [
      "11111111-1111-1111-1111-111111111101", // Diseño
      "11111111-1111-1111-1111-111111111102", // Impresión
      "11111111-1111-1111-1111-111111111103", // Troquelado
      "11111111-1111-1111-1111-111111111104", // Corte
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
      "11111111-1111-1111-1111-111111111101", // Diseño
      "11111111-1111-1111-1111-111111111102", // Impresión
      "11111111-1111-1111-1111-111111111104", // Corte
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
      "11111111-1111-1111-1111-111111111101", // Diseño
      "11111111-1111-1111-1111-111111111102", // Impresión
      "11111111-1111-1111-1111-111111111103", // Troquelado
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
    estado: "en_produccion",
    area_actual_id: "11111111-1111-1111-1111-111111111101", // Diseño
    creada_por: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002",
    entregada_en: null,
    entregada_a: null,
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
    area_actual_id: "11111111-1111-1111-1111-111111111102", // Impresión
    creada_por: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0002",
    entregada_en: null,
    entregada_a: null,
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
    estado: "lista_entrega",
    area_actual_id: null,
    creada_por: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001",
    entregada_en: null,
    entregada_a: null,
    created_at: "2026-10-13T14:00:00Z",
    updated_at: "2026-10-14T11:00:00Z",
  },
];

// Etapas de las órdenes iniciales
export const INITIAL_ETAPAS: OrdenEtapaRow[] = [
  // OT-0001 (En Diseño)
  {
    id: "66666666-6666-6666-6666-666666666601",
    orden_id: "55555555-5555-5555-5555-555555555501",
    area_id: "11111111-1111-1111-1111-111111111101", // Diseño
    secuencia: 1,
    estado: "en_cola",
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
    area_id: "11111111-1111-1111-1111-111111111102", // Impresión
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
    area_id: "11111111-1111-1111-1111-111111111103", // Troquelado
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
    area_id: "11111111-1111-1111-1111-111111111104", // Corte
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

  // OT-0002 (En Impresión, iniciada)
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
    id: "66666666-6666-6666-6666-666666666606",
    orden_id: "55555555-5555-5555-5555-555555555502",
    area_id: "11111111-1111-1111-1111-111111111102", // Impresión
    secuencia: 2,
    estado: "en_proceso",
    operador_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0005",
    iniciada_en: "2026-10-14T09:15:00Z",
    terminada_en: null,
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 0,
    created_at: "2026-10-14T08:30:00Z",
    updated_at: "2026-10-14T09:15:00Z",
  },
  {
    id: "66666666-6666-6666-6666-666666666607",
    orden_id: "55555555-5555-5555-5555-555555555502",
    area_id: "11111111-1111-1111-1111-111111111103", // Troquelado
    secuencia: 3,
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
    secuencia: 4,
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

  // OT-0003 (Todas terminadas)
  {
    id: "66666666-6666-6666-6666-666666666609",
    orden_id: "55555555-5555-5555-5555-555555555503",
    area_id: "11111111-1111-1111-1111-111111111101",
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
    id: "66666666-6666-6666-6666-666666666610",
    orden_id: "55555555-5555-5555-5555-555555555503",
    area_id: "11111111-1111-1111-1111-111111111102",
    secuencia: 2,
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
    id: "66666666-6666-6666-6666-666666666611",
    orden_id: "55555555555555555555555555555503",
    area_id: "11111111-1111-1111-1111-111111111104",
    secuencia: 3,
    estado: "terminada",
    operador_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0007",
    iniciada_en: "2026-10-14T09:00:00Z",
    terminada_en: "2026-10-14T11:00:00Z",
    motivo_pausa_id: null,
    nota_pausa: null,
    minutos_trabajados: 120,
    created_at: "2026-10-13T14:00:00Z",
    updated_at: "2026-10-14T11:00:00Z",
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

// Estado mutable global en memoria para desarrollo
class DataStore {
  areas: AreaRow[] = [...INITIAL_AREAS];
  motivosPausa: MotivoPausaRow[] = [...INITIAL_MOTIVOS_PAUSA];
  clientes: ClienteRow[] = [...INITIAL_CLIENTES];
  tiposTrabajo: TipoTrabajoRow[] = [...INITIAL_TIPOS_TRABAJO];
  ordenes: OrdenRow[] = [...INITIAL_ORDENES];
  etapas: OrdenEtapaRow[] = [...INITIAL_ETAPAS];
  eventos: EventoOrdenRow[] = [...INITIAL_EVENTOS];
  comentarios: ComentarioRow[] = [...INITIAL_COMENTARIOS];
  mockups: MockupEmpaqueRow[] = [
    {
      id: "99999999-9999-9999-9999-999999999901",
      orden_id: "22222222-2222-2222-2222-222222222201", // OT-0001
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
      orden_id: "22222222-2222-2222-2222-222222222201",
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
  }) {
    const codigo = `OT-${String(this.nextOtNum++).padStart(4, "0")}`;
    const id = crypto.randomUUID();

    let ruta = data.ruta;
    if (!ruta || ruta.length === 0) {
      const tt = this.tiposTrabajo.find((t) => t.id === data.tipo_trabajo_id);
      ruta = tt ? tt.ruta : this.areas.map((a) => a.id);
    }

    const primeraAreaId = ruta[0];

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
      estado: "en_produccion",
      area_actual_id: primeraAreaId,
      creada_por: data.creada_por || null,
      entregada_en: null,
      entregada_a: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.ordenes.unshift(nuevaOrden);

    // Crear etapas
    ruta.forEach((areaId, idx) => {
      this.etapas.push({
        id: crypto.randomUUID(),
        orden_id: id,
        area_id: areaId,
        secuencia: idx + 1,
        estado: idx === 0 ? "en_cola" : "bloqueada",
        operador_id: null,
        iniciada_en: null,
        terminada_en: null,
        motivo_pausa_id: null,
        nota_pausa: null,
        minutos_trabajados: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    // Registrar evento
    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: id,
      etapa_id: null,
      usuario_id: data.creada_por || null,
      tipo: "creada",
      detalle: { codigo, titulo: data.titulo, cantidad: data.cantidad },
      created_at: new Date().toISOString(),
    });

    return { ok: true, id, codigo };
  }

  iniciarEtapa(etapaId: string, operadorId?: string | null) {
    const etapa = this.etapas.find((e) => e.id === etapaId);
    if (!etapa) throw new Error("Etapa no encontrada");

    etapa.estado = "en_proceso";
    etapa.iniciada_en = etapa.iniciada_en || new Date().toISOString();
    etapa.operador_id = operadorId || etapa.operador_id;
    etapa.updated_at = new Date().toISOString();

    const orden = this.ordenes.find((o) => o.id === etapa.orden_id);
    if (orden) {
      orden.area_actual_id = etapa.area_id;
      orden.estado = "en_produccion";
      orden.updated_at = new Date().toISOString();
    }

    const area = this.areas.find((a) => a.id === etapa.area_id);
    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: etapa.orden_id,
      etapa_id: etapaId,
      usuario_id: operadorId || null,
      tipo: "iniciada",
      detalle: { area: area?.nombre || "Área", secuencia: etapa.secuencia },
      created_at: new Date().toISOString(),
    });

    return { ok: true };
  }

  pausarEtapa(etapaId: string, motivoId: string, nota?: string | null, usuarioId?: string | null) {
    const etapa = this.etapas.find((e) => e.id === etapaId);
    if (!etapa) throw new Error("Etapa no encontrada");

    etapa.estado = "pausada";
    etapa.motivo_pausa_id = motivoId;
    etapa.nota_pausa = nota || null;
    etapa.updated_at = new Date().toISOString();

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
      created_at: new Date().toISOString(),
    });

    return { ok: true };
  }

  reanudarEtapa(etapaId: string, usuarioId?: string | null) {
    const etapa = this.etapas.find((e) => e.id === etapaId);
    if (!etapa) throw new Error("Etapa no encontrada");

    etapa.estado = "en_proceso";
    etapa.motivo_pausa_id = null;
    etapa.nota_pausa = null;
    etapa.updated_at = new Date().toISOString();

    const area = this.areas.find((a) => a.id === etapa.area_id);

    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: etapa.orden_id,
      etapa_id: etapaId,
      usuario_id: usuarioId || null,
      tipo: "reanudada",
      detalle: { area: area?.nombre },
      created_at: new Date().toISOString(),
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
    etapa.minutos_trabajados = minutos;
    etapa.updated_at = now.toISOString();

    // Siguiente etapa
    const siguiente = this.etapas.find(
      (e) => e.orden_id === etapa.orden_id && e.secuencia === etapa.secuencia + 1
    );

    const orden = this.ordenes.find((o) => o.id === etapa.orden_id);
    const area = this.areas.find((a) => a.id === etapa.area_id);

    if (siguiente) {
      siguiente.estado = "en_cola";
      siguiente.updated_at = now.toISOString();
      if (orden) {
        orden.area_actual_id = siguiente.area_id;
        orden.updated_at = now.toISOString();
      }
    } else {
      if (orden) {
        orden.estado = "lista_entrega";
        orden.area_actual_id = null;
        orden.updated_at = now.toISOString();
      }
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
        es_final: !siguiente,
      },
      created_at: now.toISOString(),
    });

    return { ok: true, es_final: !siguiente };
  }

  marcarEntregada(ordenId: string, entregadaA: string, usuarioId?: string | null) {
    const orden = this.ordenes.find((o) => o.id === ordenId);
    if (!orden) throw new Error("Orden no encontrada");

    const now = new Date().toISOString();
    orden.estado = "entregada";
    orden.entregada_en = now;
    orden.entregada_a = entregadaA;
    orden.updated_at = now;

    this.eventos.unshift({
      id: crypto.randomUUID(),
      orden_id: ordenId,
      etapa_id: null,
      usuario_id: usuarioId || null,
      tipo: "entregada",
      detalle: { entregada_a: entregadaA, fecha: now },
      created_at: now,
    });

    return { ok: true };
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

    // Buscar etapa de diseño y finalizarla
    const disenoArea = this.areas.find((a) => a.slug === "diseno");
    if (disenoArea) {
      const etapaDiseno = this.etapas.find(
        (e) => e.orden_id === aprobacion.orden_id && e.area_id === disenoArea.id
      );
      if (etapaDiseno && etapaDiseno.estado !== "terminada") {
        etapaDiseno.estado = "terminada";
        etapaDiseno.terminada_en = now;
        etapaDiseno.updated_at = now;

        // Activar siguiente etapa
        const siguiente = this.etapas
          .filter((e) => e.orden_id === aprobacion.orden_id && e.secuencia > etapaDiseno.secuencia)
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

    // Pausar etapa de diseño
    const disenoArea = this.areas.find((a) => a.slug === "diseno");
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
}

// Instancia singleton para desarrollo
const globalForStore = global as unknown as { mockStore?: DataStore };
export const mockStore =
  globalForStore.mockStore && typeof globalForStore.mockStore.obtenerAprobacionPorToken === "function"
    ? globalForStore.mockStore
    : (globalForStore.mockStore = new DataStore());
if (process.env.NODE_ENV !== "production") globalForStore.mockStore = mockStore;
