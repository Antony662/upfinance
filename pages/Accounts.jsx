import React, { useState, useEffect } from "react";
import { BankAccount } from "@/api/entities";
import { CreditCard } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Wallet, CreditCard as CreditCardIcon, Edit, Trash2, Calendar, TrendingUp } from "lucide-react";
import BankAccountForm from "../components/forms/BankAccountForm";
import CreditCardForm from "../components/forms/CreditCardForm";

export default function AccountsPage() {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [currentWorkspace, setCurrentWorkspace] = useState("personal");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const user = await User.me();
      const workspace = user.current_workspace || "personal";
      setCurrentWorkspace(workspace);
      const [banks, cards] = await Promise.all([
        BankAccount.filter({ workspace }), 
        CreditCard.filter({ workspace })
      ]);
      setBankAccounts(banks);
      setCreditCards(cards);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBankSubmit = async (data) => {
    try {
      if (editingAccount) {
        await BankAccount.update(editingAccount.id, data);
      } else {
        await BankAccount.create(data);
      }
      setShowBankForm(false);
      setEditingAccount(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar conta bancária:", error);
    }
  };

  const handleCardSubmit = async (data) => {
    try {
      if (editingCard) {
        await CreditCard.update(editingCard.id, data);
      } else {
        await CreditCard.create(data);
      }
      setShowCardForm(false);
      setEditingCard(null);
      loadData();
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
    }
  };

  const getBestDayToBuy = (card) => {
    const today = new Date().getDate();
    const closing = card.closing_day;
    
    if (today <= closing - 5) {
      return `Hoje é um bom dia! ${closing - today} dias até fechar.`;
    } else if (today > closing) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const daysToNext = (30 - today) + closing;
      return `Compre hoje! ${daysToNext} dias para pagar.`;
    } else {
      return "Espere alguns dias para comprar.";
    }
  };

  return (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-900">Contas e Cartões</h1>
        </div>

        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="accounts">Contas Bancárias</TabsTrigger>
            <TabsTrigger value="cards">Cartões de Crédito</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Suas Contas Bancárias</h2>
              <Button onClick={() => { setEditingAccount(null); setShowBankForm(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? <p>Carregando...</p> : bankAccounts.map(account => (
                <Card key={account.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Wallet className="w-8 h-8 text-blue-500" />
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingAccount(account); setShowBankForm(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle>{account.name}</CardTitle>
                    <p className="text-sm text-slate-600">{account.bank_name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Badge variant={account.type === 'checking' ? 'default' : 'secondary'}>
                        {account.type === 'checking' ? 'Conta Corrente' : 'Poupança'}
                      </Badge>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          R$ {account.initial_balance.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500">Saldo inicial</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cards" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Seus Cartões de Crédito</h2>
              <Button onClick={() => { setEditingCard(null); setShowCardForm(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cartão
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? <p>Carregando...</p> : creditCards.map(card => (
                <Card key={card.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CreditCardIcon className="w-8 h-8 text-purple-500" />
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingCard(card); setShowCardForm(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle>{card.name}</CardTitle>
                    <p className="text-sm text-slate-600">{card.issuer}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-right">
                        <p className="text-xl font-bold text-purple-600">
                          R$ {card.limit.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500">Limite disponível</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Fecha dia {card.closing_day}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>Vence dia {card.due_day}</span>
                        </div>
                      </div>
                      <div className="p-2 bg-green-50 rounded text-xs text-green-700">
                        💡 {getBestDayToBuy(card)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {showBankForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg">
              <BankAccountForm
                account={editingAccount}
                onSubmit={handleBankSubmit}
                onCancel={() => { setShowBankForm(false); setEditingAccount(null); }}
                workspace={currentWorkspace}
              />
            </div>
          </div>
        )}

        {showCardForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-lg">
              <CreditCardForm
                card={editingCard}
                onSubmit={handleCardSubmit}
                onCancel={() => { setShowCardForm(false); setEditingCard(null); }}
                workspace={currentWorkspace}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}