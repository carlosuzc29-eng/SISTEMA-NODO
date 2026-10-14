import * as THREE from "three";
import { TipoHotStamping } from "@/types/database";

/**
 * Sistema de materiales compartido por todos los modelos de empaque.
 *
 * - Texturas procedurales (grano de cartulina, fibra kraft, cordón torcido)
 *   generadas en canvas una sola vez y cacheadas.
 * - Barniz UV como clearcoat físico real (no solo "menos rugosidad").
 * - Hot stamping como lámina metálica aplicada sobre la cara principal,
 *   no como un empaque entero de metal.
 * - Relieve (emboss) como bump map del mismo motivo del stamping.
 */

export type Stock = "white" | "kraft";

export interface FinishState {
  artTexture: THREE.Texture | null;
  uvVarnish: boolean;
  hotStamping: TipoHotStamping;
  emboss: boolean;
}

export interface PackageModelParams {
  width: number; // unidades Three.js (cm / 10)
  height: number;
  depth: number;
  finish: FinishState;
  openProgress: number; // 0 (cerrado) a 1 (abierto)
}

export interface PackageModelHandle {
  group: THREE.Group;
  updateOpen: (progress: number) => void;
  updateFinish: (finish: FinishState) => void;
  dispose: () => void;
}

const STOCK_COLOR: Record<Stock, number> = {
  white: 0xf7f6f2,
  kraft: 0xb48a5c,
};

const FOIL: Record<Exclude<TipoHotStamping, "ninguno">, { color: number; roughness: number }> = {
  oro: { color: 0xffd36e, roughness: 0.18 },
  plata: { color: 0xf2f4f7, roughness: 0.14 },
  cobre: { color: 0xf0a479, roughness: 0.22 },
};

// ---------------------------------------------------------------------------
// Texturas procedurales
// ---------------------------------------------------------------------------

const textureCache = new Map<string, THREE.CanvasTexture>();

function canvasTexture(
  key: string,
  size: [number, number],
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  srgb = false
): THREE.CanvasTexture {
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = size[0];
  canvas.height = size[1];
  const ctx = canvas.getContext("2d")!;
  draw(ctx, size[0], size[1]);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(key, tex);
  return tex;
}

// Generador pseudoaleatorio determinista: las texturas salen iguales en cada carga
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Grano fino de cartulina/papel (escala de grises, para bump y rugosidad). */
function paperGrainTexture() {
  return canvasTexture("grain", [256, 256], (ctx, w, h) => {
    const rand = rng(7);
    const img = ctx.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (rand() - 0.5) * 70;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  });
}

/** Papel kraft: base marrón con fibras cortas claras y oscuras. */
function kraftTexture() {
  return canvasTexture(
    "kraft",
    [512, 512],
    (ctx, w, h) => {
      const rand = rng(42);
      ctx.fillStyle = "#b48a5c";
      ctx.fillRect(0, 0, w, h);

      // Manchas amplias de tono (variación natural del papel)
      for (let i = 0; i < 60; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const r = 30 + rand() * 80;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        const dark = rand() > 0.5;
        g.addColorStop(0, dark ? "rgba(120,85,50,0.10)" : "rgba(210,175,130,0.10)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }

      // Fibras
      for (let i = 0; i < 2600; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const len = 2 + rand() * 9;
        const a = rand() * Math.PI;
        ctx.strokeStyle =
          rand() > 0.55
            ? `rgba(95,65,35,${0.12 + rand() * 0.2})`
            : `rgba(225,195,150,${0.12 + rand() * 0.2})`;
        ctx.lineWidth = 0.6 + rand() * 0.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
        ctx.stroke();
      }
    },
    true
  );
}

/** Cartulina blanca: ruido muy sutil para que no se vea plástico. */
function whiteBoardTexture() {
  return canvasTexture(
    "white",
    [256, 256],
    (ctx, w, h) => {
      const rand = rng(11);
      const img = ctx.createImageData(w, h);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (rand() - 0.5) * 8;
        img.data[i] = 247 + v;
        img.data[i + 1] = 246 + v;
        img.data[i + 2] = 242 + v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
    },
    true
  );
}

/** Cordón de papel torcido para las asas de la bolsa. */
export function twistedCordTexture() {
  const tex = canvasTexture(
    "cord",
    [128, 32],
    (ctx, w, h) => {
      ctx.fillStyle = "#9c7448";
      ctx.fillRect(0, 0, w, h);
      for (let i = -4; i < 12; i++) {
        const x = i * 12;
        const g = ctx.createLinearGradient(x, 0, x + 12, h);
        g.addColorStop(0, "rgba(70,45,20,0.45)");
        g.addColorStop(0.5, "rgba(215,180,135,0.35)");
        g.addColorStop(1, "rgba(70,45,20,0.45)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 12, 0);
        ctx.lineTo(x + 12 + h, h);
        ctx.lineTo(x + h, h);
        ctx.closePath();
        ctx.fill();
      }
    },
    true
  );
  tex.repeat.set(18, 1);
  return tex;
}

/**
 * Motivo de acabado especial: marco fino con esquinas ornamentales.
 * Es la zona que se "estampa" (hot stamping) o se "realza" (emboss),
 * dibujada en el espacio UV de la cara principal con su proporción real.
 */
function finishMarkTexture(aspect: number) {
  const w = 1024;
  const h = Math.max(64, Math.round(1024 / aspect));
  const key = `mark-${w}x${h}`;
  const tex = canvasTexture(key, [w, h], (ctx) => {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#fff";

    const m = Math.min(w, h) * 0.07;
    const lw = Math.max(4, Math.min(w, h) * 0.012);

    // Marco doble
    ctx.lineWidth = lw;
    ctx.strokeRect(m, m, w - m * 2, h - m * 2);
    ctx.lineWidth = lw * 0.45;
    const m2 = m + lw * 2.2;
    ctx.strokeRect(m2, m2, w - m2 * 2, h - m2 * 2);

    // Esquinas en rombo
    const s = lw * 2.6;
    for (const [cx, cy] of [
      [m, m],
      [w - m, m],
      [m, h - m],
      [w - m, h - m],
    ]) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.lineTo(cx + s, cy);
      ctx.lineTo(cx, cy + s);
      ctx.lineTo(cx - s, cy);
      ctx.closePath();
      ctx.fill();
    }
  });
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/** Sombra de contacto: degradado radial que ancla el empaque al suelo. */
export function contactShadowTexture() {
  const tex = canvasTexture("contact", [256, 256], (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, "rgba(0,0,0,0.55)");
    g.addColorStop(0.45, "rgba(0,0,0,0.28)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

/**
 * Color promedio del borde del arte: se usa para las caras sin arte
 * (laterales, solapas) para que el empaque se vea continuo.
 */
function sampleArtEdgeColor(tex: THREE.Texture): THREE.Color | null {
  const image = tex.image as CanvasImageSource | undefined;
  if (!image) return null;
  try {
    const n = 24;
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = n;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0, n, n);
    const { data } = ctx.getImageData(0, 0, n, n);
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (x > 1 && x < n - 2 && y > 1 && y < n - 2) continue;
        const i = (y * n + x) * 4;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
    }
    return new THREE.Color().setRGB(
      r / count / 255,
      g / count / 255,
      b / count / 255,
      THREE.SRGBColorSpace
    );
  } catch {
    // Imagen sin CORS: el canvas queda "tainted"
    return null;
  }
}

// ---------------------------------------------------------------------------
// Set de materiales de un empaque
// ---------------------------------------------------------------------------

export interface PackageMaterials {
  /** Caras que llevan el arte del cliente (frente, dorso, tapa). */
  art: THREE.MeshPhysicalMaterial;
  /** Caras exteriores sin arte (laterales, solapas). */
  outer: THREE.MeshPhysicalMaterial;
  /** Cara interior del cartón. */
  inside: THREE.MeshStandardMaterial;
  /** Canto del cartón. */
  edge: THREE.MeshStandardMaterial;
  /** Lámina metálica del hot stamping (se aplica como calcomanía). */
  foil: THREE.MeshPhysicalMaterial;
  update: (finish: FinishState) => void;
  dispose: () => void;
}

export function createPackageMaterials(opts: {
  outerStock: Stock;
  insideStock: Stock;
  /** Proporción ancho/alto de la cara principal, para el motivo de acabado. */
  markAspect: number;
}): PackageMaterials {
  const grain = paperGrainTexture();
  const stockMap = (stock: Stock) => (stock === "kraft" ? kraftTexture() : whiteBoardTexture());
  const mark = finishMarkTexture(opts.markAspect);

  const art = new THREE.MeshPhysicalMaterial({
    roughness: 0.62,
    metalness: 0,
    roughnessMap: grain,
    bumpMap: grain,
    bumpScale: 0.25,
  });

  const outer = new THREE.MeshPhysicalMaterial({
    roughness: 0.62,
    metalness: 0,
    roughnessMap: grain,
    bumpMap: grain,
    bumpScale: 0.25,
  });

  const inside = new THREE.MeshStandardMaterial({
    map: stockMap(opts.insideStock),
    roughness: 0.92,
    metalness: 0,
    bumpMap: grain,
    bumpScale: 0.4,
  });

  const edge = new THREE.MeshStandardMaterial({
    color: opts.insideStock === "kraft" ? 0x9a7449 : 0xe9e4d8,
    roughness: 0.95,
  });

  const foil = new THREE.MeshPhysicalMaterial({
    metalness: 1,
    roughness: 0.2,
    envMapIntensity: 2.2, // la lámina vive de los reflejos del estudio
    alphaMap: mark,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    bumpMap: mark,
    bumpScale: 1.2,
    visible: false,
  });

  function update(finish: FinishState) {
    const stockColor = new THREE.Color(STOCK_COLOR[opts.outerStock]);
    const hasArt = !!finish.artTexture;

    // Cara con arte
    const artMap = finish.artTexture ?? stockMap(opts.outerStock);
    if (art.map !== artMap) {
      art.map = artMap;
      art.needsUpdate = true;
    }

    // Caras sin arte: continúan el color del borde del diseño
    const edgeColor = finish.artTexture ? sampleArtEdgeColor(finish.artTexture) : null;
    outer.map = hasArt ? null : stockMap(opts.outerStock);
    outer.color.copy(hasArt ? edgeColor ?? stockColor : new THREE.Color(0xffffff));
    outer.needsUpdate = true;

    // Barniz UV: capa de clearcoat brillante sobre el papel
    for (const m of [art, outer]) {
      m.clearcoat = finish.uvVarnish ? 1 : 0;
      m.clearcoatRoughness = 0.06;
      m.roughness = finish.uvVarnish ? 0.4 : opts.outerStock === "kraft" ? 0.85 : 0.62;
    }

    // Relieve: el motivo del acabado se levanta del papel
    const bump = finish.emboss ? mark : grain;
    if (art.bumpMap !== bump) {
      art.bumpMap = bump;
      art.needsUpdate = true;
    }
    art.bumpScale = finish.emboss ? 3 : 0.25;

    // Hot stamping
    if (finish.hotStamping !== "ninguno") {
      const f = FOIL[finish.hotStamping];
      foil.color.setHex(f.color);
      foil.roughness = f.roughness;
      foil.bumpScale = finish.emboss ? 2 : 0.3;
      foil.visible = true;
    } else {
      foil.visible = false;
    }
  }

  return {
    art,
    outer,
    inside,
    edge,
    foil,
    update,
    dispose() {
      // Las texturas procedurales están cacheadas y se reutilizan entre modelos
      art.dispose();
      outer.dispose();
      inside.dispose();
      edge.dispose();
      foil.dispose();
    },
  };
}

// ---------------------------------------------------------------------------
// Geometría
// ---------------------------------------------------------------------------

/** Índices de cara de BoxGeometry. */
export const FACE = { px: 0, nx: 1, py: 2, ny: 3, pz: 4, nz: 5 } as const;
const OPPOSITE = [1, 0, 3, 2, 5, 4];

/**
 * Panel de cartón con grosor real: una cara exterior, la opuesta interior
 * y los cantos con el material de canto.
 */
export function createPanel(
  size: [number, number, number],
  outerFace: number,
  outerMat: THREE.Material,
  mats: Pick<PackageMaterials, "inside" | "edge">
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(...size);
  const materials: THREE.Material[] = Array(6).fill(mats.edge);
  materials[outerFace] = outerMat;
  materials[OPPOSITE[outerFace]] = mats.inside;
  const mesh = new THREE.Mesh(geo, materials);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Calcomanía plana de lámina metálica, apenas separada de la superficie. */
export function createFoilDecal(
  width: number,
  height: number,
  foil: THREE.Material
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), foil);
  mesh.renderOrder = 1;
  return mesh;
}

export function disposeGroup(group: THREE.Object3D) {
  group.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) (obj as THREE.Mesh).geometry.dispose();
  });
}

/** Interpolación suave 0→1 dentro de [a, b]. Útil para coreografiar pliegues. */
export function smoothstep(a: number, b: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
