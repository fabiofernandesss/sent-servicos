
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { Users, FileText, TrendingUp, Calendar, DollarSign, MapPin, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardData {
  totalProfissionais: number;
  profissionaisAtivos: number;
  totalDemandas: number;
  demandasPendentes: number;
  demandasConcluidas: number;
  valorTotalSaldos: number;
  mediaValorDiaria: number;
  cidadesMaisAtivas: Array<{ cidade: string; total: number }>;
  demandasPorMes: Array<{ mes: string; total: number }>;
  profissionaisPorEstado: Array<{ estado: string; total: number }>;
  evolucaoMensal: Array<{ mes: string; profissionais: number; demandas: number }>;
  statusDemandas: Array<{ status: string; total: number }>;
}

const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData>({
    totalProfissionais: 0,
    profissionaisAtivos: 0,
    totalDemandas: 0,
    demandasPendentes: 0,
    demandasConcluidas: 0,
    valorTotalSaldos: 0,
    mediaValorDiaria: 0,
    cidadesMaisAtivas: [],
    demandasPorMes: [],
    profissionaisPorEstado: [],
    evolucaoMensal: [],
    statusDemandas: []
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
        .select('id, desativado, estado, cidade, saldo, valor_diaria, created_at');
      
      if (profissionaisError) throw profissionaisError;

      // Carregar dados das demandas
      const { data: demandas, error: demandasError } = await supabase
        .from('demandas')
        .select('id, status, created_at, cidade');
      
      if (demandasError) throw demandasError;

      // Processar dados dos profissionais
      const totalProfissionais = profissionais?.length || 0;
      const profissionaisAtivos = profissionais?.filter(p => !p.desativado).length || 0;
      const valorTotalSaldos = profissionais?.reduce((sum, p) => sum + (p.saldo || 0), 0) || 0;
      const mediaValorDiaria = profissionais?.length > 0 
        ? profissionais.reduce((sum, p) => sum + (p.valor_diaria || 0), 0) / profissionais.length 
        : 0;

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
      }, []).slice(0, 5) || [];

      // Cidades mais ativas (profissionais)
      const cidadesMaisAtivas = profissionais?.reduce((acc: any[], prof) => {
        const cidade = prof.cidade || 'Não informado';
        const existing = acc.find(item => item.cidade === cidade);
        if (existing) {
          existing.total += 1;
        } else {
          acc.push({ cidade, total: 1 });
        }
        return acc;
      }, []).sort((a, b) => b.total - a.total).slice(0, 5) || [];

      // Processar dados das demandas
      const totalDemandas = demandas?.length || 0;
      const demandasPendentes = demandas?.filter(d => d.status === 'pendente').length || 0;
      const demandasConcluidas = demandas?.filter(d => d.status === 'concluida').length || 0;

      // Status das demandas
      const statusDemandas = demandas?.reduce((acc: any[], demanda) => {
        const status = demanda.status || 'pendente';
        const existing = acc.find(item => item.status === status);
        if (existing) {
          existing.total += 1;
        } else {
          acc.push({ status, total: 1 });
        }
        return acc;
      }, []) || [];

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
      }, []).slice(-6) || [];

      // Evolução mensal (profissionais e demandas)
      const evolucaoMensal = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        const mes = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        
        const profissionaisMes = profissionais?.filter(p => {
          const profDate = new Date(p.created_at);
          return profDate.getMonth() === date.getMonth() && profDate.getFullYear() === date.getFullYear();
        }).length || 0;
        
        const demandasMes = demandas?.filter(d => {
          const demandaDate = new Date(d.created_at);
          return demandaDate.getMonth() === date.getMonth() && demandaDate.getFullYear() === date.getFullYear();
        }).length || 0;
        
        return { mes, profissionais: profissionaisMes, demandas: demandasMes };
      });

      setData({
        totalProfissionais,
        profissionaisAtivos,
        totalDemandas,
        demandasPendentes,
        demandasConcluidas,
        valorTotalSaldos,
        mediaValorDiaria,
        cidadesMaisAtivas,
        demandasPorMes,
        profissionaisPorEstado,
        evolucaoMensal,
        statusDemandas
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
      color: "#1E486F",
    },
    profissionais: {
      label: "Profissionais",
      color: "#1E486F",
    },
    demandas: {
      label: "Demandas",
      color: "#DC2626",
    },
  };

  const pieColors = ['#1E486F', '#DC2626', '#059669', '#D97706', '#7C3AED'];

  if (loading) {
    return <div className="text-center py-8">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo - Primeira linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profissionais</CardTitle>
            <Users className="h-4 w-4 text-[#1E486F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1E486F]">{data.totalProfissionais}</div>
            <p className="text-xs text-muted-foreground">
              {data.profissionaisAtivos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Demandas</CardTitle>
            <FileText className="h-4 w-4 text-[#DC2626]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#DC2626]">{data.totalDemandas}</div>
            <p className="text-xs text-muted-foreground">
              {data.demandasPendentes} pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ativação</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
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
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {data.valorTotalSaldos.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              em saldos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Resumo - Segunda linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandas Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{data.demandasConcluidas}</div>
            <p className="text-xs text-muted-foreground">
              finalizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.demandasPendentes}</div>
            <p className="text-xs text-muted-foreground">
              aguardando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Valor Diária</CardTitle>
            <DollarSign className="h-4 w-4 text-[#1E486F]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1E486F]">
              R$ {data.mediaValorDiaria.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              valor médio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-[#DC2626]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#DC2626]">
              {data.demandasPorMes[data.demandasPorMes.length - 1]?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              novas demandas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Primeira linha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1E486F]">Demandas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.demandasPorMes}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="#DC2626" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#1E486F]">Profissionais por Estado</CardTitle>
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

      {/* Gráficos - Segunda linha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1E486F]">Evolução Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.evolucaoMensal}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="profissionais" stroke="#1E486F" strokeWidth={2} />
                  <Line type="monotone" dataKey="demandas" stroke="#DC2626" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#1E486F]">Status das Demandas</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.statusDemandas}>
                  <XAxis dataKey="status" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="total" stroke="#1E486F" fill="#1E486F" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
