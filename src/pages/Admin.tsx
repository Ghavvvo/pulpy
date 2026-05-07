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
  Trash2, Eye, BarChart3,
} from "lucide-react";
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
    setProfiles((p as ProfileRow[]) || []);
    setSubs((s as SubRow[]) || []);
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

  // KPIs
  const total = profiles.length;
  const premium = subs.filter(s => s.plan === "premium" && s.status === "active").length;
  const newWeek = profiles.filter(p => Date.now() - new Date(p.created_at).getTime() < 7 * 86400000).length;
  const pendingSubs = subs.filter(s => s.status === "pending");

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

  const setSubStatus = async (
    sub: SubRow,
    status: "active" | "none",
    plan: "premium" | "free",
  ) => {
    const start = status === "active" ? new Date().toISOString() : null;
    const end = status === "active"
      ? new Date(Date.now() + (sub.billing_cycle === "yearly" ? 365 : 30) * 86400000).toISOString()
      : null;
    const { error } = await supabase.from("subscriptions").update({
      status, plan, start_date: start, end_date: end, updated_at: new Date().toISOString(),
    }).eq("id", sub.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Suscripción actualizada" });
    refresh();
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
          <TabsContent value="overview" className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={<Users className="w-5 h-5" />} label="Usuarios totales" value={total} />
            <KpiCard icon={<Crown className="w-5 h-5 text-amber-500" />} label="Premium activos" value={premium} />
            <KpiCard icon={<Users className="w-5 h-5" />} label="Nuevos (7 días)" value={newWeek} />
            <KpiCard icon={<BarChart3 className="w-5 h-5" />} label="Visitas / clicks" value={`${views} / ${clicks}`} />
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
          <TabsContent value="subs" className="mt-6">
            <Card className="rounded-2xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Ciclo</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...pendingSubs, ...subs.filter(s => s.status !== "pending")].map(s => {
                    const p = profiles.find(x => x.id === s.user_id);
                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="font-medium">{p?.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">@{p?.username}</div>
                        </TableCell>
                        <TableCell>{s.plan}</TableCell>
                        <TableCell>
                          {s.status === "pending" && <Badge variant="secondary">Pendiente</Badge>}
                          {s.status === "active" && <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Activa</Badge>}
                          {s.status === "none" && <Badge variant="outline">—</Badge>}
                        </TableCell>
                        <TableCell className="text-sm">{s.billing_cycle || "—"}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground truncate max-w-[160px]">{s.payment_reference || "—"}</TableCell>
                        <TableCell className="text-right space-x-1">
                          {s.status !== "active" && (
                            <Button size="sm" onClick={() => setSubStatus(s, "active", "premium")}>Aprobar</Button>
                          )}
                          {s.status === "active" && (
                            <Button size="sm" variant="outline" onClick={() => setSubStatus(s, "none", "free")}>Cancelar</Button>
                          )}
                          {s.status === "pending" && (
                            <Button size="sm" variant="ghost" onClick={() => setSubStatus(s, "none", "free")}>Rechazar</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {subs.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Sin suscripciones</TableCell></TableRow>
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
