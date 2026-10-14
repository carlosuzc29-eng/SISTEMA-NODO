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

/**
 * Caja de pizza en microcorrugado: bandeja con paredes de 3 mm,
 * interior kraft y tapa abisagrada con pestaña frontal.
 * El arte va en la tapa, que es la cara que ve el cliente final.
 */
export function createPizzaBox(params: PackageModelParams): PackageModelHandle {
  const root = new THREE.Group();
  const { width: w, height: h, depth: d } = params;
  const t = 0.03; // ~3 mm de microcorrugado

  const mats = createPackageMaterials({
    outerStock: "white",
    insideStock: "kraft",
    markAspect: w / (d + t),
  });

  // 1. Bandeja
  const bottom = createPanel([w, t, d], FACE.ny, mats.outer, mats);
  bottom.position.set(0, -h / 2 + t / 2, 0);

  const wallH = h - t;
  const wallY = t / 2;

  const front = createPanel([w, wallH, t], FACE.pz, mats.outer, mats);
  front.position.set(0, wallY, d / 2 - t / 2);

  const back = createPanel([w, wallH, t], FACE.nz, mats.outer, mats);
  back.position.set(0, wallY, -d / 2 + t / 2);

  const left = createPanel([t, wallH, d - 2 * t], FACE.nx, mats.outer, mats);
  left.position.set(-w / 2 + t / 2, wallY, 0);

  const right = createPanel([t, wallH, d - 2 * t], FACE.px, mats.outer, mats);
  right.position.set(w / 2 - t / 2, wallY, 0);

  root.add(bottom, front, back, left, right);

  // 2. Tapa con bisagra en la arista superior trasera
  const lid = new THREE.Group();
  lid.position.set(0, h / 2, -d / 2);

  const lidDepth = d + t; // cubre también el grosor de la pestaña
  const lidPanel = createPanel([w, t, lidDepth], FACE.py, mats.art, mats);
  lidPanel.position.set(0, t / 2, lidDepth / 2);
  lid.add(lidPanel);

  const foilDecal = createFoilDecal(w, lidDepth, mats.foil);
  foilDecal.rotation.x = -Math.PI / 2;
  foilDecal.position.set(0, t + 0.0005, lidDepth / 2);
  lid.add(foilDecal);

  // Pestaña frontal que cae por fuera de la pared delantera
  const lipH = h * 0.8 + t;
  const lip = createPanel([w, lipH, t], FACE.pz, mats.outer, mats);
  lip.position.set(0, t - lipH / 2, lidDepth - t / 2);
  lid.add(lip);

  root.add(lid);

  function updateOpen(progress: number) {
    const p = smoothstep(0, 1, Math.max(0, Math.min(1, progress)));
    lid.rotation.x = -p * Math.PI * 0.6;
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
