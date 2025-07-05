import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Save, Calendar, Clock } from "lucide-react";

export default function EventForm({ event, onSubmit, onCancel, workspace }) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    start_date: event?.start_date || new Date().toISOString().slice(0, 16),
    end_date: event?.end_date || new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    type: event?.type || "task",
    priority: event?.priority || "medium",
    workspace: workspace,
    is_all_day: event?.is_all_day || false,
    location: event?.location || "",
    reminder_time: event?.reminder_time || 15,
    is_recurring: event?.is_recurring || false,
    recurring_frequency: event?.recurring_frequency || "weekly"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {event ? "Editar Evento" : "Novo Evento"}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Evento</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Digite o título do evento"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descreva o evento..."
              className="h-20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Reunião</SelectItem>
                  <SelectItem value="task">Tarefa</SelectItem>
                  <SelectItem value="appointment">Compromisso</SelectItem>
                  <SelectItem value="reminder">Lembrete</SelectItem>
                  <SelectItem value="payment">Pagamento</SelectItem>
                  <SelectItem value="deadline">Prazo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="all-day"
              checked={formData.is_all_day}
              onCheckedChange={(checked) => handleChange("is_all_day", checked)}
            />
            <Label htmlFor="all-day">Evento de dia inteiro</Label>
          </div>

          {!formData.is_all_day && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Data/Hora Início</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Data/Hora Fim</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {formData.is_all_day && (
            <div className="space-y-2">
              <Label htmlFor="start_date_day">Data</Label>
              <Input
                id="start_date_day"
                type="date"
                value={formData.start_date.split('T')[0]}
                onChange={(e) => {
                  handleChange("start_date", e.target.value + 'T00:00');
                  handleChange("end_date", e.target.value + 'T23:59');
                }}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="location">Local</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Onde será o evento?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder">Lembrete (minutos antes)</Label>
            <Select value={formData.reminder_time.toString()} onValueChange={(value) => handleChange("reminder_time", parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sem lembrete</SelectItem>
                <SelectItem value="5">5 minutos</SelectItem>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="1440">1 dia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => handleChange("is_recurring", checked)}
              />
              <Label htmlFor="recurring">Evento recorrente</Label>
            </div>
            {formData.is_recurring && (
              <Select value={formData.recurring_frequency} onValueChange={(value) => handleChange("recurring_frequency", value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              <Save className="w-4 h-4 mr-2" />
              Salvar Evento
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}