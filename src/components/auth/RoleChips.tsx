"use client";

import React from "react";
import styles from "@/app/(auth)/login/login.module.css";

export interface RoleChipItem {
  label: string;
  usuario: string;
  color: string;
}

export const REAL_ROLES: RoleChipItem[] = [
  { label: "Admin", usuario: "admin", color: "var(--k)" },
  { label: "Recepción", usuario: "recepcion", color: "var(--c)" },
  { label: "Supervisor", usuario: "supervisor", color: "var(--k)" },
  { label: "Diseño", usuario: "op_diseno", color: "var(--m)" },
  { label: "Impresión", usuario: "op_impresion", color: "var(--y)" },
  { label: "Troquelado", usuario: "op_troquelado", color: "var(--c)" },
  { label: "Corte", usuario: "op_corte", color: "#A08B6C" },
  { label: "Logística", usuario: "op_logistica", color: "#EAB308" },
];

interface RoleChipsProps {
  selectedUser: string;
  onSelectRole: (usuario: string) => void;
  className?: string;
}

export function RoleChips({ selectedUser, onSelectRole, className }: RoleChipsProps) {
  const normUser = selectedUser.trim().toLowerCase();

  return (
    <div className={`${styles.roles} ${className || ""}`}>
      {REAL_ROLES.map((role) => {
        const isSelected =
          normUser === role.usuario.toLowerCase() ||
          (normUser.startsWith("op_") && normUser.replace("op_", "") === role.usuario) ||
          (role.usuario.startsWith("op_") && normUser === role.usuario.replace("op_", ""));

        return (
          <button
            key={role.usuario}
            type="button"
            onClick={() => onSelectRole(role.usuario)}
            className={`${styles.role} ${isSelected ? styles.roleOn : ""}`}
            style={{ "--rc": role.color } as React.CSSProperties}
          >
            {role.label}
          </button>
        );
      })}
    </div>
  );
}

export default RoleChips;

