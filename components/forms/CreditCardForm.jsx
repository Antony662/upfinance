import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";

export default function CreditCardForm({ onSubmit, onCancel, card, workspace = "personal" }) {
  const [formData, setFormData] = useState({
    name: card?.name || "",
    issuer: card?.issuer || "",
    limit: card?.limit || 0,
    closing_day: card?.closing_day || 1,
    due_day: card?.due_day || 10,
    workspace: workspace
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      limit: parseFloat(formData.limit),
      closing_day: parseInt(formData.closing_day),
      due_day: parseInt(formData.due_day)
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg font-semibold">
          {card ? "Editar Cartão de Crédito" : "Novo Cartão de Crédito"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cartão</Label>
            <Input
              id="name"
              placeholder="Ex: Ultravioleta, Gold, Platinum"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuer">Emissor/Banco</Label>
            <Input
              id="issuer"
              placeholder="Ex: Nubank, Itaú, Bradesco"
              value={formData.issuer}
              onChange={(e) => handleChange("issuer", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Limite de Crédito</Label>
            <Input
              id="limit"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.limit}
              onChange={(e) => handleChange("limit", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closing_day">Dia do Fechamento</Label>
              <Input
                id="closing_day"
                type="number"
                min="1"
                max="31"
                value={formData.closing_day}
                onChange={(e) => handleChange("closing_day", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_day">Dia do Vencimento</Label>
              <Input
                id="due_day"
                type="number"
                min="1"
                max="31"
                value={formData.due_day}
                onChange={(e) => handleChange("due_day", e.target.value)}
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
              Salvar Cartão
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}