import { useParams } from "react-router-dom";
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
import { Eye, MousePointer, Users, TrendingUp, Link as LinkIcon } from "lucide-react";
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
} from "recharts";

const Statistics = () => {
  const viewsData = [
    { name: "Lun", visits: 45 },
    { name: "Mar", visits: 52 },
    { name: "Mié", visits: 38 },
    { name: "Jue", visits: 65 },
    { name: "Vie", visits: 78 },
    { name: "Sáb", visits: 42 },
    { name: "Dom", visits: 35 },
  ];

  const linkClicks = [
    { name: "LinkedIn", clicks: 234, color: "hsl(var(--chart-1))" },
    { name: "Twitter", clicks: 156, color: "hsl(var(--chart-2))" },
    { name: "Instagram", clicks: 189, color: "hsl(var(--chart-3))" },
    { name: "Website", clicks: 98, color: "hsl(var(--chart-4))" },
  ];

  const recentVisitors = [
    { name: "Visitante anónimo", time: "Hace 5 min", source: "QR Code" },
    { name: "Visitante anónimo", time: "Hace 15 min", source: "Link directo" },
    { name: "Visitante anónimo", time: "Hace 32 min", source: "NFC" },
    { name: "Visitante anónimo", time: "Hace 1 hora", source: "QR Code" },
    { name: "Visitante anónimo", time: "Hace 2 horas", source: "Link directo" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Estadísticas
            </h1>
            <p className="text-muted-foreground mt-1">
              Analiza el rendimiento de tu tarjeta digital
            </p>
          </div>
          <Select defaultValue="7d">
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Visitas totales"
            value="1,247"
            change="+12.5%"
            changeType="positive"
            icon={Eye}
          />
          <StatCard
            title="Clics en enlaces"
            value="677"
            change="+8.2%"
            changeType="positive"
            icon={MousePointer}
          />
          <StatCard
            title="Visitantes únicos"
            value="892"
            change="+5.1%"
            changeType="positive"
            icon={Users}
          />
          <StatCard
            title="Tasa de conversión"
            value="54.3%"
            change="-2.3%"
            changeType="negative"
            icon={TrendingUp}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Views Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Visitas por día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Link Clicks Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Clics por enlace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={linkClicks} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar 
                      dataKey="clicks" 
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Visitors */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVisitors.map((visitor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{visitor.name}</p>
                      <p className="text-sm text-muted-foreground">{visitor.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-full">
                    <LinkIcon className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{visitor.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Statistics;
