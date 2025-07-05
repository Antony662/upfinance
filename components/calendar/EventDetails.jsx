import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit, Trash2, Calendar, Clock, MapPin, Users, Bell } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EventDetails({ event, onEdit, onDelete, onClose }) {
  if (!event) return null;

  const getTypeColor = (type) => {
    const colors = {
      meeting: "bg-blue-100 text-blue-800",
      task: "bg-green-100 text-green-800",
      appointment: "bg-purple-100 text-purple-800",
      reminder: "bg-yellow-100 text-yellow-800",
      payment: "bg-red-100 text-red-800",
      deadline: "bg-orange-100 text-orange-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-slate-100 text-slate-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    return colors[priority] || colors.medium;
  };

  const getTypeLabel = (type) => {
    const labels = {
      meeting: "Reunião",
      task: "Tarefa",
      appointment: "Compromisso", 
      reminder: "Lembrete",
      payment: "Pagamento",
      deadline: "Prazo"
    };
    return labels[type] || type;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: "Baixa",
      medium: "Média",
      high: "Alta"
    };
    return labels[priority] || priority;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-2">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          <div className="flex gap-2">
            <Badge className={getTypeColor(event.type)}>
              {getTypeLabel(event.type)}
            </Badge>
            <Badge variant="outline" className={getPriorityColor(event.priority)}>
              {getPriorityLabel(event.priority)}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {event.description && (
          <div>
            <p className="text-sm text-slate-600">{event.description}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>
              {event.is_all_day ? 
                format(new Date(event.start_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) :
                `${format(new Date(event.start_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
              }
            </span>
          </div>

          {!event.is_all_day && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>
                Até {format(new Date(event.end_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>{event.location}</span>
            </div>
          )}

          {event.reminder_time > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Bell className="w-4 h-4 text-slate-500" />
              <span>
                Lembrete {event.reminder_time >= 1440 ? `${event.reminder_time / 1440} dia(s)` : 
                event.reminder_time >= 60 ? `${event.reminder_time / 60} hora(s)` : 
                `${event.reminder_time} minuto(s)`} antes
              </span>
            </div>
          )}

          {event.is_recurring && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>Repete {
                event.recurring_frequency === 'daily' ? 'diariamente' :
                event.recurring_frequency === 'weekly' ? 'semanalmente' :
                event.recurring_frequency === 'monthly' ? 'mensalmente' : 'anualmente'
              }</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" onClick={() => onDelete(event.id)}>
            <Trash2 className="w-4 h-4 mr-2 text-red-500" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}