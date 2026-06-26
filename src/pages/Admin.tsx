import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users, Crown, Shield, ShieldOff, Ban, CheckCircle2, ExternalLink,
  Trash2, Eye, BarChart3, AlertTriangle, Calendar, Clock, Plus,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileRow {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_suspended: boolean | null;
  created_at: string;
}
interface SubRow {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  billing_cycle: string | null;
  payment_reference: string | null;
  start_date: string | null;
  end_date: string | null;
  updated_at: string | null;
}
interface RoleRow { user_id: string; role: "admin" | "user"; }

const Admin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const { user: me } = useAuth();

  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [views, setViews] = useState<number>(0);
  const [clicks, setClicks] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const refresh = async () => {
    setLoading(true);
    const [{ data: p }, { data: s }, { data: r }, { count: vc }, { count: cc }] = await Promise.all([
      supabase.from("profiles").select("id,username,full_name,avatar_url,is_suspended,created_at").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("*").order("updated_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
      supabase.from("profile_views").select("*", { count: "exact", head: true }),
      supabase.from("link_clicks").select("*", { count: "exact", head: true }),
    ]);
    let subsData = (s as SubRow[]) || [];

    // Auto-expiración: marcar como 'none/free' las activas cuyo end_date ya pasó
    const now = Date.now();
    const expired = subsData.filter(
      x => x.status === "active" && x.end_date && new Date(x.end_date).getTime() < now,
    );
    if (expired.length > 0) {
      await Promise.all(
        expired.map(x =>
          supabase.from("subscriptions").update({
            status: "none",
            plan: "free",
            updated_at: new Date().toISOString(),
          }).eq("id", x.id),
        ),
      );
      subsData = subsData.map(x =>
        expired.find(e => e.id === x.id)
          ? { ...x, status: "none", plan: "free" }
          : x,
      );
    }

    setProfiles((p as ProfileRow[]) || []);
    setSubs(subsData);
    setRoles((r as RoleRow[]) || []);
    setViews(vc || 0);
    setClicks(cc || 0);
    setLoading(false);
  };


  useEffect(() => { refresh(); }, []);

  const subByUser = useMemo(() => {
    const m: Record<string, SubRow> = {};
    subs.forEach(s => { m[s.user_id] = s; });
    return m;
  }, [subs]);

  const adminSet = useMemo(
    () => new Set(roles.filter(r => r.role === "admin").map(r => r.user_id)),
    [roles],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(p =>
      (p.username || "").toLowerCase().includes(q) ||
      (p.full_name || "").toLowerCase().includes(q),
    );
  }, [profiles, search]);

  // KPIs y alertas
  const total = profiles.length;
  const activeSubs = subs.filter(s => s.plan === "premium" && s.status === "active");
  const premium = activeSubs.length;
  const newWeek = profiles.filter(p => Date.now() - new Date(p.created_at).getTime() < 7 * 86400000).length;
  const pendingSubs = subs.filter(s => s.status === "pending");

  const daysLeft = (end?: string | null) => {
    if (!end) return null;
    return Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);
  };
  const expiringSoon = activeSubs.filter(s => {
    const d = daysLeft(s.end_date);
    return d !== null && d >= 0 && d <= 7;
  });


  // Actions
  const toggleAdmin = async (userId: string) => {
    const isA = adminSet.has(userId);
    if (isA) {
      if (userId === me?.id) {
        toast({ title: "No puedes quitarte el rol admin a ti mismo", variant: "destructive" });
        return;
      }
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    toast({ title: isA ? "Admin removido" : "Promovido a admin" });
    refresh();
  };

  const toggleSuspend = async (p: ProfileRow) => {
    const next = !p.is_suspended;
    const { error } = await supabase.from("profiles").update({ is_suspended: next }).eq("id", p.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: next ? "Perfil suspendido" : "Perfil reactivado" });
    refresh();
  };

  const deleteProfile = async (p: ProfileRow) => {
    if (!confirm(`¿Eliminar el perfil @${p.username}? Esta acción no borra la cuenta de auth.`)) return;
    const { error } = await supabase.from("profiles").delete().eq("id", p.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Perfil eliminado" });
    refresh();
  };

  const activateSub = async (
    sub: SubRow,
    days: number,
    cycle: "monthly" | "yearly" | "custom",
  ) => {
    const start = new Date().toISOString();
    const end = new Date(Date.now() + days * 86400000).toISOString();
    const { error } = await supabase.from("subscriptions").update({
      status: "active",
      plan: "premium",
      billing_cycle: cycle,
      start_date: start,
      end_date: end,
      updated_at: new Date().toISOString(),
    }).eq("id", sub.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: `Suscripción activada por ${days} días` });
    refresh();
  };

  const extendSub = async (sub: SubRow, days: number) => {
    const base = sub.end_date && new Date(sub.end_date).getTime() > Date.now()
      ? new Date(sub.end_date).getTime()
      : Date.now();
    const end = new Date(base + days * 86400000).toISOString();
    const { error } = await supabase.from("subscriptions").update({
      status: "active",
      plan: "premium",
      end_date: end,
      updated_at: new Date().toISOString(),
    }).eq("id", sub.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: `Extendida ${days} días` });
    refresh();
  };

  const deactivateSub = async (sub: SubRow) => {
    if (!confirm("¿Desactivar esta suscripción ahora?")) return;
    const { error } = await supabase.from("subscriptions").update({
      status: "none",
      plan: "free",
      end_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", sub.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Suscripción desactivada" });
    refresh();
  };

  const customExtend = async (sub: SubRow) => {
    const raw = prompt("¿Cuántos días añadir? (puede ser negativo para recortar)", "30");
    if (!raw) return;
    const days = parseInt(raw, 10);
    if (Number.isNaN(days) || days === 0) return;
    extendSub(sub, days);
  };


  const initials = (name?: string | null, fallback = "U") =>
    (name || fallback).split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-32 md:pt-24 pb-16">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Shield className="w-4 h-4" /> Panel de administración
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Administración</h1>
          <p className="text-muted-foreground mt-1">Gestiona usuarios, suscripciones y modera el contenido público.</p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })}>
          <TabsList className="rounded-full bg-muted/60 p-1">
            <TabsTrigger value="overview" className="rounded-full">Resumen</TabsTrigger>
            <TabsTrigger value="users" className="rounded-full">Usuarios</TabsTrigger>
            <TabsTrigger value="subs" className="rounded-full">
              Suscripciones {pendingSubs.length > 0 && <Badge className="ml-2" variant="secondary">{pendingSubs.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="moderation" className="rounded-full">Moderación</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon={<Users className="w-5 h-5" />} label="Usuarios totales" value={total} />
              <KpiCard icon={<Crown className="w-5 h-5 text-amber-500" />} label="Premium activos" value={premium} />
              <KpiCard icon={<AlertTriangle className="w-5 h-5 text-orange-500" />} label="Vencen ≤ 7 días" value={expiringSoon.length} />
              <KpiCard icon={<BarChart3 className="w-5 h-5" />} label="Visitas / clicks" value={`${views} / ${clicks}`} />
            </div>
            {expiringSoon.length > 0 && (
              <Card className="p-4 rounded-2xl border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-orange-900 dark:text-orange-200">
                      {expiringSoon.length} suscripción(es) próximas a vencer
                    </div>
                    <ul className="text-sm text-orange-800 dark:text-orange-300 mt-1 space-y-0.5">
                      {expiringSoon.slice(0, 5).map(s => {
                        const p = profiles.find(x => x.id === s.user_id);
                        return (
                          <li key={s.id}>
                            @{p?.username || s.user_id.slice(0, 8)} — vence en {daysLeft(s.end_date)} día(s)
                          </li>
                        );
                      })}
                    </ul>
                    <Button size="sm" variant="link" className="px-0 mt-1" onClick={() => setSearchParams({ tab: "subs" })}>
                      Ver todas →
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>


          {/* Users */}
          <TabsContent value="users" className="mt-6 space-y-4">
            <Input
              placeholder="Buscar por nombre o @username…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm rounded-full"
            />
            <Card className="rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Alta</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Cargando…</TableCell></TableRow>}
                  {!loading && filtered.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sin resultados</TableCell></TableRow>
                  )}
                  {filtered.map(p => {
                    const sub = subByUser[p.id];
                    const isA = adminSet.has(p.id);
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={p.avatar_url || undefined} />
                              <AvatarFallback>{initials(p.full_name, p.username || "U")}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{p.full_name || "—"}</div>
                              <div className="text-xs text-muted-foreground truncate">@{p.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {sub?.plan === "premium" && sub.status === "active" ? (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"><Crown className="w-3 h-3 mr-1" />Premium</Badge>
                          ) : (
                            <Badge variant="secondary">Free</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {isA ? <Badge><Shield className="w-3 h-3 mr-1" />Admin</Badge> : <span className="text-muted-foreground text-sm">user</span>}
                        </TableCell>
                        <TableCell>
                          {p.is_suspended ? <Badge variant="destructive">Suspendido</Badge> : <Badge variant="outline">Activo</Badge>}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(p.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            <Button asChild size="icon" variant="ghost" title="Ver perfil">
                              <Link to={`/${p.username}`} target="_blank"><ExternalLink className="w-4 h-4" /></Link>
                            </Button>
                            <Button size="icon" variant="ghost" title={isA ? "Quitar admin" : "Promover a admin"} onClick={() => toggleAdmin(p.id)}>
                              {isA ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                            </Button>
                            <Button size="icon" variant="ghost" title={p.is_suspended ? "Reactivar" : "Suspender"} onClick={() => toggleSuspend(p)}>
                              {p.is_suspended ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </Button>
                            <Button size="icon" variant="ghost" className="text-destructive" title="Eliminar perfil" onClick={() => deleteProfile(p)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Subscriptions */}
          <TabsContent value="subs" className="mt-6 space-y-4">
            {expiringSoon.length > 0 && (
              <Card className="p-3 rounded-xl border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900 flex items-center gap-2 text-sm text-orange-900 dark:text-orange-200">
                <AlertTriangle className="w-4 h-4" />
                {expiringSoon.length} suscripción(es) vencen en los próximos 7 días.
              </Card>
            )}
            <Card className="rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Plan / Ciclo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Período cubierto</TableHead>
                    <TableHead>Restan</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...pendingSubs, ...subs.filter(s => s.status !== "pending")].map(s => {
                    const p = profiles.find(x => x.id === s.user_id);
                    const d = daysLeft(s.end_date);
                    const isActive = s.status === "active";
                    const warn = isActive && d !== null && d >= 0 && d <= 7;
                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium">{p?.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">@{p?.username}</div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="capitalize">{s.plan}</div>
                          <div className="text-xs text-muted-foreground capitalize">{s.billing_cycle || "—"}</div>
                        </TableCell>
                        <TableCell>
                          {s.status === "pending" && <Badge variant="secondary">Pendiente</Badge>}
                          {s.status === "active" && <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Activa</Badge>}
                          {s.status === "none" && <Badge variant="outline">Inactiva</Badge>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {s.start_date ? (
                            <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(s.start_date).toLocaleDateString()}</div>
                          ) : <span>—</span>}
                          {s.end_date && (
                            <div className="flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{new Date(s.end_date).toLocaleDateString()}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {isActive && d !== null ? (
                            <Badge
                              variant={warn ? "destructive" : "outline"}
                              className={warn ? "" : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"}
                            >
                              {d} día{d === 1 ? "" : "s"}
                            </Badge>
                          ) : <span className="text-muted-foreground text-xs">—</span>}
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground truncate max-w-[140px]">{s.payment_reference || "—"}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline">Gestionar</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Activar / renovar</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => activateSub(s, 30, "monthly")}>
                                <Plus className="w-4 h-4 mr-2" /> Activar 30 días (mensual)
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => activateSub(s, 365, "yearly")}>
                                <Plus className="w-4 h-4 mr-2" /> Activar 365 días (anual)
                              </DropdownMenuItem>
                              {isActive && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>Extender vigencia</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => extendSub(s, 7)}>+ 7 días</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => extendSub(s, 30)}>+ 30 días</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => extendSub(s, 365)}>+ 365 días</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => customExtend(s)}>Personalizado…</DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deactivateSub(s)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Ban className="w-4 h-4 mr-2" /> Desactivar ahora
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {subs.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Sin suscripciones</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>


          {/* Moderation */}
          <TabsContent value="moderation" className="mt-6">
            <Card className="rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8"><AvatarImage src={p.avatar_url || undefined} /><AvatarFallback>{initials(p.full_name, p.username || "U")}</AvatarFallback></Avatar>
                          <div>
                            <div className="font-medium">{p.full_name || "—"}</div>
                            <div className="text-xs text-muted-foreground">@{p.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {p.is_suspended ? <Badge variant="destructive">Suspendido</Badge> : <Badge variant="outline">Visible</Badge>}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button asChild size="sm" variant="ghost"><Link to={`/${p.username}`} target="_blank"><Eye className="w-4 h-4 mr-1" />Ver</Link></Button>
                        <Button size="sm" variant={p.is_suspended ? "outline" : "destructive"} onClick={() => toggleSuspend(p)}>
                          {p.is_suspended ? "Reactivar" : "Suspender"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const KpiCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) => (
  <Card className="p-5 rounded-2xl">
    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">{icon}{label}</div>
    <div className="text-3xl font-bold">{value}</div>
  </Card>
);

export default Admin;
