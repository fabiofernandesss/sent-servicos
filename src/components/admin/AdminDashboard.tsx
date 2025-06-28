
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  totalProfissionais: number;
  profissionaisAtivos: number;
  totalDemandas: number;
  demandasPendentes: number;
  demandasPorMes: Array<{ mes: string; total: number }>;
  profissionaisPorEstado: Array<{ estado: string; total: number }>;
}

const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData>({
    totalProfissionais: 0,
    profissionaisAtivos: 0,
    totalDemandas: 0,
    demandasPendentes: 0,
    demandasPorMes: [],
    profissionaisPorEstado: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carregar dados dos profissionais
      const { data: profissionais, error: profissionaisError } = await supabase
        .from('profissionais')
        .select('id, desativado, estado');
      
      if (profissionaisError) throw profissionaisError;

      // Carregar dados das demandas
      const { data: demandas, error: demandasError } = await supabase
        .from('demandas')
        .select('id, status, created_at');
      
      if (demandasError) throw demandasError;

      // Processar dados dos profissionais
      const totalProfissionais = profissionais?.length || 0;
      const profissionaisAtivos = profissionais?.filter(p => !p.desativado).length || 0;

      // Agrupar profissionais por estado
      const profissionaisPorEstado = profissionais?.reduce((acc: any[], prof) => {
        const estado = prof.estado || 'Não informado';
        const existing = acc.find(item => item.estado === estado);
        if (existing) {
          existing.total += 1;
        } else {
          acc.push({ estado, total: 1 });
        }
        return acc;
      }, []).slice(0, 5) || []; // Top 5 estados

      // Processar dados das demandas
      const totalDemandas = demandas?.length || 0;
      const demandasPendentes = demandas?.filter(d => d.status === 'pendente').length || 0;

      // Agrupar demandas por mês
      const demandasPorMes = demandas?.reduce((acc: any[], demanda) => {
        const data = new Date(demanda.created_at);
        const mes = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        const existing = acc.find(item => item.mes === mes);
        if (existing) {
          existing.total += 1;
        } else {
          acc.push({ mes, total: 1 });
        }
        return acc;
      }, []).slice(-6) || []; // Últimos 6 meses

      setData({
        totalProfissionais,
        profissionaisAtivos,
        totalDemandas,
        demandasPendentes,
        demandasPorMes,
        profissionaisPorEstado
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    total: {
      label: "Total",
      color: "hsl(var(--primary))",
    },
  };

  const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return <div className="text-center py-8">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profissionais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalProfissionais}</div>
            <p className="text-xs text-muted-foreground">
              {data.profissionaisAtivos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Demandas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalDemandas}</div>
            <p className="text-xs text-muted-foreground">
              {data.demandasPendentes} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ativação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalProfissionais > 0 
                ? Math.round((data.profissionaisAtivos / data.totalProfissionais) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              profissionais ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.demandasPorMes[data.demandasPorMes.length - 1]?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              novas demandas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Demandas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.demandasPorMes}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profissionais por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.profissionaisPorEstado}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ estado, percent }) => `${estado} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                  >
                    {data.profissionaisPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
