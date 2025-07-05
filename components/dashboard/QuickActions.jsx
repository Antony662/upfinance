
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, Send, CreditCard, Landmark, Target, 
  Receipt, Users, Calendar, FileText, Zap
} from "lucide-react";

export default function QuickActions({ workspace, onAction }) {
  const getActions = () => {
    // Ações com títulos e descrições simplificados
    const actionsMap = {
      personal: [
        { icon: Plus, title: "Nova Transação", description: "Receitas e despesas", color: "bg-blue-500", action: "new-transaction" },
        { icon: Target, title: "Nova Meta", description: "Definir objetivos", color: "bg-green-500", action: "new-goal" },
        { icon: CreditCard, title: "Novo Cartão", description: "Cadastrar crédito", color: "bg-purple-500", action: "new-card" },
        { icon: Landmark, title: "Nova Conta", description: "Cadastrar conta", color: "bg-indigo-500", action: "new-account" },
        { icon: Receipt, title: "Nova Dívida", description: "Controlar dívidas", color: "bg-red-500", action: "new-debt" },
        { icon: Calendar, title: "Agendar", description: "Criar lembrete", color: "bg-orange-500", action: "new-event" },
      ],
      business: [
        { icon: Plus, title: "Nova Transação", description: "Receitas e despesas", color: "bg-indigo-500", action: "new-transaction" },
        { icon: Users, title: "Novo Cliente", description: "Cadastrar cliente", color: "bg-blue-500", action: "new-client" },
        { icon: FileText, title: "Novo Orçamento", description: "Proposta comercial", color: "bg-green-500", action: "new-quote" },
        { icon: Users, title: "Novo Funcionário", description: "Adicionar colaborador", color: "bg-purple-500", action: "new-employee" },
        { icon: Calendar, title: "Agendar Reunião", description: "Marcar compromisso", color: "bg-orange-500", action: "new-meeting" },
        { icon: Zap, title: "Relatório Rápido", description: "Gerar análise", color: "bg-yellow-500", action: "quick-report" },
      ],
      couple: [
        { icon: Plus, title: "Gasto Conjunto", description: "Registrar despesa", color: "bg-pink-500", action: "new-shared-expense" },
        { icon: Target, title: "Meta do Casal", description: "Objetivo a dois", color: "bg-red-500", action: "new-shared-goal" },
        { icon: Calendar, title: "Planejar Juntos", description: "Evento do casal", color: "bg-purple-500", action: "new-couple-event" },
        { icon: CreditCard, title: "Conta Conjunta", description: "Adicionar conta", color: "bg-indigo-500", action: "new-joint-account" },
        { icon: Send, title: "Dividir Conta", description: "Calcular divisão", color: "bg-blue-500", action: "split-bill" },
        { icon: FileText, title: "Relatório do Casal", description: "Ver finanças", color: "bg-green-500", action: "couple-report" },
      ]
    };
    return actionsMap[workspace] || [];
  };

  const actions = getActions();

  const getWorkspaceTitle = () => {
    switch (workspace) {
      case "personal": return "Ações Rápidas Pessoais";
      case "business": return "Ações Rápidas Empresariais";
      case "couple": return "Ações Rápidas do Casal";
      default: return "Ações Rápidas";
    }
  };

  const getWorkspaceIcon = () => {
    switch (workspace) {
      case "personal": return "👤";
      case "business": return "🏢";
      case "couple": return "💕";
      default: return "⚡";
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="text-lg">{getWorkspaceIcon()}</span>
          {getWorkspaceTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className={`h-auto p-3 flex flex-col items-center justify-center gap-2 text-center hover:scale-105 transition-all duration-200 border-2 hover:border-transparent ${action.color} hover:text-white group min-h-[90px]`}
              onClick={() => onAction(action.action)}
            >
              <action.icon className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
              <div className="space-y-0.5">
                <div className="font-semibold text-xs leading-tight">{action.title}</div>
                <div className="text-xs opacity-70 group-hover:opacity-90 leading-tight font-normal">
                  {action.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
