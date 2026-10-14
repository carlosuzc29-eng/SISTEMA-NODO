export const brand = {
  nombre: "Nodo 26 - Imprenta & Empaques",
  nombreCorto: "N26",
  logo: "/brand/logo.svg",
  logoClaro: "/brand/logo-light.svg",
  colorPrimario: "#2563EB",
  colorSecundario: "#F59E0B",
  whatsapp: "+584120000000",
  dominioInterno: "nodo26.local",
  timezone: "America/Caracas",
} as const;

export type BrandConfig = typeof brand;
