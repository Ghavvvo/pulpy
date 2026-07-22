// .azure/edge/index.js
export default async function handler(context) {
  const { request } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  const path = url.pathname;

  console.log('🔹 Edge Function ejecutada para:', path);

  // 1. IGNORAR ARCHIVOS ESTÁTICOS (IMPORTANTE)
  // Azure sirve estos archivos directamente sin pasar por la Edge Function
  if (path.match(/\.(jpg|jpeg|png|gif|svg|ico|webp|css|js|json|map|txt|xml|pdf)$/)) {
    console.log('⏭️ Archivo estático, continuar...');
    return context.next();
  }

  // 2. IGNORAR RUTAS DE LA API DE AZURE
  if (path.startsWith('/api/')) {
    console.log('⏭️ Ruta de API, continuar...');
    return context.next();
  }

  // 3. IGNORAR RUTAS ESPECÍFICAS DE LA APP
  const appRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/pricing', '/admin', '/dashboard'];
  if (appRoutes.includes(path)) {
    console.log('⏭️ Ruta de app, continuar...');
    return context.next();
  }

  // 4. SI ES LA RAÍZ, SERVIR LA REACT APP
  if (path === '/' || path === '') {
    console.log('⏭️ Raíz, continuar...');
    return context.next();
  }

  // 5. EXTRAER USERNAME
  const username = path.slice(1);
  console.log('👤 Username extraído:', username);

  // 6. VALIDAR USERNAME
  if (!/^[a-z0-9_-]{1,40}$/.test(username)) {
    console.log('❌ Username inválido, continuar...');
    return context.next();
  }

  // 7. DETECTAR BOT
  const isBot = /bot|crawl|spider|facebook|twitter|whatsapp|telegram|slack|discord|linkedin|facebookexternalhit|facebot|Googlebot|Bingbot|Slackbot|Discordbot/i.test(userAgent);
  console.log('🤖 Es bot:', isBot);

  // 8. SI ES BOT, REDIRIGIR A PROFILE-META
  if (isBot) {
    const metaUrl = `https://mbxwatemtkzjedmcxogn.supabase.co/functions/v1/profile-meta?u=${username}`;
    console.log('🔗 Redirigiendo a profile-meta:', metaUrl);

    try {
      const response = await fetch(metaUrl);
      console.log('📥 Status de profile-meta:', response.status);

      if (!response.ok) {
        console.error('❌ Error en profile-meta:', response.status);
        return context.next(); // Si falla, mostrar React app
      }

      const html = await response.text();
      console.log('✅ HTML obtenido, devolviendo...');
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } catch (error) {
      console.error('💥 Error en fetch:', error.message);
      return context.next(); // Si falla, mostrar React app
    }
  }

  // 9. PARA HUMANOS, SERVIR REACT APP
  console.log('👤 Es humano, continuar...');
  return context.next();
}