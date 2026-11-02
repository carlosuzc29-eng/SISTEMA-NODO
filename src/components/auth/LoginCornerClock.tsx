"use client";

import React, { useState, useEffect } from "react";
import styles from "@/app/(auth)/login/login.module.css";

export function LoginCornerClock() {
  const [timeStr, setTimeStr] = useState("--:--:--");

  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString("es-VE", { hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`${styles.corner} ${styles.cornerBr}`} aria-label="Reloj de planta">
      {timeStr}
    </div>
  );
}

export default LoginCornerClock;

