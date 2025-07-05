
import React, { useState, useEffect } from "react";
import { Client } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Placeholder for ClientForm
const ClientForm = ({ client, onSubmit, onCancel }) => {
    const [name, setName] = useState(client?.name || "");
    const [email, setEmail] = useState(client?.email || "");
    const [phone, setPhone] = useState(client?.phone || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ name, email, phone });
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader><CardTitle>{client ? 'Editar Cliente' : 'Novo Cliente'}</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label>Nome</label><input value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border rounded"/></div>
                    <div><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border rounded"/></div>
                    <div><label>Telefone</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded"/></div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await Client.list("-created_date");
      setClients(data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFormSubmit = async (data) => {
    try {
      if (editingClient) {
        await Client.update(editingClient.id, data);
      } else {
        await Client.create(data);
      }
      setShowForm(false);
      setEditingClient(null);
      loadClients();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.")) {
      try {
        await Client.delete(id);
        loadClients();
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        alert("Não foi possível excluir o cliente. Verifique se ele não está sendo usado em algum orçamento.");
      }
    }
  };

  return (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestão de Clientes</h1>
            <p className="text-slate-600 mt-1">Centralize as informações dos seus clientes.</p>
          </div>
          <Button onClick={() => { setEditingClient(null); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Lista de Clientes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Total Gasto</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan="5">Carregando...</TableCell></TableRow> 
                : clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell><div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" />{client.name}</div></TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>R$ {client.total_spent?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => { setEditingClient(client); setShowForm(true); }}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md">
              <ClientForm
                client={editingClient}
                onSubmit={handleFormSubmit}
                onCancel={() => { setShowForm(false); setEditingClient(null); }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
