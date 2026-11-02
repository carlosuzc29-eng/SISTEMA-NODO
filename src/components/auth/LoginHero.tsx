"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/(auth)/login/login.module.css";

export function LoginHero() {
  const [shift, setShift] = useState("—");
  const [dateStr, setDateStr] = useState("—");

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const h = d.getHours();
      setShift(h >= 6 && h < 14 ? "Mañana" : h >= 14 && h < 22 ? "Tarde" : "Noche");
      setDateStr(
        d
          .toLocaleDateString("es-VE", { day: "2-digit", month: "short" })
          .replace(".", "")
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.hero}>
      {/* Eyebrow de imprenta */}
      <div className={styles.eyebrow}>
        <span className={styles.cmyk}>
          <i style={{ background: "var(--c)" }} />
          <i style={{ background: "var(--m)" }} />
          <i style={{ background: "var(--y)" }} />
          <i style={{ background: "var(--k)" }} />
        </span>
        Imprenta &amp; Empaques · Mérida
      </div>

      {/* Título de Display con registro corrido a registro perfecto */}
      <h1>
        Control de<br />
        <span className={styles.regTx}>Producción</span>
      </h1>

      <p className={styles.lead}>
        Cada orden, de la recepción al corte, en un solo flujo. Ingresa con tu usuario y PIN para ver tu cola de trabajo.
      </p>

      {/* Flujo de taller */}
      <div className={styles.pipe}>
        <div className={styles.pipeLabel}>Flujo de taller</div>
        <div className={styles.pipeTrack}>
          <div className={styles.pulse} />
          <div className={styles.node} style={{ "--col": "var(--c)" } as React.CSSProperties}>
            <div className={styles.dot}><span /></div>
            <small>Recepción</small>
          </div>
          <div className={styles.node} style={{ "--col": "var(--m)" } as React.CSSProperties}>
            <div className={styles.dot}><span /></div>
            <small>Diseño</small>
          </div>
          <div className={styles.node} style={{ "--col": "var(--y)" } as React.CSSProperties}>
            <div className={styles.dot}><span /></div>
            <small>Impresión</small>
          </div>
          <div className={styles.node} style={{ "--col": "var(--k)" } as React.CSSProperties}>
            <div className={styles.dot}><span /></div>
            <small>Troquelado</small>
          </div>
          <div className={styles.node} style={{ "--col": "#A08B6C" } as React.CSSProperties}>
            <div className={styles.dot}><span /></div>
            <small>Corte</small>
          </div>
        </div>
      </div>

      {/* Indicadores de Turno y Planta */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          Turno
          <strong>{shift}</strong>
        </div>
        <div className={styles.stat}>
          Fecha
          <strong>{dateStr}</strong>
        </div>
        <div className={styles.stat}>
          Estado
          <strong style={{ color: "var(--ok)" }}>En línea</strong>
        </div>
      </div>
    </section>
  );
}

export default LoginHero;
