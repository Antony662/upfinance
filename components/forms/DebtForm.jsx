import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";

export default function DebtForm({ onSubmit, onCancel, debt, workspace = "personal" }) {
  const [formData, setFormData] = useState({
    title: debt?.title || "",
    total_amount: debt?.total_amount || 0,
    paid_amount: debt?.paid_amount || 0,
    due_day: debt?.due_day || 1,
    installment_amount: debt?.installment_amount || 0,
    creditor: debt?.creditor || "",
    workspace: workspace
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      total_amount: parseFloat(formData.total_amount),
      paid_amount: parseFloat(formData.paid_amount),
      due_day: parseInt(formData.due_day),
      installment_amount: parseFloat(formData.installment_amount)
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
          {debt ? "Editar Dívida" : "Nova Dívida"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nome da Dívida</Label>
            <Input
              id="title"
              placeholder="Ex: Financiamento do Carro"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creditor">Credor</Label>
            <Input
              id="creditor"
              placeholder="Ex: Banco do Brasil, João, Loja XYZ"
              value={formData.creditor}
              onChange={(e) => handleChange("creditor", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_amount">Valor Total</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.total_amount}
                onChange={(e) => handleChange("total_amount", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paid_amount">Valor Já Pago</Label>
              <Input
                id="paid_amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.paid_amount}
                onChange={(e) => handleChange("paid_amount", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="installment_amount">Valor da Parcela</Label>
              <Input
                id="installment_amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.installment_amount}
                onChange={(e) => handleChange("installment_amount", e.target.value)}
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
            <Button type="submit" className="bg-red-500 hover:bg-red-600">
              <Save className="w-4 h-4 mr-2" />
              Salvar Dívida
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}