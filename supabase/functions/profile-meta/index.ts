// HTML with per-profile OG tags for social crawlers.
// Humans are redirected to https://pulpy.me/{username} via meta-refresh + JS.
// URL: /profile-meta?u={username}
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://pulpy.me";

const escapeHtml = (s: string) =>
  (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const truncate = (s: string, n: number) =>
  !s ? "" : s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";

const buildHtml = (opts: {
  title: string;
  description: string;
  image: string;
  url: string;
  redirectUrl: string;
}) => {
  const { title, description, image, url, redirectUrl } = opts;
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const img = escapeHtml(image);
  const u = escapeHtml(url);
  const r = escapeHtml(redirectUrl);
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${t}</title>
  <meta name="description" content="${d}"/>
  <link rel="canonical" href="${u}"/>

  <meta property="og:type" content="profile"/>
  <meta property="og:site_name" content="Pulpy"/>
  <meta property="og:title" content="${t}"/>
  <meta property="og:description" content="${d}"/>
  <meta property="og:url" content="${u}"/>
  <meta property="og:image" content="${img}"/>
  <meta property="og:image:secure_url" content="${img}"/>
  <meta property="og:image:type" content="image/svg+xml"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>

  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${t}"/>
  <meta name="twitter:description" content="${d}"/>
  <meta name="twitter:image" content="${img}"/>

  <meta http-equiv="refresh" content="0; url=${r}"/>
  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
  <style>body{font-family:system-ui,sans-serif;padding:40px;text-align:center;color:#333}</style>
</head>
<body>
  <p>Redirigiendo a <a href="${r}">${r}</a>…</p>
</body>
</html>`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const reqUrl = new URL(req.url);
    const usernameRaw = (reqUrl.searchParams.get("u") || "").trim().toLowerCase();
    const username = usernameRaw.replace(/^@/, "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const ogImageUrl = `${supabaseUrl}/functions/v1/og-image?u=${encodeURIComponent(username)}`;
    const canonical = username ? `${SITE}/${username}` : SITE;
    const redirect = canonical;

    const htmlHeaders = {
      ...corsHeaders,
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
    };

    if (!username || !/^[a-z0-9_-]{1,40}$/.test(username)) {
      return new Response(
        buildHtml({
          title: "Pulpy — Tu tarjeta digital en un enlace",
          description: "Crea tu perfil digital, reúne tus redes y compártelo con un solo enlace.",
          image: `${supabaseUrl}/functions/v1/og-image`,
          url: SITE,
          redirectUrl: SITE,
        }),
        { headers: htmlHeaders },
      );
    }

    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);

    const { data: profile } = await supabase
      .from("profiles")
      .select("username, full_name, title, company, bio, industry, card_style, is_suspended")
      .eq("username", username)
      .maybeSingle();

    if (!profile || profile.is_suspended) {
      return new Response(
        buildHtml({
          title: `@${username} — Pulpy`,
          description: "Este perfil de Pulpy no está disponible.",
          image: `${supabaseUrl}/functions/v1/og-image`,
          url: canonical,
          redirectUrl: redirect,
        }),
        { headers: htmlHeaders },
      );
    }

    const name = profile.full_name || `@${profile.username}`;
    const isCompany = profile.card_style === "company";
    const subtitle = isCompany
      ? profile.industry || ""
      : [profile.title, profile.company].filter(Boolean).join(" · ");

    const title = subtitle ? `${name} — ${subtitle}` : `${name} — Pulpy`;
    const description =
      truncate(profile.bio || "", 155) ||
      (isCompany
        ? `Conoce a ${name} en Pulpy. Contacto, redes y enlaces en un solo lugar.`
        : `Mira la tarjeta digital de ${name} en Pulpy: redes, contacto y enlaces en un solo lugar.`);

    return new Response(
      buildHtml({
        title: truncate(title, 70),
        description,
        image: ogImageUrl,
        url: canonical,
        redirectUrl: redirect,
      }),
      { headers: htmlHeaders },
    );
  } catch (err) {
    console.error("profile-meta error", err);
    return new Response(
      buildHtml({
        title: "Pulpy",
        description: "Tu tarjeta digital en un enlace.",
        image: `${Deno.env.get("SUPABASE_URL")}/functions/v1/og-image`,
        url: SITE,
        redirectUrl: SITE,
      }),
      { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } },
    );
  }
});
