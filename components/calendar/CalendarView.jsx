import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CalendarView({ workspace, onEventClick, onNewEvent }) {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [workspace, currentDate]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await Event.filter({ workspace }, "-start_date");
      setEvents(data);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dateFormat = "d";
  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const dayEvents = events.filter(event => 
        isSameDay(new Date(event.start_date), day)
      );

      days.push(
        <div
          key={day}
          className={`min-h-[120px] p-2 border border-slate-200 ${
            !isSameMonth(day, monthStart) ? 'bg-slate-50 text-slate-400' : 'bg-white'
          } ${isSameDay(day, new Date()) ? 'bg-blue-50' : ''}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${
              isSameDay(day, new Date()) ? 'text-blue-600' : ''
            }`}>
              {format(day, dateFormat)}
            </span>
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map(event => (
              <div
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`text-xs p-1 rounded cursor-pointer truncate ${
                  event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                  event.type === 'task' ? 'bg-green-100 text-green-800' :
                  event.type === 'appointment' ? 'bg-purple-100 text-purple-800' :
                  event.type === 'payment' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-slate-500">
                +{dayEvents.length - 3} mais
              </div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div key={day} className="grid grid-cols-7">
        {days}
      </div>
    );
    days = [];
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={today}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button onClick={onNewEvent} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Carregando agenda...</div>
        ) : (
          <>
            {/* Header dos dias da semana */}
            <div className="grid grid-cols-7 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-slate-600 border-b">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendário */}
            <div className="space-y-0">
              {rows}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}