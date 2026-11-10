import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Activity, AlertTriangle, CalendarDays, CalendarX, ClipboardList, LayoutDashboard, ListOrdered, LogOut, RefreshCcw, RotateCcw, Stethoscope, Users, Video, UserX, CheckCircle2, BarChart3 } from "lucide-react";
import { SiteHeader, StatCard, StatusBadge } from "@/components/app/SiteHeader";
import { TeleBoard } from "@/components/app/TeleBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { actions, addDays, fmt, prettyDate, useStore, type Patient, type Slot } from "@/lib/store";
import { waitlist } from "./paciente";

export const Route = createFileRoute("/funcionarios")({
  head: () => ({
    meta: [
      { title: "Panel de funcionarios · Conecta Salud" },
      { name: "description", content: "Dashboard, agenda de traumatólogos, ausencias, reasignación de cupos y estadísticas." },
      { property: "og:title", content: "Panel de funcionarios · Conecta Salud" },
      { property: "og:description", content: "Gestión del CAE de Traumatología con datos ficticios." },
    ],
  }),
  component: StaffPage,
});

function StaffPage() {
  const logged = useStore((s) => s.sessionStaff);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      {logged ? <Panel /> : (
        <div className="mx-auto max-w-md px-4 py-16">
          <div className="rounded-3xl border bg-card p-8 shadow-soft">
            <Stethoscope className="size-10 rounded-xl bg-accent p-2 text-accent-foreground" />
            <h1 className="mt-4 text-2xl font-bold">Acceso funcionarios</h1>
            <p className="mt-1 text-sm text-muted-foreground">Cuenta demo: gestora del CAE de Traumatología.</p>
            <div className="mt-6 space-y-3">
              <div><Label>Usuario</Label><Input defaultValue="gestion.cae@demo.cl" /></div>
              <div><Label>Contraseña</Label><Input type="password" defaultValue="demo1234" /></div>
            </div>
            <Button className="mt-6 w-full" size="lg" onClick={() => actions.loginStaff(true)}>Ingresar al panel</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Panel() {
  const [tab, setTab] = useState("dashboard");
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-bold">Panel CAE Traumatología</h1><p className="text-muted-foreground">Hospital San Pablo de Coquimbo · datos de demostración</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { actions.reset(); toast("Datos de demostración restablecidos"); }}><RotateCcw /> Restablecer demo</Button>
          <Button variant="ghost" onClick={() => actions.loginStaff(false)}><LogOut /> Salir</Button>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="dashboard"><LayoutDashboard /> Dashboard</TabsTrigger>
          <TabsTrigger value="pacientes"><Users /> Pacientes</TabsTrigger>
          <TabsTrigger value="espera"><ListOrdered /> Lista de espera</TabsTrigger>
          <TabsTrigger value="citas"><ClipboardList /> Citas</TabsTrigger>
          <TabsTrigger value="calendario"><CalendarDays /> Calendario</TabsTrigger>
          <TabsTrigger value="ausencias"><CalendarX /> Ausencias</TabsTrigger>
          <TabsTrigger value="tele"><Video /> Telemedicina</TabsTrigger>
          <TabsTrigger value="stats"><BarChart3 /> Estadísticas</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6"><Dashboard go={setTab} /></TabsContent>
        <TabsContent value="pacientes" className="mt-6"><Patients /></TabsContent>
        <TabsContent value="espera" className="mt-6"><Waitlist /></TabsContent>
        <TabsContent value="citas" className="mt-6"><Appointments /></TabsContent>
        <TabsContent value="calendario" className="mt-6"><Calendar /></TabsContent>
        <TabsContent value="ausencias" className="mt-6"><Absences /></TabsContent>
        <TabsContent value="tele" className="mt-6"><TeleBoard canDecide /></TabsContent>
        <TabsContent value="stats" className="mt-6"><Stats /></TabsContent>
      </Tabs>
    </div>
  );
}

function useDerived() {
  const s = useStore((x) => x);
  const today = fmt(new Date());
  const future = s.slots.filter((x) => x.date >= today);
  const past = s.slots.filter((x) => x.date < today && x.attended);
  const noShows = past.filter((x) => x.attended === "no asistió").length;
  return {
    s, today, future,
    free: future.filter((x) => x.status === "disponible" && x.date > today),
    booked: future.filter((x) => x.status === "reservada"),
    affected: future.filter((x) => x.status === "afectada"),
    wl: waitlist(s), past, noShows,
    noShowRate: past.length ? Math.round((noShows / past.length) * 100) : 0,
    doc: (id: string) => s.doctors.find((d) => d.id === id)!,
    pname: (id?: string) => s.patients.find((p) => p.id === id)?.name ?? "—",
  };
}

function Dashboard({ go }: { go: (t: string) => void }) {
  const d = useDerived();
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ListOrdered} label="Pacientes en espera" value={d.wl.length} hint={`${d.wl.filter((p) => p.priority === "Alta").length} con prioridad alta`} />
        <StatCard icon={CheckCircle2} label="Cupos disponibles" value={d.free.length} hint="Próximas 2 semanas" tone="success" />
        <StatCard icon={AlertTriangle} label="Horas afectadas" value={d.affected.length} hint="Por ausencias médicas" tone="destructive" />
        <StatCard icon={RefreshCcw} label="Horas recuperadas" value={d.s.stats.recovered} hint="Reasignadas tras cancelación o ausencia" tone="warning" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h3 className="font-bold">Alertas</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {d.affected.length > 0 && <li className="flex items-center justify-between rounded-xl bg-destructive/10 p-3"><span>{d.affected.length} pacientes deben ser reprogramados</span><Button size="sm" variant="outline" onClick={() => go("ausencias")}>Ver</Button></li>}
            {d.free.length > 0 && <li className="flex items-center justify-between rounded-xl bg-accent p-3"><span>{d.free.length} cupos libres pueden asignarse a la lista de espera</span><Button size="sm" variant="outline" onClick={() => go("espera")}>Asignar</Button></li>}
            {d.s.tele.filter((t) => t.status === "Pendiente de evaluación").length > 0 && <li className="flex items-center justify-between rounded-xl bg-warning/20 p-3"><span>{d.s.tele.filter((t) => t.status === "Pendiente de evaluación").length} solicitudes de telemedicina por evaluar</span><Button size="sm" variant="outline" onClick={() => go("tele")}>Evaluar</Button></li>}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h3 className="font-bold">Ocupación por traumatólogo</h3>
          <div className="mt-4 space-y-3">
            {d.s.doctors.map((doc) => {
              const all = d.future.filter((x) => x.doctorId === doc.id);
              const b = all.filter((x) => x.status === "reservada").length;
              const pct = all.length ? Math.round((b / all.length) * 100) : 0;
              return (
                <div key={doc.id}>
                  <div className="flex justify-between text-sm"><span>{doc.name} <span className="text-muted-foreground">· {doc.area}</span></span><span className="font-medium">{pct}%</span></div>
                  <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Patients() {
  const s = useStore((x) => x);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Patient | null>(null);
  const list = s.patients.filter((p) => (p.name + p.rut).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <Input placeholder="Buscar por nombre o RUT" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Paciente</TableHead><TableHead>RUT</TableHead><TableHead>Teléfono</TableHead><TableHead>Diagnóstico</TableHead><TableHead>Prioridad</TableHead><TableHead>Estado</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {list.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}<div className="text-xs text-muted-foreground">{p.email}</div></TableCell>
                <TableCell>{p.rut}</TableCell><TableCell>{p.phone}</TableCell><TableCell>{p.diagnosis}</TableCell>
                <TableCell><StatusBadge status={p.priority} /></TableCell><TableCell>{p.waitStatus}</TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => setEdit(p)}>Editar</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar paciente</DialogTitle></DialogHeader>
          {edit && (
            <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); actions.updatePatient(edit.id, edit); setEdit(null); toast.success("Paciente actualizado"); }}>
              <div><Label>Teléfono</Label><Input value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></div>
              <div><Label>Correo</Label><Input value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></div>
              <div><Label>Prioridad</Label>
                <Select value={edit.priority} onValueChange={(v) => setEdit({ ...edit, priority: v as Patient["priority"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Alta", "Media", "Baja"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Estado</Label>
                <Select value={edit.waitStatus} onValueChange={(v) => setEdit({ ...edit, waitStatus: v as Patient["waitStatus"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["En espera", "Citado", "Atendido", "Egresado"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button type="submit">Guardar</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SlotPicker({ slots, onPick, placeholder }: { slots: Slot[]; onPick: (id: string) => void; placeholder: string }) {
  const d = useDerived();
  return (
    <Select value="" onValueChange={onPick}>
      <SelectTrigger className="w-64"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {slots.slice(0, 30).map((x) => <SelectItem key={x.id} value={x.id}>{prettyDate(x.date)} {x.time} · {d.doc(x.doctorId).name} ({x.modality})</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

const sortSlots = (a: Slot, b: Slot) => (a.date + a.time).localeCompare(b.date + b.time);

function Waitlist() {
  const d = useDerived();
  const free = [...d.free].filter((x) => x.modality === "presencial").sort(sortSlots);
  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <Table>
        <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Paciente</TableHead><TableHead>Diagnóstico</TableHead><TableHead>Prioridad</TableHead><TableHead>Días en espera</TableHead><TableHead>Asignar cupo liberado</TableHead></TableRow></TableHeader>
        <TableBody>
          {d.wl.map((p, i) => (
            <TableRow key={p.id}>
              <TableCell className="font-display font-bold text-primary">{i + 1}</TableCell>
              <TableCell className="font-medium">{p.name}<div className="text-xs text-muted-foreground">{p.phone}</div></TableCell>
              <TableCell>{p.diagnosis}</TableCell><TableCell><StatusBadge status={p.priority} /></TableCell>
              <TableCell>{Math.round((Date.now() - new Date(p.waitlistSince).getTime()) / 86400000)}</TableCell>
              <TableCell><SlotPicker slots={free} placeholder="Elegir hora" onPick={(id) => { actions.book(id, p.id, true); toast.success(`Cupo asignado a ${p.name}`); }} /></TableCell>
            </TableRow>
          ))}
          {d.wl.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Sin pacientes en espera 🎉</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
}

function Appointments() {
  const d = useDerived();
  const [filter, setFilter] = useState("proximas");
  const rows = (filter === "proximas" ? d.future.filter((x) => x.status === "reservada" || x.status === "afectada") : d.s.slots.filter((x) => x.date < d.today && x.patientId)).sort(sortSlots);
  return (
    <div>
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="proximas">Próximas citas</SelectItem><SelectItem value="pasadas">Citas pasadas (asistencia)</SelectItem></SelectContent>
      </Select>
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Paciente</TableHead><TableHead>Traumatólogo</TableHead><TableHead>Modalidad</TableHead><TableHead>Estado</TableHead><TableHead>Acción</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((x) => (
              <TableRow key={x.id}>
                <TableCell className="capitalize">{prettyDate(x.date)} {x.time}</TableCell>
                <TableCell>{d.pname(x.patientId)}{x.reassigned && <span className="ml-2 text-xs text-success">reasignada</span>}</TableCell>
                <TableCell>{d.doc(x.doctorId).name}</TableCell><TableCell className="capitalize">{x.modality}</TableCell>
                <TableCell>{filter === "pasadas" ? (x.attended ?? "sin registro") : <StatusBadge status={x.status} />}</TableCell>
                <TableCell>
                  {filter === "proximas" ? (
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => { actions.cancel(x.id, "funcionario"); toast.success("Cita cancelada; cupo disponible"); }}>Cancelar</Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => actions.markAttendance(x.id, "asistió")}>Asistió</Button>
                      <Button size="sm" variant="outline" onClick={() => actions.markAttendance(x.id, "no asistió")}>No asistió</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Calendar() {
  const d = useDerived();
  const [docId, setDocId] = useState("d1");
  const [sel, setSel] = useState<Slot | null>(null);
  const days = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; out.length < 10; i++) { const x = addDays(new Date(), i); if (x.getDay() % 6 !== 0) out.push(fmt(x)); }
    return out;
  }, []);
  const slots = d.s.slots.filter((x) => x.doctorId === docId);
  const times = [...new Set(slots.map((x) => x.time))].sort();
  const cls: Record<string, string> = {
    disponible: "bg-accent text-accent-foreground hover:ring-2 hover:ring-success",
    reservada: "bg-secondary text-secondary-foreground",
    afectada: "bg-destructive/15 text-destructive",
    bloqueada: "bg-muted text-muted-foreground line-through",
  };
  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <Select value={docId} onValueChange={setDocId}>
          <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
          <SelectContent>{d.s.doctors.map((x) => <SelectItem key={x.id} value={x.id}>{x.name} · {x.area}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 text-xs">{Object.keys(cls).map((k) => <StatusBadge key={k} status={k} />)}</div>
      </div>
      <div className="mt-4 overflow-x-auto rounded-2xl border bg-card p-3">
        <div className="grid min-w-[900px] gap-1" style={{ gridTemplateColumns: `70px repeat(${days.length}, 1fr)` }}>
          <div />
          {days.map((day) => <div key={day} className="p-2 text-center text-xs font-semibold capitalize">{prettyDate(day)}</div>)}
          {times.map((t) => (
            <Row key={t} t={t}>
              {days.map((day) => {
                const x = slots.find((y) => y.date === day && y.time === t);
                if (!x) return <div key={day} />;
                return (
                  <button key={day} onClick={() => setSel(x)} className={`rounded-lg p-1.5 text-left text-[11px] leading-tight transition ${cls[x.status]}`}>
                    <div className="truncate font-medium">{x.patientId ? d.pname(x.patientId).split(" ")[0] : x.status}</div>
                    <div className="opacity-70">{x.modality === "telemedicina" ? "remoto" : "presencial"}</div>
                  </button>
                );
              })}
            </Row>
          ))}
        </div>
      </div>
      <Dialog open={!!sel} onOpenChange={(o) => !o && setSel(null)}>
        <DialogContent>
          {sel && (
            <>
              <DialogHeader><DialogTitle className="capitalize">{prettyDate(sel.date)} · {sel.time}</DialogTitle></DialogHeader>
              <p className="text-sm">{d.doc(sel.doctorId).name} · <StatusBadge status={sel.status} /></p>
              {sel.status === "disponible" && (
                <div className="space-y-2"><Label>Asignar a paciente en lista de espera</Label>
                  <Select value="" onValueChange={(pid) => { actions.book(sel.id, pid, true); toast.success("Hora asignada; calendario actualizado"); setSel(null); }}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
                    <SelectContent>{d.wl.map((p, i) => <SelectItem key={p.id} value={p.id}>#{i + 1} {p.name} ({p.priority})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              {(sel.status === "reservada" || sel.status === "afectada") && (
                <div className="space-y-3">
                  <p className="text-sm">Paciente: <b>{d.pname(sel.patientId)}</b></p>
                  <SlotPicker slots={d.free.filter((x) => x.id !== sel.id).sort(sortSlots)} placeholder="Reprogramar a…" onPick={(id) => { actions.move(sel.id, id); toast.success("Hora reprogramada"); setSel(null); }} />
                  {sel.status === "reservada" && <Button variant="outline" className="text-destructive" onClick={() => { actions.cancel(sel.id, "funcionario"); setSel(null); toast.success("Cupo liberado"); }}>Cancelar cita</Button>}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
function Row({ t, children }: { t: string; children: React.ReactNode }) {
  return <><div className="p-2 text-xs font-semibold text-muted-foreground">{t}</div>{children}</>;
}

function Absences() {
  const d = useDerived();
  const [f, setF] = useState({ doctorId: "d1", from: fmt(addDays(new Date(), 1)), to: fmt(addDays(new Date(), 3)), reason: "Vacaciones" });
  const free = [...d.free].sort(sortSlots);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <form className="space-y-3 rounded-2xl border bg-card p-5 shadow-soft" onSubmit={(e) => {
        e.preventDefault();
        const n = d.future.filter((x) => x.doctorId === f.doctorId && x.date >= f.from && x.date <= f.to && x.status === "reservada").length;
        actions.addAbsence(f.doctorId, f.from, f.to, f.reason);
        toast.warning(`Ausencia registrada: ${n} horas afectadas identificadas`);
      }}>
        <h3 className="font-bold">Registrar vacaciones o ausencia</h3>
        <div><Label>Traumatólogo</Label>
          <Select value={f.doctorId} onValueChange={(v) => setF({ ...f, doctorId: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{d.s.doctors.map((x) => <SelectItem key={x.id} value={x.id}>{x.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Desde</Label><Input type="date" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></div>
          <div><Label>Hasta</Label><Input type="date" value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} /></div>
        </div>
        <div><Label>Motivo</Label>
          <Select value={f.reason} onValueChange={(v) => setF({ ...f, reason: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{["Vacaciones", "Licencia médica", "Capacitación", "Turno de urgencia"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full">Registrar</Button>
        <div className="space-y-2 pt-2">
          {d.s.absences.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl bg-muted p-2 text-sm">
              <span>{d.doc(a.doctorId).name}<br /><span className="text-xs text-muted-foreground">{a.reason} · {prettyDate(a.from)} – {prettyDate(a.to)}</span></span>
              <Button size="sm" variant="ghost" onClick={() => actions.removeAbsence(a.id)}>Quitar</Button>
            </div>
          ))}
        </div>
      </form>
      <div className="lg:col-span-2">
        <h3 className="flex items-center gap-2 font-bold"><UserX className="size-5 text-destructive" /> Horas afectadas ({d.affected.length})</h3>
        <p className="text-sm text-muted-foreground">Reasigne cada paciente a un cupo libre para no perder la atención.</p>
        <div className="mt-3 space-y-2">
          {d.affected.length === 0 && <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">No hay horas afectadas.</div>}
          {[...d.affected].sort(sortSlots).map((x) => (
            <div key={x.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-card p-4">
              <div><div className="font-medium">{d.pname(x.patientId)}</div><div className="text-sm capitalize text-muted-foreground">{prettyDate(x.date)} {x.time} · {d.doc(x.doctorId).name}</div></div>
              <SlotPicker slots={free.filter((y) => y.doctorId !== x.doctorId || !d.s.absences.some((a) => a.doctorId === y.doctorId && y.date >= a.from && y.date <= a.to))} placeholder="Reasignar a…" onPick={(id) => { actions.move(x.id, id); toast.success("Paciente reprogramado y notificado"); }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const cfg = { v: { label: "Inasistencias %", color: "var(--chart-5)" }, r: { label: "Horas recuperadas", color: "var(--chart-2)" } } satisfies ChartConfig;
function Stats() {
  const d = useDerived();
  const months = ["May", "Jun", "Jul", "Ago", "Sep", "Oct"];
  const ns = d.s.stats.noShowsHistoric.map((v, i) => ({ m: months[i], v }));
  const rec = [8, 11, 13, 15, 17, d.s.stats.recovered].map((r, i) => ({ m: months[i], r }));
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={UserX} label="Tasa de inasistencia (semana)" value={`${d.noShowRate}%`} hint={`${d.noShows} de ${d.past.length} citas`} tone="destructive" />
        <StatCard icon={RefreshCcw} label="Horas recuperadas" value={d.s.stats.recovered} tone="success" />
        <StatCard icon={CalendarX} label="Cancelaciones anticipadas" value={d.s.stats.cancellations} hint="Cupos liberados a tiempo" tone="warning" />
        <StatCard icon={Activity} label="Citas próximas" value={d.booked.length} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h3 className="font-bold">Inasistencias mensuales (%)</h3>
          <ChartContainer config={cfg} className="mt-4 h-64 w-full">
            <LineChart data={ns}><CartesianGrid vertical={false} /><XAxis dataKey="m" /><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><Line dataKey="v" stroke="var(--color-v)" strokeWidth={3} /></LineChart>
          </ChartContainer>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-soft">
          <h3 className="font-bold">Horas recuperadas por mes</h3>
          <ChartContainer config={cfg} className="mt-4 h-64 w-full">
            <BarChart data={rec}><CartesianGrid vertical={false} /><XAxis dataKey="m" /><YAxis /><ChartTooltip content={<ChartTooltipContent />} /><Bar dataKey="r" fill="var(--color-r)" radius={8} /></BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
