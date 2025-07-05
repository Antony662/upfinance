
import React, { useState, useEffect } from 'react';
import { ApiKey } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import { generateSecret } from '@/api/functions';

export default function ApiKeysManager() {
  const [keys, setKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { loadKeys(); }, []);

  const loadKeys = async () => {
    const data = await ApiKey.list();
    setKeys(data);
  };

  const generateKey = async () => {
    if (!newKeyName) {
      alert('Por favor, dê um nome para a chave.');
      return;
    }
    
    const { data: secretData, error } = await generateSecret({ prefix: 'ff_live', length: 24 });
    if (error || !secretData || !secretData.secret) {
        alert('Ocorreu um erro ao gerar a chave. Tente novamente.');
        console.error(error);
        return;
    }
    
    const newKey = secretData.secret;
    const created = await ApiKey.create({ key: newKey, name: newKeyName });
    setGeneratedKey(created.key);
    setNewKeyName('');
    loadKeys();
  };

  const revokeKey = async (id) => {
    if (window.confirm('Tem certeza que deseja revogar esta chave? Ela deixará de funcionar imediatamente.')) {
      await ApiKey.update(id, { status: 'revoked' });
      loadKeys();
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chaves de API</CardTitle>
        <CardDescription>Use estas chaves para autenticar requisições à API do FinanceFlow.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Input 
            placeholder="Nome da nova chave (ex: Automação N8N)" 
            value={newKeyName} 
            onChange={e => setNewKeyName(e.target.value)} 
          />
          <Button onClick={generateKey}><Plus className="w-4 h-4 mr-2" />Gerar Chave</Button>
        </div>

        {generatedKey && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-bold text-green-800">Chave Gerada com Sucesso!</h3>
            <p className="text-sm text-green-700">Anote esta chave. Ela não será exibida novamente.</p>
            <div className="mt-2 p-2 bg-green-100 rounded font-mono flex items-center justify-between">
              <span>{generatedKey}</span>
              <Button size="icon" variant="ghost" onClick={copyKey}>
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Chave (início)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map(key => (
              <TableRow key={key.id}>
                <TableCell className="font-medium">{key.name}</TableCell>
                <TableCell className="font-mono">{key.key.substring(0, 12)}...</TableCell>
                <TableCell>{key.status === 'active' ? 'Ativa' : 'Revogada'}</TableCell>
                <TableCell className="text-right">
                  {key.status === 'active' && (
                    <Button variant="destructive" size="sm" onClick={() => revokeKey(key.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />Revogar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
