import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Iniciar Sesión — Control de Producción",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex flex-col justify-center items-center p-4 sm:p-8 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-md my-auto">
        <LoginForm />
      </div>

      <footer className="mt-8 text-center text-xs text-muted-foreground/80">
        <p>Sistema Interno de Gestión de Producción • Nodo 26</p>
      </footer>
    </main>
  );
}
