import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarCheck, Bell, Video, Users, Stethoscope, Clock, MapPin, Phone, Mail, ShieldCheck, ArrowRight, Bone, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SiteHeader, Logo } from "@/components/app/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Conecta Salud · CAE Traumatología Hospital San Pablo de Coquimbo" },
      { name: "description", content: "Plataforma demostrativa para gestionar citas, listas de espera y telemedicina en el CAE de Traumatología." },
      { property: "og:title", content: "Conecta Salud · CAE Traumatología" },
      { property: "og:description", content: "Menos horas perdidas, mejor comunicación y listas de espera más cortas." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: CalendarCheck, t: "Agenda en línea", d: "Agende, confirme o cancele su hora sin filas ni llamadas." },
  { icon: Bell, t: "Recordatorios", d: "Avisos automáticos que reducen las inasistencias." },
  { icon: ListOrdered, t: "Lista de espera visible", d: "Conozca su posición y estado en todo momento." },
  { icon: Video, t: "Telemedicina", d: "Controles remotos cuando el profesional lo considere adecuado." },
];

const faqs: [string, string][] = [
  ["¿Cómo obtengo una hora en Traumatología?", "Debe ser derivado desde su CESFAM mediante interconsulta. Una vez ingresado a la lista de espera, podrá ver su estado en el portal del paciente."],
  ["¿Qué pasa si no puedo asistir a mi cita?", "Cancélela desde el portal con la mayor anticipación posible. El cupo se libera inmediatamente y se reasigna a otro paciente en espera."],
  ["¿Todos los controles pueden ser por telemedicina?", "No. Usted puede solicitarlo, pero la asignación queda sujeta a la evaluación del traumatólogo tratante."],
  ["¿Qué documentos debo llevar?", "Cédula de identidad, interconsulta o derivación, exámenes e imágenes previas y listado de medicamentos."],
  ["¿Mis datos están protegidos?", "Esta es una maqueta académica con datos ficticios. Una implementación real debe cumplir la Ley 19.628 y la Ley 20.584 de derechos del paciente."],
];

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
              <Bone className="size-3.5" /> CAE de Traumatología · Hospital San Pablo de Coquimbo
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl">
              Su atención en traumatología, más cerca y sin esperas innecesarias.
            </h1>
            <p className="mt-4 max-w-lg text-primary-foreground/85">
              Conecta Salud conecta pacientes y equipos clínicos para aprovechar cada hora médica, mejorar la comunicación y reducir las listas de espera.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary"><Link to="/paciente"><Users /> Soy paciente</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/funcionarios"><Stethoscope /> Soy funcionario</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 self-center">
            {[["32%", "menos inasistencias proyectadas"], ["+120", "horas recuperadas al mes"], ["24/7", "acceso a su información"], ["4", "especialistas conectados"]].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-primary-foreground/10 p-5 backdrop-blur">
                <div className="font-display text-3xl font-bold">{n}</div>
                <div className="mt-1 text-sm text-primary-foreground/80">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl font-bold">¿Qué puede hacer en Conecta Salud?</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.t} className="rounded-2xl border bg-card p-6 shadow-soft">
              <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground"><f.icon className="size-5" /></span>
              <h3 className="mt-4 font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-16 md:grid-cols-2">
        <Link to="/paciente" className="group rounded-3xl border bg-card p-8 shadow-soft transition hover:border-primary">
          <Users className="size-8 text-primary" />
          <h3 className="mt-4 text-2xl font-bold">Acceso pacientes</h3>
          <p className="mt-2 text-muted-foreground">Revise sus citas, su lugar en la lista de espera, actualice sus datos y solicite telemedicina.</p>
          <span className="mt-5 inline-flex items-center gap-1 font-medium text-primary">Ingresar <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
        </Link>
        <Link to="/funcionarios" className="group rounded-3xl border bg-card p-8 shadow-soft transition hover:border-success">
          <Stethoscope className="size-8 text-success" />
          <h3 className="mt-4 text-2xl font-bold">Acceso funcionarios</h3>
          <p className="mt-2 text-muted-foreground">Dashboard, agenda de traumatólogos, ausencias, reasignación de cupos y estadísticas.</p>
          <span className="mt-5 inline-flex items-center gap-1 font-medium text-success">Ingresar <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
        </Link>
      </section>

      <section className="bg-secondary/60">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">CAE de Traumatología</h2>
            <p className="mt-3 text-muted-foreground">
              El Centro de Atención de Especialidades atiende patologías de rodilla, columna, hombro, codo, cadera y pie derivadas desde la red de atención primaria de la provincia de Elqui.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-3"><Clock className="size-5 text-primary" /> Lunes a viernes, 08:00 a 17:00 hrs.</li>
              <li className="flex gap-3"><MapPin className="size-5 text-primary" /> Av. Videla s/n, Coquimbo (dirección referencial)</li>
              <li className="flex gap-3"><Phone className="size-5 text-primary" /> +56 51 000 0000 (número ficticio)</li>
              <li className="flex gap-3"><Mail className="size-5 text-primary" /> contacto@conectasalud-demo.cl</li>
              <li className="flex gap-3"><ShieldCheck className="size-5 text-primary" /> Llegue 20 minutos antes con su cédula de identidad.</li>
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-bold">Preguntas frecuentes</h2>
            <Accordion type="single" collapsible className="mt-4 rounded-2xl border bg-card px-5">
              {faqs.map(([q, a]) => (
                <AccordionItem key={q} value={q}>
                  <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground md:flex-row">
          <Logo />
          <p>Proyecto académico de transformación digital · Datos ficticios con fines demostrativos.</p>
        </div>
      </footer>
    </div>
  );
}
