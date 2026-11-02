"use client";

import React from "react";
import styles from "@/app/(auth)/login/login.module.css";

interface PinPadProps {
  onPress: (key: string) => void;
  disabled?: boolean;
  className?: string;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clr", "0", "del"] as const;

export function PinPad({ onPress, disabled = false, className }: PinPadProps) {
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = styles.rip;
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    ripple.style.background = "radial-gradient(closest-side, rgba(21, 20, 26, 0.08), transparent)";
    btn.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 520);
  };

  return (
    <div className={`${styles.pad} ${className || ""}`}>
      {KEYS.map((k) => {
        const isClr = k === "clr";
        const isDel = k === "del";
        const isGhost = isClr || isDel;

        return (
          <button
            key={k}
            type="button"
            data-k={k}
            disabled={disabled}
            onClick={() => onPress(k)}
            onPointerDown={handlePointerDown}
            className={`${styles.key} ${isGhost ? styles.keyGhost : ""}`}
            aria-label={isClr ? "Borrar PIN" : isDel ? "Retroceso" : `Número ${k}`}
          >
            {isClr ? (
              "Borrar"
            ) : isDel ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M21 5H9l-6 7 6 7h12zM18 9l-6 6M12 9l6 6" />
              </svg>
            ) : (
              k
            )}
          </button>
        );
      })}
    </div>
  );
}

export default PinPad;
