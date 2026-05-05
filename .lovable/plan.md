## Reorganizar el editor de Mi Tarjeta

**Problema actual:** la pestaña "Mi Tarjeta" muestra 5 cards apiladas (Usuario, Perfil, CV, Tema, Enlaces) sin jerarquía. Dentro de "Información del Perfil" se mezclan cosas muy distintas (estilo de tarjeta, portada, avatar, datos de contacto, bio), y el orden no sigue cómo realmente piensa el usuario al armar su tarjeta.

### Nuevo flujo (5 pasos numerados, de arriba a abajo)

```text
1. Identidad         → quién eres (avatar, nombre, usuario/URL)
2. Información       → cargo, empresa, bio, contacto (email, tel, ubicación)
3. Enlaces           → redes sociales y links
4. Documentos        → CV en PDF
5. Apariencia        → estilo de tarjeta + portada + tema/colores/tipografía/fondo
```

Cada paso será una **sección con número, título, descripción corta e icono**, presentada como un acordeón (sólo el paso actual abierto por defecto: paso 1). Esto reduce la sensación de muro y guía al usuario en orden.

### Cambios concretos por archivo

**`src/pages/Dashboard.tsx`** (TabsContent "card")
- Reemplazar la lista actual de componentes sueltos por un acordeón (`@/components/ui/accordion`, ya existe) con 5 items numerados.
- Mantener el panel de preview sticky a la derecha (sin cambios estructurales).
- Mantener la barra inferior fija de "Guardar cambios".

**`src/components/ProfileEditor.tsx`** — dividir en dos roles:
- Renombrar a sección "Información" → sólo contiene: selector de estilo de tarjeta movido fuera, **se eliminan** del editor: portada, avatar (van a Identidad/Apariencia). Queda: nombre, cargo, empresa, ubicación, email, teléfono, biografía.
- Extraer **`AvatarUploader`** (avatar + botón cambiar foto) a un subcomponente reutilizable, usado en el paso "Identidad".
- Extraer **`CoverEditor`** (portada: imagen/color + paleta) a un subcomponente, usado en el paso "Apariencia".
- El selector "Estilo de tarjeta" (professional/social) se mueve al paso "Apariencia", al inicio, ya que es decisión visual.

**`src/components/UsernameEditor.tsx`**
- Quitar su `Card` envolvente (la tarjeta la pone el acordeón) o aceptar prop `embedded` para renderizar sin card. Más simple: dejar contenido plano y que Dashboard lo envuelva.

**`src/components/CvUploader.tsx`**, **`src/components/SocialLinkEditor.tsx`**, **`src/components/ThemeCustomizer.tsx`**
- Mismo patrón: aceptar variante "embedded" (sin Card propia) o que Dashboard renderice su contenido dentro del acordeón. Decisión: añadir prop opcional `embedded?: boolean` que oculta el wrapper `<Card>` y `<CardHeader>`.

### Estructura visual del acordeón

```text
┌─────────────────────────────────────────┐
│ ① Identidad                          ▼  │
│   Tu foto, nombre y enlace público      │
├─────────────────────────────────────────┤
│   [Avatar] [Cambiar foto]               │
│   Nombre: [_________________]           │
│   Usuario: pulpy.app/[_______] ✓        │
└─────────────────────────────────────────┘
② Información                          ▶
③ Enlaces                              ▶
④ Documentos                           ▶
⑤ Apariencia                           ▶
```

Cabeceras con número en círculo (`bg-primary/10 text-primary`), título en `font-semibold`, subtítulo `text-xs text-muted-foreground`. Icono de la sección a la derecha del número. Permitir múltiples abiertos (`type="multiple"`) con paso 1 abierto por defecto.

### Detalles UX
- Microcopy claro en cada cabecera ("Tu foto, nombre y enlace público", "Cómo te encuentran", "Lo que compartes", "Archivos descargables", "Cómo se ve tu microsite").
- Quitar el texto "Las imágenes se guardan automáticamente al subirlas" del editor de perfil; añadir un badge sutil "Autoguardado" en cabecera de Identidad y Apariencia donde aplica.
- Mantener intacto el comportamiento de auto-save de avatar/portada/CV y el guardado manual del resto.
- En móvil, acordeón ocupa todo el ancho; el preview se mueve debajo como ya hace (`xl:col-span-1`).

### Sin cambios funcionales
- Ningún cambio de datos, esquema Supabase, ni de tipos `ProfileData`.
- Sin cambios en preview, share o estadísticas.
