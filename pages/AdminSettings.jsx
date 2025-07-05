import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Configurações Gerais</h1>
            <p className="text-slate-600 mt-1">Gerencie as configurações globais da plataforma.</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações da Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  WhatsApp da Empresa
                </label>
                <Input 
                  placeholder="+55 11 99999-9999"
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Número que responderá às interações via WhatsApp
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Chave de API (Webhook WhatsApp)
                </label>
                <Input 
                  type="password"
                  placeholder="********"
                  className="w-full"
                />
                 <p className="text-xs text-slate-500 mt-1">
                  Chave para autenticação de webhooks.
                </p>
              </div>

               <div>
                <label className="block text-sm font-medium mb-2">
                  Valor Assinatura Premium
                </label>
                <Input 
                  placeholder="29.90"
                  className="w-full"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Valor mensal da assinatura premium em R$.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email de Suporte
                </label>
                <Input 
                  type="email"
                  placeholder="suporte@financeflow.com"
                  className="w-full"
                />
                 <p className="text-xs text-slate-500 mt-1">
                  Email para contato e suporte ao cliente.
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="bg-amber-600 hover:bg-amber-700">
                <Database className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}