import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Bell, CalendarPlus, CalendarDays, ClipboardList, Info, LogOut, User, Video, XCircle, ListOrdered, FileText } from "lucide-react";
import { SiteHeader, StatusBadge } from "@/components/app/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { actions, fmt, prettyDate, useStore, type Patient, type State } from "@/lib/store";

export const Route = createFileRoute("/paciente")({
  head: () => ({
    meta: [
      { title: "Portal del paciente · Conecta Salud" },
      { name: "description", content: "Consulte sus citas, lista de espera, datos personales y telemedicina." },
      { property: "og:title", content: "Portal del paciente · Conecta Salud" },
      { property: "og:description", content: "Gestione sus horas de Traumatología en línea." },
    ],
  }),
  component: PatientPage,
});

const prioOrder = { Alta: 0, Media: 1, Baja: 2 };
export function waitlist(s: State) {
  return s.patients.filter((p) => p.waitStatus === "En espera")
    .sort((a, b) => prioOrder[a.priority] - prioOrder[b.priority] || a.waitlistSince.localeCompare(b.waitlistSince));
}

function PatientPage() {
  const sessionId = useStore((s) => s.sessionPatientId);
  const patients = useStore((s) => s.patients);
  const patient = patients.find((p) => p.id === sessionId);
  return (
    <div className="min-h-screen">
      <SiteHeader />
      {patient ? <Dashboard patient={patient} /> : <Login patients={patients} />}
    </div>
  );
}

function Login({ patients }: { patients: Patient[] }) {
  const [id, setId] = useState("p1");
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border bg-card p-8 shadow-soft">
        <User className="size-10 rounded-xl bg-secondary p-2 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Ingreso de pacientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">Seleccione una cuenta de demostración. Ningún dato corresponde a personas reales.</p>
        <div className="mt-6 space-y-2">
          <Label>Cuenta demo</Label>
          <Select value={id} onValueChange={setId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} · {p.rut} ({p.waitStatus})</SelectItem>)}
            </SelectContent>
          </Select>
          <Label className="pt-2">Clave Única (simulada)</Label>
          <Input type="password" defaultValue="demo1234" />
        </div>
        <Button className="mt-6 w-full" size="lg" onClick={() => { actions.loginPatient(id); toast.success("Sesión iniciada"); }}>Ingresar</Button>
      </div>
    </div>
  );
}

function Dashboard({ patient }: { patient: Patient }) {
  const s = useStore((x) => x);
  const today = fmt(new Date());
  const doc = (id: string) => s.doctors.find((d) => d.id === id)!;
  const myAppts = s.slots.filter((x) => x.patientId === patient.id && x.date >= today && (x.status === "reservada" || x.status === "afectada"))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const notes = s.notifications.filter((n) => n.patientId === patient.id);
  const wl = waitlist(s);
  const pos = wl.findIndex((p) => p.id === patient.id) + 1;
  const myTele = s.tele.filter((t) => t.patientId === patient.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-hero p-6 text-primary-foreground">
        <div>
          <p className="text-sm text-primary-foreground/80">Bienvenido/a</p>
          <h1 className="text-2xl font-bold md:text-3xl">{patient.name}</h1>
          <p className="text-sm text-primary-foreground/80">RUT {patient.rut} · {patient.diagnosis}</p>
        </div>
        <Button variant="secondary" onClick={() => actions.loginPatient(null)}><LogOut /> Cerrar sesión</Button>
      </div>

      <Tabs defaultValue="inicio" className="mt-6">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="inicio"><CalendarDays /> Mis citas</TabsTrigger>
          <TabsTrigger value="espera"><ListOrdered /> Lista de espera</TabsTrigger>
          <TabsTrigger value="avisos"><Bell /> Avisos ({notes.length})</TabsTrigger>
          <TabsTrigger value="datos"><User /> Mis datos</TabsTrigger>
          <TabsTrigger value="info"><Info /> Información</TabsTrigger>
        </TabsList>

        <TabsContent value="inicio" className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <h2 className="text-xl font-bold">Próximas citas</h2>
            {myAppts.length === 0 && <Empty text="No tiene citas próximas asignadas. Si necesita información, comuníquese con el hospital." />}
            {myAppts.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-secondary px-3 py-2 text-center">
                    <div className="text-xs capitalize text-muted-foreground">{prettyDate(a.date)}</div>
                    <div className="font-display text-lg font-bold text-primary">{a.time}</div>
                  </div>
                  <div>
                    <div className="font-semibold">{doc(a.doctorId).name}</div>
                    <div className="text-sm text-muted-foreground">Traumatología · {doc(a.doctorId).area} · {a.modality}</div>
                    {a.status === "afectada" && <div className="mt-1 text-xs font-medium text-destructive">El profesional estará ausente. El hospital le reprogramará pronto.</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-bold">Últimos avisos</h2>
            {notes.slice(0, 4).map((n) => <NoteCard key={n.id} text={n.text} date={n.date} />)}
          </div>
        </TabsContent>

        

        <TabsContent value="espera" className="mt-6">
          <div className="max-w-2xl rounded-3xl border bg-card p-8 shadow-soft">
            <h2 className="text-xl font-bold">Estado en lista de espera</h2>
            <div className="mt-4 flex items-center gap-3"><span className="text-sm text-muted-foreground">Estado:</span><StatusBadge status={patient.waitStatus} /><span className="text-sm text-muted-foreground">Prioridad clínica:</span><StatusBadge status={patient.priority} /></div>
            {pos > 0 ? (
              <>
                <div className="mt-6 font-display text-6xl font-extrabold text-primary">#{pos}</div>
                <p className="text-muted-foreground">de {wl.length} pacientes en espera para Traumatología</p>
                <Progress className="mt-4" value={100 - (pos / wl.length) * 100} />
              </>
            ) : <p className="mt-6 text-muted-foreground">Usted ya tiene una hora asignada o no está en lista de espera activa.</p>}
            <p className="mt-6 text-sm text-muted-foreground">En lista desde el {new Date(patient.waitlistSince + "T12:00").toLocaleDateString("es-CL")}. La posición depende de la prioridad clínica y la fecha de ingreso; cuando se libera un cupo por cancelación se asigna al siguiente paciente.</p>
          </div>
        </TabsContent>

        

        <TabsContent value="avisos" className="mt-6 max-w-2xl space-y-3">
          {notes.map((n) => <NoteCard key={n.id} text={n.text} date={n.date} />)}
        </TabsContent>

        <TabsContent value="datos" className="mt-6"><ProfileForm patient={patient} /></TabsContent>

        <TabsContent value="info" className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            { icon: FileText, t: "Requisitos para su atención", items: ["Cédula de identidad vigente", "Interconsulta o derivación", "Exámenes e imágenes previas", "Listado de medicamentos"] },
            { icon: ClipboardList, t: "Antes de su cita", items: ["Llegue 20 minutos antes", "Use ropa cómoda", "Si no puede asistir, cancele con 48 h", "Venga acompañado si tiene movilidad reducida"] },
            { icon: Info, t: "Hospital San Pablo", items: ["CAE Traumatología, 2° piso (referencial)", "Lunes a viernes 08:00–17:00", "OIRS para reclamos y sugerencias", "Teléfono ficticio +56 51 000 0000"] },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border bg-card p-6 shadow-soft">
              <c.icon className="size-6 text-primary" /><h3 className="mt-3 font-semibold">{c.t}</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">{c.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Book({ patient }: { patient: Patient }) {
  const s = useStore((x) => x);
  const [docId, setDocId] = useState("todos");
  const [modality, setModality] = useState("presencial");
  const today = fmt(new Date());
  const free = useMemo(() => s.slots.filter((x) => x.status === "disponible" && x.date > today && x.modality === modality && (docId === "todos" || x.doctorId === docId))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 24), [s.slots, docId, modality, today]);
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Select value={docId} onValueChange={setDocId}>
          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los traumatólogos</SelectItem>
            {s.doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} · {d.area}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={modality} onValueChange={setModality}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="presencial">Presencial</SelectItem><SelectItem value="telemedicina">Telemedicina (control)</SelectItem></SelectContent>
        </Select>
      </div>
      {modality === "telemedicina" && <p className="mt-3 text-sm text-muted-foreground">Las horas de telemedicina se reservan solo para controles y quedan sujetas a la evaluación del profesional.</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {free.map((x) => {
          const d = s.doctors.find((dd) => dd.id === x.doctorId)!;
          return (
            <button key={x.id} onClick={() => { actions.book(x.id, patient.id); toast.success(`Cita agendada para el ${prettyDate(x.date)} a las ${x.time}`); }}
              className="rounded-2xl border bg-card p-4 text-left shadow-soft transition hover:border-primary hover:bg-secondary">
              <div className="text-sm capitalize text-muted-foreground">{prettyDate(x.date)}</div>
              <div className="font-display text-xl font-bold text-primary">{x.time}</div>
              <div className="mt-1 text-sm font-medium">{d.name}</div>
              <div className="text-xs text-muted-foreground">{d.area}</div>
            </button>
          );
        })}
        {free.length === 0 && <Empty text="No hay cupos con esos filtros." />}
      </div>
    </div>
  );
}

function TeleRequestForm({ patientId }: { patientId: string }) {
  const [reason, setReason] = useState("");
  return (
    <div className="rounded-3xl border bg-card p-6 shadow-soft">
      <Video className="size-8 text-success" />
      <h2 className="mt-3 text-xl font-bold">Solicitar control por telemedicina</h2>
      <p className="mt-1 text-sm text-muted-foreground">Su traumatólogo evaluará si el control puede realizarse a distancia. Si requiere examen físico, se mantendrá presencial.</p>
      <Textarea className="mt-4" placeholder="Ej: control de evolución tras kinesiología" value={reason} onChange={(e) => setReason(e.target.value)} />
      <Button className="mt-4" disabled={!reason.trim()} onClick={() => { actions.requestTele(patientId, reason.trim()); setReason(""); toast.success("Solicitud enviada para evaluación médica"); }}>Enviar solicitud</Button>
    </div>
  );
}

function ProfileForm({ patient }: { patient: Patient }) {
  const [f, setF] = useState({
  phone: patient.phone,
  email: patient.email,
  address: patient.address,
  commune: patient.commune,
  });
  return (
    <form className="max-w-xl space-y-4 rounded-3xl border bg-card p-6 shadow-soft"
      onSubmit={(e) => { e.preventDefault(); actions.updatePatient(patient.id, f); toast.success("Datos actualizados. El equipo del hospital ya ve su información nueva."); }}>
      <h2 className="text-xl font-bold">Datos personales y de contacto</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Nombre</Label><Input value={patient.name} disabled /></div>
        <div><Label>RUT</Label><Input value={patient.rut} disabled /></div>
      </div>
      <div><Label>Teléfono</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
      <div><Label>Correo</Label><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
      <div><Label>Dirección</Label><Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
      <div><Label>Comuna de residencia</Label><Input value={f.commune} onChange={(e) => setF({ ...f, commune: e.target.value })} placeholder="Ej. Coquimbo" /></div>
      <Button type="submit">Guardar cambios</Button>
    </form>
  );
}

function NoteCard({ text, date }: { text: string; date: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border bg-card p-4">
      <Bell className="mt-0.5 size-5 shrink-0 text-success" />
      <div><p className="text-sm">{text}</p><p className="mt-1 text-xs capitalize text-muted-foreground">{prettyDate(date)}</p></div>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{text}</div>;
}
