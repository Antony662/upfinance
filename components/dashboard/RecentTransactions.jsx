import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RecentTransactions({ transactions, onAddTransaction }) {
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
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Transações Recentes</CardTitle>
        <Button onClick={onAddTransaction} size="sm" className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>Nenhuma transação encontrada</p>
            <p className="text-sm">Adicione sua primeira transação para começar</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium text-slate-900">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Badge variant="outline" className="text-xs">
                      {transaction.category}
                    </Badge>
                    <span>{format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === "income" ? "+" : "-"}R$ {transaction.amount.toFixed(2)}
                </p>
                {transaction.is_recurring && (
                  <Badge variant="secondary" className="text-xs">
                    Recorrente
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}