# Plan: Tarjeta Empresa + PDF tipado

## 1. Nuevo `cardStyle: 'company'` (gratis para todos)

Extender el tipo `ProfileData.cardStyle` a `'professional' | 'social' | 'company'`.

**Campos Empresa (set básico):**

- Nombre de la empresa
- Sector / industria (input libre)
- Descripción corta (reemplaza "bio")
- Ubicación
- Teléfono
- Email
- Sitio web
- Horario (texto libre, ej: "Lun–Vie 9:00–18:00")

**Cambios UI:**

- `ProfileEditor.tsx` → nueva rama de formulario cuando `cardStyle === 'company'` con esos campos. El avatar pasa a llamarse "Logo" en el copy.
- `Dashboard.tsx` → agregar opción "Empresa" en el `Select` de estilo de tarjeta.
- `ProfileCard.tsx` y `PublicMicrosite.tsx` → layout adaptado: muestra logo (cuadrado), nombre como título, sector como subtítulo, descripción, y los datos de contacto (ubicación, teléfono, email, web, horario) en una lista clara con íconos. Sin "@username" como protagonista.

**Persistencia:** los nuevos campos se guardan en la tabla `profiles` existente. Hace falta migración para añadir columnas `industry text`, `website text`, `business_hours text` (los demás ya existen). El campo `bio` se reutiliza como "descripción".

## 2. PDF tipado (premium, 1 documento)

Reemplazar el actual `cvUrl` plano por un documento con tipo:

- `documentUrl: string`
- `documentType: 'cv' | 'catalog' | 'menu' | 'portfolio'`
- `documentLabel?: string` (opcional, override del texto del botón)

**Migración:** añadir columnas `document_type text`, `document_label text` a `profiles`. Mantener `cv_url` renombrado lógicamente como `document_url` (o conservar `cv_url` por compatibilidad y leer/escribir desde ahí).

**UI editor (`CvUploader.tsx` → renombrar a `DocumentUploader.tsx`):**

- Selector de tipo (CV, Catálogo, Menú, Portafolio) antes/después de subir.
- Sigue bloqueado tras paywall premium (ya lo está el CV hoy según memoria).
- Solo 1 documento activo; subir otro reemplaza el anterior y borra el archivo previo del bucket.
- Etiqueta del botón se calcula del tipo: "Descargar CV", "Descargar catálogo", "Descargar menú", "Descargar portafolio". El usuario puede sobrescribir con `documentLabel`.

**UI pública (`PublicMicrosite.tsx`):**

- Botón actual "Descargar CV" pasa a usar `documentLabel || defaultLabelByType(documentType)` y el ícono cambia según tipo (FileText para CV/Portafolio, BookOpen para catálogo, UtensilsCrossed para menú).

## 3. Defaults estilo Empresa

Cuando el usuario cambia a `cardStyle: 'company'` por primera vez, sugerir tipo de documento `catalog` por defecto (no forzado).

## Detalles técnicos

**Migración SQL necesaria (te la doy para que la corras tú):**

```sql
alter table public.profiles
  add column if not exists industry text,
  add column if not exists website text,
  add column if not exists business_hours text,
  add column if not exists document_type text check (document_type in ('cv','catalog','menu','portfolio')),
  add column if not exists document_label text;
```

No cambian RLS ni grants existentes.

**Archivos a tocar:**

- `src/components/ProfileEditor.tsx` — rama Empresa, nuevos inputs, copy "Logo".
- `src/pages/Dashboard.tsx` — opción "Empresa" en Select + tipos ampliados.
- `src/components/ProfileCard.tsx` — render variante company.
- `src/components/public/PublicMicrosite.tsx` — render variante company + botón documento tipado.
- `src/components/CvUploader.tsx` → renombrar a `DocumentUploader.tsx`, añadir selector de tipo.
- `src/contexts/AuthContext.tsx` / cualquier hook de perfil — mapear nuevas columnas.
- Tipos compartidos de `ProfileData` (donde estén declarados) — agregar `industry`, `website`, `businessHours`, `documentType`, `documentLabel`.

**Fuera de alcance (no se toca):**

- Sistema de temas, watermark, stats, admin.
- Pago/paywall (se reutiliza `isPremium` para bloquear el documento, igual que hoy con el CV).
- Mapa embebido en ubicación (solo texto).