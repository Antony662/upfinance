
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Save } from "lucide-react";
import { BankAccount } from "@/api/entities";
import { CreditCard } from "@/api/entities";
import { SpendingLimit } from "@/api/entities"; // Import SpendingLimit
import { Transaction } from "@/api/entities"; // Import Transaction
import { triggerWebhook } from '@/api/functions'; // Importar triggerWebhook
import { startOfMonth, startOfWeek, endOfMonth, endOfWeek } from 'date-fns';

const categories = {
  income: [
    "Salário",
    "Freelance",
    "Investimentos",
    "Vendas",
    "Outros"
  ],
  expense: [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Educação",
    "Lazer",
    "Compras",
    "Contas",
    "Outros"
  ]
};

export default function TransactionForm({ onSubmit, onCancel, transaction, workspace = "personal" }) {
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_frequency: "monthly",
    payment_method: "debit",
    bank_account_id: "",
    credit_card_id: "",
    workspace: workspace
  });

  const [bankAccounts, setBankAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccountsAndCards();
    if (transaction) {
      setFormData({
        ...transaction,
        // Ensure amount is handled as a string for input, and date is correctly formatted
        amount: transaction.amount ? String(transaction.amount) : "",
        date: transaction.date || new Date().toISOString().split('T')[0]
      });
    }
  }, [transaction]);

  const loadAccountsAndCards = async () => {
    try {
      const [accounts, cards] = await Promise.all([
        BankAccount.filter({ workspace }),
        CreditCard.filter({ workspace })
      ]);
      setBankAccounts(accounts);
      setCreditCards(cards);
    } catch (error) {
      console.error("Erro ao carregar contas e cartões:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkSpendingLimits = async (newTransaction) => {
    if (newTransaction.type !== 'expense') return;

    const allLimits = await SpendingLimit.filter({ workspace: newTransaction.workspace });
    const relevantLimits = allLimits.filter(limit =>
        (!limit.category || limit.category === newTransaction.category) &&
        limit.notification_enabled
    );

    if (relevantLimits.length === 0) return;

    const today = new Date();
    const periodFilters = {
        monthly: { start: startOfMonth(today), end: endOfMonth(today) },
        weekly: { start: startOfWeek(today), end: endOfWeek(today) },
    };

    for (const limit of relevantLimits) {
        const { start, end } = periodFilters[limit.period];
        
        const filter = {
            workspace: newTransaction.workspace,
            type: 'expense',
            date: { gte: start.toISOString(), lte: end.toISOString() },
            ...(limit.category && { category: limit.category })
        };
        
        const transactionsInPeriod = await Transaction.filter(filter);
        const totalSpent = transactionsInPeriod.reduce((sum, t) => sum + (t.amount || 0), 0);
        const limitThreshold = limit.limit_amount * (limit.notification_threshold / 100);

        if (totalSpent >= limitThreshold) {
            await triggerWebhook({
                event: 'spending.limit.warning',
                payload: {
                    limit,
                    totalSpent,
                    transaction: newTransaction,
                    percentage: Math.round((totalSpent / limit.limit_amount) * 100),
                    message: `⚠️ Atenção! Você já gastou R$ ${totalSpent.toFixed(2)} de R$ ${limit.limit_amount.toFixed(2)} ${limit.category ? `na categoria ${limit.category}` : 'no total'} este ${limit.period === 'monthly' ? 'mês' : 'semana'}.`
                }
            });
        }

        if (totalSpent > limit.limit_amount) {
            await triggerWebhook({
                event: 'spending.limit.exceeded',
                payload: {
                    limit,
                    totalSpent,
                    transaction: newTransaction,
                    exceededAmount: totalSpent - limit.limit_amount,
                    message: `🚨 LIMITE ULTRAPASSADO! Você gastou R$ ${totalSpent.toFixed(2)} de R$ ${limit.limit_amount.toFixed(2)} ${limit.category ? `na categoria ${limit.category}` : 'no total'}. Excedeu em R$ ${(totalSpent - limit.limit_amount).toFixed(2)}.`
                }
            });
        }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar e converter amount
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Por favor, insira um valor válido maior que zero.");
      return;
    }

    const finalData = {
      ...formData,
      amount: amount
    };
    
    try {
      // A função onSubmit (passada como prop) contém o Transaction.create()
      const createdOrUpdatedTransaction = await onSubmit(finalData);

      if (createdOrUpdatedTransaction) {
        // Disparar o webhook principal APÓS a transação ser criada/atualizada com sucesso
        try {
          await triggerWebhook({
            event: transaction ? 'transaction.updated' : 'transaction.created',
            payload: createdOrUpdatedTransaction
          });
        } catch (webhookError) {
          console.error("Falha ao disparar o webhook de transação:", webhookError);
          // Opcional: notificar o usuário que o webhook falhou, mas a transação foi salva.
        }

        // Trigger limit check only on new expense transactions, separate from main webhook
        if (finalData.type === 'expense' && !transaction) { // !transaction means it's a new one
            try {
                await checkSpendingLimits(createdOrUpdatedTransaction);
            } catch (limitCheckError) {
                console.error("Falha ao verificar limites de gastos:", limitCheckError);
            }
        }
      }
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      alert("Erro ao salvar transação. Tente novamente.");
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset category when type changes
      ...(field === "type" && { category: "" }),
      // Reset account/card when payment method changes
      ...(field === "payment_method" && { 
        bank_account_id: "", 
        credit_card_id: "" 
      })
    }));
  };

  return (
    <Card className="border-0 shadow-lg max-w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 lg:p-6">
        <CardTitle className="text-base lg:text-lg font-semibold">
          {formData.type === "income" ? "Nova Receita" : "Nova Despesa"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 lg:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories[formData.type].map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva a transação"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="payment_method">
              {formData.type === "income" ? "Como recebeu?" : "Como pagou?"}
            </Label>
            <Select 
              value={formData.payment_method} 
              onValueChange={(value) => handleChange("payment_method", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formData.type === "income" ? (
                  <>
                    <SelectItem value="debit">Depósito em Conta</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="debit">Débito/Conta</SelectItem>
                    <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Conta ou Cartão */}
          {(formData.payment_method === "debit" || formData.payment_method === "pix") && (
            <div className="space-y-2">
              <Label htmlFor="bank_account">
                {formData.type === "income" ? "Conta que recebeu" : "Conta debitada"}
              </Label>
              <Select 
                value={formData.bank_account_id} 
                onValueChange={(value) => handleChange("bank_account_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a conta bancária" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} - {account.bank_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.payment_method === "credit_card" && (
            <div className="space-y-2">
              <Label htmlFor="credit_card">Cartão utilizado</Label>
              <Select 
                value={formData.credit_card_id} 
                onValueChange={(value) => handleChange("credit_card_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cartão de crédito" />
                </SelectTrigger>
                <SelectContent>
                  {creditCards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name} - {card.issuer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(bankAccounts.length === 0 && creditCards.length === 0) && !loading && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                💡 <strong>Dica:</strong> Adicione suas contas e cartões na seção "Contas" para ter controle completo das suas transações!
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => handleChange("is_recurring", checked)}
              />
              <Label htmlFor="recurring">Transação recorrente</Label>
            </div>
            {formData.is_recurring && (
              <Select 
                value={formData.recurring_frequency} 
                onValueChange={(value) => handleChange("recurring_frequency", value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex flex-col lg:flex-row justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="w-full lg:w-auto">
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 w-full lg:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
