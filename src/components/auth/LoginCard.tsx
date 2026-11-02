"use client";

import React, { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginConPin } from "@/features/auth/actions";
import { RoleChips } from "./RoleChips";
import { PinPad } from "./PinPad";
import styles from "@/app/(auth)/login/login.module.css";

interface LoginCardProps {
  onPulse?: (hex: number) => void;
}

const PIN_LEN = 6;
const PIN_COLORS = [
  "var(--c)",
  "var(--m)",
  "var(--y)",
  "var(--k)",
  "var(--c)",
  "var(--m)",
];

export function LoginCard({ onPulse }: LoginCardProps) {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [pin, setPin] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShake, setIsShake] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [welcomeName, setWelcomeName] = useState("Cargando tu cola de trabajo…");
  const [isPending, startTransition] = useTransition();

  const cardRef = useRef<HTMLFormElement | null>(null);
  const userInputRef = useRef<HTMLInputElement | null>(null);

  // Inclinación 3D interactiva protegida con media query (pointer: fine)
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      card.style.transform = `rotateY(${(x - 0.5) * 5}deg) rotateX(${(0.5 - y) * 5}deg)`;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
    };

    const handlePointerLeave = () => {
      card.style.transform = "";
    };

    card.addEventListener("pointermove", handlePointerMove);
    card.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      card.removeEventListener("pointermove", handlePointerMove);
      card.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  // Envío real con autenticación de Supabase / Server Action
  const executeSubmit = useCallback(
    (currentUser: string, currentPin: string) => {
      if (isPending || isSuccess) return;

      const trimmedUser = currentUser.trim().toLowerCase();
      if (!trimmedUser) {
        setErrorMessage("Ingresa tu usuario para continuar.");
        if (userInputRef.current) userInputRef.current.focus();
        return;
      }

      if (currentPin.length < PIN_LEN) {
        setErrorMessage(`El PIN debe tener ${PIN_LEN} dígitos.`);
        return;
      }

      setErrorMessage(null);

      startTransition(async () => {
        const result = await loginConPin({
          usuario: trimmedUser,
          pin: currentPin,
        });

        if (!result.ok) {
          // Pulso rojo de error y animación shake
          onPulse?.(0xc9374a);
          setIsShake(true);
          setErrorMessage(result.error || "Usuario o PIN incorrecto. Verifica e intenta de nuevo.");
          setPin("");

          setTimeout(() => {
            setIsShake(false);
          }, 460);
          return;
        }

        // Acceso exitoso: pulso verde y overlay de éxito
        onPulse?.(0x1f9d6b);
        setIsSuccess(true);
        if (result.nombreCompleto) {
          setWelcomeName(`Bienvenido, ${result.nombreCompleto}. Cargando tu cola de trabajo…`);
        } else {
          setWelcomeName("Bienvenido. Cargando tu cola de trabajo…");
        }

        // Breve pausa para la animación de éxito antes de redirigir
        setTimeout(() => {
          if (result.redirectUrl) {
            router.push(result.redirectUrl);
            router.refresh();
          }
        }, 850);
      });
    },
    [isPending, isSuccess, onPulse, router]
  );

  // Teclado físico: números, Backspace, Escape, Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPending || isSuccess) return;

      const isInputFocused = document.activeElement === userInputRef.current;

      // Si el foco está en el input de usuario
      if (isInputFocused) {
        if (e.key === "Enter") {
          e.preventDefault();
          executeSubmit(usuario, pin);
        }
        return;
      }

      // Atajos de dígitos y caracteres para el PIN / clave
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        e.preventDefault();
        setErrorMessage(null);
        setPin((prev) => {
          if (prev.length < PIN_LEN) {
            const next = prev + e.key;
            if (next.length === PIN_LEN && usuario.trim()) {
              setTimeout(() => executeSubmit(usuario, next), 180);
            }
            return next;
          }
          return prev;
        });
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setErrorMessage(null);
        setPin((prev) => prev.slice(0, -1));
      } else if (e.key === "Escape") {
        e.preventDefault();
        setErrorMessage(null);
        setPin("");
      } else if (e.key === "Enter") {
        e.preventDefault();
        executeSubmit(usuario, pin);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [usuario, pin, isPending, isSuccess, executeSubmit]);

  // Manejo de pulsación en el PinPad táctil
  const handleKeypadPress = (k: string) => {
    if (isPending || isSuccess) return;
    setErrorMessage(null);

    if (k === "del") {
      setPin((prev) => prev.slice(0, -1));
    } else if (k === "clr") {
      setPin("");
    } else if (pin.length < PIN_LEN) {
      const next = pin + k;
      setPin(next);
      if (next.length === PIN_LEN && usuario.trim()) {
        setTimeout(() => executeSubmit(usuario, next), 180);
      }
    }
  };

  const handleSelectRole = (userVal: string) => {
    setUsuario(userVal);
    setErrorMessage(null);
  };

  const isButtonDisabled = !(usuario.trim() && pin.length === PIN_LEN) || isPending || isSuccess;

  return (
    <div className={styles.cardShell}>
      <form
        ref={cardRef}
        className={styles.card}
        id="card"
        autoComplete="off"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          executeSubmit(usuario, pin);
        }}
      >
        {/* Tira CMYK de control en la parte superior */}
        <div className={styles.strip}>
          <i style={{ background: "var(--c)" }} />
          <i style={{ background: "var(--m)" }} />
          <i style={{ background: "var(--y)" }} />
          <i style={{ background: "var(--k)" }} />
        </div>

        <div className={styles.cardContent}>
          {/* Identidad de marca con anillos de registro en rotación */}
          <div className={styles.brand}>
            <div className={styles.logo} aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none">
                <g className={styles.logoRing}>
                  <circle cx="20" cy="20" r="13.5" stroke="#fff" strokeOpacity=".9" strokeWidth="1.5" />
                  <path d="M20 3v8M20 29v8M3 20h8M29 20h8" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="20" cy="6.5" r="1.6" fill="#0098D4" />
                  <circle cx="33.5" cy="20" r="1.6" fill="#D6006F" />
                  <circle cx="20" cy="33.5" r="1.6" fill="#F2B800" />
                </g>
                <text x="20" y="24" textAnchor="middle" fontFamily="var(--sans), sans-serif" fontWeight="800" fontSize="11" fill="#fff">
                  26
                </text>
              </svg>
            </div>
            <div>
              <h2>Nodo 26</h2>
              <p>IMPRENTA &amp; EMPAQUES</p>
            </div>
          </div>

          {/* Caja de alertas */}
          <div
            className={`${styles.alert} ${errorMessage ? styles.alertShow : ""}`}
            role="alert"
            aria-live="assertive"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <span>{errorMessage || ""}</span>
          </div>

          {/* Campo de usuario */}
          <label className={styles.lbl} htmlFor="user">
            <span>Usuario</span>
          </label>
          <div className={styles.field}>
            <input
              ref={userInputRef}
              id="user"
              name="user"
              value={usuario}
              onChange={(e) => {
                setUsuario(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="Tu usuario"
              spellCheck={false}
              autoCapitalize="characters"
              className={styles.fieldInput}
            />
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </div>

          {/* Chips de roles del sistema real */}
          <RoleChips selectedUser={usuario} onSelectRole={handleSelectRole} />

          {/* Indicadores de PIN */}
          <label className={styles.lbl}>
            <span>PIN de seguridad</span>
            <span>
              {pin.length} / {PIN_LEN}
            </span>
          </label>
          <div
            className={`${styles.pins} ${isShake ? styles.pinsShake : ""} ${
              errorMessage ? styles.pinsErr : ""
            } ${isSuccess ? styles.pinsOkp : ""}`}
            aria-label="PIN"
          >
            {Array.from({ length: PIN_LEN }).map((_, idx) => (
              <div
                key={idx}
                className={`${styles.pin} ${idx < pin.length ? styles.pinOn : ""}`}
                style={{ "--pc": PIN_COLORS[idx] } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Teclado táctil */}
          <PinPad onPress={handleKeypadPress} disabled={isPending || isSuccess} />

          {/* Botón de acceso */}
          <button
            className={styles.go}
            type="submit"
            disabled={isButtonDisabled}
          >
            <span>
              {isPending ? (
                <>
                  <span className={styles.spinner} /> Verificando…
                </>
              ) : (
                <>
                  Entrar al sistema
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </span>
          </button>

          {/* Pie de la tarjeta */}
          <div className={styles.foot}>
            <span>Nodo 26 · Sistema MES</span>
            <span>
              ¿Olvidaste tu PIN? <b>Supervisor</b>
            </span>
          </div>

          {/* Pantalla de éxito overlay con animación de dibujo */}
          <div className={`${styles.success} ${isSuccess ? styles.successShow : ""}`}>
            <div>
              <svg viewBox="0 0 84 84" fill="none">
                <circle cx="42" cy="42" r="38" stroke="#1F9D6B" strokeWidth="3" />
                <path d="M27 43l10 10 21-22" stroke="#1F9D6B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>Acceso concedido</h3>
              <p>{welcomeName}</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default LoginCard;
