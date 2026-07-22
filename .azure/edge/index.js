// .azure/edge/index.js
export default async function handler(context) {
  const { request } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  const path = url.pathname;

  // 1. Ignorar archivos estáticos (assets, imágenes, etc.)
  if (path.match(/\.(jpg|jpeg|png|gif|svg|ico|webp|css|js|json|map)$/)) {
    return context.next();
  }

  // 2. Ignorar rutas específicas de la app (login, signup, etc.)
  const appRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/pricing', '/admin'];
  if (appRoutes.includes(path)) {
    return context.next();
  }

  // 3. Detectar si es un bot
  const isBot = /bot|crawl|spider|facebook|twitter|whatsapp|telegram|slack|discord|linkedin|facebookexternalhit|facebot/i.test(userAgent);

  // 4. Si es un bot y la ruta es un posible username
  if (isBot && path !== '/' && path.length > 1) {
    // Extraer el username (eliminar la primera /)
    const username = path.slice(1);

    // Validar que sea un username válido
    if (/^[a-z0-9_-]{1,40}$/.test(username)) {
      const metaUrl = `https://mbxwatemtkzjedmcxogn.supabase.co/functions/v1/profile-meta?u=${username}`;

      try {
        const response = await fetch(metaUrl);
        const html = await response.text();

        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      } catch (error) {
        console.error('Error al obtener profile-meta:', error);
        // Si falla, continuar con la app React
        return context.next();
      }
    }
  }

  // 5. Para humanos, servir la app React normalmente
  return context.next();
}

