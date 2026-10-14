import * as THREE from "three";
import {
  FACE,
  PackageModelHandle,
  PackageModelParams,
  createFoilDecal,
  createPackageMaterials,
  createPanel,
  disposeGroup,
  smoothstep,
} from "./materials";

export type { PackageModelParams } from "./materials";

/**
 * Caja plegadiza tuck-end (estuche de cartulina).
 * Paredes con grosor real, interior visible al abrir, tapa con solapa
 * de cierre y solapas guardapolvo que se levantan después de la tapa.
 */
export function createTuckEndBox(params: PackageModelParams): PackageModelHandle {
  const root = new THREE.Group();
  const { width: w, height: h, depth: d } = params;
  const t = 0.008; // ~0.8 mm de cartulina (en unidades de 1 dm)

  const mats = createPackageMaterials({
    outerStock: "white",
    insideStock: "white",
    markAspect: w / h,
  });

  // 1. Cuerpo: cuatro paredes y fondo
  const front = createPanel([w, h, t], FACE.pz, mats.art, mats);
  front.position.set(0, 0, d / 2 - t / 2);

  const back = createPanel([w, h, t], FACE.nz, mats.art, mats);
  back.position.set(0, 0, -d / 2 + t / 2);

  const left = createPanel([t, h, d - 2 * t], FACE.nx, mats.outer, mats);
  left.position.set(-w / 2 + t / 2, 0, 0);

  const right = createPanel([t, h, d - 2 * t], FACE.px, mats.outer, mats);
  right.position.set(w / 2 - t / 2, 0, 0);

  const bottom = createPanel([w - 2 * t, t, d - 2 * t], FACE.ny, mats.outer, mats);
  bottom.position.set(0, -h / 2 + t / 2, 0);

  root.add(front, back, left, right, bottom);

  // Lámina de hot stamping sobre el frente
  const foilDecal = createFoilDecal(w, h, mats.foil);
  foilDecal.position.set(0, 0, d / 2 + 0.0005);
  root.add(foilDecal);

  // 2. Solapas guardapolvo (bajo la tapa, ancladas a los laterales)
  const dustW = Math.min(w * 0.28, d * 0.6);
  const dustD = d - 4 * t - 0.01; // holgura frente a la solapa de cierre

  function createDustFlap(side: -1 | 1) {
    const pivot = new THREE.Group();
    pivot.position.set(side * (w / 2 - t), h / 2, 0);
    const flap = createPanel([dustW, t, dustD], FACE.py, mats.inside, mats);
    flap.position.set(-side * (dustW / 2), -t / 2, 0);
    pivot.add(flap);
    return pivot;
  }

  const dustLeft = createDustFlap(-1);
  const dustRight = createDustFlap(1);
  root.add(dustLeft, dustRight);

  // 3. Tapa con bisagra en la arista superior trasera
  const lid = new THREE.Group();
  lid.position.set(0, h / 2, -d / 2);

  const lidPanel = createPanel([w, t, d], FACE.py, mats.outer, mats);
  lidPanel.position.set(0, t / 2, d / 2);
  lid.add(lidPanel);

  // Solapa de cierre: entra por detrás de la pared frontal
  const tuckLen = Math.min(d * 0.45, h * 0.22);
  const tuck = new THREE.Group();
  tuck.position.set(0, 0, d - t);
  const tuckPanel = createPanel([w * 0.96 - 2 * t, tuckLen, t], FACE.pz, mats.inside, mats);
  tuckPanel.position.set(0, -tuckLen / 2, -t / 2);
  tuck.add(tuckPanel);
  lid.add(tuck);

  root.add(lid);

  // Coreografía: primero sube la tapa, luego se libera la solapa
  // y al final se levantan los guardapolvos.
  function updateOpen(progress: number) {
    const p = Math.max(0, Math.min(1, progress));
    const lidP = smoothstep(0, 0.75, p);
    const tuckP = smoothstep(0.1, 0.8, p);
    const dustP = smoothstep(0.45, 1, p);

    lid.rotation.x = -lidP * Math.PI * 0.68;
    tuck.rotation.x = -tuckP * Math.PI * 0.32;
    dustLeft.rotation.z = dustP * Math.PI * 0.56;
    dustRight.rotation.z = -dustP * Math.PI * 0.56;
  }

  updateOpen(params.openProgress);
  mats.update(params.finish);

  return {
    group: root,
    updateOpen,
    updateFinish: mats.update,
    dispose() {
      disposeGroup(root);
      mats.dispose();
    },
  };
}
