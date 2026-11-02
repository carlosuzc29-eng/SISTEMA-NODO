import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nodo 26 · Acceso",
  description: "Control de Producción y Empaques • Sistema MES",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
