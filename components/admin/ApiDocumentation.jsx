import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Code, Copy, Check, Server } from 'lucide-react';

const ApiDocumentation = () => {
  const [copied, setCopied] = useState({});
  const baseUrl = window.location.origin;

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied({ [id]: true });
    setTimeout(() => setCopied({ [id]: false }), 2000);
  };

  const CurlExample = ({ id, command }) => (
    <div className="bg-slate-900 text-white rounded-lg p-4 font-mono text-sm relative">
      <pre className="overflow-x-auto">
        <code>{command}</code>
      </pre>
      <button
        onClick={() => handleCopy(command, id)}
        className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md"
      >
        {copied[id] ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );

  const createUserCurl = `curl -X POST ${baseUrl}/functions/createUser \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "full_name": "Nome do Novo Usuário",
    "email": "email.novo@exemplo.com",
    "role": "user"
  }'`;
  
  const createTransactionCurl = `curl -X POST ${baseUrl}/functions/transactions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_email": "usuario.existente@exemplo.com",
    "type": "expense",
    "amount": 49.90,
    "category": "Software",
    "description": "Assinatura Mensal N8N",
    "date": "2024-05-21",
    "workspace": "business"
  }'`;

  const getTransactionsCurl = `curl -X GET "${baseUrl}/functions/transactions?user_email=usuario.existente@exemplo.com&workspace=business&limit=5" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

  const generateQuotePdfCurl = `curl -X POST ${baseUrl}/functions/generateQuotePDF \\
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "quoteId": "ID_DO_ORCAMENTO_AQUI"
  }' --output orcamento.pdf`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-6 h-6" />
          Documentação da API
        </CardTitle>
        <CardDescription>
          Use os exemplos abaixo para integrar o FinanceFlow com N8N ou outros sistemas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-slate-600">
          Substitua <code className="bg-slate-100 p-1 rounded">YOUR_API_KEY</code> por uma chave gerada na seção "Gerenciar Chaves de API".
        </p>
        <Accordion type="single" collapsible className="w-full">
          {/* Create User */}
          <AccordionItem value="item-1">
            <AccordionTrigger>POST /functions/createUser</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>Cria um novo registro de usuário na plataforma.</p>
              <CurlExample id="createUser" command={createUserCurl} />
              <h4 className="font-semibold">Resposta de Sucesso (201):</h4>
              <pre className="bg-slate-100 p-2 rounded text-xs">
{`{
  "success": true,
  "message": "Registro de usuário criado com sucesso...",
  "userId": "uuid-do-usuario-criado",
  "email": "email.novo@exemplo.com",
  "dashboard_link": "${baseUrl}"
}`}
              </pre>
            </AccordionContent>
          </AccordionItem>

          {/* Create Transaction */}
          <AccordionItem value="item-2">
            <AccordionTrigger>POST /functions/transactions</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>Registra uma nova transação (receita ou despesa) para um usuário existente.</p>
              <CurlExample id="createTx" command={createTransactionCurl} />
              <h4 className="font-semibold">Resposta de Sucesso (201):</h4>
              <pre className="bg-slate-100 p-2 rounded text-xs">
{`{
  "success": true,
  "data": { /* ...objeto da transação... */ }
}`}
              </pre>
            </AccordionContent>
          </AccordionItem>

          {/* Get Transactions */}
          <AccordionItem value="item-3">
            <AccordionTrigger>GET /functions/transactions</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p>Busca as transações de um usuário específico, com filtros opcionais.</p>
              <CurlExample id="getTx" command={getTransactionsCurl} />
              <h4 className="font-semibold">Resposta de Sucesso (200):</h4>
              <pre className="bg-slate-100 p-2 rounded text-xs">
{`{
  "success": true,
  "count": 5,
  "data": [ /* ...lista de objetos de transação... */ ]
}`}
              </pre>
            </AccordionContent>
          </AccordionItem>

           {/* Generate Quote PDF */}
           <AccordionItem value="item-4">
            <AccordionTrigger>POST /functions/generateQuotePDF</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p className="text-amber-700 bg-amber-50 p-2 rounded-md border border-amber-200 text-sm">
                <strong>Atenção:</strong> Este endpoint atualmente requer um token de sessão de usuário (JWT) e não uma chave de API. É ideal para ser chamado de um frontend após o login.
              </p>
              <p>Gera um arquivo PDF para um orçamento existente e o retorna para download.</p>
              <CurlExample id="quotePdf" command={generateQuotePdfCurl} />
              <h4 className="font-semibold">Resposta de Sucesso (200):</h4>
              <p className="text-sm">O corpo da resposta será o conteúdo binário do arquivo PDF.</p>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ApiDocumentation;