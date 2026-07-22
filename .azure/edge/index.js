// .azure/edge/index.js
export default async function handler(context) {
  const { request } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  const path = url.pathname;

  console.log('🔹 Edge Function ejecutada para:', path);

  // --- Lógica para ignorar archivos estáticos y rutas de la app (mantenerla) ---
  if (path.match(/\.(jpg|jpeg|png|gif|svg|ico|webp|css|js|json|map)$/)) {
    return context.next();
  }
  const appRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/pricing', '/admin'];
  if (appRoutes.includes(path)) {
    return context.next();
  }
  if (path === '/') {
    return context.next();
  }
  // --- Fin de la lógica para ignorar ---

  const username = path.slice(1);
  if (!/^[a-z0-9_-]{1,40}$/.test(username)) {
    console.log('❌ Username inválido:', username);
    return context.next();
  }

  const isBot = /bot|crawl|spider|facebook|twitter|whatsapp|telegram|slack|discord|linkedin|facebookexternalhit|facebot/i.test(userAgent);
  console.log('🤖 Es bot:', isBot, 'Username:', username);

  if (isBot) {
    const metaUrl = `https://mbxwatemtkzjedmcxogn.supabase.co/functions/v1/profile-meta?u=${username}`;
    console.log('🔗 Intentando obtener profile-meta de:', metaUrl);
    try {
      const response = await fetch(metaUrl);
      console.log('📥 Respuesta de profile-meta:', response.status, response.statusText);

      if (!response.ok) {
        console.error('❌ Error al obtener profile-meta:', response.status);
        // Devuelve un error amigable o pasa al siguiente middleware
        return new Response(`<h1>Error al obtener meta tags</h1><p>Status: ${response.status}</p>`, {
          status: 500,
          headers: { 'Content-Type': 'text/html' }
        });
      }

      const html = await response.text();
      console.log('✅ HTML obtenido correctamente, devolviendo...');
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } catch (error) {
      console.error('💥 Error crítico en fetch:', error.message);
      return new Response(`<h1>Error en Edge Function</h1><p>${error.message}</p>`, {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      });
    }
  }

  // Si no es bot, pasar al siguiente middleware (la React app)
  return context.next();
}