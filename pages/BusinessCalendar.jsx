import React, { useState } from "react";
import { Event } from "@/api/entities";
import { Calendar } from "lucide-react";
import CalendarView from "../components/calendar/CalendarView";
import EventForm from "../components/calendar/EventForm";
import EventDetails from "../components/calendar/EventDetails";

export default function BusinessCalendarPage() {
  const [showEventForm, setShowEventForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEventSubmit = async (eventData) => {
    try {
      if (editingEvent) {
        await Event.update(editingEvent.id, eventData);
      } else {
        await Event.create(eventData);
      }
      setShowEventForm(false);
      setEditingEvent(null);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventDetails(false);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Tem certeza que deseja excluir este evento?")) {
      try {
        await Event.delete(eventId);
        setShowEventDetails(false);
        window.location.reload();
      } catch (error) {
        console.error("Erro ao excluir evento:", error);
      }
    }
  };

  return (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Agenda Empresarial</h1>
            <p className="text-slate-600 mt-1">Gerencie reuniões, prazos e compromissos do negócio.</p>
          </div>
        </div>

        <CalendarView
          workspace="business"
          onEventClick={handleEventClick}
          onNewEvent={() => {
            setEditingEvent(null);
            setShowEventForm(true);
          }}
        />

        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <EventForm
              event={editingEvent}
              workspace="business"
              onSubmit={handleEventSubmit}
              onCancel={() => {
                setShowEventForm(false);
                setEditingEvent(null);
              }}
            />
          </div>
        )}

        {showEventDetails && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <EventDetails
              event={selectedEvent}
              onEdit={() => handleEditEvent(selectedEvent)}
              onDelete={handleDeleteEvent}
              onClose={() => {
                setShowEventDetails(false);
                setSelectedEvent(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}