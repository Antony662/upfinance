import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Relatórios da Plataforma</h1>
            <p className="text-slate-600 mt-1">Métricas de crescimento e uso do FinanceFlow.</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Em Breve</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-20">
            <h2 className="text-xl font-semibold text-slate-700">Relatórios Avançados</h2>
            <p className="text-slate-500 mt-2">
              Esta seção trará gráficos detalhados sobre aquisição de usuários, receita recorrente mensal (MRR), e outras métricas chave de negócio.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}