import { supabase } from "./supabase";

/**
 * Tracking de visitas y clics en perfiles públicos.
 *
 * Tablas requeridas en Supabase (RLS: insert público, select solo dueño):
 *  - profile_views (id, profile_id, username, source, country, city,
 *                   device, browser, os, referrer, user_agent, created_at)
 *  - link_clicks   (id, profile_id, username, link_id, platform, label, url,
 *                   source, country, city, device, browser, os, referrer,
 *                   user_agent, created_at)
 */

type Source = "qr" | "direct" | "social" | "search" | "referral" | "nfc";

interface GeoInfo {
  country: string | null;
  city: string | null;
}

interface UAInfo {
  device: "mobile" | "tablet" | "desktop";
  browser: string;
  os: string;
}

let cachedGeo: GeoInfo | null = null;
let geoPromise: Promise<GeoInfo> | null = null;

/** Resuelve país/ciudad del visitante usando ipapi.co (gratis, sin API key). */
async function getGeo(): Promise<GeoInfo> {
  if (cachedGeo) return cachedGeo;
  if (geoPromise) return geoPromise;

  geoPromise = (async () => {
    try {
      const res = await fetch("https://ipapi.co/json/", { method: "GET" });
      if (!res.ok) throw new Error("geo failed");
      const data = await res.json();
      cachedGeo = {
        country: data.country_name || data.country || null,
        city: data.city || null,
      };
      return cachedGeo;
    } catch {
      cachedGeo = { country: null, city: null };
      return cachedGeo;
    }
  })();

  return geoPromise;
}

/** Parser ligero de user-agent. */
function parseUA(ua: string): UAInfo {
  const u = ua.toLowerCase();

  let device: UAInfo["device"] = "desktop";
  if (/ipad|tablet/.test(u)) device = "tablet";
  else if (/mobi|android|iphone|ipod/.test(u)) device = "mobile";

  let browser = "Other";
  if (/edg\//.test(u)) browser = "Edge";
  else if (/chrome\//.test(u) && !/edg|opr/.test(u)) browser = "Chrome";
  else if (/firefox\//.test(u)) browser = "Firefox";
  else if (/safari\//.test(u) && !/chrome/.test(u)) browser = "Safari";
  else if (/opr\/|opera/.test(u)) browser = "Opera";

  let os = "Other";
  if (/windows/.test(u)) os = "Windows";
  else if (/android/.test(u)) os = "Android";
  else if (/iphone|ipad|ipod|ios/.test(u)) os = "iOS";
  else if (/mac os|macintosh/.test(u)) os = "macOS";
  else if (/linux/.test(u)) os = "Linux";

  return { device, browser, os };
}

/** Determina la fuente a partir del referrer y query string. */
function detectSource(): Source {
  const params = new URLSearchParams(window.location.search);
  const utm = params.get("utm_source") || params.get("src");
  if (utm) {
    const v = utm.toLowerCase();
    if (v.includes("qr")) return "qr";
    if (v.includes("nfc")) return "nfc";
    if (["instagram", "facebook", "twitter", "x", "tiktok", "linkedin"].some((s) => v.includes(s))) return "social";
    return "referral";
  }

  const ref = document.referrer;
  if (!ref) return "direct";

  try {
    const host = new URL(ref).hostname.toLowerCase();
    if (/google|bing|duckduckgo|yandex/.test(host)) return "search";
    if (/instagram|facebook|twitter|x\.com|tiktok|linkedin|t\.co/.test(host)) return "social";
    return "referral";
  } catch {
    return "direct";
  }
}

async function buildContext() {
  const ua = navigator.userAgent;
  const { device, browser, os } = parseUA(ua);
  const geo = await getGeo();
  return {
    source: detectSource(),
    country: geo.country,
    city: geo.city,
    device,
    browser,
    os,
    referrer: document.referrer || null,
    user_agent: ua,
  };
}

/** Evita doble registro durante navegaciones SPA en la misma sesión. */
const viewKey = (username: string) => `pulpy_v_${username}`;

export async function trackProfileView(profileId: string, username: string) {
  try {
    if (sessionStorage.getItem(viewKey(username))) return;
    sessionStorage.setItem(viewKey(username), "1");

    const ctx = await buildContext();
    await supabase.from("profile_views").insert({
      profile_id: profileId,
      username,
      ...ctx,
    });
  } catch (err) {
    // No interrumpir UX si falla el tracking
    console.warn("[tracking] view failed", err);
  }
}

export async function trackLinkClick(params: {
  profileId: string;
  username: string;
  linkId: string;
  platform: string;
  label: string;
  url: string;
}) {
  try {
    const ctx = await buildContext();
    await supabase.from("link_clicks").insert({
      profile_id: params.profileId,
      username: params.username,
      link_id: params.linkId,
      platform: params.platform,
      label: params.label,
      url: params.url,
      ...ctx,
    });
  } catch (err) {
    console.warn("[tracking] click failed", err);
  }
}
