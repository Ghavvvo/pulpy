// .azure/edge/index.js
export default async function handler(context) {
  const { request } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  const path = url.pathname;

  console.log('🔹 Edge Function ejecutada:', path);

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

  // 4. Extraer el username
  const username = path.slice(1);
  if (!/^[a-z0-9_-]{1,40}$/.test(username)) {
    return context.next();
  }

  // 5. Detectar si es un bot
  const isBot = /bot|crawl|spider|facebook|twitter|whatsapp|telegram|slack|discord|linkedin|facebookexternalhit|facebot/i.test(userAgent);
  console.log('🤖 Es bot:', isBot, 'Username:', username);

  // 6. Si es bot, redirigir a profile-meta
  if (isBot) {
    const metaUrl = `https://mbxwatemtkzjedmcxogn.supabase.co/functions/v1/profile-meta?u=${username}`;
    try {
      const response = await fetch(metaUrl);
      const html = await response.text();
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    } catch (error) {
      console.error('Error:', error);
      return context.next();
    }
  }

  return context.next();
}