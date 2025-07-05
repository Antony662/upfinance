import React, { useState, useEffect } from 'react';
import { Webhook } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Send } from 'lucide-react';
import { triggerWebhook } from '@/api/functions';
import { generateSecret } from '@/api/functions';

const availableEvents = [
  { id: 'transaction.created', label: 'Transação Criada' },
  { id: 'transaction.updated', label: 'Transação Atualizada' },
  { id: 'transaction.deleted', label: 'Transação Deletada' },
  { id: 'goal.created', label: 'Meta Criada' },
  { id: 'goal.updated', label: 'Meta Atualizada' },
  { id: 'client.created', label: 'Cliente Criado' },
  { id: 'client.updated', label: 'Cliente Atualizado' },
  { id: 'quote.created', label: 'Orçamento Criado' },
  { id: 'quote.accepted', label: 'Orçamento Aceito (com PDF)' },
  { id: 'user.created', label: 'Usuário Criado (via API)' },
  { id: 'spending.limit.warning', label: 'Aviso de Limite de Gastos' },
  { id: 'spending.limit.exceeded', label: 'Limite de Gastos Excedido' },
  { id: 'couple.invite.sent', label: 'Convite de Casal Enviado' },
  { id: 'couple.connected', label: 'Casal Conectado com Sucesso' },
  { id: 'debt.payment.due', label: 'Lembrete de Pagamento de Dívida' },
  { id: 'event.reminder', label: 'Lembrete de Evento/Compromisso' },
  { id: 'employee.created', label: 'Funcionário Criado' },
  { id: 'debt.created', label: 'Dívida Criada' },
];

export default function WebhooksManager() {
  const [webhooks, setWebhooks] = useState([]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [testingWebhookId, setTestingWebhookId] = useState(null);

  useEffect(() => { loadWebhooks(); }, []);

  const loadWebhooks = async () => {
    const data = await Webhook.list();
    setWebhooks(data);
  };

  const handleEventChange = (eventId) => {
    setSelectedEvents(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleCreateWebhook = async () => {
    if (!newWebhookUrl || selectedEvents.length === 0) {
      alert("URL e pelo menos um evento são obrigatórios.");
      return;
    }
    const { data: secretData } = await generateSecret({ prefix: 'whsec' });
    await Webhook.create({
      url: newWebhookUrl,
      events: selectedEvents,
      secret: secretData.secret,
    });
    setNewWebhookUrl('');
    setSelectedEvents([]);
    loadWebhooks();
  };

  const handleDeleteWebhook = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este webhook?")) {
      await Webhook.delete(id);
      loadWebhooks();
    }
  };
  
  const handleTestWebhook = async (webhook) => {
    setTestingWebhookId(webhook.id);
    const eventToTest = webhook.events[0];
    const samplePayload = {
        test_id: `test_${Date.now()}`,
        message: `Este é um evento de teste para '${eventToTest}'`,
        user: { name: "Usuário Teste", email: "teste@financeflow.com" },
        timestamp: new Date().toISOString()
    };

    try {
        await triggerWebhook({ event: eventToTest, payload: samplePayload });
        alert(`Webhook de teste para o evento '${eventToTest}' enviado com sucesso para ${webhook.url}!`);
    } catch (error) {
        alert(`Falha ao enviar webhook de teste: ${error.message}`);
    } finally {
        setTestingWebhookId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Webhooks</CardTitle>
        <CardDescription>
          Configure URLs para receber notificações. Perfeito para integração com N8N ou Zapier.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-medium">Criar Novo Webhook</h3>
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL do Webhook</Label>
            <Input
              id="webhook-url"
              placeholder="https://seu-n8n.com/webhook/..."
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Eventos para Escutar</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableEvents.map(event => (
                <div key={event.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={event.id}
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={() => handleEventChange(event.id)}
                  />
                  <Label htmlFor={event.id} className="text-sm font-normal">{event.label}</Label>
                </div>
              ))}
            </div>
          </div>
          <Button onClick={handleCreateWebhook}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Webhook
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Eventos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map(hook => (
              <TableRow key={hook.id}>
                <TableCell className="font-mono text-xs">{hook.url}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {hook.events.map(event => (
                      <Badge key={event} variant="secondary">{event}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleTestWebhook(hook)}
                    disabled={testingWebhookId === hook.id}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {testingWebhookId === hook.id ? "Enviando..." : "Testar"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteWebhook(hook.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remover
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}