import React from 'react';
import ApiKeysManager from '../components/admin/ApiKeysManager';
import WebhooksManager from '../components/admin/WebhooksManager';
import ApiDocumentation from '../components/admin/ApiDocumentation'; // Importar o novo componente
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Waypoints, BookMarked } from 'lucide-react';

export default function AdminApiWebhooks() {
  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">API & Webhooks</h1>
            <p className="text-slate-600 mt-1">
              Conecte o FinanceFlow a outras ferramentas e automatize seus processos.
            </p>
          </div>
        </div>

        <Tabs defaultValue="documentation" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
            <TabsTrigger value="documentation" className="flex items-center gap-2">
                <BookMarked className="w-4 h-4" /> Documentação da API
            </TabsTrigger>
            <TabsTrigger value="apikeys" className="flex items-center gap-2">
                <Key className="w-4 h-4" /> Chaves de API
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
                <Waypoints className="w-4 h-4" /> Webhooks
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="documentation" className="mt-6">
            <ApiDocumentation />
          </TabsContent>
          <TabsContent value="apikeys" className="mt-6">
            <ApiKeysManager />
          </TabsContent>
          <TabsContent value="webhooks" className="mt-6">
            <WebhooksManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}