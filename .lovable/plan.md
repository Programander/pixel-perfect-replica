# Conecta Salud: de maqueta a aplicación funcional

## 1. Estado actual (revisión)

**Arquitectura hoy:** una sola aplicación web con 4 páginas (Inicio, Paciente, Funcionarios, Telemedicina). Toda la información vive en un "almacén" en el navegador (localStorage) con datos ficticios generados al abrir. No hay servidor, base de datos ni inicio de sesión real.

**Funciona de verdad (dentro del navegador):**
- Agendar, cancelar y reprogramar horas; los cambios se reflejan entre portal y panel.
- Actualizar teléfono/correo del paciente.
- Lista de espera y asignación de cupo libre al siguiente paciente.
- Registrar/quitar ausencias de traumatólogos (marca horas afectadas).
- Marcar asistencia, solicitudes y aprobación de telemedicina, notificaciones internas.
- Botón "Restablecer demo".

**Solo visual o simulado:**
- "Inicio de sesión": se elige un paciente de una lista; el acceso de funcionario es un botón, sin contraseña.
- Permisos: cualquiera puede entrar al panel de funcionarios.
- Estadísticas: parte son números fijos (recuperadas, inasistencias históricas).
- Datos no compartidos entre personas ni dispositivos; se pierden al limpiar el navegador.
- Recordatorios: no se envían, solo se muestran.

**Falta desarrollar:** autenticación real, base de datos, roles y políticas de seguridad, validación de formularios en el servidor, auditoría de cambios, aviso visible de "prototipo académico no oficial".

## 2. Qué se construirá (sin cambiar el diseño)

Se conservan diseño, colores, estructura y textos actuales. Solo se reemplaza la fuente de datos y se agrega inicio de sesión.

1. **Lovable Cloud** como servidor: autenticación, base de datos y permisos.
2. **Inicio de sesión real** con correo y contraseña, página de recuperación de contraseña.
   - Pacientes: crean su cuenta y se vinculan a su ficha (ficticia).
   - Funcionarios: cuentas con rol asignado; solo ellos ven el panel.
3. **Portal del paciente** conectado a la base: próximas citas, agendar, cancelar, actualizar datos, estado en lista de espera, notificaciones, solicitud de telemedicina. Cada paciente ve solo lo suyo.
4. **Panel de funcionarios** conectado a la base: pacientes, citas, lista de espera, disponibilidad, ausencias, reasignación, telemedicina y estadísticas calculadas desde datos reales (ya no fijas).
5. **Datos ficticios iniciales** cargados en la base (traumatólogos, pacientes, horas), claramente marcados como demo. Cuentas de prueba: 1 funcionario y 1–2 pacientes.
6. **Aviso permanente** "Prototipo académico — no oficial — datos ficticios" en cabecera y pie.
7. **Validación** de todos los formularios (RUT, teléfono, correo, largos máximos).
8. **Adaptable** a celular, tablet y computador (revisión en los tres tamaños).
9. **Pruebas reales**: recorrer cada flujo iniciando sesión como paciente y como funcionario, y pruebas automáticas de las reglas de permisos y agendamiento.

## 3. Estructura de base de datos (escalable)

```text
establecimientos ─┬─ especialidades ── profesionales ── disponibilidad (bloques)
                  │                          │                │
                  │                          └── ausencias    └── citas ── pacientes
                  └─ (futuro: servicios, boxes, convenios)          │
perfiles (cuenta) ── roles_usuario                lista_espera ─────┤
                                                  solicitudes_telemedicina
                                                  notificaciones
                                                  registro_auditoria
```

- `establecimiento` y `especialidad` permiten sumar otros hospitales/servicios después.
- Roles en tabla separada (`paciente`, `funcionario`, `administrador`), nunca en la ficha.
- Estados de cita y lista de espera como listas cerradas; historial de cambios en auditoría.

## 4. Permisos y seguridad

- Paciente: lee/edita solo su ficha de contacto; ve y cancela solo sus citas; agenda solo en cupos disponibles.
- Funcionario: lee y gestiona pacientes, citas, ausencias y lista de espera.
- Administrador: además asigna roles.
- Políticas de seguridad en cada tabla; operaciones sensibles (reasignar, cancelar por ausencia) validadas en el servidor.

## 5. Orden de trabajo

1. Activar Lovable Cloud, crear tablas, roles, políticas y datos ficticios.
2. Inicio de sesión, registro, recuperación de contraseña y protección de páginas.
3. Conectar portal del paciente.
4. Conectar panel de funcionarios y telemedicina.
5. Estadísticas reales, aviso de prototipo, validaciones.
6. Verificación completa de flujos y tamaños de pantalla; informe de lo probado.

## Detalles técnicos

- Funciones de servidor con verificación de sesión; RLS + GRANT por tabla; `has_role()` security definer.
- El almacén local se reemplaza por consultas con React Query manteniendo la misma interfaz de componentes; las páginas protegidas pasan bajo una ruta autenticada.
- Trigger al registrarse crea perfil y rol `paciente`; la vinculación con ficha demo se hace por RUT ficticio.
