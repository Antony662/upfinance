
import React, { useState, useEffect } from "react";
import { Transaction } from "@/api/entities";
import { Goal } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Download, Calendar, TrendingUp, DollarSign, FileText, Heart, Target } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CoupleReportsPage() {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("3months");

  useEffect(() => {
    loadData();
  }, [selectedPeriod]); // Add selectedPeriod to dependency array to re-load data when period changes

  const loadData = async () => {
    setLoading(true);
    try {
      const [transactionsData, goalsData] = await Promise.all([
        Transaction.filter({ workspace: "couple" }),
        Goal.filter({ workspace: "couple" })
      ]);
      setTransactions(transactionsData);
      setGoals(goalsData);
    } catch (error) {
      console.error("Erro ao carregar dados do casal:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthlyReport = () => {
    const months = [];
    const numMonths = selectedPeriod === "6months" ? 6 : selectedPeriod === "12months" ? 12 : 3;
    
    for (let i = numMonths - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        month: format(date, "MMM/yy", { locale: ptBR }),
        receitas: income,
        despesas: expenses,
        saldo: income - expenses
      });
    }
    return months;
  };

  const getCategoryBreakdown = () => {
    const currentPeriodStart = subMonths(new Date(), selectedPeriod === "6months" ? 6 : selectedPeriod === "12months" ? 12 : 3);
    
    const expenses = transactions.filter(t => 
      t.type === "expense" && new Date(t.date) >= currentPeriodStart
    );
    const categoryTotals = {};
    
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ name: category, value: amount }))
      .sort((a, b) => b.value - a.value);
  };
  
  // Memoize these calculations to only re-run when dependencies change
  const monthlyData = React.useMemo(() => getMonthlyReport(), [transactions, selectedPeriod]);
  const categoryData = React.useMemo(() => getCategoryBreakdown(), [transactions, selectedPeriod]);

  const summaryStats = React.useMemo(() => {
    const stats = monthlyData.reduce((acc, month) => {
      acc.totalIncome += month.receitas;
      acc.totalExpenses += month.despesas;
      return acc;
    }, { totalIncome: 0, totalExpenses: 0 });

    stats.netBalance = stats.totalIncome - stats.totalExpenses;
    stats.activeGoals = goals.filter(g => g.status === 'active').length;
    return stats;
  }, [monthlyData, goals]);

  const COLORS = ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#db2777', '#c026d3', '#a21caf', '#86198f', '#701a75', '#5b21b6'];

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-slate-50">
        <div className="text-center py-16 text-slate-700">Carregando relatórios do casal...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Relatórios do Casal</h1>
              <p className="text-slate-600 mt-1">Análise detalhada das finanças conjuntas.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="12months">Últimos 12 meses</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Receita Total</p>
                  <p className="text-2xl font-bold text-green-900">
                    R$ {summaryStats.totalIncome.toFixed(2)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">Despesas Total</p>
                  <p className="text-2xl font-bold text-red-900">
                    R$ {summaryStats.totalExpenses.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-pink-50 to-pink-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-pink-700 font-medium">Saldo Conjunto</p>
                  <p className={`text-2xl font-bold ${summaryStats.netBalance >= 0 ? 'text-pink-900' : 'text-red-900'}`}>
                    R$ {summaryStats.netBalance.toFixed(2)}
                  </p>
                </div>
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Metas Ativas</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {summaryStats.activeGoals}
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `R$ ${value.toFixed(0)}`} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      formatter={(value, name) => [`R$ ${value.toFixed(2)}`, name === 'receitas' ? 'Receitas' : 'Despesas']} 
                    />
                    <Bar dataKey="receitas" fill="#10b981" name="Receitas" barSize={30} />
                    <Bar dataKey="despesas" fill="#ef4444" name="Despesas" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-500 py-10">Nenhum dado de evolução mensal encontrado para o período.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Gastos Conjuntos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData.slice(0, 5)} // Show top 5 categories
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-500 py-10">Nenhum gasto por categoria encontrado para o período.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
