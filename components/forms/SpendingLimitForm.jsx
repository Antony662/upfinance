import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { X, Save, Bell } from "lucide-react";

const categories = [
  "Alimentação",
  "Transporte", 
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Contas",
  "Outros"
];

export default function SpendingLimitForm({ limit, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    limit_amount: "",
    category: "",
    period: "monthly",
    notification_enabled: true,
    notification_threshold: 80, // Notificar quando atingir 80% do limite
    phone_notification: true,
    email_notification: true
  });

  useEffect(() => {
    if (limit) {
      setFormData({
        limit_amount: limit.limit_amount?.toString() || "",
        category: limit.category || "",
        period: limit.period || "monthly",
        notification_enabled: limit.notification_enabled ?? true,
        notification_threshold: limit.notification_threshold || 80,
        phone_notification: limit.phone_notification ?? true,
        email_notification: limit.email_notification ?? true
      });
    }
  }, [limit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.limit_amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Por favor, insira um valor válido maior que zero.");
      return;
    }

    onSubmit({
      ...formData,
      limit_amount: amount
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
          {limit ? "Editar Limite de Gastos" : "Novo Limite de Gastos"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limit_amount">Valor do Limite</Label>
              <Input
                id="limit_amount"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.limit_amount}
                onChange={(e) => handleChange("limit_amount", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Select value={formData.period} onValueChange={(value) => handleChange("period", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria (Opcional)</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <Label htmlFor="notifications" className="font-medium">Ativar Notificações</Label>
              </div>
              <Switch
                id="notifications"
                checked={formData.notification_enabled}
                onCheckedChange={(checked) => handleChange("notification_enabled", checked)}
              />
            </div>

            {formData.notification_enabled && (
              <>
                <div className="space-y-2">
                  <Label>Notificar quando atingir {formData.notification_threshold}% do limite</Label>
                  <Slider
                    value={[formData.notification_threshold]}
                    onValueChange={(value) => handleChange("notification_threshold", value[0])}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>50%</span>
                    <span>{formData.notification_threshold}%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="phone_notification"
                      checked={formData.phone_notification}
                      onCheckedChange={(checked) => handleChange("phone_notification", checked)}
                    />
                    <Label htmlFor="phone_notification" className="text-sm">WhatsApp</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email_notification"
                      checked={formData.email_notification}
                      onCheckedChange={(checked) => handleChange("email_notification", checked)}
                    />
                    <Label htmlFor="email_notification" className="text-sm">Email</Label>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              <Save className="w-4 h-4 mr-2" />
              Salvar Limite
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}