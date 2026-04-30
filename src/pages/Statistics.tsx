import { useState } from "react";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  MousePointer,
  Users,
  TrendingUp,
  Link as LinkIcon,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileStats, StatsRange } from "@/hooks/useProfileStats";

const sourceLabels: Record<string, string> = {
  direct: "Directo",
  qr: "QR",
  nfc: "NFC",
  social: "Redes",
  search: "Búsqueda",
  referral: "Referido",
};

const deviceIcon = (d: string) => {
  if (d === "mobile") return <Smartphone className="w-4 h-4" />;
  if (d === "tablet") return <Tablet className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
};

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, var(--primary) / 0.7))",
  "hsl(var(--chart-3, var(--primary) / 0.5))",
  "hsl(var(--chart-4, var(--primary) / 0.3))",
];

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Hace unos segundos";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  return `Hace ${d} d`;
}

const Statistics = () => {
  const { user } = useAuth();
  const [range, setRange] = useState<StatsRange>("7d");
  const stats = useProfileStats(user?.id, range);

  const conversionLabel = `${stats.totals.conversionRate}%`;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Estadísticas</h1>
            <p className="text-muted-foreground mt-1">
              Datos reales de tu tarjeta digital{stats.loading ? " · cargando…" : ""}
            </p>
          </div>
          <Select value={range} onValueChange={(v) => setRange(v as StatsRange)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Visitas totales" value={stats.totals.views.toLocaleString()} icon={Eye} />
          <StatCard title="Clics en enlaces" value={stats.totals.clicks.toLocaleString()} icon={MousePointer} />
          <StatCard
            title="Visitantes únicos"
            value={stats.totals.uniqueVisitors.toLocaleString()}
            icon={Users}
          />
          <StatCard title="Tasa de conversión" value={conversionLabel} icon={TrendingUp} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Visitas y clics por día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      name="Visitas"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      name="Clics"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Top enlaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {stats.topLinks.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    Aún no hay clics en este período.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topLinks} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={90} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" name="Clics" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-4 h-4" /> Países
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topCountries.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
              ) : (
                <ul className="space-y-3">
                  {stats.topCountries.map((c) => (
                    <li key={c.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{c.name}</span>
                      <span className="text-sm text-muted-foreground">{c.value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Dispositivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                {stats.devices.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Sin datos</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.devices} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                        {stats.devices.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Fuentes de tráfico</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.sources.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
              ) : (
                <ul className="space-y-3">
                  {stats.sources.map((s) => (
                    <li key={s.name} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{sourceLabels[s.name] || s.name}</span>
                      <span className="text-sm text-muted-foreground">{s.value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aún no hay actividad. Comparte tu enlace para empezar a ver visitas.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recent.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        {a.type === "view" ? (
                          <Eye className="w-5 h-5 text-primary" />
                        ) : (
                          <LinkIcon className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-card-foreground truncate">{a.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {timeAgo(a.createdAt)}
                          {a.city || a.country ? ` · ${[a.city, a.country].filter(Boolean).join(", ")}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-full shrink-0">
                      {deviceIcon(a.device)}
                      <span className="text-xs text-muted-foreground capitalize">
                        {sourceLabels[a.source] || a.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Statistics;
