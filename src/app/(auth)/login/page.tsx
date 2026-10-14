import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Iniciar Sesión — Control de Producción",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-8 bg-background overflow-hidden">
      {/* Trama sutil de marcas de imprenta */}
      <div className="absolute inset-0 print-register-mark opacity-40 pointer-events-none" />

      {/* Marcas de registro en esquinas */}
      <div className="absolute top-6 left-6 text-muted-foreground/30 font-mono text-[10px] select-none pointer-events-none hidden sm:block">
        ┌ NODO 26 // CALIBRATION 0.1mm
      </div>
      <div className="absolute top-6 right-6 text-muted-foreground/30 font-mono text-[10px] select-none pointer-events-none hidden sm:block">
        COLOR: ISO-12647-2 ┐
      </div>

      <div className="relative z-10 w-full max-w-md my-auto">
        <LoginForm />
      </div>

      <footer className="relative z-10 mt-8 flex flex-col items-center gap-3 text-center text-xs text-muted-foreground/80">
        {/* Barra de calibración CMYK mínima (guiño sutil al oficio) */}
        <div className="flex items-center gap-1.5 opacity-60">
          <div className="h-2 w-3 rounded-xs bg-[#00A3E0]" title="Cyan" />
          <div className="h-2 w-3 rounded-xs bg-[#E4007C]" title="Magenta" />
          <div className="h-2 w-3 rounded-xs bg-[#FFDD00]" title="Yellow" />
          <div className="h-2 w-3 rounded-xs bg-[#1A1A1A] dark:bg-[#FFFFFF]" title="Key (Black)" />
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground/60 ml-1">
            CMYK 100%
          </span>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground/70">
          NODO 26 • Control de Producción y Empaques
        </p>
      </footer>
    </main>
  );
}
