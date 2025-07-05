import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save } from "lucide-react";

export default function BankAccountForm({ onSubmit, onCancel, account, workspace = "personal" }) {
  const [formData, setFormData] = useState({
    name: account?.name || "",
    bank_name: account?.bank_name || "",
    type: account?.type || "checking",
    initial_balance: account?.initial_balance || 0,
    workspace: workspace
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      initial_balance: parseFloat(formData.initial_balance)
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
          {account ? "Editar Conta Bancária" : "Nova Conta Bancária"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Conta</Label>
            <Input
              id="name"
              placeholder="Ex: Conta Corrente Principal"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_name">Nome do Banco</Label>
            <Input
              id="bank_name"
              placeholder="Ex: Nubank, Itaú, Bradesco"
              value={formData.bank_name}
              onChange={(e) => handleChange("bank_name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Conta</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Conta Poupança</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initial_balance">Saldo Inicial</Label>
            <Input
              id="initial_balance"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={formData.initial_balance}
              onChange={(e) => handleChange("initial_balance", e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              <Save className="w-4 h-4 mr-2" />
              Salvar Conta
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}