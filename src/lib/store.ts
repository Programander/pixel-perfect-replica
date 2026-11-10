import { useSyncExternalStore } from "react";

export type SlotStatus = "disponible" | "reservada" | "afectada" | "bloqueada";
export type Modality = "presencial" | "telemedicina";

export interface Doctor { id: string; name: string; area: string; color: string }
export interface Patient {
  id: string; rut: string; name: string; age: number; phone: string; email: string; address: string;
  diagnosis: string; priority: "Alta" | "Media" | "Baja"; waitlistSince: string;
  waitStatus: "En espera" | "Citado" | "Atendido" | "Egresado";
}
export interface Slot {
  id: string; doctorId: string; date: string; time: string; status: SlotStatus;
  patientId?: string | undefined; modality: Modality; reassigned?: boolean; attended?: "asistió" | "no asistió";
}
export interface Absence { id: string; doctorId: string; from: string; to: string; reason: string }
export interface TeleRequest {
  id: string; patientId: string; reason: string; createdAt: string;
  status: "Pendiente de evaluación" | "Aprobada" | "Rechazada"; slotId?: string | undefined; note?: string | undefined;
}
export interface Notification { id: string; patientId: string; text: string; date: string; kind: "recordatorio" | "aviso" | "telemedicina" }

export interface State {
  doctors: Doctor[]; patients: Patient[]; slots: Slot[]; absences: Absence[];
  tele: TeleRequest[]; notifications: Notification[];
  stats: { recovered: number; cancellations: number; noShowsHistoric: number[] };
  sessionPatientId: string | null; sessionStaff: boolean;
}

export const fmt = (d: Date) => d.toISOString().slice(0, 10);
export const addDays = (base: Date, n: number) => { const d = new Date(base); d.setDate(d.getDate() + n); return d; };
export const prettyDate = (s: string) =>
  new Date(s + "T12:00:00").toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" });

const uid = () => Math.random().toString(36).slice(2, 9);

function seed(): State {
  const today = new Date(); today.setHours(12, 0, 0, 0);
  const doctors: Doctor[] = [
    { id: "d1", name: "Dra. Camila Rojas", area: "Rodilla", color: "chart-1" },
    { id: "d2", name: "Dr. Matías Fuentes", area: "Columna", color: "chart-2" },
    { id: "d3", name: "Dra. Javiera Tapia", area: "Hombro y codo", color: "chart-3" },
    { id: "d4", name: "Dr. Felipe Araya", area: "Cadera y pie", color: "chart-4" },
  ];
  const names = ["María González", "José Muñoz", "Ana Pérez", "Luis Soto", "Carmen Díaz", "Pedro Contreras", "Rosa Silva", "Jorge Vega", "Patricia Castillo", "Manuel Morales", "Elena Herrera", "Ricardo Núñez", "Sofía Pizarro", "Héctor Cortés", "Valentina Ramos", "Andrés Olivares"];
  const dx = ["Gonartrosis", "Lumbago crónico", "Tendinitis manguito rotador", "Coxartrosis", "Esguince tobillo", "Hernia discal", "Fractura consolidada (control)", "Túnel carpiano"];
  const patients: Patient[] = names.map((n, i) => ({
    id: "p" + (i + 1), rut: `${12 + i}.${(345 + i * 7) % 1000}.${(678 + i * 13) % 1000}-${i % 10}`, name: n,
    age: 34 + ((i * 7) % 45), phone: `+56 9 ${8000 + i * 37} ${1000 + i * 91}`,
    email: n.toLowerCase().split(" ")[0]!.normalize("NFD").replace(/[\u0300-\u036f]/g, "") + i + "@correo-demo.cl",
    address: `Av. Ejemplo ${100 + i * 12}, Coquimbo`, diagnosis: dx[i % dx.length]!,
    priority: (["Alta", "Media", "Baja"] as const)[i % 3]!,
    waitlistSince: fmt(addDays(today, -(40 + i * 23))), waitStatus: i < 6 ? "Citado" : "En espera",
  }));
  const times = ["08:30", "09:15", "10:00", "10:45", "11:30", "15:00", "15:45"];
  const slots: Slot[] = [];
  let pi = 0;
  for (let day = 0; day < 14; day++) {
    const d = addDays(today, day);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    for (const doc of doctors) for (const t of times) {
      const r = (day * 7 + t.charCodeAt(1) + doc.id.charCodeAt(1)) % 5;
      const booked = r < 3 && pi < 40;
      slots.push({
        id: uid(), doctorId: doc.id, date: fmt(d), time: t, modality: t >= "15:00" && doc.id !== "d4" ? "telemedicina" : "presencial",
        status: booked ? "reservada" : "disponible", patientId: booked ? patients[pi++ % 6]!.id : undefined,
      });
    }
  }
  // past slots for no-show stats
  for (let day = 1; day <= 5; day++) {
    const d = addDays(today, -day);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    doctors.forEach((doc, k) => slots.push({ id: uid(), doctorId: doc.id, date: fmt(d), time: "09:15", status: "reservada", modality: "presencial", patientId: patients[6 + k]!.id, attended: (day + k) % 4 === 0 ? "no asistió" : "asistió" }));
  }
  return {
    doctors, patients, slots, absences: [],
    tele: [
      { id: uid(), patientId: "p1", reason: "Control post kinesiología", createdAt: fmt(addDays(today, -2)), status: "Pendiente de evaluación" },
      { id: uid(), patientId: "p8", reason: "Revisión de exámenes de imagen", createdAt: fmt(addDays(today, -1)), status: "Pendiente de evaluación" },
    ],
    notifications: [
      { id: uid(), patientId: "p1", text: "Recordatorio: tiene una cita próximamente. Confirme o cancele con anticipación para liberar el cupo.", date: fmt(today), kind: "recordatorio" },
      { id: uid(), patientId: "p1", text: "Traiga su cédula de identidad y exámenes previos a su atención.", date: fmt(addDays(today, -3)), kind: "aviso" },
    ],
    stats: { recovered: 18, cancellations: 9, noShowsHistoric: [22, 19, 17, 14, 12, 9] },
    sessionPatientId: null, sessionStaff: false,
  };
}

const KEY = "conecta-salud-demo-v1";
let state: State = seed();
const listeners = new Set<() => void>();
let loaded = false;

export function loadStore() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) { state = JSON.parse(raw); emit(); } } catch { /* ignore */ }
}
function emit() { listeners.forEach((l) => l()); }
function set(fn: (s: State) => State) {
  state = fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  emit();
}
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const serverState = seed();
export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => sel(state), () => sel(serverState));
}
export const getState = () => state;

const notify = (s: State, patientId: string, text: string, kind: Notification["kind"] = "aviso"): Notification[] =>
  [{ id: uid(), patientId, text, date: fmt(new Date()), kind }, ...s.notifications];

const slotLabel = (s: State, slot: Slot) =>
  `${prettyDate(slot.date)} ${slot.time} con ${s.doctors.find((d) => d.id === slot.doctorId)?.name}`;

export const actions = {
  reset() { loaded = true; set(() => seed()); },
  loginPatient(id: string | null) { set((s) => ({ ...s, sessionPatientId: id })); },
  loginStaff(v: boolean) { set((s) => ({ ...s, sessionStaff: v })); },
  updatePatient(id: string, data: Partial<Patient>) {
    set((s) => ({ ...s, patients: s.patients.map((p) => (p.id === id ? { ...p, ...data } : p)) }));
  },
  book(slotId: string, patientId: string, reassigned = false) {
    set((s) => {
      const slot = s.slots.find((x) => x.id === slotId)!;
      return {
        ...s,
        slots: s.slots.map((x) => (x.id === slotId ? { ...x, status: "reservada", patientId, reassigned } : x)),
        patients: s.patients.map((p) => (p.id === patientId && p.waitStatus === "En espera" ? { ...p, waitStatus: "Citado" } : p)),
        stats: reassigned ? { ...s.stats, recovered: s.stats.recovered + 1 } : s.stats,
        notifications: notify(s, patientId, `${reassigned ? "Se le ha asignado" : "Cita agendada"}: ${slotLabel(s, slot)} (${slot.modality}).`, "recordatorio"),
      };
    });
  },
  cancel(slotId: string, by: "paciente" | "funcionario") {
    set((s) => {
      const slot = s.slots.find((x) => x.id === slotId)!;
      return {
        ...s,
        slots: s.slots.map((x) => (x.id === slotId ? { ...x, status: "disponible", patientId: undefined, reassigned: false } : x)),
        stats: { ...s.stats, cancellations: s.stats.cancellations + 1 },
        notifications: slot.patientId ? notify(s, slot.patientId, `Su cita del ${slotLabel(s, slot)} fue cancelada${by === "funcionario" ? " por el hospital" : ""}. El cupo quedó disponible para otro paciente.`) : s.notifications,
      };
    });
  },
  /** Moves the patient of an affected/booked slot into a free slot. */
  move(fromSlotId: string, toSlotId: string) {
    set((s) => {
      const from = s.slots.find((x) => x.id === fromSlotId)!;
      const to = s.slots.find((x) => x.id === toSlotId)!;
      return {
        ...s,
        slots: s.slots.map((x) =>
          x.id === fromSlotId ? { ...x, status: from.status === "afectada" ? "bloqueada" : "disponible", patientId: undefined }
          : x.id === toSlotId ? { ...x, status: "reservada", patientId: from.patientId, reassigned: true } : x),
        stats: { ...s.stats, recovered: s.stats.recovered + 1 },
        notifications: from.patientId ? notify(s, from.patientId, `Su hora fue reprogramada al ${slotLabel(s, to)}.`) : s.notifications,
      };
    });
  },
  addAbsence(doctorId: string, from: string, to: string, reason: string) {
    set((s) => ({
      ...s,
      absences: [...s.absences, { id: uid(), doctorId, from, to, reason }],
      slots: s.slots.map((x) => x.doctorId === doctorId && x.date >= from && x.date <= to
        ? { ...x, status: x.status === "reservada" ? "afectada" : x.status === "disponible" ? "bloqueada" : x.status } : x),
    }));
  },
  removeAbsence(id: string) {
    set((s) => {
      const a = s.absences.find((x) => x.id === id)!;
      return {
        ...s, absences: s.absences.filter((x) => x.id !== id),
        slots: s.slots.map((x) => x.doctorId === a.doctorId && x.date >= a.from && x.date <= a.to
          ? { ...x, status: x.status === "afectada" ? "reservada" : x.status === "bloqueada" ? "disponible" : x.status } : x),
      };
    });
  },
  markAttendance(slotId: string, v: "asistió" | "no asistió") {
    set((s) => ({ ...s, slots: s.slots.map((x) => (x.id === slotId ? { ...x, attended: v } : x)) }));
  },
  requestTele(patientId: string, reason: string) {
    set((s) => ({
      ...s, tele: [{ id: uid(), patientId, reason, createdAt: fmt(new Date()), status: "Pendiente de evaluación" }, ...s.tele],
      notifications: notify(s, patientId, "Recibimos su solicitud de telemedicina. Un traumatólogo evaluará si su control puede realizarse de forma remota.", "telemedicina"),
    }));
  },
  decideTele(id: string, approve: boolean, slotId?: string, note?: string) {
    set((s) => {
      const r = s.tele.find((x) => x.id === id)!;
      const slot = slotId ? s.slots.find((x) => x.id === slotId) : undefined;
      return {
        ...s,
        tele: s.tele.map((x) => (x.id === id ? { ...x, status: approve ? "Aprobada" : "Rechazada", slotId, note } : x)),
        slots: slot ? s.slots.map((x) => (x.id === slotId ? { ...x, status: "reservada", patientId: r.patientId, modality: "telemedicina" } : x)) : s.slots,
        notifications: notify(s, r.patientId, approve && slot
          ? `Telemedicina aprobada por el profesional: ${slotLabel(s, slot)}. Recibirá el enlace de videollamada 30 minutos antes.`
          : `El profesional determinó que su control requiere atención presencial.${note ? " " + note : ""}`, "telemedicina"),
      };
    });
  },
};
