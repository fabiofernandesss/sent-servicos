
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Users, Package, FileText, Settings, ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminSession } from '@/hooks/useAdminSession';
import AdminLogin from '@/components/admin/AdminLogin';
import CategoriasAdmin from '@/components/admin/CategoriasAdmin';
import SubcategoriasAdmin from '@/components/admin/SubcategoriasAdmin';
import ProfissionaisAdmin from '@/components/admin/ProfissionaisAdmin';
import DemandasAdmin from '@/components/admin/DemandasAdmin';
import EquipamentosAdmin from '@/components/admin/EquipamentosAdmin';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdminLoggedIn, loading, loginAdmin, logoutAdmin } = useAdminSession();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <AdminLogin onLogin={loginAdmin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-gray-600">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <Database className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logoutAdmin} className="text-red-600">
              <LogOut className="h-4 w-4 mr-1" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="categorias" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="categorias" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="subcategorias" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Subcategorias
            </TabsTrigger>
            <TabsTrigger value="profissionais" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Profissionais
            </TabsTrigger>
            <TabsTrigger value="demandas" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Demandas
            </TabsTrigger>
            <TabsTrigger value="equipamentos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Equipamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categorias">
            <CategoriasAdmin />
          </TabsContent>

          <TabsContent value="subcategorias">
            <SubcategoriasAdmin />
          </TabsContent>

          <TabsContent value="profissionais">
            <ProfissionaisAdmin />
          </TabsContent>

          <TabsContent value="demandas">
            <DemandasAdmin />
          </TabsContent>

          <TabsContent value="equipamentos">
            <EquipamentosAdmin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
