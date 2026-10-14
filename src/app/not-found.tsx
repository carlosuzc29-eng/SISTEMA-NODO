import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-foreground">
        Página no encontrada
      </h2>
      <p className="text-muted-foreground mt-2 max-w-sm">
        La ruta a la que intentas acceder no existe o no tienes permisos para verla.
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}
