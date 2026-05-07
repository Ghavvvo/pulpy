# Sistema de Roles y Panel de Administración

Añadiremos roles separados (`admin`, `user`) siguiendo el patrón seguro recomendado (tabla aparte + función `SECURITY DEFINER`, nunca un campo `role` en `profiles`), y un panel `/admin` accesible solo para administradores para moderar usuarios, perfiles públicos y suscripciones.

---

## 1. Base de datos (migración)

Crear:

- **Enum** `app_role` con valores `'admin'` y `'user'`.
- **Tabla** `public.user_roles`:
  - `id uuid pk`, `user_id uuid → auth.users(id) on delete cascade`, `role app_role`, `created_at timestamptz`.
  - `unique (user_id, role)`.
  - RLS activado.
- **Función** `public.has_role(_user_id uuid, _role app_role) returns boolean` con `SECURITY DEFINER` y `set search_path = public` (evita recursión en RLS).
- **Trigger** en `auth.users` (`on_auth_user_role`) que asigne `'user'` automáticamente al crearse un usuario.
- **Políticas RLS sobre `user_roles`**:
  - SELECT: el propio usuario ve sus roles; admins ven todos (`has_role(auth.uid(),'admin')`).
  - INSERT/UPDATE/DELETE: solo admins.
- **Políticas RLS adicionales para administración** (añadidas a tablas existentes, sin romper las actuales):
  - `profiles`: admins pueden `SELECT/UPDATE/DELETE` cualquier fila.
  - `social_links`, `subscriptions`, `profile_views`, `link_clicks`: admins pueden `SELECT` (y `UPDATE/DELETE` donde aplique para moderación).
- **Bootstrap del primer admin**: tras correr la migración, el usuario debe indicar el email del primer admin. Insertaremos su rol vía herramienta de inserción de datos:
  ```sql
  insert into public.user_roles (user_id, role)
  select id, 'admin' from auth.users where email = '<email>';
  ```

---

## 2. Frontend — capa de auth/roles

- **`src/contexts/AuthContext.tsx`**:
  - Al hacer `fetchUserProfile`, traer también roles desde `user_roles` (`select role where user_id = ...`).
  - Exponer `roles: AppRole[]` y `isAdmin: boolean` en el contexto.
- **`src/components/AdminRoute.tsx`** (nuevo): wrapper como `ProtectedRoute` que además exige `isAdmin`; si no, redirige al dashboard del usuario.
- **`src/components/Header.tsx`**: si `isAdmin`, añadir entrada "Admin" en el dropdown del avatar (link a `/admin`).

---

## 3. Panel de administración

Nueva ruta pública-protegida `/admin` (registrada en `App.tsx` envuelta en `AdminRoute`), con layout propio (header existente + sidebar simple) y 4 secciones por pestañas:

### 3.1 Resumen (`/admin`)
KPIs en tarjetas:
- Total de usuarios, usuarios premium, usuarios nuevos (7 / 30 días).
- Total de visitas a perfiles y clicks (últimos 30 días, leídos de `profile_views` / `link_clicks`).
- Top 5 perfiles por visitas.

### 3.2 Usuarios (`/admin?tab=users`)
Tabla (`@/components/ui/table`) con búsqueda por nombre/username/email y paginación cliente:
- Columnas: avatar, nombre, `@username`, email, plan, estado suscripción, rol, fecha de alta, acciones.
- Acciones por fila:
  - Ver perfil público (link `/:username`).
  - Promover a admin / quitar admin (toggle sobre `user_roles`).
  - Suspender / reactivar (campo nuevo `profiles.is_suspended boolean default false` añadido en la misma migración; cuando esté `true`, `PublicMicrosite` mostrará un placeholder "Perfil no disponible").
  - Eliminar usuario (borra fila de `profiles`; `auth.users` se mantiene salvo que el admin lo solicite explícitamente — fuera de alcance esta vez).

### 3.3 Suscripciones (`/admin?tab=subs`)
Lista de filas en `subscriptions` con `status = 'pending'` arriba (solicitudes de upgrade), con acciones:
- Aprobar → `status='active'`, set `start_date`, `end_date` (anual/mensual).
- Rechazar → vuelve a `plan='free'`, `status='none'`.
- Cancelar premium activo.

### 3.4 Moderación de contenido (`/admin?tab=moderation`)
Tabla de perfiles públicos con filtros por: tiene avatar, tiene cover, nº de social links, suspendido. Permite abrir el perfil público en una nueva pestaña y suspenderlo desde la misma vista.

---

## 4. Detalles técnicos

- **Patrón recomendado** (ver tu propia knowledge base): la tabla de roles **debe** estar separada de `profiles` para evitar escaladas de privilegio, y todas las políticas RLS de admin deben usar `public.has_role(auth.uid(), 'admin')` (SECURITY DEFINER) — nunca un subquery directo a `user_roles` desde políticas sobre `user_roles` (recursión).
- **No tocar** la lógica de tracking ni el editor existente.
- Colocar nuevos componentes en `src/components/admin/` (`AdminLayout.tsx`, `UsersTable.tsx`, `SubscriptionsTable.tsx`, `ModerationTable.tsx`, `OverviewCards.tsx`) y la página en `src/pages/Admin.tsx`.
- Estética alineada con la memoria del proyecto: violeta oscuro, minimal, botones redondeados.

---

## 5. Pasos de implementación

1. Migración SQL (enum, `user_roles`, `has_role`, trigger auto-`user`, columna `is_suspended`, políticas admin sobre tablas existentes).
2. Insertar primer admin (necesito su email — te lo preguntaré al pasar a build).
3. Extender `AuthContext` con `roles` / `isAdmin`.
4. Crear `AdminRoute`, página `Admin.tsx` con tabs y los 4 sub-componentes.
5. Añadir entrada "Admin" en el dropdown del Header cuando `isAdmin`.
6. Respetar `is_suspended` en `PublicMicrosite`.

¿Avanzo? Cuando apruebes, te pediré el **email del primer admin** para hacerle el bootstrap.
