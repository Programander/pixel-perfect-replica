import { useState } from "react";
import { toast } from "sonner";
import { Video, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "./SiteHeader";
import { actions, fmt, prettyDate, useStore } from "@/lib/store";

export function TeleBoard({ canDecide }: { canDecide: boolean }) {
  const s = useStore((x) => x);
  const today = fmt(new Date());
  const name = (id?: string) => s.patients.find((p) => p.id === id)?.name ?? "—";
  const doc = (id: string) => s.doctors.find((d) => d.id === id)!.name;
  const scheduled = s.slots.filter((x) => x.modality === "telemedicina" && x.status === "reservada" && x.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const free = s.slots.filter((x) => x.modality === "telemedicina" && x.status === "disponible" && x.date > today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="space-y-3 lg:col-span-1">
        <h3 className="text-lg font-bold">Solicitudes</h3>
        <p className="text-xs text-muted-foreground">La asignación queda sujeta a la evaluación del profesional médico.</p>
        {s.tele.map((t) => <Request key={t.id} id={t.id} canDecide={canDecide} freeIds={free.slice(0, 12).map((f) => ({ id: f.id, label: `${prettyDate(f.date)} ${f.time} · ${doc(f.doctorId)}` }))} />)}
      </section>
      <section className="space-y-3">
        <h3 className="text-lg font-bold">Controles programados ({scheduled.length})</h3>
        {scheduled.slice(0, 12).map((x) => (
          <div key={x.id} className="flex items-center gap-3 rounded-2xl border bg-card p-3">
            <Video className="size-5 text-primary" />
            <div className="text-sm"><div className="font-medium">{name(x.patientId)}</div><div className="capitalize text-muted-foreground">{prettyDate(x.date)} {x.time} · {doc(x.doctorId)}</div></div>
          </div>
        ))}
      </section>
      <section className="space-y-3">
        <h3 className="text-lg font-bold">Disponibilidad remota ({free.length})</h3>
        <div className="grid grid-cols-2 gap-2">
          {free.slice(0, 16).map((x) => (
            <div key={x.id} className="rounded-xl bg-accent p-3 text-sm text-accent-foreground">
              <div className="font-semibold capitalize">{prettyDate(x.date)} · {x.time}</div><div className="text-xs">{doc(x.doctorId)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Request({ id, canDecide, freeIds }: { id: string; canDecide: boolean; freeIds: { id: string; label: string }[] }) {
  const t = useStore((s) => s.tele.find((x) => x.id === id)!);
  const p = useStore((s) => s.patients.find((x) => x.id === t.patientId));
  const [slot, setSlot] = useState("");
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2"><div><div className="font-semibold">{p?.name}</div><div className="text-sm text-muted-foreground">{t.reason}</div></div><StatusBadge status={t.status} /></div>
      {canDecide && t.status === "Pendiente de evaluación" && (
        <div className="mt-3 space-y-2">
          <Select value={slot} onValueChange={setSlot}>
            <SelectTrigger><SelectValue placeholder="Elegir hora remota" /></SelectTrigger>
            <SelectContent>{freeIds.map((f) => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button size="sm" disabled={!slot} onClick={() => { actions.decideTele(id, true, slot); toast.success("Telemedicina aprobada y agendada"); }}><CheckCircle2 /> Aprobar</Button>
            <Button size="sm" variant="outline" onClick={() => { actions.decideTele(id, false, undefined, "Se mantiene control presencial."); toast("Se mantiene atención presencial"); }}><XCircle /> Requiere presencial</Button>
          </div>
        </div>
      )}
    </div>
  );
}
