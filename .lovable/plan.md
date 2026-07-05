# Rediseño de la Home de Pulpy

## Objetivo
Comunicar con claridad qué es Pulpy hoy: **crear tu perfil digital, centralizar tus redes sociales y compartir tu info fácilmente** — sin mencionar NFC. Añadir una **tarjeta de ejemplo giratoria** (flip 3D CSS) como pieza visual central.

## Cambios de contenido (copy)

**Hero**
- Badge: "Tu presencia digital, en una sola tarjeta"
- H1: "Tu perfil digital, todo en un enlace"
- Subtítulo: "Crea tu tarjeta de presentación digital con tus redes sociales, contacto y enlaces. Compártela con un QR o un link y descubre quién conecta contigo."
- CTAs: "Crear mi tarjeta gratis" / "Ver ejemplo"
- Trust badges: se mantienen (gratis, sin tarjeta, 2 min)

**Features (4)** — reemplazar los actuales por:
1. **Perfil digital** — Tu tarjeta de presentación online con foto, bio, contacto y estilo propio.
2. **Todas tus redes en un lugar** — Instagram, LinkedIn, TikTok, WhatsApp, web… un solo enlace.
3. **Comparte al instante** — QR descargable o link corto. Sin apps, sin instalar nada.
4. **Estadísticas reales** — Visitas a tu perfil y clics por enlace, con origen y ubicación.

Se eliminan menciones a NFC en toda la página (hero, features, cómo funciona, footer).

**Cómo funciona** — pasos actualizados:
1. Crea tu perfil (foto, bio, contacto)
2. Añade tus redes y enlaces
3. Comparte tu QR o link

## Tarjeta giratoria de ejemplo (flip card CSS)

Nuevo bloque entre el Hero y Features (o dentro del Hero en columna derecha en desktop) mostrando una **tarjeta 3D que gira** al hover y automáticamente cada X segundos en móvil.

- **Cara frontal**: mock del microsite de Pulpy — avatar, nombre ("Ana Martín"), rol ("Diseñadora · Estudio Nova"), badge `@ana`, botón "Guardar contacto", 2-3 chips de redes (Instagram, LinkedIn, Web).
- **Cara trasera**: QR grande centrado + texto "Escanea para ver mi perfil" + logo Pulpy pequeño.
- **Animación**: técnica del artículo — contenedor con `perspective`, hijo con `transform-style: preserve-3d` y `transition: transform .8s`, caras con `backface-visibility: hidden` (una rotada `rotateY(180deg)`). Al hover del contenedor: `transform: rotateY(180deg)`. Además, animación keyframe suave que la gira sola cada ~6s en loop (pausable en hover para que el usuario controle).
- Los estilos van en `src/index.css` con clases utilitarias (`.flip-card`, `.flip-card-inner`, `.flip-card-front`, `.flip-card-back`) para no chocar con Tailwind.
- Usa tokens semánticos existentes (primary, card, border) — nada de colores hardcoded.

## Archivos a tocar

- `src/pages/Index.tsx` — reescribir hero copy, features, steps, footer (quitar NFC) y añadir el componente `<FlipCardDemo />`.
- `src/components/FlipCardDemo.tsx` — nuevo componente con la tarjeta giratoria (front + back), usa `Avatar`, `Badge`, `Button` de shadcn y un QR estático (imagen SVG inline o `qrcode.react` ya presente si existe; si no, un placeholder SVG).
- `src/index.css` — añadir clases `.flip-card*` con perspective, preserve-3d, backface-visibility, keyframes `flip-loop` y `.flip-card:hover` que fuerza el flip manual.

## Fuera de alcance
- No se toca el dashboard, editor, microsite público, auth ni backend.
- No se cambian tokens de diseño globales (colores, tipografía).
- No se agrega i18n ni nuevas rutas.
