
import React, { useState, useEffect } from "react";
import { Transaction } from "@/api/entities";
import { Goal } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, TrendingUp, Target, Receipt, Heart, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import StatsCard from "../components/dashboard/StatsCard";
import GoalsOverview from "../components/dashboard/GoalsOverview";
import QuickActions from "../components/dashboard/QuickActions";
import TransactionForm from "../components/forms/TransactionForm";

export default function CoupleDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userResponse, transactionsResponse, goalsResponse] = await Promise.all([
        User.me(),
        Transaction.filter({ workspace: "couple" }, "-created_date", 10),
        Goal.filter({ workspace: "couple" }, "-created_date", 5)
      ]);

      setUser(userResponse);
      setTransactions(transactionsResponse);
      setGoals(goalsResponse);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case "new-shared-expense":
        setShowTransactionForm(true);
        break;
      case "new-shared-goal":
        window.location.href = "/CoupleGoals";
        break;
      case "new-couple-event":
        window.location.href = "/CoupleCalendar";
        break;
      case "new-joint-account":
        window.location.href = "/Accounts";
        break;
      case "split-bill":
        // Implement bill splitting logic
        alert("Funcionalidade de divisão de contas em desenvolvimento!");
        break;
      case "couple-report":
        window.location.href = "/CoupleReports";
        break;
      default:
        console.log("Ação não implementada:", action);
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      await Transaction.create({ ...transactionData, is_shared: true });
      setShowTransactionForm(false);
      loadData();
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
    }
  };

  const getMonthlyStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const income = monthlyTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

    return { 
      income: income || 0, 
      expenses: expenses || 0, 
      balance: (income - expenses) || 0 
    };
  };

  const getCategoryData = () => {
    const expenses = transactions.filter(t => t.type === "expense");
    const categoryTotals = {};
    
    expenses.forEach(t => {
      const amount = parseFloat(t.amount) || 0;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
    });

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount: amount || 0 }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const getMonthlyTrend = () => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === month && tDate.getFullYear() === year;
      });

      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      const expenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

      last6Months.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        receitas: income || 0,
        despesas: expenses || 0
      });
    }
    return last6Months;
  };

  const stats = getMonthlyStats();
  const categoryData = getCategoryData();
  const monthlyTrend = getMonthlyTrend();

  const COLORS = ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
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
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Finanças do Casal 💕
              </h1>
              <p className="text-slate-600 mt-1">
                Construindo o futuro financeiro juntos
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setShowTransactionForm(true)}
            className="bg-pink-500 hover:bg-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação Compartilhada
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Receitas do Casal"
            value={stats.income.toFixed(2)}
            prefix="R$ "
            icon={TrendingUp}
            color="bg-green-500"
            changeType="positive"
            change="+12.5%"
          />
          <StatsCard
            title="Gastos Compartilhados"
            value={stats.expenses.toFixed(2)}
            prefix="R$ "
            icon={Receipt}
            color="bg-red-500"
            changeType="negative"
            change="-8.2%"
          />
          <StatsCard
            title="Saldo Conjunto"
            value={stats.balance.toFixed(2)}
            prefix="R$ "
            icon={DollarSign}
            color={stats.balance >= 0 ? "bg-green-500" : "bg-red-500"}
            changeType={stats.balance >= 0 ? "positive" : "negative"}
            change={stats.balance >= 0 ? "+15.3%" : "-5.7%"}
          />
          <StatsCard
            title="Metas Conjuntas"
            value={goals.filter(g => g.status === "active").length}
            icon={Target}
            color="bg-pink-500"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Tendência Mensal do Casal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`R$ ${value.toFixed(2)}`, '']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                  <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-500" />
                Gastos Compartilhados por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActions 
            workspace="couple" 
            onAction={handleQuickAction}
          />
          <GoalsOverview 
            goals={goals} 
            onAddGoal={() => window.location.href = "/CoupleGoals"}
          />
        </div>

        {/* Transaction Form Modal */}
        {showTransactionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md">
              <TransactionForm
                onSubmit={handleAddTransaction}
                onCancel={() => setShowTransactionForm(false)}
                workspace="couple"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
