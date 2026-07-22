// .azure/edge/index.js
export default async function handler(context) {
  const { request } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  const path = url.pathname;

  console.log('🔹 Edge Function ejecutada');
  console.log('📥 Path:', path);
  console.log('📥 User-Agent:', userAgent);

  // 1. Ignorar archivos estáticos
  if (path.match(/\.(jpg|jpeg|png|gif|svg|ico|webp|css|js|json|map)$/)) {
    return context.next();
  }

  // 2. Ignorar rutas específicas de la app
  const appRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/pricing', '/admin'];
  if (appRoutes.includes(path)) {
    return context.next();
  }

  // 3. Si es la raíz, servir la app React
  if (path === '/') {
    return context.next();
  }

  // 4. Extraer el username de la ruta
  const username = path.slice(1); // Elimina la primera /
  console.log('👤 Username extraído:', username);

  // 5. Validar que sea un username válido
  if (!/^[a-z0-9_-]{1,40}$/.test(username)) {
    console.log('❌ Username inválido:', username);
    return context.next();
  }

  // 6. Detectar si es un bot
  const isBot = /bot|crawl|spider|facebook|twitter|whatsapp|telegram|slack|discord|linkedin|facebookexternalhit|facebot/i.test(userAgent);
  console.log('🤖 Es bot:', isBot);

  // 7. Si es un bot, redirigir a profile-meta
  if (isBot) {
    const metaUrl = `https://mbxwatemtkzjedmcxogn.supabase.co/functions/v1/profile-meta?u=${username}`;
    console.log('🔗 Fetching profile-meta:', metaUrl);

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
      console.error('❌ Error al obtener profile-meta:', error);
      return context.next();
    }
  }

  // 8. Para humanos, servir la app React
  return context.next();
}