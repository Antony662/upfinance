import React, { useState, useEffect } from "react";
import { Transaction } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpRight, ArrowDownLeft, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import TransactionForm from "../components/forms/TransactionForm";

export default function BusinessTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await Transaction.filter({ workspace: "business" }, "-date");
      setTransactions(data);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingTransaction) {
        await Transaction.update(editingTransaction.id, data);
      } else {
        await Transaction.create(data);
      }
      setShowForm(false);
      setEditingTransaction(null);
      loadTransactions();
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      try {
        await Transaction.delete(id);
        loadTransactions();
      } catch (error) {
        console.error("Erro ao excluir transação:", error);
      }
    }
  };

  const getTransactionIcon = (type) => {
    return type === "income" ? (
      <ArrowUpRight className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDownLeft className="w-4 h-4 text-red-500" />
    );
  };

  const getTransactionColor = (type) => {
    return type === "income" ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Transações Empresariais</h1>
            <p className="text-slate-600 mt-1">Controle financeiro do seu negócio.</p>
          </div>
          <Button onClick={() => { setEditingTransaction(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Histórico de Transações Empresariais</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={5} className="text-center p-4">Carregando...</TableCell></TableRow>
                  ))
                ) : transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          {getTransactionIcon(t.type)}
                        </div>
                        <span className="font-medium">{t.description}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{t.category}</Badge></TableCell>
                    <TableCell>{format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell className={`text-right font-semibold ${getTransactionColor(t.type)}`}>
                      R$ {t.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(t)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md">
              <TransactionForm
                transaction={editingTransaction}
                onSubmit={handleFormSubmit}
                onCancel={() => { setShowForm(false); setEditingTransaction(null); }}
                workspace="business"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}