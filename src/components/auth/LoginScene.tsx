"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";

export interface LoginSceneHandle {
  pulse: (hex: number) => void;
}

export const LoginScene = forwardRef<LoginSceneHandle, { className?: string }>(
  function LoginScene({ className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const pulseFnRef = useRef<((hex: number) => void) | null>(null);

    useImperativeHandle(ref, () => ({
      pulse: (hex: number) => {
        if (pulseFnRef.current) {
          pulseFnRef.current(hex);
        }
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const PAPER = 0xf5f2ec;
      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(PAPER, 10, 30);

      const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      cam.position.set(0, 0, 14);

      const C = 0x0098d4,
        M = 0xd6006f,
        Y = 0xf2b800,
        K = 0x15141a,
        KRAFT = 0xc9ae86,
        WHITE = 0xffffff;

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xd9d2c4, 0.95);
      scene.add(hemiLight);

      const sun = new THREE.DirectionalLight(0xffffff, 0.55);
      sun.position.set(5, 8, 6);
      scene.add(sun);

      // Colección para liberar recursos limpiamente al desmontar
      const disposables: { dispose: () => void }[] = [];
      const trackDisposable = <T extends { dispose: () => void }>(item: T): T => {
        disposables.push(item);
        return item;
      };

      // Núcleo: marca de registro 3D, anillos finos en tintas de proceso
      const core = new THREE.Group();
      scene.add(core);

      const torusConfigs: [number, [number, number, number]][] = [
        [C, [0, 0, 0]],
        [M, [Math.PI / 2, 0, 0]],
        [Y, [0, Math.PI / 2, 0]],
      ];

      torusConfigs.forEach(([col, rot], i) => {
        const geo = trackDisposable(new THREE.TorusGeometry(3.1, 0.028, 12, 180));
        const mat = trackDisposable(
          new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85 })
        );
        const t = new THREE.Mesh(geo, mat);
        t.rotation.set(...rot);
        t.userData.s = 0.15 + i * 0.07;
        core.add(t);
      });

      const icoGeo = trackDisposable(new THREE.IcosahedronGeometry(1.45, 1));
      const icoMat = trackDisposable(
        new THREE.MeshStandardMaterial({
          color: 0xfbfaf7,
          roughness: 0.85,
          metalness: 0,
          flatShading: true,
          emissive: 0x000000,
        })
      );
      const ico = new THREE.Mesh(icoGeo, icoMat);
      core.add(ico);

      const icoEdgesGeo = trackDisposable(
        new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.46, 1))
      );
      const icoLineMat = trackDisposable(
        new THREE.LineBasicMaterial({ color: K, transparent: true, opacity: 0.28 })
      );
      const icoW = new THREE.LineSegments(icoEdgesGeo, icoLineMat);
      core.add(icoW);

      const cross = new THREE.Group();
      const crossMat = trackDisposable(
        new THREE.LineBasicMaterial({ color: K, transparent: true, opacity: 0.3 })
      );
      [
        [-4.6, 0, 0, 4.6, 0, 0],
        [0, -4.6, 0, 0, 4.6, 0],
      ].forEach((p) => {
        const g = trackDisposable(new THREE.BufferGeometry());
        g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
        cross.add(new THREE.Line(g, crossMat));
      });
      core.add(cross);

      // Cajas de empaque: cartón blanco y kraft, con arista de tinta
      const boxes: THREE.Group[] = [];
      const boxCols = [WHITE, KRAFT, WHITE, WHITE, KRAFT];
      for (let i = 0; i < 18; i++) {
        const w = 0.6 + Math.random() * 1.2;
        const h = 0.5 + Math.random() * 1;
        const d = 0.5 + Math.random() * 0.9;
        const geo = trackDisposable(new THREE.BoxGeometry(w, h, d));
        const g = new THREE.Group();
        const boxMat = trackDisposable(
          new THREE.MeshStandardMaterial({ color: boxCols[i % 5], roughness: 0.95 })
        );
        g.add(new THREE.Mesh(geo, boxMat));
        const edgesGeo = trackDisposable(new THREE.EdgesGeometry(geo));
        const edgeMat = trackDisposable(
          new THREE.LineBasicMaterial({ color: K, transparent: true, opacity: 0.18 })
        );
        g.add(new THREE.LineSegments(edgesGeo, edgeMat));

        const a = Math.random() * Math.PI * 2;
        const rad = 7 + Math.random() * 8;
        g.position.set(
          Math.cos(a) * rad,
          (Math.random() - 0.5) * 11,
          -Math.random() * 10 - 5
        );
        g.userData = {
          vr: new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
          ).multiplyScalar(0.008),
          fy: Math.random() * 6.28,
          by: g.position.y,
        };
        scene.add(g);
        boxes.push(g);
      }

      // Pliegos con una franja de color (como barras de control)
      const sheets: THREE.Group[] = [];
      const sheetCols = [C, M, Y, K];
      for (let i = 0; i < 8; i++) {
        const s = new THREE.Group();
        const sheetGeo = trackDisposable(new THREE.PlaneGeometry(1.3, 1.8));
        const sheetMat = trackDisposable(
          new THREE.MeshStandardMaterial({
            color: WHITE,
            side: THREE.DoubleSide,
            roughness: 1,
          })
        );
        s.add(new THREE.Mesh(sheetGeo, sheetMat));

        const barGeo = trackDisposable(new THREE.PlaneGeometry(1.3, 0.12));
        const barMat = trackDisposable(
          new THREE.MeshBasicMaterial({
            color: sheetCols[i % 4],
            side: THREE.DoubleSide,
          })
        );
        const bar = new THREE.Mesh(barGeo, barMat);
        bar.position.set(0, 0.84, 0.002);
        s.add(bar);

        s.userData = {
          a: (i / 8) * Math.PI * 2,
          r: 5 + (i % 3) * 0.6,
          sp: 0.002 + Math.random() * 0.0015,
          yo: (Math.random() - 0.5) * 2,
        };
        scene.add(s);
        sheets.push(s);
      }

      // Puntos de semitono
      const N = 900;
      const pos = new Float32Array(N * 3);
      const col = new Float32Array(N * 3);
      const pal = [C, M, Y, K].map((c) => new THREE.Color(c));
      for (let i = 0; i < N; i++) {
        pos.set(
          [
            (Math.random() - 0.5) * 44,
            (Math.random() - 0.5) * 26,
            (Math.random() - 0.5) * 22 - 4,
          ],
          i * 3
        );
        const c = pal[i % 4];
        col.set([c.r, c.g, c.b], i * 3);
      }
      const pg = trackDisposable(new THREE.BufferGeometry());
      pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      pg.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const ptsMat = trackDisposable(
        new THREE.PointsMaterial({
          size: 0.06,
          vertexColors: true,
          transparent: true,
          opacity: 0.55,
          depthWrite: false,
        })
      );
      const pts = new THREE.Points(pg, ptsMat);
      scene.add(pts);

      let mx = 0,
        my = 0,
        tx = 0,
        ty = 0;
      const onPointerMove = (e: PointerEvent) => {
        tx = e.clientX / window.innerWidth - 0.5;
        ty = e.clientY / window.innerHeight - 0.5;
      };
      window.addEventListener("pointermove", onPointerMove);

      const baseScale = () => (window.innerWidth > 980 ? 1.2 : 0.72);
      const handleResize = () => {
        if (!canvas) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h, false);
        cam.aspect = w / h;
        cam.updateProjectionMatrix();
        if (w > 980) core.position.set(1.4, 0.4, -6);
        else core.position.set(0, 7.5, -8);
        core.scale.setScalar(baseScale());
      };
      window.addEventListener("resize", handleResize);
      handleResize();

      const baseColor = new THREE.Color(0x000000);
      core.userData.flash = 0;
      core.userData.col = new THREE.Color(0x1f9d6b);

      pulseFnRef.current = (hex: number) => {
        core.userData.flash = 1;
        core.userData.col = new THREE.Color(hex);
      };

      const startTime = performance.now();
      let animId: number;

      const loop = () => {
        const t = (performance.now() - startTime) * 0.001;
        const k = reduce ? 0.15 : 1;
        mx += (tx - mx) * 0.04;
        my += (ty - my) * 0.04;
        cam.position.x = mx * 2.4;
        cam.position.y = -my * 1.6;
        cam.lookAt(0, 0, 0);

        core.children.forEach((o) => {
          if (o.userData.s) {
            o.rotation.x += o.userData.s * 0.018 * k;
            o.rotation.y += o.userData.s * 0.026 * k;
          }
        });
        ico.rotation.y += 0.003 * k;
        ico.rotation.x += 0.0015 * k;
        icoW.rotation.copy(ico.rotation);
        cross.rotation.z = -t * 0.08 * k;

        if (core.userData.flash > 0) {
          core.userData.flash -= 0.02;
          const f = Math.max(core.userData.flash, 0);
          icoMat.emissive.copy(baseColor).lerp(core.userData.col, f * 0.6);
          core.scale.setScalar(baseScale() * (1 + f * 0.1));
        }

        boxes.forEach((b) => {
          b.rotation.x += b.userData.vr.x * k;
          b.rotation.y += b.userData.vr.y * k;
          b.position.y =
            b.userData.by + Math.sin(t * 0.5 + b.userData.fy) * 0.4;
        });

        sheets.forEach((s) => {
          const u = s.userData;
          u.a += u.sp * k;
          s.position.set(
            core.position.x + Math.cos(u.a) * u.r,
            core.position.y + u.yo + Math.sin(u.a * 2) * 0.5,
            core.position.z + Math.sin(u.a) * u.r
          );
          s.rotation.set(
            Math.sin(t * 0.4 + u.a) * 0.3,
            u.a + Math.PI / 2,
            Math.sin(t + u.a) * 0.25
          );
        });

        pts.rotation.y = t * 0.012 * k;
        renderer.render(scene, cam);
        animId = requestAnimationFrame(loop);
      };

      animId = requestAnimationFrame(loop);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", handleResize);
        pulseFnRef.current = null;
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
      };
    }, []);

    return <canvas ref={canvasRef} id="scene" className={className} />;
  }
);

LoginScene.displayName = "LoginScene";
export default LoginScene;

