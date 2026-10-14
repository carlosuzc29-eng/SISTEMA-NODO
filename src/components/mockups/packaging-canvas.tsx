"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { TipoModeloEmpaque, TipoHotStamping } from "@/types/database";
import { createTuckEndBox } from "./models/tuck-end-box";
import { createPizzaBox } from "./models/pizza-box";
import { createKraftBag } from "./models/kraft-bag";
import {
  FinishState,
  PackageModelHandle,
  PackageModelParams,
  contactShadowTexture,
} from "./models/materials";
import { cn } from "@/lib/utils";
import {
  Camera,
  Loader2,
  Package,
  PackageOpen,
  RotateCw,
  Scan,
  Hand,
} from "lucide-react";

export interface PackagingCanvasProps {
  modeloTipo?: TipoModeloEmpaque;
  anchoCm?: number;
  altoCm?: number;
  profundidadCm?: number;
  artTextureUrl?: string | null;
  uvVarnish?: boolean;
  hotStamping?: TipoHotStamping;
  emboss?: boolean;
  isOpenInitial?: boolean;
  showControls?: boolean;
  onSnapshot?: (dataUrl: string) => void;
  className?: string;
}

const FOIL_SWATCH: Record<Exclude<TipoHotStamping, "ninguno">, string> = {
  oro: "linear-gradient(135deg,#fde68a,#d4a017 55%,#fff3c4)",
  plata: "linear-gradient(135deg,#f8fafc,#a8b0bb 55%,#ffffff)",
  cobre: "linear-gradient(135deg,#fbc7a4,#b8653a 55%,#ffd9c0)",
};

// Vista de tres cuartos, ligeramente elevada: la pose clásica de packshot
const HOME_DIRECTION = new THREE.Vector3(0.62, 0.48, 1).normalize();

// Resorte críticamente amortiguado para abrir/cerrar (sin rebote, interrumpible)
const OPEN_SPRING_RESPONSE = 0.55; // segundos

function buildModel(tipo: TipoModeloEmpaque, params: PackageModelParams): PackageModelHandle {
  if (tipo === "caja_pizza") return createPizzaBox(params);
  if (tipo === "bolsa_kraft") return createKraftBag(params);
  return createTuckEndBox(params);
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

interface Stage {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  keyLight: THREE.DirectionalLight;
  ground: THREE.Mesh;
  contact: THREE.Mesh;
  home: { position: THREE.Vector3; target: THREE.Vector3 };
  flight: {
    fromPos: THREE.Vector3;
    toPos: THREE.Vector3;
    fromTarget: THREE.Vector3;
    toTarget: THREE.Vector3;
    start: number;
    duration: number;
    ease: (t: number) => number;
  } | null;
  render: () => void;
}

export function PackagingCanvas({
  modeloTipo = "caja_tuck_end",
  anchoCm = 15,
  altoCm = 20,
  profundidadCm = 8,
  artTextureUrl,
  uvVarnish = false,
  hotStamping = "ninguno",
  emboss = false,
  isOpenInitial = false,
  showControls = true,
  onSnapshot,
  className = "w-full h-[480px]",
}: PackagingCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(isOpenInitial);
  const [autoRotate, setAutoRotate] = useState(false);
  // URL cuyo arte ya terminó de cargar (o falló): el resto del tiempo se muestra la carga
  const [settledArtUrl, setSettledArtUrl] = useState<string | null>(null);
  const isLoadingTexture = !!artTextureUrl && settledArtUrl !== artTextureUrl;
  const [isReady, setIsReady] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [flash, setFlash] = useState(false);

  const stageRef = useRef<Stage | null>(null);
  const modelRef = useRef<PackageModelHandle | null>(null);
  const hasFramedRef = useRef(false);

  // Estado vivo leído por el bucle de render (evita reconstruir la escena)
  const openRef = useRef({ value: isOpenInitial ? 1 : 0, velocity: 0, target: isOpenInitial ? 1 : 0 });
  const autoRotateRef = useRef(autoRotate);
  const finishRef = useRef<FinishState>({
    artTexture: null,
    uvVarnish,
    hotStamping,
    emboss,
  });

  useEffect(() => {
    openRef.current.target = isOpen ? 1 : 0;
  }, [isOpen]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // ---------------------------------------------------------------------------
  // 1. Escenario: renderer, cámara, luz de estudio y suelo (se monta una vez)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 480;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // permite capturas
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // Neutral preserva los colores de impresión mejor que ACES (clave para aprobar arte)
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Iluminación basada en imagen: estudio suave que da reflejos reales
    // al barniz y a la lámina metálica
    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envMap = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = envMap;
    scene.environmentIntensity = 0.75;

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.05, 200);
    camera.position.copy(HOME_DIRECTION).multiplyScalar(6);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.75;
    controls.zoomSpeed = 0.8;
    controls.enablePan = false;
    controls.minPolarAngle = 0.12;
    controls.maxPolarAngle = Math.PI / 2 - 0.03; // nunca por debajo del suelo
    controls.autoRotateSpeed = 1.4;

    // Luz principal (sombra suave) + contraluz para separar las aristas del fondo
    const keyLight = new THREE.DirectionalLight(0xfff6ec, 1.9);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.radius = 6;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.normalBias = 0.015;
    scene.add(keyLight, keyLight.target);

    const rimLight = new THREE.DirectionalLight(0xe6efff, 0.9);
    rimLight.position.set(4, 3, -5);
    scene.add(rimLight);

    // Suelo invisible que solo recibe la sombra proyectada
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ opacity: 0.2 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Sombra de contacto: oscurece justo bajo el empaque y lo "asienta"
    const contact = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.MeshBasicMaterial({
        map: contactShadowTexture(),
        color: 0x000000,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
      })
    );
    contact.rotation.x = -Math.PI / 2;
    contact.renderOrder = -1;
    scene.add(contact);

    const stage: Stage = {
      scene,
      camera,
      renderer,
      controls,
      keyLight,
      ground,
      contact,
      home: { position: camera.position.clone(), target: new THREE.Vector3() },
      flight: null,
      render: () => renderer.render(scene, camera),
    };
    stageRef.current = stage;

    // El usuario toma el control: se cancela cualquier vuelo de cámara
    const onStart = () => {
      stage.flight = null;
      setHasInteracted(true);
    };
    controls.addEventListener("start", onStart);

    // Pausar el render cuando el visor no está en pantalla
    let isVisible = true;
    const io = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    io.observe(container);

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      stage.render();
    });
    ro.observe(container);

    let lastTime = performance.now();
    let frameId = 0;
    let firstFrame = true;

    const loop = () => {
      frameId = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;
      if (!isVisible) return;

      // Resorte de apertura: parte del valor y la velocidad actuales,
      // así se puede invertir a mitad de camino sin saltos
      const open = openRef.current;
      if (reduceMotion) {
        if (open.value !== open.target) {
          open.value = open.target;
          modelRef.current?.updateOpen(open.value);
        }
      } else if (Math.abs(open.target - open.value) > 0.0005 || Math.abs(open.velocity) > 0.0005) {
        const omega = (2 * Math.PI) / OPEN_SPRING_RESPONSE;
        const steps = 4;
        const h = dt / steps;
        for (let i = 0; i < steps; i++) {
          const accel = omega * omega * (open.target - open.value) - 2 * omega * open.velocity;
          open.velocity += accel * h;
          open.value += open.velocity * h;
        }
        modelRef.current?.updateOpen(open.value);
      }

      // Vuelo de cámara (encuadre inicial, recentrar, cambio de medidas)
      const flight = stage.flight;
      if (flight) {
        const raw = Math.min(1, (performance.now() - flight.start) / flight.duration);
        const k = flight.ease(raw);
        camera.position.lerpVectors(flight.fromPos, flight.toPos, k);
        controls.target.lerpVectors(flight.fromTarget, flight.toTarget, k);
        if (raw >= 1) stage.flight = null;
      }

      controls.autoRotate = autoRotateRef.current && !flight;
      controls.update(dt);
      stage.render();

      if (firstFrame) {
        firstFrame = false;
        setIsReady(true);
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(frameId);
      io.disconnect();
      ro.disconnect();
      controls.removeEventListener("start", onStart);
      controls.dispose();
      modelRef.current?.dispose();
      modelRef.current = null;
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      contact.geometry.dispose();
      (contact.material as THREE.Material).dispose();
      envMap.dispose();
      pmrem.dispose();
      roomEnv.dispose();
      renderer.dispose();
      container.innerHTML = "";
      stageRef.current = null;
      hasFramedRef.current = false;
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 2. Modelo: se reconstruye solo cuando cambia el tipo o las medidas
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const w = Math.max(anchoCm, 1) / 10;
    const h = Math.max(altoCm, 1) / 10;
    const d = Math.max(profundidadCm, 1) / 10;

    modelRef.current?.dispose();
    if (modelRef.current) stage.scene.remove(modelRef.current.group);

    const model = buildModel(modeloTipo, {
      width: w,
      height: h,
      depth: d,
      finish: finishRef.current,
      openProgress: openRef.current.value,
    });
    modelRef.current = model;
    stage.scene.add(model.group);

    // Encuadre a partir de las medidas reales (cerrado)
    model.updateOpen(0);
    const box = new THREE.Box3().setFromObject(model.group);
    model.updateOpen(openRef.current.value);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const center = sphere.center.clone();
    const r = Math.max(sphere.radius, 0.3);

    // Suelo, sombra de contacto y cámara de sombras ajustados al tamaño
    const floorY = -h / 2;
    stage.ground.position.y = floorY;
    stage.contact.position.y = floorY + 0.001;
    stage.contact.scale.set(w * 1.45, d * 1.6 + 0.15, 1);

    const shadowCam = stage.keyLight.shadow.camera;
    shadowCam.left = shadowCam.bottom = -r * 2;
    shadowCam.right = shadowCam.top = r * 2;
    shadowCam.near = 0.1;
    shadowCam.far = r * 12;
    shadowCam.updateProjectionMatrix();
    stage.keyLight.position.copy(center).add(new THREE.Vector3(-2.2, 5, 2.4).normalize().multiplyScalar(r * 5));
    stage.keyLight.target.position.copy(center);

    // Distancia para que el empaque llene ~70% del visor en cualquier proporción
    const cam = stage.camera;
    const vFov = THREE.MathUtils.degToRad(cam.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * cam.aspect);
    const fitFov = Math.min(vFov, hFov);
    const distance = (r / Math.sin(fitFov / 2)) * 1.12;

    const homePos = center.clone().add(HOME_DIRECTION.clone().multiplyScalar(distance));
    stage.home = { position: homePos, target: center.clone() };
    stage.controls.minDistance = r * 1.3;
    stage.controls.maxDistance = distance * 2.5;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!hasFramedRef.current) {
      // Entrada: la cámara llega girando suavemente hasta la pose de packshot
      hasFramedRef.current = true;
      const introPos = center
        .clone()
        .add(new THREE.Vector3(1, 0.3, 0.55).normalize().multiplyScalar(distance * 1.25));
      if (reduceMotion) {
        cam.position.copy(homePos);
        stage.controls.target.copy(center);
      } else {
        cam.position.copy(introPos);
        stage.controls.target.copy(center);
        stage.flight = {
          fromPos: introPos,
          toPos: homePos,
          fromTarget: center.clone(),
          toTarget: center.clone(),
          start: performance.now(),
          duration: 1100,
          ease: easeOutQuart,
        };
      }
    } else if (reduceMotion) {
      cam.position.copy(homePos);
      stage.controls.target.copy(center);
    } else {
      // Cambio de medidas: la cámara se reacomoda sin perder la orientación
      const dir = cam.position.clone().sub(stage.controls.target).normalize();
      stage.flight = {
        fromPos: cam.position.clone(),
        toPos: center.clone().add(dir.multiplyScalar(distance)),
        fromTarget: stage.controls.target.clone(),
        toTarget: center.clone(),
        start: performance.now(),
        duration: 450,
        ease: easeInOutCubic,
      };
    }
  }, [modeloTipo, anchoCm, altoCm, profundidadCm]);

  // ---------------------------------------------------------------------------
  // 3. Arte del cliente
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    const previous = finishRef.current.artTexture;

    if (!artTextureUrl) {
      finishRef.current = { ...finishRef.current, artTexture: null };
      modelRef.current?.updateFinish(finishRef.current);
      previous?.dispose();
      return;
    }

    new THREE.TextureLoader().load(
      artTextureUrl,
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.anisotropy = stageRef.current?.renderer.capabilities.getMaxAnisotropy() ?? 1;
        finishRef.current = { ...finishRef.current, artTexture: tex };
        modelRef.current?.updateFinish(finishRef.current);
        previous?.dispose();
        setSettledArtUrl(artTextureUrl);
      },
      undefined,
      () => {
        if (!cancelled) setSettledArtUrl(artTextureUrl);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [artTextureUrl]);

  // ---------------------------------------------------------------------------
  // 4. Acabados
  // ---------------------------------------------------------------------------
  useEffect(() => {
    finishRef.current = { ...finishRef.current, uvVarnish, hotStamping, emboss };
    modelRef.current?.updateFinish(finishRef.current);
  }, [uvVarnish, hotStamping, emboss]);

  const resetCamera = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      stage.camera.position.copy(stage.home.position);
      stage.controls.target.copy(stage.home.target);
      return;
    }
    stage.flight = {
      fromPos: stage.camera.position.clone(),
      toPos: stage.home.position.clone(),
      fromTarget: stage.controls.target.clone(),
      toTarget: stage.home.target.clone(),
      start: performance.now(),
      duration: 650,
      ease: easeInOutCubic,
    };
  }, []);

  // Captura en alta resolución (fondo transparente, lista para ficha técnica)
  const handleSnapshot = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const { renderer } = stage;
    const prevRatio = renderer.getPixelRatio();
    const size = renderer.getSize(new THREE.Vector2());
    renderer.setPixelRatio(Math.min(4, 2400 / Math.max(size.x, 1)));
    renderer.setSize(size.x, size.y, false);
    stage.render();
    const dataUrl = renderer.domElement.toDataURL("image/png");
    renderer.setPixelRatio(prevRatio);
    renderer.setSize(size.x, size.y, false);
    stage.render();

    setFlash(true);
    window.setTimeout(() => setFlash(false), 160);

    if (onSnapshot) {
      onSnapshot(dataUrl);
    } else {
      const link = document.createElement("a");
      link.download = `mockup-3d-${modeloTipo}.png`;
      link.href = dataUrl;
      link.click();
    }
  }, [modeloTipo, onSnapshot]);

  const finishChips: { key: string; label: string; swatch: string }[] = [];
  if (uvVarnish) {
    finishChips.push({
      key: "uv",
      label: "Barniz UV",
      swatch: "linear-gradient(135deg,#ffffff,#cbd5e1 50%,#ffffff)",
    });
  }
  if (hotStamping !== "ninguno") {
    finishChips.push({
      key: "foil",
      label: `Foil ${hotStamping}`,
      swatch: FOIL_SWATCH[hotStamping],
    });
  }
  if (emboss) {
    finishChips.push({
      key: "emboss",
      label: "Relieve",
      swatch: "linear-gradient(135deg,#e7e5e4,#a8a29e)",
    });
  }

  const toolButton =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.94] hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/10 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

  return (
    <div
      className={cn(
        "group/stage relative isolate overflow-hidden rounded-2xl border border-black/5 dark:border-white/10",
        "bg-[radial-gradient(120%_90%_at_50%_35%,#ffffff_0%,#f1f2f4_55%,#e3e5e9_100%)]",
        "dark:bg-[radial-gradient(120%_90%_at_50%_35%,#2b2d31_0%,#1a1b1e_60%,#111214_100%)]",
        className
      )}
    >
      {/* Canvas WebGL: aparece con un fundido corto cuando el primer cuadro está listo */}
      <div
        ref={containerRef}
        className={cn(
          "h-full w-full cursor-grab active:cursor-grabbing transition-opacity duration-500 ease-out",
          isReady ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Destello de cámara al capturar */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-white transition-opacity",
          flash ? "opacity-60 duration-75" : "opacity-0 duration-300"
        )}
      />

      {/* Ficha superior: medidas y acabados */}
      <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
        <span className="rounded-full border border-black/5 bg-white/70 px-2.5 py-1 font-mono text-[11px] font-medium tabular-nums text-zinc-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200">
          {anchoCm} × {altoCm} × {profundidadCm} cm
        </span>

        {finishChips.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1.5">
            {finishChips.map((chip) => (
              <span
                key={chip.key}
                className="flex items-center gap-1.5 rounded-full border border-black/5 bg-white/70 py-1 pl-1 pr-2.5 text-[11px] font-medium capitalize text-zinc-700 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/60 dark:text-zinc-200"
              >
                <span
                  className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10 dark:ring-white/20"
                  style={{ background: chip.swatch }}
                />
                {chip.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Carga del arte */}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-14 flex -translate-x-1/2 items-center gap-2 rounded-full border border-black/5 bg-white/80 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-sm backdrop-blur-md transition-[opacity,transform] duration-200 ease-out dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-200",
          isLoadingTexture ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
        )}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Aplicando arte…
      </div>

      {/* Pista de interacción: desaparece en cuanto el usuario toca el modelo */}
      {showControls && (
        <div
          className={cn(
            "pointer-events-none absolute bottom-16 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-zinc-900/70 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md transition-opacity duration-300 ease-out",
            isReady && !hasInteracted ? "opacity-100 delay-1000" : "opacity-0"
          )}
        >
          <Hand className="h-3.5 w-3.5" />
          Arrastra para girar · pellizca para acercar
        </div>
      )}

      {/* Barra de herramientas */}
      {showControls && (
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            aria-pressed={isOpen}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-zinc-900 px-3.5 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(0,0,0,0.2),0_4px_12px_-2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] transition-[transform,background-color] duration-150 ease-out active:scale-[0.97] hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            {isOpen ? <Package className="h-4 w-4" /> : <PackageOpen className="h-4 w-4" />}
            {isOpen ? "Cerrar" : "Abrir"}
          </button>

          <div className="flex items-center gap-0.5 rounded-xl border border-black/5 bg-white/75 p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_6px_16px_-4px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/70">
            <button
              type="button"
              onClick={() => setAutoRotate((v) => !v)}
              aria-pressed={autoRotate}
              aria-label="Giro automático 360°"
              title="Giro automático 360°"
              className={cn(
                toolButton,
                autoRotate && "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
              )}
            >
              <RotateCw className={cn("h-4 w-4", autoRotate && "animate-[spin_2.4s_linear_infinite]")} />
            </button>
            <button
              type="button"
              onClick={resetCamera}
              aria-label="Recentrar vista"
              title="Recentrar vista"
              className={toolButton}
            >
              <Scan className="h-4 w-4" />
            </button>
            <div className="mx-0.5 h-4 w-px bg-black/10 dark:bg-white/10" />
            <button
              type="button"
              onClick={handleSnapshot}
              aria-label="Capturar imagen en alta resolución"
              title="Capturar imagen en alta resolución"
              className={toolButton}
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
