import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, Landmark, Wallet, TrendingUp, 
  AlertTriangle, Calendar, CheckCircle 
} from "lucide-react";
import { safeNumber, safePercent, formatCurrency } from "../utils/safeNumbers";

export default function AccountsOverview({ bankAccounts = [], creditCards = [], debts = [] }) {
  const safeBankAccounts = Array.isArray(bankAccounts) ? bankAccounts.filter(acc => acc && typeof acc === 'object') : [];
  const safeCreditCards = Array.isArray(creditCards) ? creditCards.filter(card => card && typeof card === 'object') : [];
  const safeDebts = Array.isArray(debts) ? debts.filter(debt => debt && typeof debt === 'object') : [];

  const getTotalBalance = () => {
    return safeBankAccounts.reduce((sum, acc) => {
      return sum + safeNumber(acc.initial_balance);
    }, 0);
  };

  const getTotalCreditLimit = () => {
    return safeCreditCards.reduce((sum, card) => {
      return sum + safeNumber(card.limit);
    }, 0);
  };

  const getTotalDebt = () => {
    return safeDebts.reduce((sum, debt) => {
      const total = safeNumber(debt.total_amount);
      const paid = safeNumber(debt.paid_amount);
      return sum + Math.max(0, total - paid);
    }, 0);
  };

  const getDebtProgress = (debt) => {
    if (!debt) return 0;
    const total = safeNumber(debt.total_amount);
    const paid = safeNumber(debt.paid_amount);
    if (total === 0) return 0;
    const progress = safePercent(paid, total);
    return Math.min(Math.max(progress, 0), 100);
  };

  const getUpcomingPayments = () => {
    const today = new Date();
    const currentDay = today.getDate();
    
    return safeDebts.filter(debt => {
      const dueDay = safeNumber(debt.due_day);
      const daysDiff = dueDay - currentDay;
      return daysDiff >= 0 && daysDiff <= 7;
    });
  };

  const upcomingPayments = getUpcomingPayments();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bank Accounts & Credit Cards */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Contas e Cartões
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bank Accounts Summary */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">Contas Bancárias</span>
              </div>
              <Badge variant="outline" className="text-blue-700">
                {safeBankAccounts.length} conta{safeBankAccounts.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              R$ {formatCurrency(getTotalBalance())}
            </div>
            <div className="text-sm text-blue-600">Saldo total disponível</div>
          </div>

          {/* Credit Cards Summary */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span className="font-medium text-purple-900">Cartões de Crédito</span>
              </div>
              <Badge variant="outline" className="text-purple-700">
                {safeCreditCards.length} cartão{safeCreditCards.length !== 1 ? 'ões' : ''}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              R$ {formatCurrency(getTotalCreditLimit())}
            </div>
            <div className="text-sm text-purple-600">Limite total disponível</div>
          </div>

          {/* Individual Accounts */}
          <div className="space-y-2">
            <h4 className="font-medium text-slate-700 text-sm">Detalhes das Contas</h4>
            {safeBankAccounts.slice(0, 3).map((account) => (
              <div key={account.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Landmark className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{account.name || 'Conta'}</div>
                    <div className="text-xs text-slate-500">{account.bank_name || 'Banco'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">
                    R$ {formatCurrency(account.initial_balance)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {account.type === 'checking' ? 'Corrente' : 'Poupança'}
                  </div>
                </div>
              </div>
            ))}
            
            {safeCreditCards.slice(0, 2).map((card) => (
              <div key={card.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{card.name || 'Cartão'}</div>
                    <div className="text-xs text-slate-500">{card.issuer || 'Emissor'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">
                    R$ {formatCurrency(card.limit)}
                  </div>
                  <div className="text-xs text-slate-500">
                    Vence dia {safeNumber(card.due_day)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debts & Upcoming Payments */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            Dívidas e Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Debt */}
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="font-medium text-red-900">Dívidas Totais</span>
              </div>
              <Badge variant="outline" className="text-red-700">
                {safeDebts.length} dívida{safeDebts.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-red-900">
              R$ {formatCurrency(getTotalDebt())}
            </div>
            <div className="text-sm text-red-600">Valor pendente</div>
          </div>

          {/* Upcoming Payments */}
          {upcomingPayments.length > 0 && (
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-900">Próximos Vencimentos</span>
              </div>
              <div className="space-y-2">
                {upcomingPayments.slice(0, 3).map((debt) => (
                  <div key={debt.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div>
                      <div className="font-medium text-sm">{debt.title || 'Dívida'}</div>
                      <div className="text-xs text-orange-600">Vence dia {safeNumber(debt.due_day)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">
                        R$ {formatCurrency(debt.installment_amount)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {Math.max(0, safeNumber(debt.due_day) - new Date().getDate())} dias
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Debt Progress */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 text-sm">Progresso das Dívidas</h4>
            {safeDebts.slice(0, 3).map((debt) => {
              const progress = getDebtProgress(debt);
              return (
                <div key={debt.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {progress >= 100 ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-red-400"></div>
                      )}
                      <span className="font-medium text-sm">{debt.title || 'Dívida'}</span>
                    </div>
                    <span className="text-sm font-bold">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>
                      R$ {formatCurrency(debt.paid_amount)} pago
                    </span>
                    <span>
                      R$ {formatCurrency(debt.total_amount)} total
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}