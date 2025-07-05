import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Transaction } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, Crown, UserCheck, BarChart3 } from "lucide-react";

export default function AdminPage() {
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [usersData, transactionsData] = await Promise.all([
        User.list(),
        Transaction.list(),
      ]);

      const totalRevenue = transactionsData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      setPlatformStats({
        totalUsers: usersData.length,
        activeSubscriptions: usersData.filter(u => u.plan === 'premium' || u.plan === 'enterprise').length,
        totalRevenue,
        totalTransactions: transactionsData.length
      });
    } catch (error) {
      console.error("Erro ao carregar dados administrativos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-slate-50">
        <div className="text-center py-16">Carregando painel administrativo...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel Geral</h1>
            <p className="text-slate-600 mt-1">Visão geral da plataforma FinanceFlow.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total de Usuários</p>
                  <p className="text-3xl font-bold text-blue-900">{platformStats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Assinaturas Ativas</p>
                  <p className="text-3xl font-bold text-green-900">{platformStats.activeSubscriptions}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Receita Total</p>
                  <p className="text-2xl font-bold text-purple-900">R$ {platformStats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Total Transações</p>
                  <p className="text-3xl font-bold text-orange-900">{platformStats.totalTransactions}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center py-16 bg-white rounded-lg shadow-sm">
           <h2 className="text-xl font-semibold text-slate-700">Bem-vindo, Administrador!</h2>
           <p className="text-slate-500">Use o menu lateral para navegar entre as seções administrativas.</p>
        </div>
      </div>
    </div>
  );
}