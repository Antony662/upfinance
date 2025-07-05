import React, { useState, useEffect } from "react";
import { Goal } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Target, Calendar, DollarSign, Edit, Trash2, Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import GoalForm from "../components/forms/GoalForm";

export default function CoupleGoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await Goal.filter({ workspace: "couple" }, "-created_date");
      setGoals(data);
    } catch (error) {
      console.error("Erro ao carregar metas do casal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingGoal) {
        await Goal.update(editingGoal.id, data);
      } else {
        await Goal.create({ ...data, is_shared: true });
      }
      setShowForm(false);
      setEditingGoal(null);
      loadGoals();
    } catch (error) {
      console.error("Erro ao salvar meta do casal:", error);
    }
  };
  
  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };
  
  const handleDelete = async (id) => {
    if(window.confirm("Tem certeza que deseja excluir esta meta compartilhada?")) {
      await Goal.delete(id);
      loadGoals();
    }
  };

  const getProgress = (goal) => {
    if (!goal.target_amount) return 0;
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  return (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Heart className="text-pink-500"/> Metas Conjuntas
            </h1>
            <p className="text-slate-600 mt-1">Planejem e conquistem seus objetivos juntos.</p>
          </div>
          <Button onClick={() => { setEditingGoal(null); setShowForm(true); }} className="bg-pink-500 hover:bg-pink-600">
            <Plus className="w-4 h-4 mr-2" />
            Nova Meta Conjunta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p>Carregando metas...</p>
          ) : goals.map((goal) => (
            <Card key={goal.id} className="border-0 shadow-sm flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Target className="w-8 h-8 text-pink-500" />
                   <div>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(goal)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(goal.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                   </div>
                </div>
                <CardTitle>{goal.title}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>Até {format(new Date(goal.target_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-end">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      R$ {goal.current_amount.toFixed(2)}
                    </span>
                    <span className="font-medium">
                      R$ {goal.target_amount.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={getProgress(goal)} className="h-2" />
                  <div className="text-right text-lg font-bold text-pink-600">
                    {getProgress(goal).toFixed(1)}%
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline"><DollarSign className="w-4 h-4 mr-2" />Adicionar Contribuição</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md">
              <GoalForm
                goal={editingGoal}
                onSubmit={handleFormSubmit}
                onCancel={() => { setShowForm(false); setEditingGoal(null); }}
                workspace="couple"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}