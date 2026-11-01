import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Iniciar Sesión — Control de Producción",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-8 bg-background overflow-hidden">
      {/* Trama de semitono (Halftone) de imprenta auténtica */}
      <div className="absolute inset-0 halftone-pattern opacity-60 pointer-events-none" />

      {/* Marcas de registro en esquinas */}
      <div className="absolute top-6 left-6 text-muted-foreground/40 font-mono text-[11px] select-none pointer-events-none hidden sm:block">
        ┌ NODO 26 // REGISTRO 0.1mm CMYK
      </div>
      <div className="absolute top-6 right-6 text-muted-foreground/40 font-mono text-[11px] select-none pointer-events-none hidden sm:block">
        PRENSA: ISO-12647-2 ┐
      </div>

      <div className="relative z-10 w-full max-w-md my-auto">
        <LoginForm />
      </div>

      <footer className="relative z-10 mt-8 flex flex-col items-center gap-2.5 text-center text-xs text-muted-foreground">
        {/* Barra de calibración CMYK de proceso */}
        <div className="flex items-center gap-1.5 opacity-80">
          <div className="h-2 w-3 rounded-xs bg-[var(--ink-cyan)]" title="Cyan" />
          <div className="h-2 w-3 rounded-xs bg-[var(--ink-magenta)]" title="Magenta" />
          <div className="h-2 w-3 rounded-xs bg-[var(--ink-yellow)]" title="Yellow" />
          <div className="h-2 w-3 rounded-xs bg-[var(--ink-key)]" title="Key" />
          <span className="text-[11px] font-mono tracking-widest text-muted-foreground ml-1">
            CMYK CALIBRATED
          </span>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground">
          NODO 26 • Control de Piso de Imprenta & Empaques
        </p>
      </footer>
    </main>
  );
}
