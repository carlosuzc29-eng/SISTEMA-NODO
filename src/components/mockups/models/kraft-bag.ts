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
  twistedCordTexture,
} from "./materials";

/**
 * Bolsa de papel kraft con fuelles laterales en V, dobladillo interior
 * y asas de cordón de papel torcido. Al "abrir", las asas caen hacia
 * afuera y dejan ver la boca de la bolsa.
 */
export function createKraftBag(params: PackageModelParams): PackageModelHandle {
  const root = new THREE.Group();
  const { width: w, height: h, depth: d } = params;
  const t = 0.005; // papel kraft ~120 g

  const mats = createPackageMaterials({
    outerStock: "kraft",
    insideStock: "kraft",
    markAspect: w / h,
  });

  // 1. Frente y dorso
  const front = createPanel([w, h, t], FACE.pz, mats.art, mats);
  front.position.set(0, 0, d / 2 - t / 2);

  const back = createPanel([w, h, t], FACE.nz, mats.art, mats);
  back.position.set(0, 0, -d / 2 + t / 2);

  root.add(front, back);

  const foilDecal = createFoilDecal(w, h, mats.foil);
  foilDecal.position.set(0, 0, d / 2 + 0.0005);
  root.add(foilDecal);

  // 2. Fuelles laterales: dos medias caras que se pliegan hacia adentro
  const gusset = Math.min(d * 0.22, w * 0.12);
  const halfLen = Math.hypot(gusset, d / 2);
  const halfAngle = Math.atan2(gusset, d / 2);

  function createGussetSide(side: -1 | 1) {
    const group = new THREE.Group();
    for (const zSign of [1, -1] as const) {
      const half = createPanel([t, h, halfLen], FACE.px, mats.outer, mats);
      half.position.set(w / 2 - gusset / 2, 0, (zSign * d) / 4);
      half.rotation.y = zSign * halfAngle;
      group.add(half);
    }
    group.scale.x = side; // espejo para el lado izquierdo
    return group;
  }

  root.add(createGussetSide(1), createGussetSide(-1));

  // 3. Fondo
  const bottom = createPanel([w - gusset, t, d - 2 * t], FACE.ny, mats.outer, mats);
  bottom.position.set(0, -h / 2 + t / 2, 0);
  root.add(bottom);

  // 4. Dobladillo superior interior (refuerzo donde se pegan las asas)
  const hemH = Math.min(0.35, h * 0.12);
  for (const zSign of [1, -1] as const) {
    const hem = createPanel([w - 2 * t, hemH, t], zSign === 1 ? FACE.nz : FACE.pz, mats.inside, mats);
    hem.position.set(0, h / 2 - hemH / 2, zSign * (d / 2 - t * 1.5));
    root.add(hem);
  }

  // 5. Asas de cordón torcido
  const cordTex = twistedCordTexture();
  const cordMat = new THREE.MeshStandardMaterial({
    map: cordTex,
    bumpMap: cordTex,
    bumpScale: 1.5,
    roughness: 0.85,
  });

  const span = w * 0.22;
  const lift = Math.min(h * 0.32, w * 0.42);
  const anchor = hemH * 0.7;
  const cordR = 0.022;

  function createHandle(zSign: 1 | -1) {
    // Anclado por dentro del dobladillo, sin atravesar el papel
    const base = new THREE.Group();
    base.position.set(0, h / 2, zSign * (d / 2 - 2 * t - cordR - 0.004));

    // Extremos pegados por dentro: fijos
    const stubGeo = new THREE.CylinderGeometry(cordR, cordR, anchor, 10);
    const jointGeo = new THREE.SphereGeometry(cordR, 12, 8);
    for (const x of [-span, span]) {
      const stub = new THREE.Mesh(stubGeo, cordMat);
      stub.position.set(x, -anchor / 2, 0);
      const joint = new THREE.Mesh(jointGeo, cordMat);
      joint.position.set(x, 0, 0);
      stub.castShadow = joint.castShadow = true;
      base.add(stub, joint);
    }

    // Lazo: pivota sobre el eje que une los dos extremos
    const loop = new THREE.Group();
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-span, 0, 0),
      new THREE.Vector3(-span * 0.94, lift * 0.45, 0),
      new THREE.Vector3(-span * 0.62, lift * 0.88, 0),
      new THREE.Vector3(0, lift, 0),
      new THREE.Vector3(span * 0.62, lift * 0.88, 0),
      new THREE.Vector3(span * 0.94, lift * 0.45, 0),
      new THREE.Vector3(span, 0, 0),
    ]);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, cordR, 10, false), cordMat);
    tube.castShadow = true;
    loop.add(tube);
    base.add(loop);

    root.add(base);
    return loop;
  }

  const frontHandle = createHandle(1);
  const backHandle = createHandle(-1);

  // Al abrir, las asas caen hacia afuera sobre cada cara
  function updateOpen(progress: number) {
    const p = Math.max(0, Math.min(1, progress));
    frontHandle.rotation.x = smoothstep(0, 0.85, p) * Math.PI * 0.82;
    backHandle.rotation.x = -smoothstep(0.15, 1, p) * Math.PI * 0.82;
  }

  updateOpen(params.openProgress);
  mats.update(params.finish);

  return {
    group: root,
    updateOpen,
    updateFinish: mats.update,
    dispose() {
      disposeGroup(root);
      cordMat.dispose();
      mats.dispose();
    },
  };
}
