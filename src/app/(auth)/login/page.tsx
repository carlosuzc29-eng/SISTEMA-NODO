"use client";

import React, { useRef } from "react";
import dynamic from "next/dynamic";
import { manrope, ibmPlexMono } from "./fonts";
import { LoginHero } from "@/components/auth/LoginHero";
import { LoginCard } from "@/components/auth/LoginCard";
import { LoginCornerClock } from "@/components/auth/LoginCornerClock";
import type { LoginSceneHandle } from "@/components/auth/LoginScene";
import styles from "./login.module.css";

const LoginScene = dynamic(() => import("@/components/auth/LoginScene"), {
  ssr: false,
});

export default function LoginPage() {
  const sceneRef = useRef<LoginSceneHandle | null>(null);

  const handlePulse = (hex: number) => {
    sceneRef.current?.pulse(hex);
  };

  return (
    <div className={`${styles.loginRoot} ${manrope.variable} ${ibmPlexMono.variable}`}>
      {/* Escena 3D con Three.js cargada dinámicamente en cliente */}
      <LoginScene ref={sceneRef} className={styles.scene} />

      {/* Capas de textura: retícula de semitono y grano de papel */}
      <div className={styles.dots} />
      <div className={styles.grain} />

      {/* Marcas técnicas de registro en las esquinas */}
      <div className={`${styles.corner} ${styles.cornerTl}`}>
        <span className={styles.reg} />
        Nodo 26 // Registro 0.1 mm
      </div>
      <div className={`${styles.corner} ${styles.cornerTr}`}>
        <span className={styles.live} />
        Prensa · ISO 12647-2
      </div>
      <div className={`${styles.corner} ${styles.cornerBl}`}>
        <span className={styles.cmyk}>
          <i style={{ background: "var(--c)" }} />
          <i style={{ background: "var(--m)" }} />
          <i style={{ background: "var(--y)" }} />
          <i style={{ background: "var(--k)" }} />
        </span>
        CMYK calibrado
      </div>
      <LoginCornerClock />

      {/* Layout principal */}
      <main className={styles.wrap}>
        <LoginHero />
        <LoginCard onPulse={handlePulse} />
      </main>
    </div>
  );
}
