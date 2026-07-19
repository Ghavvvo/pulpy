// Dynamic Open Graph image per profile (SVG 1200x630)
// URL: /og-image?u={username}
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeXml = (s: string) =>
  (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const truncate = (s: string, n: number) =>
  !s ? "" : s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";

const fallbackSvg = () => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3a1c71"/>
      <stop offset="50%" stop-color="#764ba2"/>
      <stop offset="100%" stop-color="#667eea"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="600" y="330" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-size="88" font-weight="800" fill="#fff" text-anchor="middle">Pulpy</text>
  <text x="600" y="390" font-family="system-ui,sans-serif" font-size="30" fill="#ffffffcc" text-anchor="middle">Tu tarjeta digital en un enlace</text>
</svg>`;

const buildSvg = (p: {
  name: string;
  subtitle: string;
  username: string;
  avatar?: string | null;
  coverImage?: string | null;
  coverColor?: string | null;
  bio?: string | null;
}) => {
  const useCoverImage = !!p.coverImage;
  const bgDef = useCoverImage
    ? `<pattern id="cover" patternUnits="userSpaceOnUse" width="1200" height="630">
         <image href="${escapeXml(p.coverImage!)}" x="0" y="0" width="1200" height="630" preserveAspectRatio="xMidYMid slice"/>
       </pattern>`
    : `<linearGradient id="cover" x1="0" y1="0" x2="1" y2="1">
         <stop offset="0%" stop-color="#3a1c71"/>
         <stop offset="60%" stop-color="#764ba2"/>
         <stop offset="100%" stop-color="#f093fb"/>
       </linearGradient>`;

  const avatarNode = p.avatar
    ? `<clipPath id="avatarClip"><circle cx="230" cy="315" r="150"/></clipPath>
       <circle cx="230" cy="315" r="158" fill="#fff"/>
       <image href="${escapeXml(p.avatar)}" x="80" y="165" width="300" height="300" clip-path="url(#avatarClip)" preserveAspectRatio="xMidYMid slice"/>`
    : `<circle cx="230" cy="315" r="150" fill="#ffffff33" stroke="#fff" stroke-width="6"/>
       <text x="230" y="345" font-family="system-ui,sans-serif" font-size="120" font-weight="800" fill="#fff" text-anchor="middle">${escapeXml((p.name || "?").charAt(0).toUpperCase())}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    ${bgDef}
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.75"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#cover)"/>
  <rect width="1200" height="630" fill="url(#scrim)"/>

  ${avatarNode}

  <g font-family="system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif" fill="#fff">
    <text x="430" y="255" font-size="66" font-weight="800">${escapeXml(truncate(p.name, 24))}</text>
    <text x="430" y="310" font-size="32" font-weight="500" fill="#ffffffdd">${escapeXml(truncate(p.subtitle, 42))}</text>
    <text x="430" y="365" font-size="26" font-weight="600" fill="#ffffffbb">pulpy.me/${escapeXml(truncate(p.username, 30))}</text>
    ${
      p.bio
        ? `<text x="430" y="430" font-size="24" font-weight="400" fill="#ffffffcc">${escapeXml(truncate(p.bio, 60))}</text>`
        : ""
    }
  </g>

  <g transform="translate(1030,540)">
    <rect x="0" y="0" rx="24" ry="24" width="140" height="52" fill="#ffffff" fill-opacity="0.15" stroke="#ffffff55" stroke-width="1"/>
    <text x="70" y="34" font-family="system-ui,sans-serif" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">Pulpy</text>
  </g>
</svg>`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const username = (url.searchParams.get("u") || "").trim().toLowerCase();

    const svgHeaders = {
      ...corsHeaders,
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=3600",
    };

    if (!username || !/^[a-z0-9_-]{1,40}$/.test(username)) {
      return new Response(fallbackSvg(), { headers: svgHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "username, full_name, title, company, bio, avatar_url, cover_type, cover_image_url, cover_color, industry, card_style, is_suspended",
      )
      .eq("username", username)
      .maybeSingle();

    if (!profile || profile.is_suspended) {
      return new Response(fallbackSvg(), { headers: svgHeaders });
    }

    const isCompany = profile.card_style === "company";
    const subtitle = isCompany
      ? profile.industry || ""
      : [profile.title, profile.company].filter(Boolean).join(" · ");

    const svg = buildSvg({
      name: profile.full_name || profile.username,
      subtitle,
      username: profile.username,
      avatar: profile.avatar_url,
      coverImage: profile.cover_type === "image" ? profile.cover_image_url : null,
      coverColor: profile.cover_color,
      bio: profile.bio,
    });

    return new Response(svg, { headers: svgHeaders });
  } catch (err) {
    console.error("og-image error", err);
    return new Response(fallbackSvg(), {
      headers: { ...corsHeaders, "Content-Type": "image/svg+xml; charset=utf-8" },
    });
  }
});
