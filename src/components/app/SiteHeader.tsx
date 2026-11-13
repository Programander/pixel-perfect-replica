import { Link } from "@tanstack/react-router";
import { HeartPulse, Menu, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { SlotStatus } from "@/lib/store";


export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3">
      {/* Identidad de Conecta Salud */}
      <span className="flex shrink-0 items-center gap-2">
        <span className="grid size-9 place-items-center rounded-xl bg-hero text-primary-foreground shadow-soft">
          <HeartPulse className="size-5" />
        </span>
        <span className="font-display text-lg font-bold text-primary-deep">
          Conecta <span className="text-success">Salud</span>
        </span>
      </span>

      {/* Separador */}
      <span className="h-9 w-px bg-border" />

      {/* Identidad académica UCN */}
      <span className="flex items-center gap-2">
        <img
          src="/ucn-isologo.png"
          alt="Universidad Católica del Norte"
          className="h-8 w-auto max-w-[110px] object-contain"
        />
        <span className="hidden text-[10px] leading-tight text-muted-foreground sm:block">
          Proyecto<br />académico
        </span>
      </span>
    </Link>
  );
}


const links = [
  { to: "/", label: "Inicio" },
  { to: "/paciente", label: "Portal paciente" },
  { to: "/funcionarios", label: "Funcionarios" },
] as const;
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
      <div className="bg-primary-deep py-1 text-center text-xs text-primary-foreground">
        Maqueta académica · Datos 100% ficticios · No conectada a sistemas del hospital
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: true }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-primary"
              activeProps={{ className: "bg-secondary text-primary" }}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menú">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="grid gap-1 border-t px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium">
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function StatusBadge({ status }: { status: SlotStatus | string }) {
  const map: Record<string, string> = {
    disponible: "bg-accent text-accent-foreground",
    reservada: "bg-secondary text-secondary-foreground",
    afectada: "bg-destructive/15 text-destructive",
    bloqueada: "bg-muted text-muted-foreground",
    "Pendiente de evaluación": "bg-warning/25 text-warning-foreground",
    Aprobada: "bg-accent text-accent-foreground",
    Rechazada: "bg-muted text-muted-foreground",
    Alta: "bg-destructive/15 text-destructive",
    Media: "bg-warning/25 text-warning-foreground",
    Baja: "bg-accent text-accent-foreground",
  };
  return <Badge variant="outline" className={`border-0 capitalize ${map[status] ?? ""}`}>{status}</Badge>;
}

export function StatCard({ icon: Icon, label, value, hint, tone = "primary" }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode; hint?: string;
  tone?: "primary" | "success" | "warning" | "destructive";
}) {
  const tones = { primary: "bg-secondary text-primary", success: "bg-accent text-accent-foreground", warning: "bg-warning/25 text-warning-foreground", destructive: "bg-destructive/15 text-destructive" };
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}><Icon className="size-5" /></span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="mt-3 font-display text-3xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
