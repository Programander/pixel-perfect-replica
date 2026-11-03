import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/app/SiteHeader";
import { TeleBoard } from "@/components/app/TeleBoard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/telemedicina")({
  head: () => ({
    meta: [
      { title: "Telemedicina · Conecta Salud" },
      { name: "description", content: "Controles remotos programados, solicitudes y disponibilidad del CAE de Traumatología." },
      { property: "og:title", content: "Telemedicina · Conecta Salud" },
      { property: "og:description", content: "Controles de traumatología a distancia, evaluados por el profesional." },
    ],
  }),
  component: Tele,
});

function Tele() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Módulo de telemedicina</h1>
            <p className="mt-1 max-w-2xl text-muted-foreground">Vista general de controles remotos. Los pacientes solicitan desde su portal y el traumatólogo decide si corresponde atención a distancia.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/paciente">Solicitar como paciente</Link></Button>
            <Button asChild><Link to="/funcionarios">Evaluar como funcionario</Link></Button>
          </div>
        </div>
        <div className="mt-8"><TeleBoard canDecide={false} /></div>
      </div>
    </div>
  );
}
