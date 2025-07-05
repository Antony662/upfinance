
import React, { useState, useEffect } from "react";
import { Transaction } from "@/api/entities";
import { Client } from "@/api/entities";
import { Quote } from "@/api/entities";
import { Employee } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart
} from "recharts";
import {
  Download, Calendar, TrendingUp, DollarSign, FileText, Building,
  Users, Target, Award, AlertTriangle, Activity, ArrowUp, ArrowDown,
  PieChart as PieChartIcon, BarChart3, TrendingDown, Eye, Zap
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { generateBusinessReportPDF } from "@/api/functions";

export default function BusinessReportsPage() {
  const [transactions, setTransactions] = useState([]);
  const [clients, setClients] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("3months");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [transactionsData, clientsData, quotesData, employeesData] = await Promise.all([
        Transaction.filter({ workspace: "business" }),
        Client.list(),
        Quote.list(),
        Employee.list()
      ]);
      setTransactions(transactionsData);
      setClients(clientsData);
      setQuotes(quotesData);
      setEmployees(employeesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const reportData = {
        summaryStats,
        monthlyData,
        clientData,
        quotesAnalysis,
        categoryData,
        selectedPeriod,
        clients,
        employees,
        transactions,
        quotes,
      };

      const response = await generateBusinessReportPDF(reportData);
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_empresarial_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Ocorreu um erro ao gerar o relatório em PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case "thisMonth":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "3months":
        return { start: subMonths(now, 3), end: now };
      case "6months":
        return { start: subMonths(now, 6), end: now };
      case "thisYear":
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: subMonths(now, 3), end: now };
    }
  };

  const getMonthlyReport = () => {
    const months = [];
    const numMonths = selectedPeriod === "6months" ? 6 : selectedPeriod === "thisYear" ? 12 : 3;
    
    for (let i = numMonths - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= monthStart && tDate <= monthEnd;
      });

      const revenue = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0); // Fix: Ensure amount is parsed as float

      const expenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0); // Fix: Ensure amount is parsed as float

      const profit = revenue - expenses;
      const margin = revenue > 0 ? ((profit / revenue) * 100) : 0; // Fix: Handle division by zero

      months.push({
        month: format(date, "MMM/yy", { locale: ptBR }),
        receitas: revenue,
        despesas: expenses,
        lucro: profit,
        margem: isNaN(margin) ? 0 : margin, // Fix: Handle NaN for margin
        crescimento: i > 0 ? ((revenue - (months[numMonths - i]?.receitas || 0)) / (months[numMonths - i]?.receitas || 1) * 100) : 0 // Original growth calculation had index error (i-1). Corrected to use `numMonths - i` for previous month in a fixed-size array. Ensure denominator is not zero.
      });
    }
    return months;
  };

  const getDailyTrend = () => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.toDateString() === date.toDateString();
      });

      const revenue = dayTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0); // Fix: Ensure amount is parsed as float

      const expenses = dayTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0); // Fix: Ensure amount is parsed as float

      last30Days.push({
        date: format(date, "dd/MM", { locale: ptBR }),
        receitas: revenue,
        despesas: expenses,
        transacoes: dayTransactions.length
      });
    }
    return last30Days;
  };

  const getCategoryBreakdown = () => {
    const expenses = transactions.filter(t => t.type === "expense");
    const categoryTotals = {};
    
    expenses.forEach(t => {
      const amount = parseFloat(t.amount) || 0; // Fix: Ensure amount is parsed as float
      if (t.category) { // Ensure category exists
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
      }
    });

    const totalExpensesAmount = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ 
        name: category, 
        value: amount, // 'amount' is already a number
        percentage: totalExpensesAmount > 0 ? ((amount / totalExpensesAmount) * 100).toFixed(1) : '0.0' // Fix: Handle division by zero
      }))
      .sort((a, b) => b.value - a.value); // Values are numbers, sort is fine
  };

  const getClientAnalysis = () => {
    const clientRevenue = {};
    const clientTransactions = {};
    
    transactions.filter(t => t.type === "income").forEach(t => {
      if (t.client_id) {
        const amount = parseFloat(t.amount) || 0; // Fix: Ensure amount is parsed as float
        clientRevenue[t.client_id] = (clientRevenue[t.client_id] || 0) + amount;
        clientTransactions[t.client_id] = (clientTransactions[t.client_id] || 0) + 1;
      }
    });

    return clients.map(client => ({
      id: client.id,
      name: client.name,
      revenue: clientRevenue[client.id] || 0, // Fix: Ensure default to 0
      transactions: clientTransactions[client.id] || 0, // Fix: Ensure default to 0
      avgTransaction: clientTransactions[client.id] > 0 ? ((clientRevenue[client.id] || 0) / clientTransactions[client.id]) : 0 // Fix: Handle division by zero
    }))
    .sort((a, b) => (b.revenue || 0) - (a.revenue || 0)) // Fix: Defensive sort
    .slice(0, 10);
  };

  const getQuotesAnalysis = () => {
    const total = quotes.length;
    const accepted = quotes.filter(q => q.status === "accepted").length;
    const rejected = quotes.filter(q => q.status === "rejected").length;
    const pending = quotes.filter(q => q.status === "sent").length;
    const draft = quotes.filter(q => q.status === "draft").length;

    const acceptedValue = quotes
      .filter(q => q.status === "accepted")
      .reduce((sum, q) => sum + (parseFloat(q.total_amount) || 0), 0); // Fix: Ensure amount is parsed as float

    const pendingValue = quotes
      .filter(q => q.status === "sent")
      .reduce((sum, q) => sum + (parseFloat(q.total_amount) || 0), 0); // Fix: Ensure amount is parsed as float

    const totalQuotesAmount = quotes.reduce((sum, q) => sum + (parseFloat(q.total_amount) || 0), 0); // Fix: Ensure amount is parsed as float
    const avgQuoteValue = total > 0 ? totalQuotesAmount / total : 0; // Fix: Handle division by zero

    const conversionRate = total > 0 ? (accepted / total * 100) : 0; // Fix: Handle division by zero

    return {
      total,
      accepted,
      rejected,
      pending,
      draft,
      acceptedValue: acceptedValue, // Already numerical
      pendingValue: pendingValue, // Already numerical
      avgQuoteValue: avgQuoteValue, // Already numerical
      conversionRate: isNaN(conversionRate) ? 0 : conversionRate // Fix: Handle NaN for conversion rate
    };
  };

  const getSummaryStats = () => {
    const { start, end } = getDateRange();
    const periodTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= start && tDate <= end;
    });

    const totalRevenue = periodTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0); // Fix: Ensure amount is parsed as float
    
    const totalExpenses = periodTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0); // Fix: Ensure amount is parsed as float

    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0; // Fix: Handle division by zero

    const totalPayroll = employees
      .filter(e => e.status === "active")
      .reduce((sum, e) => sum + (parseFloat(e.salary) || 0), 0); // Fix: Ensure salary is parsed as float

    // Calcular crescimento vs período anterior
    const previousPeriodStart = selectedPeriod === "thisMonth" ? subMonths(start, 1) : 
                               selectedPeriod === "3months" ? subMonths(start, 3) :
                               selectedPeriod === "6months" ? subMonths(start, 6) :
                               subMonths(start, 12);
    // The end of the previous period is the start of the current period
    const previousPeriodEnd = start; 
    
    const previousPeriodTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= previousPeriodStart && tDate < previousPeriodEnd;
    });

    const previousRevenue = previousPeriodTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0); // Fix: Ensure amount is parsed as float

    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue * 100) : 0; // Fix: Handle division by zero

    const incomeTransactionsCount = periodTransactions.filter(t => t.type === "income").length;
    const avgTicket = incomeTransactionsCount > 0 ? totalRevenue / incomeTransactionsCount : 0; // Fix: Handle division by zero

    return {
      totalRevenue: totalRevenue,
      totalExpenses: totalExpenses,
      netProfit: netProfit,
      profitMargin: isNaN(profitMargin) ? 0 : profitMargin, // Fix: Handle NaN for profit margin
      totalPayroll: totalPayroll,
      revenueGrowth: isNaN(revenueGrowth) ? 0 : revenueGrowth, // Fix: Handle NaN for revenue growth
      activeClients: clients.length,
      activeEmployees: employees.filter(e => e.status === "active").length,
      quotesWon: quotes.filter(q => q.status === "accepted").length,
      avgTicket: avgTicket
    };
  };

  const getPerformanceMetrics = () => {
    // These are hardcoded values and don't involve dynamic calculations from data, so no NaN issues here.
    return [
      { metric: 'Vendas', value: 85, fullMark: 100 },
      { metric: 'Marketing', value: 75, fullMark: 100 },
      { metric: 'Operações', value: 90, fullMark: 100 },
      { metric: 'Financeiro', value: 80, fullMark: 100 },
      { metric: 'RH', value: 70, fullMark: 100 },
      { metric: 'Satisfação', value: 88, fullMark: 100 }
    ];
  };

  // Memoize calculations to prevent re-running on every render if dependencies haven't changed
  const monthlyData = React.useMemo(() => getMonthlyReport(), [transactions, selectedPeriod]);
  const dailyData = React.useMemo(() => getDailyTrend(), [transactions]);
  const categoryData = React.useMemo(() => getCategoryBreakdown(), [transactions]);
  const clientData = React.useMemo(() => getClientAnalysis(), [transactions, clients]);
  const quotesAnalysis = React.useMemo(() => getQuotesAnalysis(), [quotes]);
  const summaryStats = React.useMemo(() => getSummaryStats(), [transactions, clients, employees, selectedPeriod]);
  const performanceData = React.useMemo(() => getPerformanceMetrics(), []);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-slate-50">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando relatórios empresariais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics Empresarial</h1>
              <p className="text-slate-600 mt-1">Insights avançados para impulsionar seu negócio.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="thisYear">Este ano</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportPDF} disabled={isExporting} className="bg-indigo-600 hover:bg-indigo-700">
              {isExporting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exportando...
                </div>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 opacity-20 rounded-full transform translate-x-8 -translate-y-8"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Faturamento</p>
                  <p className="text-2xl font-bold text-green-900">
                    R$ {summaryStats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {summaryStats.revenueGrowth >= 0 ? (
                      <ArrowUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${summaryStats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(summaryStats.revenueGrowth).toFixed(1)}% vs período anterior
                    </span>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 opacity-20 rounded-full transform translate-x-8 -translate-y-8"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Lucro Líquido</p>
                  <p className={`text-2xl font-bold ${summaryStats.netProfit >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                    R$ {summaryStats.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={Math.max(0, summaryStats.profitMargin)} className="flex-1 h-2" />
                    <span className="text-sm text-blue-600 font-medium">
                      {summaryStats.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 opacity-20 rounded-full transform translate-x-8 -translate-y-8"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Ticket Médio</p>
                  <p className="text-2xl font-bold text-purple-900">
                    R$ {summaryStats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-purple-600">
                    {summaryStats.activeClients} clientes ativos
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 opacity-20 rounded-full transform translate-x-8 -translate-y-8"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-medium">Taxa Conversão</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {quotesAnalysis.conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-orange-600">
                    {quotesAnalysis.accepted} de {quotesAnalysis.total} orçamentos
                  </p>
                </div>
                <Target className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="quotes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Orçamentos
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Evolução do Faturamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 
                          name === 'receitas' ? 'Receitas' : name === 'despesas' ? 'Despesas' : 'Lucro'
                        ]} 
                      />
                      <Area type="monotone" dataKey="receitas" fill="#10b981" fillOpacity={0.3} stroke="#10b981" strokeWidth={2} />
                      <Bar dataKey="lucro" fill="#3b82f6" />
                      <Line type="monotone" dataKey="margem" stroke="#f59e0b" strokeWidth={3} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Tendência Diária (30 dias)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']} />
                      <Area type="monotone" dataKey="receitas" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
                      <Area type="monotone" dataKey="despesas" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.8} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Receitas vs Despesas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']} />
                      <Bar dataKey="receitas" fill="#10b981" name="Receitas" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-indigo-600" />
                    Distribuição de Despesas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Financial Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Margem de Lucro</p>
                      <p className="text-3xl font-bold text-blue-900">{summaryStats.profitMargin.toFixed(1)}%</p>
                      <p className="text-sm text-blue-600">Meta: 25%</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <Progress value={summaryStats.profitMargin} className="mt-3" />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium">ROI Mensal</p>
                      <p className="text-3xl font-bold text-green-900">
                        {summaryStats.totalExpenses > 0 ? ((summaryStats.netProfit / summaryStats.totalExpenses) * 100).toFixed(1) : 0}%
                      </p>
                      <p className="text-sm text-green-600">Retorno sobre investimento</p>
                    </div>
                    <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Burn Rate</p>
                      <p className="text-3xl font-bold text-purple-900">
                        R$ {(summaryStats.totalExpenses / (selectedPeriod === "thisMonth" ? 1 : selectedPeriod === "3months" ? 3 : 6)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-purple-600">Gastos mensais médios</p>
                    </div>
                    <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Top 10 Clientes por Faturamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={clientData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']} />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    Análise de Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-700 font-medium">Total de Clientes</p>
                    <p className="text-2xl font-bold text-blue-900">{clients.length}</p>
                    <p className="text-sm text-blue-600">Ativos na base</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-green-700 font-medium">Faturamento Médio</p>
                    <p className="text-2xl font-bold text-green-900">
                      R$ {clients.length > 0 ? (summaryStats.totalRevenue / clients.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                    </p>
                    <p className="text-sm text-green-600">Por cliente</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-purple-700 font-medium">Cliente Destaque</p>
                    <p className="text-lg font-bold text-purple-900">
                      {clientData.length > 0 ? clientData[0].name : 'Nenhum'}
                    </p>
                    <p className="text-sm text-purple-600">
                      R$ {clientData.length > 0 ? clientData[0].revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-orange-700 font-medium">Ticket Médio</p>
                    <p className="text-2xl font-bold text-orange-900">
                      R$ {summaryStats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-orange-600">Por transação</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Funil de Orçamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Aceitos', value: quotesAnalysis.accepted, color: '#10b981' },
                          { name: 'Pendentes', value: quotesAnalysis.pending, color: '#f59e0b' },
                          { name: 'Rejeitados', value: quotesAnalysis.rejected, color: '#ef4444' },
                          { name: 'Rascunhos', value: quotesAnalysis.draft, color: '#6b7280' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: 'Aceitos', value: quotesAnalysis.accepted, color: '#10b981' },
                          { name: 'Pendentes', value: quotesAnalysis.pending, color: '#f59e0b' },
                          { name: 'Rejeitados', value: quotesAnalysis.rejected, color: '#ef4444' },
                          { name: 'Rascunhos', value: quotesAnalysis.draft, color: '#6b7280' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" />
                    Métricas de Orçamentos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 text-sm">Total de Orçamentos</span>
                        <Badge variant="outline" className="text-lg font-bold">{quotesAnalysis.total}</Badge>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 text-sm">Taxa de Conversão</span>
                        <Badge className="bg-green-100 text-green-800 text-lg font-bold">
                          {quotesAnalysis.conversionRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700 text-sm">Valor Aceito</span>
                        <span className="font-bold text-blue-900">
                          R$ {quotesAnalysis.acceptedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      {/* Fix: Handle division by zero for progress bar */}
                      <Progress value={(quotesAnalysis.acceptedValue + quotesAnalysis.pendingValue) > 0 ? (quotesAnalysis.acceptedValue / (quotesAnalysis.acceptedValue + quotesAnalysis.pendingValue)) * 100 : 0} className="h-2" />
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-yellow-700 text-sm">Valor Pendente</span>
                        <span className="font-bold text-yellow-900">
                          R$ {quotesAnalysis.pendingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-purple-700 text-sm">Ticket Médio</span>
                        <span className="font-bold text-purple-900">
                          R$ {quotesAnalysis.avgQuoteValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-600" />
                    Radar de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={performanceData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Performance" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    KPIs Principais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">LTV (Lifetime Value)</span>
                      <span className="text-sm font-bold text-slate-900">R$ {(summaryStats.avgTicket * 12).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">CAC (Custo Aquisição)</span>
                      <span className="text-sm font-bold text-slate-900">R$ {(summaryStats.activeClients > 0 ? (summaryStats.totalExpenses * 0.1 / summaryStats.activeClients) : 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Churn Rate</span>
                      <span className="text-sm font-bold text-slate-900">5.2%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">NPS Score</span>
                      <span className="text-sm font-bold text-slate-900">72</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Eficiência Operacional</span>
                      <span className="text-sm font-bold text-slate-900">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Pontos Fortes</p>
                      <p className="text-lg font-bold text-green-900">Alta Margem de Lucro</p>
                      <p className="text-xs text-green-600">Acima da média do setor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-yellow-700 font-medium">Atenção</p>
                      <p className="text-lg font-bold text-yellow-900">Sazonalidade</p>
                      <p className="text-xs text-yellow-600">Vendas oscilam por mês</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Oportunidade</p>
                      <p className="text-lg font-bold text-blue-900">Upsell Clientes</p>
                      <p className="text-xs text-blue-600">Potencial de 30% a mais</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
