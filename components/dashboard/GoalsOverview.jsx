import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, Target, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { safeNumber, formatCurrency } from "../utils/safeNumbers";

export default function GoalsOverview({ goals = [], onAddGoal }) {
  const getProgress = (goal) => {
    if (!goal) return 0;
    
    const targetAmount = safeNumber(goal.target_amount);
    const currentAmount = safeNumber(goal.current_amount);
    
    if (targetAmount === 0) return 0;
    
    const progress = (currentAmount / targetAmount) * 100;
    return Math.min(Math.max(safeNumber(progress), 0), 100);
  };

  const safeGoals = Array.isArray(goals) ? goals.filter(g => g && typeof g === 'object') : [];

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Metas Financeiras</CardTitle>
        <Button onClick={onAddGoal} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {safeGoals.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>Nenhuma meta definida</p>
            <p className="text-sm">Crie sua primeira meta para começar a poupar</p>
          </div>
        ) : (
          safeGoals.map((goal) => {
            const progress = getProgress(goal);
            const targetAmount = safeNumber(goal.target_amount);
            const currentAmount = safeNumber(goal.current_amount);
            
            return (
              <div key={goal.id} className="p-4 bg-slate-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">{goal.title || 'Meta sem título'}</h4>
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {goal.target_date ? (
                      format(new Date(goal.target_date), "dd/MM/yyyy", { locale: ptBR })
                    ) : 'Sem data'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      R$ {formatCurrency(currentAmount)} de R$ {formatCurrency(targetAmount)}
                    </span>
                    <span className="font-medium text-blue-600">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}