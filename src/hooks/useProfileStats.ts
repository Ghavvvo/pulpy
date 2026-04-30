import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type StatsRange = "7d" | "30d" | "90d";

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  label: string; // Lun, Mar...
  visits: number;
  clicks: number;
}

export interface NamedCount {
  name: string;
  value: number;
}

export interface RecentActivity {
  id: string;
  type: "view" | "click";
  label: string; // platform / "Visita"
  source: string;
  country: string | null;
  city: string | null;
  device: string;
  createdAt: string;
}

export interface StatsData {
  loading: boolean;
  totals: {
    views: number;
    clicks: number;
    uniqueVisitors: number;
    conversionRate: number; // clicks / views * 100
  };
  daily: DailyPoint[];
  topLinks: NamedCount[];
  topCountries: NamedCount[];
  devices: NamedCount[];
  sources: NamedCount[];
  recent: RecentActivity[];
}

const rangeToDays: Record<StatsRange, number> = { "7d": 7, "30d": 30, "90d": 90 };

const dayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function startDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function tally<T>(rows: T[], key: (r: T) => string | null | undefined, limit = 8): NamedCount[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = (key(r) || "Desconocido").toString();
    map.set(k, (map.get(k) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function buildDaily(views: any[], clicks: any[], days: number): DailyPoint[] {
  const buckets = new Map<string, { v: number; c: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { v: 0, c: 0 });
  }
  for (const r of views) {
    const k = (r.created_at as string).slice(0, 10);
    const b = buckets.get(k);
    if (b) b.v++;
  }
  for (const r of clicks) {
    const k = (r.created_at as string).slice(0, 10);
    const b = buckets.get(k);
    if (b) b.c++;
  }
  return Array.from(buckets.entries()).map(([date, { v, c }]) => {
    const dt = new Date(date + "T00:00:00");
    return {
      date,
      label: days <= 7 ? dayLabels[dt.getDay()] : `${dt.getDate()}/${dt.getMonth() + 1}`,
      visits: v,
      clicks: c,
    };
  });
}

export function useProfileStats(profileId: string | undefined, range: StatsRange): StatsData {
  const [data, setData] = useState<StatsData>({
    loading: true,
    totals: { views: 0, clicks: 0, uniqueVisitors: 0, conversionRate: 0 },
    daily: [],
    topLinks: [],
    topCountries: [],
    devices: [],
    sources: [],
    recent: [],
  });

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;

    const load = async () => {
      setData((d) => ({ ...d, loading: true }));
      const days = rangeToDays[range];
      const since = startDate(days);

      const [viewsRes, clicksRes] = await Promise.all([
        supabase
          .from("profile_views")
          .select("id, source, country, city, device, browser, os, user_agent, created_at")
          .eq("profile_id", profileId)
          .gte("created_at", since)
          .order("created_at", { ascending: false }),
        supabase
          .from("link_clicks")
          .select("id, platform, label, source, country, city, device, created_at")
          .eq("profile_id", profileId)
          .gte("created_at", since)
          .order("created_at", { ascending: false }),
      ]);

      if (cancelled) return;

      const views = viewsRes.data || [];
      const clicks = clicksRes.data || [];

      const uniqueVisitors = new Set(views.map((v: any) => v.user_agent || v.id)).size;
      const totalViews = views.length;
      const totalClicks = clicks.length;
      const conversion = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

      const recent: RecentActivity[] = [
        ...views.slice(0, 10).map((v: any) => ({
          id: `v-${v.id}`,
          type: "view" as const,
          label: "Visita al perfil",
          source: v.source || "direct",
          country: v.country,
          city: v.city,
          device: v.device || "desktop",
          createdAt: v.created_at,
        })),
        ...clicks.slice(0, 10).map((c: any) => ({
          id: `c-${c.id}`,
          type: "click" as const,
          label: c.label || c.platform || "Enlace",
          source: c.source || "direct",
          country: c.country,
          city: c.city,
          device: c.device || "desktop",
          createdAt: c.created_at,
        })),
      ]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 12);

      setData({
        loading: false,
        totals: {
          views: totalViews,
          clicks: totalClicks,
          uniqueVisitors,
          conversionRate: Math.round(conversion * 10) / 10,
        },
        daily: buildDaily(views, clicks, days),
        topLinks: tally(clicks, (c: any) => c.label || c.platform),
        topCountries: tally(views, (v: any) => v.country),
        devices: tally(views, (v: any) => v.device, 4),
        sources: tally(views, (v: any) => v.source, 6),
        recent,
      });
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [profileId, range]);

  return data;
}
