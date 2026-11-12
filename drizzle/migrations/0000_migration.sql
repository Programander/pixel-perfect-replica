
-- ===== Roles =====
create type public.app_role as enum ('paciente', 'funcionario', 'administrador');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null default '',
  created_at timestamptz not null default now()
);
grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('funcionario','administrador'))
$$;

create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "own roles read" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'administrador'));

-- ===== Institutional structure =====
create table public.establecimientos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null, comuna text not null, es_ficticio boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.especialidades (
  id uuid primary key default gen_random_uuid(),
  establecimiento_id uuid not null references public.establecimientos(id) on delete cascade,
  nombre text not null, unique (establecimiento_id, nombre)
);
create table public.profesionales (
  id uuid primary key default gen_random_uuid(),
  especialidad_id uuid not null references public.especialidades(id) on delete restrict,
  codigo text unique not null, nombre text not null, area text not null, color text not null default 'chart-1',
  activo boolean not null default true
);
grant select on public.establecimientos, public.especialidades, public.profesionales to anon, authenticated;
grant all on public.establecimientos, public.especialidades, public.profesionales to service_role;
alter table public.establecimientos enable row level security;
alter table public.especialidades enable row level security;
alter table public.profesionales enable row level security;
create policy "public read" on public.establecimientos for select to anon, authenticated using (true);
create policy "public read" on public.especialidades for select to anon, authenticated using (true);
create policy "public read" on public.profesionales for select to anon, authenticated using (true);

-- ===== Patients =====
create table public.pacientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  establecimiento_id uuid references public.establecimientos(id),
  rut text unique not null, nombre text not null, edad int not null default 0 check (edad between 0 and 130),
  telefono text not null default '', email text not null default '', direccion text not null default '',
  diagnostico text not null default 'Por evaluar',
  prioridad text not null default 'Media' check (prioridad in ('Alta','Media','Baja')),
  en_espera_desde date not null default current_date,
  estado_espera text not null default 'En espera' check (estado_espera in ('En espera','Citado','Atendido','Egresado')),
  es_ficticio boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.pacientes to authenticated;
grant all on public.pacientes to service_role;
alter table public.pacientes enable row level security;

create or replace function public.my_patient_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.pacientes where user_id = auth.uid() limit 1
$$;
create policy "patient own or staff" on public.pacientes for select to authenticated using (user_id = auth.uid() or public.is_staff());

-- ===== Agenda =====
create table public.cupos (
  id uuid primary key default gen_random_uuid(),
  profesional_id uuid not null references public.profesionales(id) on delete cascade,
  fecha date not null, hora text not null check (hora ~ '^[0-2][0-9]:[0-5][0-9]$'),
  modalidad text not null default 'presencial' check (modalidad in ('presencial','telemedicina')),
  estado text not null default 'disponible' check (estado in ('disponible','reservada','afectada','bloqueada')),
  paciente_id uuid references public.pacientes(id) on delete set null,
  reasignada boolean not null default false,
  asistencia text check (asistencia in ('asistió','no asistió')),
  updated_at timestamptz not null default now(),
  unique (profesional_id, fecha, hora)
);
create index on public.cupos (fecha);
create index on public.cupos (paciente_id);
grant select on public.cupos to authenticated;
grant all on public.cupos to service_role;
alter table public.cupos enable row level security;
create policy "staff all, patient free or own" on public.cupos for select to authenticated
  using (public.is_staff() or estado = 'disponible' or paciente_id = public.my_patient_id());

create table public.ausencias (
  id uuid primary key default gen_random_uuid(),
  profesional_id uuid not null references public.profesionales(id) on delete cascade,
  desde date not null, hasta date not null, motivo text not null default '',
  creado_por uuid, created_at timestamptz not null default now(),
  check (hasta >= desde)
);
grant select on public.ausencias to authenticated;
grant all on public.ausencias to service_role;
alter table public.ausencias enable row level security;
create policy "staff read" on public.ausencias for select to authenticated using (public.is_staff());

create table public.solicitudes_telemedicina (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  motivo text not null, creada date not null default current_date,
  estado text not null default 'Pendiente de evaluación' check (estado in ('Pendiente de evaluación','Aprobada','Rechazada')),
  cupo_id uuid references public.cupos(id) on delete set null, nota text
);
grant select on public.solicitudes_telemedicina to authenticated;
grant all on public.solicitudes_telemedicina to service_role;
alter table public.solicitudes_telemedicina enable row level security;
create policy "own or staff" on public.solicitudes_telemedicina for select to authenticated using (paciente_id = public.my_patient_id() or public.is_staff());

create table public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.pacientes(id) on delete cascade,
  texto text not null, fecha date not null default current_date,
  tipo text not null default 'aviso' check (tipo in ('recordatorio','aviso','telemedicina')),
  created_at timestamptz not null default now()
);
grant select on public.notificaciones to authenticated;
grant all on public.notificaciones to service_role;
alter table public.notificaciones enable row level security;
create policy "own or staff" on public.notificaciones for select to authenticated using (paciente_id = public.my_patient_id() or public.is_staff());

create table public.registro_auditoria (
  id bigint generated always as identity primary key,
  user_id uuid, accion text not null, entidad text not null, entidad_id uuid, detalle jsonb not null default '{}',
  created_at timestamptz not null default now()
);
grant select on public.registro_auditoria to authenticated;
grant all on public.registro_auditoria to service_role;
alter table public.registro_auditoria enable row level security;
create policy "staff read" on public.registro_auditoria for select to authenticated using (public.is_staff());

-- ===== Helpers =====
create or replace function public._audit(_accion text, _entidad text, _id uuid, _detalle jsonb default '{}')
returns void language sql security definer set search_path = public as $$
  insert into public.registro_auditoria(user_id, accion, entidad, entidad_id, detalle) values (auth.uid(), _accion, _entidad, _id, _detalle)
$$;
create or replace function public._notify(_paciente uuid, _texto text, _tipo text default 'aviso')
returns void language sql security definer set search_path = public as $$
  insert into public.notificaciones(paciente_id, texto, tipo) values (_paciente, _texto, _tipo)
$$;
create or replace function public._slot_label(_cupo uuid)
returns text language sql stable security definer set search_path = public as $$
  select to_char(c.fecha, 'DD/MM/YYYY') || ' ' || c.hora || ' con ' || p.nombre
  from public.cupos c join public.profesionales p on p.id = c.profesional_id where c.id = _cupo
$$;
revoke execute on function public._audit(text,text,uuid,jsonb), public._notify(uuid,text,text) from public, anon, authenticated;

-- ===== Business operations (validated server-side) =====
create or replace function public.reservar_cupo(_cupo uuid, _paciente uuid default null, _reasignada boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare v_pac uuid; v_c public.cupos;
begin
  if auth.uid() is null then raise exception 'No autenticado'; end if;
  if public.is_staff() then v_pac := _paciente;
  else v_pac := public.my_patient_id(); _reasignada := false;
    if _paciente is not null and _paciente <> v_pac then raise exception 'No autorizado'; end if;
  end if;
  if v_pac is null then raise exception 'Paciente no encontrado'; end if;
  select * into v_c from public.cupos where id = _cupo for update;
  if v_c.id is null or v_c.estado <> 'disponible' then raise exception 'El cupo ya no está disponible'; end if;
  if v_c.fecha <= current_date then raise exception 'Solo se pueden reservar cupos futuros'; end if;
  update public.cupos set estado = 'reservada', paciente_id = v_pac, reasignada = _reasignada, updated_at = now() where id = _cupo;
  update public.pacientes set estado_espera = 'Citado' where id = v_pac and estado_espera = 'En espera';
  perform public._notify(v_pac, (case when _reasignada then 'Se le ha asignado' else 'Cita agendada' end) || ': ' || public._slot_label(_cupo) || ' (' || v_c.modalidad || ').', 'recordatorio');
  perform public._audit(case when _reasignada then 'reasignar_cupo' else 'reservar_cupo' end, 'cupos', _cupo, jsonb_build_object('paciente', v_pac));
end $$;

create or replace function public.cancelar_cita(_cupo uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_c public.cupos; v_staff boolean := public.is_staff();
begin
  select * into v_c from public.cupos where id = _cupo for update;
  if v_c.id is null or v_c.paciente_id is null then raise exception 'Cita no encontrada'; end if;
  if not v_staff and v_c.paciente_id is distinct from public.my_patient_id() then raise exception 'No autorizado'; end if;
  update public.cupos set estado = case when v_c.estado = 'afectada' then 'bloqueada' else 'disponible' end,
    paciente_id = null, reasignada = false, updated_at = now() where id = _cupo;
  perform public._notify(v_c.paciente_id, 'Su cita del ' || public._slot_label(_cupo) || ' fue cancelada' || case when v_staff then ' por el hospital' else '' end || '. El cupo quedó disponible para otro paciente.');
  perform public._audit('cancelar_cita', 'cupos', _cupo, jsonb_build_object('paciente', v_c.paciente_id, 'por', case when v_staff then 'funcionario' else 'paciente' end));
end $$;

create or replace function public.mover_cita(_desde uuid, _hacia uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_from public.cupos; v_to public.cupos;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  select * into v_from from public.cupos where id = _desde for update;
  select * into v_to from public.cupos where id = _hacia for update;
  if v_from.paciente_id is null then raise exception 'La hora de origen no tiene paciente'; end if;
  if v_to.id is null or v_to.estado <> 'disponible' then raise exception 'El cupo de destino no está disponible'; end if;
  update public.cupos set estado = case when v_from.estado = 'afectada' then 'bloqueada' else 'disponible' end, paciente_id = null, reasignada = false, updated_at = now() where id = _desde;
  update public.cupos set estado = 'reservada', paciente_id = v_from.paciente_id, reasignada = true, updated_at = now() where id = _hacia;
  perform public._notify(v_from.paciente_id, 'Su hora fue reprogramada al ' || public._slot_label(_hacia) || '.');
  perform public._audit('mover_cita', 'cupos', _hacia, jsonb_build_object('desde', _desde, 'paciente', v_from.paciente_id));
end $$;

create or replace function public.actualizar_mis_datos(_telefono text, _email text, _direccion text)
returns void language plpgsql security definer set search_path = public as $$
declare v_pac uuid := public.my_patient_id();
begin
  if v_pac is null then raise exception 'Paciente no encontrado'; end if;
  if length(_telefono) > 30 or _telefono !~ '^[+0-9 ()-]{6,30}$' then raise exception 'Teléfono inválido'; end if;
  if length(_email) > 255 or _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Correo inválido'; end if;
  if length(_direccion) > 200 then raise exception 'Dirección demasiado larga'; end if;
  update public.pacientes set telefono = trim(_telefono), email = trim(_email), direccion = trim(_direccion) where id = v_pac;
  perform public._audit('actualizar_datos', 'pacientes', v_pac, '{}');
end $$;

create or replace function public.actualizar_paciente(_id uuid, _telefono text, _email text, _prioridad text, _estado text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  if length(_telefono) > 30 or _telefono !~ '^[+0-9 ()-]{6,30}$' then raise exception 'Teléfono inválido'; end if;
  if length(_email) > 255 or _email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Correo inválido'; end if;
  update public.pacientes set telefono = trim(_telefono), email = trim(_email), prioridad = _prioridad, estado_espera = _estado where id = _id;
  perform public._audit('editar_paciente', 'pacientes', _id, jsonb_build_object('prioridad', _prioridad, 'estado', _estado));
end $$;

create or replace function public.registrar_ausencia(_prof uuid, _desde date, _hasta date, _motivo text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  if _hasta < _desde then raise exception 'Rango de fechas inválido'; end if;
  if length(_motivo) > 200 then raise exception 'Motivo demasiado largo'; end if;
  insert into public.ausencias(profesional_id, desde, hasta, motivo, creado_por) values (_prof, _desde, _hasta, trim(_motivo), auth.uid()) returning id into v_id;
  update public.cupos set estado = case estado when 'reservada' then 'afectada' when 'disponible' then 'bloqueada' else estado end, updated_at = now()
    where profesional_id = _prof and fecha between _desde and _hasta;
  perform public._audit('registrar_ausencia', 'ausencias', v_id, '{}');
  return v_id;
end $$;

create or replace function public.quitar_ausencia(_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare a public.ausencias;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  select * into a from public.ausencias where id = _id;
  if a.id is null then raise exception 'Ausencia no encontrada'; end if;
  delete from public.ausencias where id = _id;
  update public.cupos set estado = case estado when 'afectada' then 'reservada' when 'bloqueada' then (case when paciente_id is null then 'disponible' else 'reservada' end) else estado end, updated_at = now()
    where profesional_id = a.profesional_id and fecha between a.desde and a.hasta
      and not exists (select 1 from public.ausencias o where o.profesional_id = a.profesional_id and cupos.fecha between o.desde and o.hasta);
  perform public._audit('quitar_ausencia', 'ausencias', _id, '{}');
end $$;

create or replace function public.marcar_asistencia(_cupo uuid, _valor text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  if _valor not in ('asistió','no asistió') then raise exception 'Valor inválido'; end if;
  update public.cupos set asistencia = _valor, updated_at = now() where id = _cupo and paciente_id is not null;
  perform public._audit('marcar_asistencia', 'cupos', _cupo, jsonb_build_object('valor', _valor));
end $$;

create or replace function public.solicitar_telemedicina(_motivo text)
returns void language plpgsql security definer set search_path = public as $$
declare v_pac uuid := public.my_patient_id(); v_id uuid;
begin
  if v_pac is null then raise exception 'Paciente no encontrado'; end if;
  if length(trim(_motivo)) < 3 or length(_motivo) > 500 then raise exception 'Motivo inválido'; end if;
  insert into public.solicitudes_telemedicina(paciente_id, motivo) values (v_pac, trim(_motivo)) returning id into v_id;
  perform public._notify(v_pac, 'Recibimos su solicitud de telemedicina. Un traumatólogo evaluará si su control puede realizarse de forma remota.', 'telemedicina');
  perform public._audit('solicitar_telemedicina', 'solicitudes_telemedicina', v_id, '{}');
end $$;

create or replace function public.decidir_telemedicina(_id uuid, _aprobar boolean, _cupo uuid default null, _nota text default null)
returns void language plpgsql security definer set search_path = public as $$
declare r public.solicitudes_telemedicina; v_c public.cupos;
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  select * into r from public.solicitudes_telemedicina where id = _id for update;
  if r.id is null or r.estado <> 'Pendiente de evaluación' then raise exception 'Solicitud no pendiente'; end if;
  if _aprobar then
    select * into v_c from public.cupos where id = _cupo for update;
    if v_c.id is null or v_c.estado <> 'disponible' then raise exception 'Cupo no disponible'; end if;
    update public.cupos set estado = 'reservada', paciente_id = r.paciente_id, modalidad = 'telemedicina', updated_at = now() where id = _cupo;
    update public.solicitudes_telemedicina set estado = 'Aprobada', cupo_id = _cupo, nota = _nota where id = _id;
    perform public._notify(r.paciente_id, 'Telemedicina aprobada por el profesional: ' || public._slot_label(_cupo) || '. Recibirá el enlace de videollamada 30 minutos antes.', 'telemedicina');
  else
    update public.solicitudes_telemedicina set estado = 'Rechazada', nota = _nota where id = _id;
    perform public._notify(r.paciente_id, 'El profesional determinó que su control requiere atención presencial.' || coalesce(' ' || _nota, ''), 'telemedicina');
  end if;
  perform public._audit('decidir_telemedicina', 'solicitudes_telemedicina', _id, jsonb_build_object('aprobada', _aprobar));
end $$;

create or replace function public.mi_posicion_espera()
returns table(posicion int, total int) language sql stable security definer set search_path = public as $$
  with wl as (
    select id, row_number() over (order by case prioridad when 'Alta' then 0 when 'Media' then 1 else 2 end, en_espera_desde)::int as pos
    from public.pacientes where estado_espera = 'En espera')
  select coalesce((select pos from wl where id = public.my_patient_id()), 0), (select count(*)::int from wl)
$$;

-- ===== Demo data generator (fictitious only) =====
create or replace function public._generar_agenda_demo()
returns void language plpgsql security definer set search_path = public as $$
declare d date; prof record; t text; i int := 0; pac uuid[]; r int; times text[] := array['08:30','09:15','10:00','10:45','11:30','15:00','15:45'];
begin
  delete from public.solicitudes_telemedicina; delete from public.ausencias; delete from public.cupos; delete from public.notificaciones;
  select array_agg(id order by rut) into pac from public.pacientes where es_ficticio;
  -- future 3 weeks
  for d in select generate_series(current_date, current_date + 20, interval '1 day')::date loop
    continue when extract(isodow from d) > 5;
    for prof in select id, codigo from public.profesionales order by codigo loop
      foreach t in array times loop
        r := (abs(hashtext(d::text || prof.codigo || t))) % 10;
        insert into public.cupos(profesional_id, fecha, hora, modalidad, estado, paciente_id)
        values (prof.id, d, t, case when t >= '15:00' and prof.codigo <> 'd4' then 'telemedicina' else 'presencial' end,
          case when r < 4 and d > current_date then 'reservada' else 'disponible' end,
          case when r < 4 and d > current_date then pac[1 + (abs(hashtext(d::text || t || prof.codigo)) % 8)] else null end);
      end loop;
    end loop;
  end loop;
  -- past 6 months (attendance history)
  for d in select generate_series(current_date - 180, current_date - 1, interval '1 day')::date loop
    continue when extract(isodow from d) > 5;
    for prof in select id, codigo from public.profesionales order by codigo loop
      i := i + 1;
      insert into public.cupos(profesional_id, fecha, hora, estado, paciente_id, asistencia, reasignada)
      values (prof.id, d, '09:15', 'reservada', pac[9 + (i % 8)],
        case when abs(hashtext(d::text || prof.codigo)) % 100 < greatest(8, 24 - ((d - (current_date - 180)) / 10)) then 'no asistió' else 'asistió' end,
        abs(hashtext(prof.codigo || d::text)) % 100 < 12);
    end loop;
  end loop;
  insert into public.solicitudes_telemedicina(paciente_id, motivo, creada) values
    (pac[1], 'Control post kinesiología', current_date - 2), (pac[8], 'Revisión de exámenes de imagen', current_date - 1);
  insert into public.notificaciones(paciente_id, texto, fecha, tipo) values
    (pac[1], 'Recordatorio: tiene una cita próximamente. Confirme o cancele con anticipación para liberar el cupo.', current_date, 'recordatorio'),
    (pac[1], 'Traiga su cédula de identidad y exámenes previos a su atención.', current_date - 3, 'aviso');
end $$;
revoke execute on function public._generar_agenda_demo() from public, anon, authenticated;

create or replace function public.reiniciar_demo()
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception 'No autorizado'; end if;
  update public.pacientes set estado_espera = case when rut < '18' then 'Citado' else 'En espera' end where es_ficticio;
  perform public._generar_agenda_demo();
  perform public._audit('reiniciar_demo', 'sistema', null, '{}');
end $$;

-- ===== Signup trigger =====
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_rut text := nullif(trim(new.raw_user_meta_data->>'rut'), ''); v_nombre text := coalesce(nullif(trim(new.raw_user_meta_data->>'nombre'), ''), split_part(new.email, '@', 1));
begin
  insert into public.profiles(id, nombre) values (new.id, left(v_nombre, 100));
  insert into public.user_roles(user_id, role) values (new.id, 'paciente');
  if v_rut is not null then
    update public.pacientes set user_id = new.id where rut = v_rut and user_id is null;
    if not found and not exists (select 1 from public.pacientes where rut = v_rut) then
      insert into public.pacientes(user_id, rut, nombre, email, establecimiento_id)
      values (new.id, left(v_rut, 15), left(v_nombre, 100), new.email, (select id from public.establecimientos limit 1));
    end if;
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ===== Seed (fictitious) =====
with e as (insert into public.establecimientos(nombre, comuna) values ('Hospital San Pablo (referencial)', 'Coquimbo') returning id),
s as (insert into public.especialidades(establecimiento_id, nombre) select id, 'Traumatología' from e returning id)
insert into public.profesionales(especialidad_id, codigo, nombre, area, color)
select s.id, v.c, v.n, v.a, v.col from s, (values
  ('d1','Dra. Camila Rojas','Rodilla','chart-1'), ('d2','Dr. Matías Fuentes','Columna','chart-2'),
  ('d3','Dra. Javiera Tapia','Hombro y codo','chart-3'), ('d4','Dr. Felipe Araya','Cadera y pie','chart-4')) v(c,n,a,col);

insert into public.pacientes(rut, nombre, edad, telefono, email, direccion, diagnostico, prioridad, en_espera_desde, estado_espera, establecimiento_id)
select (12 + i) || '.' || lpad(((345 + i*7) % 1000)::text, 3, '0') || '.' || lpad(((678 + i*13) % 1000)::text, 3, '0') || '-' || (i % 10),
  n, 34 + ((i*7) % 45), '+56 9 ' || (8000 + i*37) || ' ' || (1000 + i*91),
  lower(split_part(translate(n, 'áéíóúñÁÉÍÓÚÑ', 'aeiounAEIOUN'), ' ', 1)) || i || '@correo-demo.cl',
  'Av. Ejemplo ' || (100 + i*12) || ', Coquimbo',
  (array['Gonartrosis','Lumbago crónico','Tendinitis manguito rotador','Coxartrosis','Esguince tobillo','Hernia discal','Fractura consolidada (control)','Túnel carpiano'])[1 + i % 8],
  (array['Alta','Media','Baja'])[1 + i % 3], current_date - (40 + i*23), case when i < 6 then 'Citado' else 'En espera' end,
  (select id from public.establecimientos limit 1)
from unnest(array['María González','José Muñoz','Ana Pérez','Luis Soto','Carmen Díaz','Pedro Contreras','Rosa Silva','Jorge Vega','Patricia Castillo','Manuel Morales','Elena Herrera','Ricardo Núñez','Sofía Pizarro','Héctor Cortés','Valentina Ramos','Andrés Olivares']) with ordinality as t(n, k), lateral (select (k - 1)::int as i) x;

select public._generar_agenda_demo();
