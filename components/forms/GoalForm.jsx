import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";

export default function GoalForm({ goal, onSubmit, onCancel, workspace = "personal" }) {
  const [formData, setFormData] = useState({
    title: goal?.title || "",
    description: goal?.description || "",
    target_amount: goal?.target_amount || "",
    target_date: goal?.target_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    workspace: workspace,
    current_amount: goal?.current_amount || 0,
    status: goal?.status || 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      target_amount: parseFloat(formData.target_amount)
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold">{goal ? 'Editar Meta' : 'Nova Meta'}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Meta</Label>
            <Input
              id="title"
              placeholder="Ex: Viagem para a praia"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalhes sobre a meta"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target_amount">Valor Alvo</Label>
              <Input
                id="target_amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.target_amount}
                onChange={(e) => handleChange("target_amount", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_date">Data Alvo</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => handleChange("target_date", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              <Save className="w-4 h-4 mr-2" />
              Salvar Meta
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}