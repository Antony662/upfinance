
import React, { useState, useEffect } from "react";
import { Transaction } from "@/api/entities";
import { Client } from "@/api/entities";
import { Quote } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, DollarSign, Users, FileText, TrendingUp, HandCoins, Building } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import StatsCard from "../components/dashboard/StatsCard";
import QuickActions from "../components/dashboard/QuickActions";
import { safeNumber, formatCurrency } from "../components/utils/safeNumbers"; // Updated import

export default function BusinessDashboard() {
  const [stats, setStats] = useState({ revenue: 0, costs: 0, profit: 0, clients: 0, quotes: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    setLoading(true);
    try {
      const [transactions, clients, quotes] = await Promise.all([
        Transaction.filter({ workspace: "business" }),
        Client.list(),
        Quote.list()
      ]);

      const revenue = transactions
        .filter(t => t && t.type === 'income')
        .reduce((sum, t) => sum + safeNumber(t.amount), 0);
      
      const costs = transactions
        .filter(t => t && t.type === 'expense')
        .reduce((sum, t) => sum + safeNumber(t.amount), 0);

      // Dados dos últimos 6 meses
      const last6Months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const monthTransactions = transactions.filter(t => {
          if (!t || !t.date) return false;
          try {
            const tDate = new Date(t.date);
            return tDate.getMonth() === month && tDate.getFullYear() === year;
          } catch {
            return false; // Invalid date, exclude transaction
          }
        });

        const monthRevenue = monthTransactions
          .filter(t => t && t.type === 'income')
          .reduce((sum, t) => sum + safeNumber(t.amount), 0);

        const monthCosts = monthTransactions
          .filter(t => t && t.type === 'expense')
          .reduce((sum, t) => sum + safeNumber(t.amount), 0);

        last6Months.push({
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          receita: safeNumber(monthRevenue),
          custos: safeNumber(monthCosts),
          lucro: safeNumber(monthRevenue - monthCosts)
        });
      }

      setStats({
        revenue: safeNumber(revenue),
        costs: safeNumber(costs),
        profit: safeNumber(revenue - costs),
        clients: clients.length || 0,
        quotes: quotes.filter(q => q && (q.status === 'sent' || q.status === 'draft')).length || 0
      });
      
      setRecentTransactions(Array.isArray(transactions) ? transactions.slice(0, 5) : []);
      setMonthlyData(last6Months);
    } catch (error) {
      console.error("Erro ao carregar dados do negócio:", error);
      // Reset states to default safe values in case of error
      setStats({ revenue: 0, costs: 0, profit: 0, clients: 0, quotes: 0 });
      setRecentTransactions([]);
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "new-transaction":
        window.location.href = "/BusinessTransactions";
        break;
      case "new-client":
        window.location.href = "/Clients";
        break;
      case "new-quote":
        window.location.href = "/Quotes";
        break;
      case "new-employee":
        window.location.href = "/Employees";
        break;
      case "new-meeting":
        window.location.href = "/BusinessCalendar";
        break;
      case "quick-report":
        window.location.href = "/BusinessReports";
        break;
      default:
        console.log("Ação não implementada:", action);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-slate-50">
        <div className="text-center py-16">Carregando dados do negócio...</div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Dashboard Empresarial</h1>
              <p className="text-slate-600 mt-1">A saúde financeira do seu negócio em um só lugar.</p>
            </div>
          </div>
          {/* Removed direct "Novo Lançamento" button, now handled by QuickActions */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCard
            title="Faturamento"
            value={stats.revenue.toFixed(2)}
            prefix="R$ "
            icon={TrendingUp}
            color="bg-green-500"
            changeType="positive"
            change="+15.3%"
          />
          <StatsCard
            title="Custos"
            value={stats.costs.toFixed(2)}
            prefix="R$ "
            icon={DollarSign}
            color="bg-red-500"
            changeType="negative"
            change="-8.2%"
          />
          <StatsCard
            title="Lucro Líquido"
            value={stats.profit.toFixed(2)}
            prefix="R$ "
            icon={HandCoins}
            color={stats.profit >= 0 ? "bg-blue-500" : "bg-red-500"}
            changeType={stats.profit >= 0 ? "positive" : "negative"}
            change={stats.profit >= 0 ? "+22.1%" : "-12.4%"}
          />
          <StatsCard
            title="Clientes Ativos"
            value={stats.clients}
            icon={Users}
            color="bg-purple-500"
          />
          <StatsCard
            title="Orçamentos Pendentes"
            value={stats.quotes}
            icon={FileText}
            color="bg-orange-500"
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Evolução Financeira</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, '']} />
                  <Line type="monotone" dataKey="receita" stroke="#10b981" strokeWidth={3} name="Receita" />
                  <Line type="monotone" dataKey="custos" stroke="#ef4444" strokeWidth={3} name="Custos" />
                  <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={3} name="Lucro" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Comparativo Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, '']} />
                  <Bar dataKey="receita" fill="#10b981" name="Receita" />
                  <Bar dataKey="custos" fill="#ef4444" name="Custos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActions 
            workspace="business" 
            onAction={handleQuickAction}
          />
          
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>Nenhuma atividade recente</p>
                  <p className="text-sm">Adicione transações para ver a atividade aqui</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-slate-500">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.type === 'income' ? '+' : '-'}R$ {safeNumber(transaction.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
